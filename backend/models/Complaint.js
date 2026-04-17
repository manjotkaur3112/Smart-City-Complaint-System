const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    complaintId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["pothole", "garbage", "streetlight", "water", "sewage", "electricity", "noise", "other"],
      required: true,
    },
    priority: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
    status: {
      type: String,
      enum: ["pending", "assigned", "in-progress", "resolved", "rejected"],
      default: "pending",
    },
    location: {
      address: { type: String, required: true },
      lat: { type: Number },
      lng: { type: Number },
      ward: { type: String },
    },
    images: [{ type: String }],
    citizen: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    resolvedAt: { type: Date },
    remarks: { type: String, default: "" },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    timeline: [
      {
        status: String,
        note: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    tags: [{ type: String }],
  },
  { timestamps: true }
);

complaintSchema.index({ title: "text", description: "text", "location.address": "text" });
complaintSchema.index({ status: 1, category: 1, createdAt: -1 });

module.exports = mongoose.model("Complaint", complaintSchema);
