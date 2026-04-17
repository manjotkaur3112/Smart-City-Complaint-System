const mongoose = require("mongoose");
require("dotenv").config();
const Complaint = require("../models/Complaint");
const Counter = require("../models/Counter");

function parseNumericId(value) {
  const num = parseInt(value, 10);
  return Number.isNaN(num) ? null : num;
}

async function migrate() {
  const complaints = await Complaint.find({}).sort({ createdAt: 1, _id: 1 }).lean();

  if (!complaints.length) {
    console.log("No complaints found to migrate.");
    return;
  }

  const numericIds = complaints
    .map((complaint) => parseNumericId(complaint.complaintId))
    .filter((id) => id !== null);

  let nextId = numericIds.length ? Math.max(...numericIds) + 1 : 1;
  const bulkOps = [];

  for (const complaint of complaints) {
    if (parseNumericId(complaint.complaintId) === null) {
      bulkOps.push({
        updateOne: {
          filter: { _id: complaint._id },
          update: { complaintId: nextId.toString() },
        },
      });
      nextId += 1;
    }
  }

  let result = { modifiedCount: 0 };
  if (bulkOps.length > 0) {
    result = await Complaint.bulkWrite(bulkOps);
  }

  const finalSeq = nextId > 1 ? nextId - 1 : 0;
  await Counter.findOneAndUpdate(
    { _id: "complaintId" },
    { $set: { seq: finalSeq } },
    { upsert: true }
  );

  console.log(`Migrated ${result.modifiedCount || 0} complaint IDs to sequential numbers.`);
  console.log(`Complaint counter set to ${finalSeq}.`);
}

async function main() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/civicpulse";
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await migrate();
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
