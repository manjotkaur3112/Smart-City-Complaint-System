const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();
const Contact = require("../models/Contact");
const { verifyToken, requireRole } = require("../middleware/auth");

const CONTACT_NOTIFICATION_EMAIL = process.env.CONTACT_NOTIFICATION_EMAIL || "kourmanjot13@gmail.com";
const EMAIL_FROM = process.env.EMAIL_FROM || process.env.EMAIL_USER || "no-reply@civicpulse.gov.in";
const mailConfig = {
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
};

if (process.env.EMAIL_HOST) {
  mailConfig.host = process.env.EMAIL_HOST;
  mailConfig.port = Number(process.env.EMAIL_PORT) || 587;
  mailConfig.secure = process.env.EMAIL_SECURE === "true";
}

const transporter = nodemailer.createTransport(mailConfig);

transporter.verify((err, success) => {
  if (err) {
    const errMsg = err.message || String(err);
    if (err.code === "EAUTH" || errMsg.includes("535") || errMsg.includes("BadCredentials")) {
      console.warn("\n====================================================================");
      console.warn("Contact Email transporter warning: SMTP Authentication Failed!");
      console.warn("Gmail no longer allows standard account passwords for SMTP.");
      console.warn("To resolve this, please generate a 16-character 'App Password' from");
      console.warn("your Google Account settings and put it in backend/.env under EMAIL_PASS.");
      console.warn("Guide: https://support.google.com/accounts/answer/185833");
      console.warn("====================================================================\n");
    } else {
      console.error("Email transporter verification failed:", errMsg);
    }
  } else {
    console.log("Email transporter is configured and ready to send messages.");
  }
});

const buildContactHtml = ({ name, email, subject, message, createdAt }) => `
  <h2>New Contact Us Submission</h2>
  <p><strong>Name:</strong> ${name || "N/A"}</p>
  <p><strong>Email:</strong> ${email || "N/A"}</p>
  <p><strong>Subject:</strong> ${subject || "N/A"}</p>
  <p><strong>Message:</strong></p>
  <p>${message || "N/A"}</p>
  <p style="margin-top:16px;color:#6b7280;font-size:0.9rem;">Submitted on ${createdAt ? new Date(createdAt).toLocaleString() : new Date().toLocaleString()}</p>
`;

router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    const contact = await Contact.create(req.body);
    let emailError = null;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await transporter.sendMail({
          from: EMAIL_FROM,
          to: CONTACT_NOTIFICATION_EMAIL,
          subject: `New CivicPulse contact message from ${contact.name || contact.email}`,
          text: `New contact submission:\nName: ${contact.name}\nEmail: ${contact.email}\nSubject: ${contact.subject}\nMessage:\n${contact.message}`,
          html: buildContactHtml(contact),
        });
      } catch (sendErr) {
        emailError = sendErr;
        console.error("Contact notification email failed:", sendErr.message || sendErr);
      }
    } else {
      console.warn("Contact email not sent: EMAIL_USER or EMAIL_PASS is not configured.");
    }

    const response = { message: "Message sent successfully", contact };
    if (emailError) {
      response.notifications = "Contact saved, but notification email failed.";
      response.emailError = emailError.message || String(emailError);
    }

    res.status(201).json(response);
  } catch (err) {
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map(e => e.message).join(", ");
      return res.status(400).json({ message });
    }
    res.status(500).json({ message: err.message });
  }
});

router.get("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
