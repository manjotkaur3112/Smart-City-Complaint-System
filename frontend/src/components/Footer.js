import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.brand}>
          <span style={styles.brandText}>🏙️ Civic<span style={{ color: "#4f8ef7" }}>Pulse</span></span>
          <p style={styles.tagline}>Empowering citizens. Building smarter cities.</p>
        </div>
        <div style={styles.links}>
          <Link to="/services" style={styles.link}>Services</Link>
          <Link to="/contact" style={styles.link}>Contact</Link>
          <Link to="/history" style={styles.link}>My Complaints</Link>
        </div>
        <div style={styles.copy}>
          <span style={{ color: "#64748b", fontSize: "0.8rem" }}>
            © 2026 CivicPulse — Smart City Complaint Management System
          </span>
          {/* <span style={{ color: "#4f8ef7", fontSize: "0.75rem", fontFamily: "monospace" }}>
            DSA: BubbleSort • InsertionSort • SelectionSort • LinearSearch • BinarySearch • Array Ops
          </span> */}
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: "#0a0c15", borderTop: "1px solid rgba(255,255,255,0.06)",
    padding: "40px 0 24px",
  },
  container: {
    maxWidth: 1200, margin: "0 auto", padding: "0 24px",
    display: "flex", flexDirection: "column", gap: 24, alignItems: "center",
  },
  brand: { textAlign: "center" },
  brandText: { fontSize: "1.3rem", fontWeight: 700, color: "#e2e8f0" },
  tagline: { color: "#64748b", fontSize: "0.85rem", marginTop: 6 },
  links: { display: "flex", gap: 24 },
  link: { color: "#64748b", fontSize: "0.875rem", textDecoration: "none" },
  copy: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
};
