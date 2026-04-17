const express = require("express");
const router  = express.Router();
const path    = require("path");
const fs      = require("fs");
const multer  = require("multer");
const { verifyToken, requireRole } = require("../middleware/auth");
const Complaint = require("../models/Complaint");
const Counter = require("../models/Counter");

const uploadDir = path.join(__dirname, "../uploads/complaints");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only image files are allowed (jpg, png, webp, gif)"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }, 
});

const PRIORITY_WEIGHT = { critical: 4, high: 3, medium: 2, low: 1 };

function parseComplaintId(value) {
  const num = parseInt(value, 10);
  return Number.isNaN(num) ? null : num;
}

function getValue(item, key) {
  if (key === "priority") return PRIORITY_WEIGHT[item[key]];
  if (key === "complaintId") {
    const num = parseComplaintId(item[key]);
    return num !== null ? num : item[key];
  }
  if (key === "createdAt" || key === "updatedAt") return new Date(item[key]).getTime();
  return item[key];
}

function insertionSort(arr, key, order = "desc") {
  const result = [...arr];
  for (let i = 1; i < result.length; i++) {
    const current = result[i];
    const currentVal = getValue(current, key);
    let j = i - 1;
    while (j >= 0) {
      const prevVal = getValue(result[j], key);
      const shouldMove = order === "asc" ? prevVal > currentVal : prevVal < currentVal;
      if (shouldMove) {
        result[j + 1] = result[j];
        j--;
      } else {
        break;
      }
    }
    result[j + 1] = current;
  }
  return result;
}

function parseComplaintId(value) {
  const num = parseInt(value, 10);
  return Number.isNaN(num) ? null : num;
}

function binarySearch(sortedArr, target) {
  const targetNum = parseComplaintId(target);
  let lo = 0, hi = sortedArr.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const current = sortedArr[mid].complaintId;
    const currentNum = parseComplaintId(current);

    if (targetNum !== null && currentNum !== null) {
      if (currentNum === targetNum) return sortedArr[mid];
      else if (currentNum < targetNum) lo = mid + 1;
      else hi = mid - 1;
    } else {
      if (current === target) return sortedArr[mid];
      else if (current < target) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return null;
}

function simpleSearch(text, pattern) {
  if (!pattern) return true;
  return text.toLowerCase().includes(pattern.toLowerCase());
}

function categoryFrequency(complaints) {
  return complaints.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {});
}

router.post(
  "/",
  verifyToken,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const { title, description, category, location, tags } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({ message: "Title is required." });
      }
      if (!category) {
        return res.status(400).json({ message: "Category is required." });
      }
      if (!location) {
        return res.status(400).json({ message: "Location is required." });
      }

      const descriptionWordCount = description ? description.trim().split(/\s+/).filter(Boolean).length : 0;
      if (!description || descriptionWordCount > 100) {
        return res.status(400).json({ message: "Description is required and must be 100 words or fewer." });
      }

      const imagePaths = (req.files || []).map(
        (f) => `/uploads/complaints/${f.filename}`
      );

      const counter = await Counter.findOneAndUpdate(
        { _id: "complaintId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      const complaintId = counter.seq.toString();

      const urgentWords = ["urgent", "emergency", "critical", "dangerous", "broken", "flood"];
      const autoHighPriority = urgentWords.some((w) =>
        description.toLowerCase().includes(w)
      );

      let parsedLocation = location;
      if (typeof location === "string") {
        try { parsedLocation = JSON.parse(location); } catch {  }
      }

      const complaint = await Complaint.create({
        complaintId,
        title,
        description,
        category,
        priority: autoHighPriority ? "high" : "medium",
        location: parsedLocation,
        images: imagePaths,
        citizen: req.user._id,
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(",").map((t) => t.trim())) : [],
        timeline: [{ status: "pending", note: "Complaint submitted", updatedBy: req.user._id }],
      });

      res.status(201).json({ complaint });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE")  return res.status(400).json({ message: "Each image must be under 5 MB" });
    if (err.code === "LIMIT_FILE_COUNT") return res.status(400).json({ message: "Maximum 5 images allowed" });
  }
  if (err) return res.status(400).json({ message: err.message });
  next();
});

router.get("/all", verifyToken, requireRole("authority", "admin"), async (req, res) => {
  try {
    const { sortBy = "createdAt", order = "desc", search = "", category, status } = req.query;

    let query = {};
    if (category) query.category = category;
    if (status)   query.status   = status;

    let complaints = await Complaint.find(query)
      .populate("citizen",    "name email")
      .populate("assignedTo", "name email")
      .lean();

    if (search) {
      complaints = complaints.filter(
        (c) =>
          simpleSearch(c.title, search) ||
          simpleSearch(c.description, search) ||
          simpleSearch(c.location.address, search)
      );
    }

    complaints = insertionSort(complaints, sortBy, order);
    const stats = categoryFrequency(complaints);

    res.json({ complaints, stats, total: complaints.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/my", verifyToken, async (req, res) => {
  try {
    const { sortBy = "createdAt", order = "desc", search = "" } = req.query;

    let complaints = await Complaint.find({ citizen: req.user._id }).lean();

    if (search) {
      complaints = complaints.filter(
        (c) =>
          simpleSearch(c.title, search) ||
          simpleSearch(c.category, search) ||
          simpleSearch(c.description, search)
      );
    }

    complaints = insertionSort(complaints, sortBy, order);
    res.json({ complaints });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/search/:complaintId", verifyToken, async (req, res) => {
  try {
    const allComplaints = await Complaint.find({}).lean();
    allComplaints.sort((a, b) => {
      const aNum = parseComplaintId(a.complaintId);
      const bNum = parseComplaintId(b.complaintId);
      if (aNum !== null && bNum !== null) return aNum - bNum;
      return String(a.complaintId).localeCompare(String(b.complaintId));
    });
    const found = binarySearch(allComplaints, req.params.complaintId);
    if (!found) return res.status(404).json({ message: "Complaint not found" });
    res.json({ complaint: found });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("citizen",    "name email")
      .populate("assignedTo", "name email");
    if (!complaint) return res.status(404).json({ message: "Not found" });
    res.json({ complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:id/status", verifyToken, requireRole("authority", "admin"), async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Not found" });

    complaint.status  = status;
    complaint.remarks = remarks || complaint.remarks;
    if (status === "resolved") complaint.resolvedAt = new Date();
    complaint.timeline.push({
      status,
      note: remarks || `Status updated to ${status}`,
      updatedBy: req.user._id,
    });
    await complaint.save();

    res.json({ complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:id/assign", verifyToken, requireRole("authority", "admin"), async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        assignedTo,
        status: "assigned",
        $push: { timeline: { status: "assigned", note: "Complaint assigned", updatedBy: req.user._id } },
      },
      { new: true }
    );
    res.json({ complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:id/upvote", verifyToken, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    const idx = complaint.upvotes.indexOf(req.user._id);
    if (idx > -1) complaint.upvotes.splice(idx, 1);
    else complaint.upvotes.push(req.user._id);
    await complaint.save();
    res.json({ upvotes: complaint.upvotes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;