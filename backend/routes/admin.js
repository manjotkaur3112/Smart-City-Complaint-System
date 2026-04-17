const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/auth");
const User = require("../models/User");
const Complaint = require("../models/Complaint");

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

module.exports = router;
