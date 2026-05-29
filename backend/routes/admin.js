const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/auth");
const User = require("../models/User");
const Complaint = require("../models/Complaint");
const { sendOTPEmail } = require("../utils/email");

router.get("/users", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/users/:id/role", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/users/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Also delete associated complaints to avoid orphan records, optional but good practice
    await Complaint.deleteMany({ citizen: req.params.id });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/stats", verifyToken, requireRole("authority", "admin"), async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: "pending" });
    const inProgress = await Complaint.countDocuments({ status: "in-progress" });
    const resolved = await Complaint.countDocuments({ status: "resolved" });
    const assigned = await Complaint.countDocuments({ status: "assigned" });
    const rejected = await Complaint.countDocuments({ status: "rejected" });

    const byCategory = await Complaint.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const byPriority = await Complaint.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);
    const recentComplaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("citizen", "name");

    res.json({ total, pending, inProgress, resolved, assigned, rejected, byCategory, byPriority, recentComplaints });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/create-authority", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // Generate random 6-digit OTP code for verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    const user = await User.create({
      name,
      email,
      password,
      role: "authority",
      isActive: true,
      isVerified: false,
      otp,
      otpExpires
    });

    // Send OTP asynchronously
    sendOTPEmail(user.email, otp).catch(e => console.error("Async sendOTPEmail for authority error:", e));

    res.status(201).json({
      verificationRequired: true,
      email: user.email,
      message: "Authority account created. Verification code sent to their email."
    });
  } catch (err) {
    console.error("Create authority error:", err);
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map(e => e.message).join(", ");
      return res.status(400).json({ message });
    }
    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyValue || {})[0] || "field";
      const message = duplicateField === "email" ? "Email already in use" : `${duplicateField} already exists`;
      return res.status(409).json({ message });
    }
    res.status(500).json({ message: err.message });
  }
});

router.post("/verify-authority", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and verification code are required" });
    }

    const user = await User.findOne({ email, role: "authority" });
    if (!user) {
      return res.status(404).json({ message: "Authority account not found" });
    }

    // Check OTP and expiration
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (!user.otpExpires || new Date() > user.otpExpires) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    // Verification succeeded! Activate account
    user.isVerified = true;
    user.otp = "";
    user.otpExpires = undefined;
    await user.save();

    res.json({
      message: "Authority account email verified and activated successfully",
      user: { ...user.toObject(), password: undefined }
    });
  } catch (err) {
    console.error("Verify authority error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
