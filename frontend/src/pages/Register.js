import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const ROLES = [
  {
    value: "citizen",
    label: "Citizen",
    icon: "👤",
    desc: "Report civic issues & track complaints",
  },
  {
    value: "authority",
    label: "Authority",
    icon: "🏛️",
    desc: "Manage & resolve assigned complaints",
  },
  {
    value: "admin",
    label: "Admin",
    icon: "🛡️",
    desc: "Full system access & user management",
  },
];

export default function Register() {
  const { registerWithEmail, verifyOTP } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", role: "citizen" });
  const [loading, setLoading] = useState(false);
  const [otpRequired, setOtpRequired] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) return toast.error("Please enter a valid email address");
    if (form.password !== form.confirm) return toast.error("Passwords do not match");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      const data = await registerWithEmail(form.email, form.password, form.name, form.role);
      if (data && data.verificationRequired) {
        toast.success("Verification code sent to your email!");
        setOtpRequired(true);
      } else {
        toast.success(`Account created! Welcome to CivicPulse as ${form.role}.`);
        navigate("/home");
      }
    } catch (err) {
      console.error("Register error:", err);
      toast.error(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      return toast.error("Please enter a valid 6-digit OTP code");
    }
    setVerifying(true);
    try {
      await verifyOTP(form.email, otp);
      toast.success("Account created and verified! Welcome to CivicPulse.");
      navigate("/home");
    } catch (err) {
      console.error("OTP verification error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Verification failed";
      toast.error(errorMsg);
    } finally {
      setVerifying(false);
    }
  };

  if (otpRequired) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.logo}>🔐</div>
            <h2 style={{ color: "#e2e8f0", marginBottom: 4 }}>Verify Email</h2>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
              Enter the 6-digit OTP code sent to:
            </p>
            <p style={{ color: "#4f8ef7", fontSize: "0.85rem", fontWeight: 600, marginTop: 4 }}>
              {form.email}
            </p>
          </div>

          <form onSubmit={handleOTPVerify}>
            <div className="form-group">
              <label className="form-label">Verification Code (OTP)</label>
              <input
                className="form-control"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="••••••"
                style={{ textAlign: "center", fontSize: "1.3rem", letterSpacing: "8px", fontWeight: "bold" }}
                required
              />
            </div>
            <button className="btn btn-primary w-full" type="submit" disabled={verifying}>
              {verifying ? "Verifying..." : "Verify & Register"}
            </button>
          </form>

          <button
            className="btn btn-ghost w-full"
            style={{ marginTop: 16, color: "#64748b", fontSize: "0.85rem", textTransform: "none" }}
            onClick={() => { setOtpRequired(false); setOtp(""); }}
          >
            ← Back to Sign Up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>🏙️</div>
          <h2 style={{ color: "#e2e8f0", marginBottom: 4 }}>Create Account</h2>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Join CivicPulse today</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-control"
              name="name"
              value={form.name}
              onChange={handle}
              placeholder="Manjot Kaur"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-control"
              name="email"
              type="email"
              value={form.email}
              onChange={handle}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-control"
              name="password"
              type="password"
              value={form.password}
              onChange={handle}
              placeholder="min 6 characters"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              className="form-control"
              name="confirm"
              type="password"
              value={form.confirm}
              onChange={handle}
              placeholder="••••••••"
              required
            />
          </div>

          <button className="btn btn-primary w-full" type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "calc(100vh - 64px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 480,
    background: "#1a1d30",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 40,
  },
  header: { textAlign: "center", marginBottom: 24 },
  logo: { fontSize: "2.5rem", marginBottom: 12 },

  roleSection: { marginBottom: 24 },
  roleLabel: {
    display: "block",
    color: "#94a3b8",
    fontSize: "0.8rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 10,
  },
  roleGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 },
  roleCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    padding: "14px 8px",
    borderRadius: 10,
    border: "2px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    cursor: "pointer",
    transition: "all 0.2s",
    textAlign: "center",
  },
  roleCardActive: {
    border: "2px solid #3b82f6",
    background: "rgba(59,130,246,0.12)",
  },
  roleIcon: { fontSize: "1.5rem" },
  roleName: { color: "#e2e8f0", fontSize: "0.85rem", fontWeight: 600 },
  roleDesc: { color: "#64748b", fontSize: "0.7rem", lineHeight: 1.3 },

  selectedBadge: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "0.85rem",
    marginBottom: 16,
    padding: "8px 12px",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 8,
  },
  footer: { textAlign: "center", marginTop: 20, fontSize: "0.875rem", color: "#64748b" },
};