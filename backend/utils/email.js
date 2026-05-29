const nodemailer = require("nodemailer");

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

// Verify connection configuration
transporter.verify((err, success) => {
  if (err) {
    const errMsg = err.message || String(err);
    if (err.code === "EAUTH" || errMsg.includes("535") || errMsg.includes("BadCredentials")) {
      console.warn("\n====================================================================");
      console.warn("OTP Email transporter warning: SMTP Authentication Failed!");
      console.warn("Gmail no longer allows standard account passwords for SMTP.");
      console.warn("To resolve this, please generate a 16-character 'App Password' from");
      console.warn("your Google Account settings and put it in backend/.env under EMAIL_PASS.");
      console.warn("Guide: https://support.google.com/accounts/answer/185833");
      console.warn("====================================================================\n");
    } else {
      console.warn("OTP Email transporter warning:", errMsg);
    }
  } else {
    console.log("OTP Email transporter is configured and ready.");
  }
});

/**
 * Sends a 6-digit OTP code to the user's email address
 * @param {string} email 
 * @param {string} otp 
 */
const sendOTPEmail = async (email, otp) => {
  // CRITICAL: Always print to terminal console for direct local testing / verification
  console.log(`\n======================================================`);
  console.log(`[OTP DEBUG] OTP for user ${email} is: ${otp}`);
  console.log(`======================================================\n`);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Email credentials not configured in .env; skipping actual email send (used console fallback).");
    return;
  }

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: email,
      subject: "CivicPulse - Login OTP Verification Code",
      text: `Your One-Time Password (OTP) for CivicPulse login is: ${otp}\n\nThis OTP is valid for 5 minutes. Please do not share it with anyone.`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0d0f1a; color: #e2e8f0; padding: 30px; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.08);">
          <div style="text-align: center; margin-bottom: 20px; font-size: 24px;">🏙️ <strong>CivicPulse</strong></div>
          <h2 style="color: #4f8ef7; text-align: center; margin-bottom: 10px;">Login OTP Verification</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #94a3b8; text-align: center;">
            Use the following One-Time Password (OTP) to complete your sign in.
          </p>
          <div style="background-color: rgba(79,142,247,0.1); border: 1px solid rgba(79,142,247,0.3); border-radius: 8px; padding: 15px; margin: 25px 0; text-align: center;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #4f8ef7; font-family: monospace;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #64748b; text-align: center;">
            This OTP is valid for <strong>5 minutes</strong>. If you did not request this code, please ignore this email.
          </p>
          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.08); margin: 30px 0;">
          <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
            Smart City Complaint Management Platform &copy; ${new Date().getFullYear()}
          </p>
        </div>
      `,
    });
    console.log(`OTP email sent successfully to ${email}`);
  } catch (err) {
    console.error(`Failed to send OTP email to ${email}:`, err.message || err);
  }
};

/**
 * Sends a password reset link to the user's email address
 * @param {string} email 
 * @param {string} token 
 */
const sendPasswordResetEmail = async (email, token) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:1510";
  const resetUrl = `${clientUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  console.log(`\n======================================================`);
  console.log(`[PASSWORD RESET DEBUG] Reset URL for user ${email} is: ${resetUrl}`);
  console.log(`======================================================\n`);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Email credentials not configured in .env; skipping actual email send (used console fallback).");
    return;
  }

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: email,
      subject: "CivicPulse - Password Reset Request",
      text: `You requested a password reset on CivicPulse. Please click on the link to reset your password: ${resetUrl}\n\nThis link is valid for 1 hour. If you did not request this, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0d0f1a; color: #e2e8f0; padding: 30px; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.08);">
          <div style="text-align: center; margin-bottom: 20px; font-size: 24px;">🏙️ <strong>CivicPulse</strong></div>
          <h2 style="color: #ef4444; text-align: center; margin-bottom: 10px;">Password Reset Request</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #94a3b8; text-align: center;">
            You are receiving this because you (or someone else) have requested the reset of the password for your account.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #ef4444; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 14px; color: #64748b; text-align: center;">
            This link is valid for <strong>1 hour</strong>. If you did not request this, please ignore this email and your password will remain unchanged.
          </p>
          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.08); margin: 30px 0;">
          <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
            Smart City Complaint Management Platform &copy; ${new Date().getFullYear()}
          </p>
        </div>
      `,
    });
    console.log(`Password reset email sent successfully to ${email}`);
  } catch (err) {
    console.error(`Failed to send password reset email to ${email}:`, err.message || err);
  }
};

module.exports = { sendOTPEmail, sendPasswordResetEmail };
