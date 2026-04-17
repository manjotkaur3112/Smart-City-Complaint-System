import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const { loginWithEmail } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginWithEmail(form.email, form.password);
      toast.success("Welcome back!");
      navigate("/home");
    } catch (err) {
      console.error("Login error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Login failed";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>🏙️</div>
          <h2 style={{ color: "#e2e8f0", marginBottom: 4 }}>Welcome Back</h2>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Sign in to CivicPulse</p>
        </div>

        <form onSubmit={handleEmail}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-control" name="email" type="email" value={form.email} onChange={handle} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••" required />
          </div>
          <button className="btn btn-primary w-full" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  card: {
    width: "100%", maxWidth: 420,
    background: "#1a1d30", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16, padding: 40,
  },
  header: { textAlign: "center", marginBottom: 28 },
  logo: { fontSize: "2.5rem", marginBottom: 12 },
  footer: { textAlign: "center", marginTop: 20, fontSize: "0.875rem", color: "#64748b" },
};
