import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

const CATEGORIES = [
  { value: "pothole", label: "🚧 Pothole", desc: "Road damage, craters" },
  { value: "garbage", label: "🗑️ Garbage", desc: "Waste collection failure" },
  { value: "streetlight", label: "💡 Streetlight", desc: "Broken/missing lights" },
  { value: "water", label: "💧 Water Supply", desc: "Supply disruption" },
  { value: "sewage", label: "🚽 Sewage", desc: "Drainage issues" },
  { value: "electricity", label: "⚡ Electricity", desc: "Power outages" },
  { value: "noise", label: "🔊 Noise", desc: "Public disturbance" },
  { value: "other", label: "📋 Other", desc: "Other civic issues" },
];

const INIT = { title: "", description: "", category: "", address: "", ward: "", tags: "", images: [] };

export default function CitizenHome() {
  const { currentUser, dbUser } = useAuth();
  const [form, setForm] = useState(INIT);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [imageNames, setImageNames] = useState([]);
  const [step, setStep] = useState(0);

  const handle = (e) => {
    const next = { ...form, [e.target.name]: e.target.value };
    setForm(next);
  };

  const handleFiles = (e) => {
    const files = Array.from(e.dataTransfer?.files || e.target.files || []);
    setForm({ ...form, images: files });
    setImageNames(files.map((file) => file.name));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleNext = () => {
    if (step === 0) {
      if (!form.title.trim()) return toast.error("Please add a title");
      if (!form.description.trim()) return toast.error("Please add a description");
      const descriptionWordCount = form.description.trim().split(/\s+/).filter(Boolean).length;
      if (descriptionWordCount > 100) return toast.error("Description must be 100 words or fewer");
    }

    if (step === 1) {
      if (!form.category) return toast.error("Please select a category");
    }

    setStep((prev) => Math.min(prev + 1, 2));
  };

  const handleBack = () => setStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required.");
    if (!form.description.trim()) return toast.error("Description is required.");
    const descriptionWordCount = form.description.trim().split(/\s+/).filter(Boolean).length;
    if (descriptionWordCount > 100) return toast.error("Description must be 100 words or fewer");
    if (!form.category) return toast.error("Category is required.");
    if (!form.address.trim()) return toast.error("Location address is required.");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("location", JSON.stringify({ address: form.address, ward: form.ward }));
      formData.append("tags", form.tags || "");
      (form.images || []).forEach((file) => formData.append("images", file));

      const res = await api.post("/complaints", formData);
      setSubmitted(res.data.complaint);
      setForm(INIT);
      setImageNames([]);
      setStep(0);
      toast.success(`Complaint ${res.data.complaint.complaintId} submitted!`);
    } catch (err) {
      console.error("Complaint submission error", {
        message: err.message,
        url: err.config?.url,
        baseURL: err.config?.baseURL,
        responseStatus: err.response?.status,
        responseData: err.response?.data,
      });
      toast.error(err.response?.data?.message || err.message || "Submission failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div className="container">
        <div style={styles.header}>
          <div>
            <h1 style={{ color: "#e2e8f0" }}>
              Hello, {currentUser?.displayName?.split(" ")[0] || "Citizen"} 👋
            </h1>
            <p>Report a civic issue and help improve your city</p>
          </div>
          {dbUser?.role !== "citizen" && (
            <div style={styles.roleBadge}>{dbUser?.role?.toUpperCase()}</div>
          )}
        </div>

        {submitted && (
          <div style={styles.successCard}>
            <div style={{ fontSize: "2rem", marginBottom: 12 }}>✅</div>
            <h3 style={{ color: "#10b981" }}>Complaint Submitted!</h3>
            <p>Your complaint ID: <strong className="font-mono" style={{ color: "#4f8ef7" }}>{submitted.complaintId}</strong></p>
            <p style={{ fontSize: "0.9rem", marginTop: 8 }}>
              Priority assigned: <span className={`badge badge-${submitted.priority}`}>{submitted.priority}</span>
            </p>
            <button className="btn btn-sm btn-success mt-16" onClick={() => setSubmitted(null)}>
              Submit Another
            </button>
          </div>
        )}

        <div className="grid-2" style={{ marginTop: 32, gap: 32 }}>
          <div className="card">
            <div style={styles.formHeader}>
              <h3 style={{ color: "#e2e8f0" }}>📝 New Complaint</h3>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={styles.steps}>
                {[
                  { label: "Details", index: 0 },
                  { label: "Category", index: 1 },
                  { label: "Location", index: 2 },
                ].map((item) => (
                  <div key={item.index}
                    style={{ ...styles.step, ...(step === item.index ? styles.stepActive : {}) }}>
                    {item.index + 1}
                  </div>
                ))}
              </div>

              {step === 0 && (
                <>
                  <div className="form-group">
                    <label className="form-label">Issue Title *</label>
                    <input className="form-control" name="title" value={form.title} onChange={handle}
                      placeholder="e.g. Large pothole on Main Street near bus stop" />
                  </div>

                  <div className="form-group" style={{ marginTop: 16 }}>
                    <label className="form-label">Description *</label>
                    <textarea className="form-control" name="description" value={form.description} onChange={handle}
                      placeholder="Describe the issue in detail. Up to 100 words. Include when it started, impact, and important context..."
                      rows={5} />
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 6 }}>
                      {form.description.trim().split(/\s+/).filter(Boolean).length} / 100 words
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Upload Images</label>
                    <div
                      style={styles.fileDrop}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <label htmlFor="images" style={styles.fileDropLabel}>
                        <span style={styles.fileDropIcon}>📁</span>
                        <div>
                          <strong>Drag & drop to upload files</strong>
                          <div style={{ color: "#94a3b8", marginTop: 6, fontSize: "0.9rem" }}>
                            or click to browse images (PNG, JPG, JPEG)
                          </div>
                        </div>
                      </label>
                      <input
                        id="images"
                        className="form-control"
                        name="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFiles}
                        style={styles.fileInput}
                      />
                    </div>
                    {imageNames.length > 0 && (
                      <div style={{ marginTop: 8, color: "#94a3b8", fontSize: "0.85rem" }}>
                        Selected: {imageNames.join(", ")}
                      </div>
                    )}
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <label className="form-label" style={{ marginBottom: 12, display: 'block' }}>Select Category *</label>
                  <div style={styles.categoryGrid}>
                    {CATEGORIES.map((c) => (
                      <div key={c.value}
                        onClick={() => setForm({ ...form, category: c.value })}
                        style={{ ...styles.categoryCard, ...(form.category === c.value ? styles.categorySelected : {}) }}>
                        <div style={{ fontSize: "1.5rem" }}>{c.label.split(" ")[0]}</div>
                        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#e2e8f0" }}>{c.label.split(" ").slice(1).join(" ")}</div>
                        <div style={{ fontSize: "0.7rem", color: "#64748b" }}>{c.desc}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="form-group">
                    <label className="form-label">Location / Address *</label>
                    <input className="form-control" name="address" value={form.address} onChange={handle}
                      placeholder="e.g. 42 Gandhi Road, Near City Park" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ward / Area</label>
                    <input className="form-control" name="ward" value={form.ward} onChange={handle}
                      placeholder="e.g. Ward 12, North Zone" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tags (optional)</label>
                    <input className="form-control" name="tags" value={form.tags} onChange={handle}
                      placeholder="e.g. monsoon, urgent, road" />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
                {step > 0 && (
                  <button type="button" className="btn btn-secondary" onClick={handleBack}>
                    ← Back
                  </button>
                )}

                {step < 2 ? (
                  <button type="button" className="btn btn-primary" onClick={handleNext}>
                    Next
                  </button>
                ) : (
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Submitting..." : "🚀 Submit Complaint"}
                  </button>
                )}
              </div>
            </form>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="card">
              <h4 style={{ color: "#e2e8f0", marginBottom: 16 }}>📋 How It Works</h4>
              {[
                ["1", "Submit your complaint with location details"],
                ["2", "AI auto-assigns priority level"],
                ["3", "Authority reviews and assigns officer"],
                ["4", "Officer resolves and updates status"],
                ["5", "You receive resolution confirmation"],
              ].map(([n, t]) => (
                <div key={n} style={styles.step_info}>
                  <div style={styles.stepNum}>{n}</div>
                  <p style={{ fontSize: "0.875rem", color: "#94a3b8" }}>{t}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
      <a href="tel:+919782100977" style={styles.callButton} aria-label="Call support">
        📞 Call Support
      </a>
    </div>
  );
}

const styles = {
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 8 },
  roleBadge: { background: "rgba(79,142,247,0.15)", border: "1px solid rgba(79,142,247,0.3)", color: "#4f8ef7", padding: "6px 14px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em" },
  successCard: { background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 12, padding: 24, textAlign: "center", marginTop: 24 },
  formHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  steps: { display: "flex", gap: 8, marginBottom: 24 },
  step: { width: 28, height: 28, borderRadius: "50%", background: "#2d3748", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700, transition: "all 0.3s" },
  stepActive: { background: "#4f8ef7", color: "#fff" },
  categoryGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  categoryCard: { background: "#131629", border: "2px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 12, cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column", gap: 4, alignItems: "center", textAlign: "center" },
  categorySelected: { border: "2px solid #4f8ef7", background: "rgba(79,142,247,0.1)" },
  fileDrop: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: 160, border: "2px dashed rgba(79,142,247,0.45)", borderRadius: 16, padding: 20, background: "rgba(79,142,247,0.04)", cursor: "pointer", transition: "background 0.2s" },
  fileDropLabel: { display: "inline-flex", alignItems: "center", gap: 16, width: "100%", justifyContent: "center", textAlign: "center", color: "#e2e8f0", cursor: "pointer" },
  fileDropIcon: { fontSize: "2rem", lineHeight: 1 },
  fileInput: { position: "absolute", width: 0, height: 0, opacity: 0, overflow: "hidden", pointerEvents: "none" },
  step_info: { display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 },
  stepNum: { width: 24, height: 24, borderRadius: "50%", background: "rgba(79,142,247,0.2)", color: "#4f8ef7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 },
  callButton: { position: "fixed", right: 20, bottom: 20, zIndex: 200, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#10b981", color: "#fff", padding: "14px 18px", borderRadius: 999, boxShadow: "0 14px 30px rgba(16,185,129,0.24)", border: "none", textDecoration: "none", fontWeight: 700, fontSize: "0.95rem", transition: "transform 0.2s ease, box-shadow 0.2s ease" },
  dsaTag: { background: "rgba(79,142,247,0.08)", border: "1px solid rgba(79,142,247,0.2)", borderRadius: 8, padding: "8px 12px", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 8 },
};
