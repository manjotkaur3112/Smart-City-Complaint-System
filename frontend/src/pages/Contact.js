import React, { useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return toast.error("Please enter a valid email address");
    }
    setLoading(true);
    try {
      await api.post("/contact", form);
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      toast.success("Message sent! We'll get back to you soon.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="section-header text-center mb-24">
          <h2 style={{ color: "#e2e8f0" }}>Contact Us</h2>
          <p style={{ marginTop: 12 }}>Have questions? We're here to help.</p>
        </div>

        <div className="grid-2" style={{ gap: 40 }}>
          <div>
            <div className="card mb-24">
              <h4 style={{ color: "#e2e8f0", marginBottom: 20 }}>Get in Touch</h4>
              {[
                { icon: "📧", label: "Email", val: "support@civicpulse.gov.in" },
                { icon: "📞", label: "Helpline", val: "1800-97821-00 (Toll Free)" },
                { icon: "🕐", label: "Hours", val: "Mon–Sat 9AM–6PM IST" },
                { icon: "📍", label: "Office", val: "Municipal Corporation HQ, City Hall" },
              ].map((item) => (
                <div key={item.label} style={styles.contactItem}>
                  <span style={styles.contactIcon}>{item.icon}</span>
                  <div>
                    <div style={styles.contactLabel}>{item.label}</div>
                    <div style={styles.contactVal}>{item.val}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <h4 style={{ color: "#e2e8f0", marginBottom: 16 }}>Emergency Contacts</h4>
              {[
                { dept: "Water Supply", num: "100-WATER" },
                { dept: "Electricity Board", num: "1912" },
                { dept: "Municipal Helpdesk", num: "1533" },
              ].map((e) => (
                <div key={e.dept} style={styles.emergency}>
                  <span style={{ color: "#94a3b8", fontSize: "0.875rem" }}>{e.dept}</span>
                  <span style={{ color: "#4f8ef7", fontFamily: "monospace", fontWeight: 600 }}>{e.num}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            {sent ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <div style={{ fontSize: "3rem", marginBottom: 16 }}>✅</div>
                <h3 style={{ color: "#10b981" }}>Message Sent!</h3>
                <p style={{ marginTop: 8 }}>We'll respond within 24 hours.</p>
                <button className="btn btn-secondary mt-16" onClick={() => setSent(false)}>Send Another</button>
              </div>
            ) : (
              <>
                <h4 style={{ color: "#e2e8f0", marginBottom: 20 }}>Send a Message</h4>
                <form onSubmit={handleSubmit}>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Your Name</label>
                      <input className="form-control" name="name" value={form.name} onChange={handle} placeholder="Full Name" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input className="form-control" name="email" type="email" value={form.email} onChange={handle} placeholder="you@email.com" required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input className="form-control" name="subject" value={form.subject} onChange={handle} placeholder="How can we help?" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea className="form-control" name="message" value={form.message} onChange={handle} rows={5} placeholder="Describe your query in detail..." required />
                  </div>
                  <button className="btn btn-primary w-full" type="submit" disabled={loading}>
                    {loading ? "Sending..." : "📨 Send Message"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  contactItem: { display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 18 },
  contactIcon: { fontSize: "1.3rem", marginTop: 2, flexShrink: 0 },
  contactLabel: { fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 },
  contactVal: { fontSize: "0.9rem", color: "#e2e8f0", marginTop: 2 },
  emergency: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" },
};
