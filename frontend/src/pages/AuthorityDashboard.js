import React, { useEffect, useState, useCallback } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import { countByField } from "../dsa";

export default function AuthorityDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats]           = useState({});
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [updateForm, setUpdateForm] = useState({ status: "", remarks: "" });
  const [activeTab, setActiveTab]   = useState("complaints");

  const fetchAll = useCallback(async () => {
    try {
      const [cRes, sRes] = await Promise.all([
        api.get("/complaints/all"),
        api.get("/admin/stats"),
      ]);
      setComplaints(cRes.data.complaints || []);
      setStats(sRes.data);
    } catch { toast.error("Failed to load complaints"); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const processed = [...complaints].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleStatusUpdate = async () => {
    if (!selected || !updateForm.status) return;
    try {
      await api.patch(`/complaints/${selected._id}/status`, updateForm);
      toast.success("Status updated!");
      setSelected(null);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || "Update failed"); }
  };

  const categoryFreq = countByField(complaints, "category");

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container">

        <div style={S.pageHeader}>
          <div>
            <h2 style={{ color: "#e2e8f0", marginBottom: 4 }}>🏛️ Authority Dashboard</h2>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Review, assign and resolve citizen complaints</p>
          </div>
          <div style={S.badge}>AUTHORITY</div>
        </div>

        <div style={S.accessNotice}>
          <span style={{ color: "#4f8ef7", marginRight: 8 }}>ℹ️</span>
          You can <strong style={{ color: "#e2e8f0" }}>view and update complaint statuses</strong>.
          User management and system settings are restricted to Admins only.
        </div>

        <div className="grid-4 mb-24">
          {[
            { label: "Total",       value: stats.total      || complaints.length, color: "#4f8ef7" },
            { label: "Pending",     value: stats.pending    || 0,                 color: "#f59e0b" },
            { label: "In Progress", value: stats.inProgress || 0,                 color: "#a78bfa" },
            { label: "Resolved",    value: stats.resolved   || 0,                 color: "#10b981" },
          ].map((s) => (
            <div key={s.label} className="card stat-card">
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div style={S.tabs}>
          {["complaints", "analytics"].map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              style={{ ...S.tab, ...(activeTab === t ? S.tabActive : {}) }}>
              {t === "complaints" ? "📋 Complaints" : "📊 Analytics"}
            </button>
          ))}
        </div>

        {activeTab === "complaints" && (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>ID</th><th>Title</th><th>Category</th><th>Priority</th><th>Status</th><th>Citizen</th><th>Date</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {processed.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "#64748b" }}>No complaints found</td></tr>
                  ) : processed.map((c) => (
                    <tr key={c._id}>
                      <td className="font-mono" style={{ fontSize: "0.75rem", color: "#4f8ef7" }}>{c.complaintId}</td>
                      <td style={{ maxWidth: 200 }}>
                        <div style={{ fontWeight: 500, color: "#e2e8f0", fontSize: "0.875rem" }}>{c.title}</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>{c.location?.address}</div>
                      </td>
                      <td style={{ textTransform: "capitalize", fontSize: "0.85rem" }}>{c.category}</td>
                      <td><span className={`badge badge-${c.priority}`}>{c.priority}</span></td>
                      <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                      <td style={{ fontSize: "0.85rem", color: "#94a3b8" }}>{c.citizen?.name || "—"}</td>
                      <td style={{ fontSize: "0.8rem", color: "#64748b" }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="btn btn-sm btn-secondary"
                          onClick={() => { setSelected(c); setUpdateForm({ status: c.status, remarks: c.remarks || "" }); }}>
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === "analytics" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="card">
              <h4 style={{ color: "#e2e8f0", marginBottom: 16 }}>📊 Category Frequency</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {Object.entries(categoryFreq).map(([cat, count]) => (
                  <div key={cat} style={S.freqBadge}>
                    <span style={{ textTransform: "capitalize" }}>{cat}</span>
                    <strong style={{ color: "#4f8ef7" }}>{count}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h4 style={{ color: "#e2e8f0", marginBottom: 20 }}>Status Overview</h4>
              {[
                { key: "pending",     color: "#f59e0b", val: stats.pending    || 0 },
                { key: "assigned",    color: "#4f8ef7", val: stats.assigned   || 0 },
                { key: "in-progress", color: "#a78bfa", val: stats.inProgress || 0 },
                { key: "resolved",    color: "#10b981", val: stats.resolved   || 0 },
                { key: "rejected",    color: "#ef4444", val: stats.rejected   || 0 },
              ].map((s) => (
                <div key={s.key} style={S.barRow}>
                  <span className={`badge badge-${s.key}`} style={{ width: 90, textAlign: "center" }}>{s.key}</span>
                  <div style={S.barTrack}>
                    <div style={{ ...S.barFill, width: `${Math.min((s.val / (stats.total || 1)) * 100, 100)}%`, background: s.color }} />
                  </div>
                  <span style={{ color: "#94a3b8", fontFamily: "monospace" }}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {selected && (
          <div style={S.overlay} onClick={() => setSelected(null)}>
            <div style={S.modal} onClick={(e) => e.stopPropagation()}>
              <div style={S.modalHeader}>
                <div>
                  <h3 style={{ color: "#e2e8f0" }}>{selected.title}</h3>
                  <span className="font-mono" style={{ fontSize: "0.8rem", color: "#4f8ef7" }}>{selected.complaintId}</span>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕</button>
              </div>
              <div style={{ padding: 24 }}>
                <p style={{ fontSize: "0.9rem", color: "#94a3b8", marginBottom: 10 }}><strong>Summary:</strong> {selected.description}</p>
                <p style={{ fontSize: "0.9rem", color: "#94a3b8", marginBottom: 16 }}><strong>Details:</strong> {selected.description}</p>
                {selected.images?.length > 0 && (
                  <div style={S.imageGrid}>
                    {selected.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`complaint-${idx}`}
                        style={S.imagePreview}
                        onClick={(e) => { e.stopPropagation(); setSelectedImage(img); }}
                      />
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
                  <span>📍 {selected.location?.address}</span>
                  <span className={`badge badge-${selected.priority}`}>{selected.priority}</span>
                  <span className={`badge badge-${selected.status}`}>{selected.status}</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Update Status</label>
                  <select className="form-control" value={updateForm.status}
                    onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}>
                    {["pending","assigned","in-progress","resolved","rejected"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Remarks</label>
                  <textarea className="form-control" value={updateForm.remarks} rows={3}
                    onChange={(e) => setUpdateForm({ ...updateForm, remarks: e.target.value })}
                    placeholder="Add update notes..." />
                </div>
                {selected.timeline?.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <h4 style={{ color: "#e2e8f0", fontSize: "0.85rem", marginBottom: 10 }}>Timeline</h4>
                    {selected.timeline.map((t, i) => (
                      <div key={i} style={S.timelineItem}>
                        <div style={S.timelineDot} />
                        <div>
                          <span className={`badge badge-${t.status}`}>{t.status}</span>
                          <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 4 }}>{t.note}</p>
                          <p style={{ fontSize: "0.75rem", color: "#4a5568" }}>{new Date(t.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button className="btn btn-primary mt-16 w-full" onClick={handleStatusUpdate}>
                  Update Status
                </button>
              </div>
            </div>
          </div>
        )}
        {selectedImage && (
          <div style={S.imageOverlay} onClick={() => setSelectedImage(null)}>
            <div style={S.imageModal} onClick={(e) => e.stopPropagation()}>
              <img src={selectedImage} alt="Expanded complaint" style={S.imageModalImg} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const S = {
  pageHeader:   { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 },
  badge:        { background: "rgba(79,142,247,0.15)", border: "1px solid rgba(79,142,247,0.4)", color: "#4f8ef7", padding: "6px 16px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em" },
  accessNotice: { background: "rgba(79,142,247,0.06)", border: "1px solid rgba(79,142,247,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 24, fontSize: "0.85rem", color: "#64748b" },
  tabs:         { display: "flex", gap: 4, marginBottom: 24, background: "#131629", padding: 4, borderRadius: 10, width: "fit-content" },
  tab:          { padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "0.875rem", fontWeight: 500, background: "transparent", color: "#64748b", transition: "all 0.2s" },
  tabActive:    { background: "#1a1d30", color: "#e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" },
  freqBadge:    { background: "rgba(79,142,247,0.08)", border: "1px solid rgba(79,142,247,0.2)", borderRadius: 8, padding: "6px 12px", fontSize: "0.8rem", display: "flex", gap: 8, alignItems: "center", color: "#94a3b8" },
  barRow:       { display: "flex", alignItems: "center", gap: 14, marginBottom: 14 },
  barTrack:     { flex: 1, height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" },
  barFill:      { height: "100%", background: "linear-gradient(90deg,#4f8ef7,#7c3aed)", borderRadius: 4, transition: "width 0.5s" },
  overlay:      { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  modal:        { background: "#1a1d30", border: "1px solid rgba(79,142,247,0.3)", borderRadius: 16, width: "100%", maxWidth: 580, maxHeight: "85vh", overflowY: "auto" },
  modalHeader:  { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" },
  imageGrid:    { display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  imagePreview: { width: 120, height: 90, objectFit: "cover", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer" },
  imageOverlay:  { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  imageModal:    { width: "80vw", maxWidth: 960, maxHeight: "80vh", overflow: "hidden", borderRadius: 16, boxShadow: "0 0 40px rgba(0,0,0,0.6)" },
  imageModalImg: { width: "100%", height: "100%", objectFit: "contain", display: "block" },
  timelineItem: { display: "flex", gap: 12, marginBottom: 12, paddingLeft: 8 },
  timelineDot:  { width: 8, height: 8, borderRadius: "50%", background: "#4f8ef7", marginTop: 8, flexShrink: 0 },
};

