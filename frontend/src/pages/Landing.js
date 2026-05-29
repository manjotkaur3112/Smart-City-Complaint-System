import React from "react";
import { Link } from "react-router-dom";
import CustomChatbot from "../components/CustomChatbot";

const features = [
  { icon: "🚧", title: "Report Issues", desc: "Submit complaints about potholes, garbage, streetlights, water supply and more." },
  { icon: "📊", title: "Live Dashboard", desc: "Authorities track, assign and resolve complaints in real-time." },
  { icon: "🔔", title: "Status Updates", desc: "Track your complaint from submission to resolution with timeline history." },
  { icon: "🧠", title: "AI-Powered Triage", desc: "Smart priority detection automatically flags urgent civic issues." },
  { icon: "🔍", title: "KMP Search", desc: "Lightning-fast pattern matching to search through thousands of complaints." },
  { icon: "⚡", title: "DSA Optimized", desc: "MergeSort, BinarySearch, and sliding window algorithms power the system." },
];

const stats = [
  { value: "10K+", label: "Complaints Resolved" },
  { value: "50+", label: "Wards Covered" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "2hrs", label: "Avg Response Time" },
];

export default function Landing() {
  return (
    <main>
      <section style={styles.hero}>
        <div style={styles.heroBg} />
        <div className="container" style={styles.heroContent}>
          <div style={styles.heroBadge}>🏙️ Smart City Platform</div>
          <h1 style={styles.heroTitle}>
            Your City.<br />
            <span style={styles.heroAccent}>Your Voice.</span><br />
            Our Mission.
          </h1>
          <p style={styles.heroDesc}>
            CivicPulse connects citizens with city authorities to resolve municipal issues faster.
            Report potholes, garbage failures, broken streetlights, and water supply disruptions
            — all in one platform powered by smart algorithms.
          </p>
          <div style={styles.heroCTA}>
            <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
            <Link to="/services" className="btn btn-secondary btn-lg">Explore Services</Link>
          </div>
        </div>
      </section>

      <section style={styles.statsSection}>
        <div className="container">
          <div className="grid-4">
            {stats.map((s, i) => (
              <div key={i} className="card stat-card">
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 0" }}>
        <div className="container">
          <div className="section-header text-center mb-24">
            <h2>Everything you need to fix your city</h2>
            <p style={{ marginTop: 12 }}>Powered by modern web tech and classic DSA algorithms</p>
          </div>
          <div className="grid-3">
            {features.map((f, i) => (
              <div key={i} className="card" style={{ gap: 12 }}>
                <div style={styles.featureIcon}>{f.icon}</div>
                <h3 style={{ color: "#e2e8f0", marginTop: 8 }}>{f.title}</h3>
                <p style={{ fontSize: "0.9rem" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={styles.ctaSection}>
        <div className="container text-center">
          <h2>Ready to improve your city?</h2>
          <p style={{ marginTop: 12, marginBottom: 32 }}>Join thousands of citizens making a difference</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <Link to="/register" className="btn btn-primary btn-lg">Create Account</Link>
            <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
          </div>
        </div>
      </section>
      <CustomChatbot />
      <a href="tel:+919782100977" style={styles.callButton} aria-label="Call support">
        📞
      </a>
    </main>
  );
}

const styles = {
  hero: {
    position: "relative", minHeight: "80vh",
    display: "flex", alignItems: "center",
    overflow: "hidden",
  },
  heroBg: {
    position: "absolute", inset: 0,
    background: "radial-gradient(ellipse at 30% 50%, rgba(79,142,247,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(124,58,237,0.08) 0%, transparent 50%)",
  },
  heroContent: { position: "relative", zIndex: 1, padding: "80px 24px" },
  heroBadge: {
    display: "inline-flex", alignItems: "center", gap: 8,
    background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.3)",
    borderRadius: 20, padding: "6px 16px", fontSize: "0.85rem",
    color: "#4f8ef7", fontWeight: 600, marginBottom: 24,
  },
  heroTitle: { color: "#e2e8f0", marginBottom: 24, lineHeight: 1.15 },
  heroAccent: {
    background: "linear-gradient(135deg, #4f8ef7, #7c3aed)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  heroDesc: { maxWidth: 600, fontSize: "1.1rem", lineHeight: 1.7, marginBottom: 40 },
  heroCTA: { display: "flex", gap: 16, flexWrap: "wrap" },
  statsSection: { padding: "60px 0", background: "rgba(255,255,255,0.02)" },
  featureIcon: { fontSize: "2rem" },
  ctaSection: {
    padding: "80px 0",
    background: "linear-gradient(135deg, rgba(79,142,247,0.05), rgba(124,58,237,0.05))",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  callButton: {
    position: "fixed",
    right: 20,
    bottom: 20,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 50,
    background: "#10b981",
    color: "#fff",
    borderRadius: "50%",
    boxShadow: "0 10px 25px rgba(16,185,129,0.3)",
    border: "none",
    textDecoration: "none",
    fontSize: "1.4rem",
    transition: "transform 0.2s ease"
  },
};
