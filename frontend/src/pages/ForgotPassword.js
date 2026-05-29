import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return toast.error("Please enter a valid email address");
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      toast.success(res.data.message || "Reset link sent!");
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>🔑</div>
          <h2 style={{ color: "#e2e8f0", marginBottom: 4 }}>Reset Password</h2>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
            Enter your email to receive a password reset link
          </p>
        </div>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <p style={{ color: "#10b981", fontSize: "0.95rem", lineHeight: 1.5, marginBottom: 20 }}>
              An email has been sent to your address with further instructions on how to reset your password.
            </p>
            <Link to="/login" className="btn btn-secondary w-full" style={{ display: "block", textDecoration: "none", textAlign: "center" }}>
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-control"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <button className="btn btn-primary w-full" type="submit" disabled={loading}>
              {loading ? "Sending link..." : "Send Reset Link"}
            </button>
          </form>
        )}

        {!submitted && (
          <p style={styles.footer}>
            Remember your password? <Link to="/login">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "#1a1d30",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 40,
  },
  header: { textAlign: "center", marginBottom: 28 },
  logo: { fontSize: "2.5rem", marginBottom: 12 },
  footer: { textAlign: "center", marginTop: 20, fontSize: "0.875rem", color: "#64748b" },
};
