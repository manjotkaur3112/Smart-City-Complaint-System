import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { insertionSort, linearSearch, binarySearchById, compareComplaintIds } from "../dsa";
import toast from "react-hot-toast";

export default function History() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchId, setSearchId] = useState("");
  const [binaryResult, setBinaryResult] = useState(null);
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [expanded, setExpanded] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    api.get("/complaints/my").then((res) => {
      setComplaints(res.data.complaints);
    }).catch(() => toast.error("Failed to load complaints"))
      .finally(() => setLoading(false));
  }, []);

  const processed = insertionSort(
    linearSearch(complaints, search, ["title", "category", "location"]),
    sortKey, sortOrder
  );

  const handleBinarySearch = () => {
    const query = searchId.trim();
    if (!query) {
      toast.error("Please enter a complaint ID.");
      return;
    }

    const sorted = [...complaints].sort((a, b) =>
      compareComplaintIds(a.complaintId, b.complaintId)
    );
    const { found } = binarySearchById(sorted, query);

    if (found) {
      setBinaryResult(found);
      toast.success(`Found: ${found.complaintId}`);
      return;
    }

    const exactMatch = complaints.find(
      (c) => String(c.complaintId).trim() === query
    );
    if (exactMatch) {
      setBinaryResult(exactMatch);
      toast.success(`Found: ${exactMatch.complaintId}`);
      return;
    }

    setBinaryResult(null);
    toast.error("Binary search requires the full complaint ID (e.g. CP-3D18AC7B).");
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="section-header">
          <h2 style={{ color: "#e2e8f0" }}>📋 My Complaint History</h2>
          <p>Track all your submitted complaints.</p>
        </div>

        <div className="card" style={styles.dsaPanel}>
          <div style={{ flex: 1, display: "grid", gap: 10 }}>
            <label style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Linear Search</label>
            <input
              className="form-control"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, category or location..."
            />
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>
              Uses linear search to filter complaints by matching query text.
            </p>
          </div>

          <div style={{ flex: 1, display: "grid", gap: 10 }}>
            <label style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Binary Search (exact ID only)</label>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                className="form-control"
                style={{ flex: 1 }}
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter full complaint ID, e.g. CP-3D18AC7B"
              />
              <button className="btn btn-primary" type="button" onClick={handleBinarySearch}>
                Search
              </button>
            </div>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>
              Uses binary search on sorted complaint IDs for fast exact lookup.
            </p>
            {binaryResult && (
              <div style={styles.binaryResult}>
                <div>
                  <strong>Found:</strong> {binaryResult.complaintId} — {binaryResult.title}
                </div>
                <button
                  className="btn btn-sm btn-secondary"
                  type="button"
                  onClick={() => setBinaryResult(null)}
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {processed.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📭</div>
            <h3>No complaints found</h3>
            <p>Try adjusting your search or submit a new complaint</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {processed.map((c) => (
              <div key={c._id} className="card" style={{ cursor: "pointer" }}
                onClick={() => setExpanded(expanded === c._id ? null : c._id)}>
                <div style={styles.complaintHeader}>
                  <div style={styles.complaintLeft}>
                    <span className="font-mono" style={styles.complaintId}>{c.complaintId}</span>
                    <h4 style={{ color: "#e2e8f0" }}>{c.title}</h4>
                    <p style={{ fontSize: "0.85rem", color: "#64748b" }}>📍 {c.location?.address}</p>
                  </div>
                  <div style={styles.complaintRight}>
                    <span className={`badge badge-${c.status}`}>{c.status}</span>
                    <span className={`badge badge-${c.priority}`}>{c.priority}</span>
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                    <span style={{ color: "#4f8ef7" }}>{expanded === c._id ? "▲" : "▼"}</span>
                  </div>
                </div>

                {expanded === c._id && (
                  <div style={styles.expanded}>
                    <p style={{ fontSize: "0.9rem", color: "#94a3b8", marginBottom: 12 }}><strong>Summary:</strong> {c.description}</p>
                    <p style={{ fontSize: "0.9rem", color: "#94a3b8", marginBottom: 16 }}><strong>Details:</strong> {c.description}</p>
                    {c.images?.length > 0 && (
                      <div style={styles.imageGrid}>
                        {c.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`complaint-${idx}`}
                            style={styles.imagePreview}
                            onClick={(e) => { e.stopPropagation(); setSelectedImage(img); }}
                          />
                        ))}
                      </div>
                    )}
                    {c.remarks && (
                      <div style={styles.remarksBox}>
                        <strong style={{ color: "#e2e8f0", fontSize: "0.8rem" }}>Authority Remarks:</strong>
                        <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: 4 }}>{c.remarks}</p>
                      </div>
                    )}
                    {c.timeline?.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <strong style={{ color: "#e2e8f0", fontSize: "0.8rem" }}>Timeline:</strong>
                        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                          {c.timeline.map((t, i) => (
                            <div key={i} style={styles.timelineRow}>
                              <span className={`badge badge-${t.status}`}>{t.status}</span>
                              <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{t.note}</span>
                              <span style={{ fontSize: "0.75rem", color: "#4a5568", marginLeft: "auto" }}>{new Date(t.timestamp).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {selectedImage && (
          <div style={styles.imageOverlay} onClick={() => setSelectedImage(null)}>
            <div style={styles.imageModal} onClick={(e) => e.stopPropagation()}>
              <img src={selectedImage} alt="Expanded complaint" style={styles.imageModalImg} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  dsaPanel: { display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" },
  binaryResult: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 8, padding: "10px 14px", marginTop: 12, fontSize: "0.85rem" },
  complaintHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 },
  complaintLeft: { display: "flex", flexDirection: "column", gap: 4 },
  complaintId: { fontSize: "0.75rem", color: "#4f8ef7" },
  complaintRight: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  expanded: { marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)" },
  imageGrid: { display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  imagePreview: { width: 110, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer" },
  imageOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  imageModal: { width: "80vw", maxWidth: 960, maxHeight: "80vh", overflow: "hidden", borderRadius: 16, boxShadow: "0 0 40px rgba(0,0,0,0.6)" },
  imageModalImg: { width: "100%", height: "100%", objectFit: "contain", display: "block" },
  remarksBox: { background: "rgba(79,142,247,0.06)", border: "1px solid rgba(79,142,247,0.15)", borderRadius: 8, padding: 12 },
  timelineRow: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" },
};
