import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const navigate = useNavigate();
  
  // Extract token and email from URL parameters
  const queryParams = new URLSearchParams(window.location.search);
  const token = queryParams.get("token") || "";
  const email = queryParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !email) {
      return toast.error("Invalid reset link. Please check your email link again.");
    }
    if (password !== confirm) {
      return toast.error("Passwords do not match");
    }
    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", { email, token, password });
      toast.success(res.data.message || "Password reset successful!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>🔒</div>
          <h2 style={{ color: "#e2e8f0", marginBottom: 4 }}>New Password</h2>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
            Enter your new password below
          </p>
        </div>

        {!token || !email ? (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <p style={{ color: "#ef4444", fontSize: "0.95rem", lineHeight: 1.5, marginBottom: 20 }}>
              The password reset token is missing or invalid. Please check your link or request a new reset link.
            </p>
            <Link to="/forgot-password" className="btn btn-secondary w-full" style={{ display: "block", textDecoration: "none", textAlign: "center" }}>
              Request New Link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                className="form-control"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="min 6 characters"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                className="form-control"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button className="btn btn-primary w-full" type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
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
};
