import React from "react";
import { Link } from "react-router-dom";

const services = [
  { icon: "🚧", title: "Road & Pothole Repair", desc: "Report damaged roads, potholes, and pavement issues that endanger commuters.", cat: "pothole", sla: "48 hrs" },
  { icon: "🗑️", title: "Garbage Collection", desc: "Flag missed garbage pickups, overflowing bins, or illegal dumping zones.", cat: "garbage", sla: "24 hrs" },
  { icon: "💡", title: "Streetlight Maintenance", desc: "Report broken, flickering, or missing street lights for faster city safety.", cat: "streetlight", sla: "72 hrs" },
  { icon: "💧", title: "Water Supply Issues", desc: "Report supply disruptions, contamination alerts, or pipeline leaks.", cat: "water", sla: "12 hrs" },
  { icon: "🚽", title: "Sewage & Drainage", desc: "Alert authorities about blocked drains, sewage overflow, or foul odors.", cat: "sewage", sla: "36 hrs" },
  { icon: "⚡", title: "Electricity & Power", desc: "Report outages, dangling wires, or transformer issues in your area.", cat: "electricity", sla: "6 hrs" },
  { icon: "🔊", title: "Noise Complaints", desc: "Report chronic noise disturbances from construction, events, or venues.", cat: "noise", sla: "24 hrs" },
  { icon: "📋", title: "Other Civic Issues", desc: "Any other municipal matter not covered above — we're here to help.", cat: "other", sla: "96 hrs" },
];

const process = [
  { step: "01", title: "Submit", desc: "Fill out the complaint form with location and description." },
  { step: "02", title: "Triage", desc: "AI assigns priority. Authority reviews within SLA window." },
  { step: "03", title: "Assign", desc: "Complaint routed to responsible department or officer." },
  { step: "04", title: "Resolve", desc: "Issue fixed. You're notified with resolution details." },
];

export default function Services() {
  return (
    <div className="page">
      <div className="container">
        <div className="section-header text-center mb-24">
          <h2 style={{ color: "#e2e8f0" }}>City Services</h2>
          <p style={{ marginTop: 12, maxWidth: 600, margin: "12px auto 0" }}>
            CivicPulse covers all major municipal services. Every complaint is tracked with a unique ID and resolved within SLA timelines.
          </p>
        </div>

        <div className="grid-3 mb-24">
          {services.map((s) => (
            <div key={s.cat} className="card">
              <div style={{ fontSize: "2.2rem", marginBottom: 12 }}>{s.icon}</div>
              <h3 style={{ color: "#e2e8f0", marginBottom: 8 }}>{s.title}</h3>
              <p style={{ fontSize: "0.875rem", marginBottom: 16 }}>{s.desc}</p>
              <div style={styles.sla}>
                ⏱️ SLA: <strong style={{ color: "#4f8ef7" }}>{s.sla}</strong>
              </div>
              <Link to="/home" className="btn btn-secondary btn-sm" style={{ marginTop: 12 }}>
                Report This Issue
              </Link>
            </div>
          ))}
        </div>

        <div style={styles.processSection}>
          <h2 style={{ color: "#e2e8f0", textAlign: "center", marginBottom: 40 }}>How It Works</h2>
          <div className="grid-4">
            {process.map((p) => (
              <div key={p.step} style={styles.processCard}>
                <div style={styles.stepNum}>{p.step}</div>
                <h4 style={{ color: "#e2e8f0", margin: "12px 0 8px" }}>{p.title}</h4>
                <p style={{ fontSize: "0.875rem" }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.cta}>
          <h3 style={{ color: "#e2e8f0" }}>Ready to report an issue?</h3>
          <p style={{ marginTop: 8, marginBottom: 24 }}>Create a free account and submit your first complaint in under 2 minutes.</p>
          <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  sla: { fontSize: "0.8rem", color: "#64748b", background: "rgba(79,142,247,0.06)", borderRadius: 6, padding: "4px 10px", display: "inline-flex", gap: 6, alignItems: "center" },
  processSection: { padding: "60px 0", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 60 },
  processCard: { textAlign: "center", padding: 24 },
  stepNum: { width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #4f8ef7, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontSize: "1rem", fontWeight: 700, color: "#fff" },
  cta: { textAlign: "center", padding: "60px 20px", background: "rgba(79,142,247,0.04)", border: "1px solid rgba(79,142,247,0.1)", borderRadius: 16 },
};
