require("dotenv").config();
const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const path     = require("path");
const fs       = require("fs");

const authRoutes      = require("./routes/auth");
const complaintRoutes = require("./routes/complaints");
const adminRoutes     = require("./routes/admin");
const contactRoutes   = require("./routes/contact");

const app = express();

const uploadDir = path.join(__dirname, "uploads/complaints");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth",       authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/admin",      adminRoutes);
app.use("/api/contact",    contactRoutes);

app.get("/api/health", (req, res) => res.json({ status: "CivicPulse API running" }));

const buildPath = path.join(__dirname, "../frontend/build");
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ message: "Not found" });
    }
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/civicpulse")
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error("MongoDB error:", err));