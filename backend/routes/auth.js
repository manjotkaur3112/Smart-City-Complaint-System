const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { verifyToken } = require("../middleware/auth");
const User = require("../models/User");
const { sendOTPEmail, sendPasswordResetEmail } = require("../utils/email");

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role = "citizen" } = req.body;
    if (role !== "citizen") {
      return res.status(400).json({ message: "Public registration is only permitted for citizen accounts" });
    }
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    // Generate random 6-digit OTP code for verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    const user = await User.create({
      name,
      email,
      password,
      role,
      isVerified: false,
      otp,
      otpExpires
    });

    // Send OTP asynchronously
    sendOTPEmail(user.email, otp).catch(e => console.error("Async sendOTPEmail for register error:", e));

    res.status(201).json({
      verificationRequired: true,
      email: user.email,
      message: "Registration successful. Verification code sent to email."
    });
  } catch (err) {
    console.error("Register error:", err);
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

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for email:", email);
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email });
    console.log("User found:", !!user);
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const match = await user.comparePassword(password);
    console.log("Password match:", match);
    if (!match) return res.status(401).json({ message: "Invalid email or password" });

    // Check if authority account is pending email verification by administrator
    if (user.role === "authority" && !user.isVerified) {
      return res.status(403).json({ message: "Authority account is pending email verification by administrator" });
    }

    // Generate random 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    // Store in User document
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP asynchronously
    sendOTPEmail(user.email, otp).catch(e => console.error("Async sendOTPEmail error:", e));

    res.json({ otpRequired: true, email: user.email });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP code are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify OTP matching and expiration
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (!user.otpExpires || new Date() > user.otpExpires) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    // OTP is valid! Clear OTP fields
    user.otp = "";
    user.otpExpires = undefined;
    user.isVerified = true;
    await user.save();

    const token = signToken(user);
    res.json({ token, user: { ...user.toObject(), password: undefined } });
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/me", verifyToken, async (req, res) => {
  res.json({ user: req.user });
});

router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true, runValidators: true, select: "-password" }
    );
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal if user doesn't exist. Just return success.
      return res.json({ message: "If that email exists, we have sent a password reset link to it." });
    }

    const crypto = require("crypto");
    const token = crypto.randomBytes(20).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    // Send reset email asynchronously
    sendPasswordResetEmail(user.email, token).catch(e => console.error("Async sendPasswordResetEmail error:", e));

    res.json({ message: "If that email exists, we have sent a password reset link to it." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, token, password } = req.body;
    if (!email || !token || !password) {
      return res.status(400).json({ message: "Email, token, and new password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: "Password reset link is invalid or has expired." });
    }

    // Set new password (pre-save hook will hash it)
    user.password = password;
    user.resetPasswordToken = "";
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful! You can now log in." });
  } catch (err) {
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map(e => e.message).join(", ");
      return res.status(400).json({ message });
    }
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
