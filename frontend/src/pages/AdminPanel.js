import React, { useEffect, useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import { insertionSort, linearSearch } from "../dsa";

const TABS = ["overview", "users", "complaints", "categories", "authority"];

export default function AdminPanel() {
  const [users, setUsers]             = useState([]);
  const [complaints, setComplaints]   = useState([]);
  const [stats, setStats]             = useState({});
  const [search, setSearch]           = useState("");
  const [compSearch, setCompSearch]   = useState("");
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState("overview");
  const [selected, setSelected]       = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [updateForm, setUpdateForm]   = useState({ status: "", remarks: "" });
  const [filterStatus, setFilterStatus] = useState("");
  
  // State for authority creation
  const [authForm, setAuthForm]       = useState({ name: "", email: "", password: "" });
  const [authLoading, setAuthLoading] = useState(false);

  // States for authority email verification
  const [authOtpRequired, setAuthOtpRequired] = useState(false);
  const [authOtp, setAuthOtp]                 = useState("");
  const [authEmailToVerify, setAuthEmailToVerify] = useState("");
  const [authVerifying, setAuthVerifying]     = useState(false);

  const handleAuthFormChange = (e) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };

  const handleCreateAuthority = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(authForm.email)) {
      return toast.error("Please enter a valid email address");
    }
    if (authForm.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    setAuthLoading(true);
    try {
      const res = await api.post("/admin/create-authority", authForm);
      if (res.data && res.data.verificationRequired) {
        toast.success("Authority account created. Verification code sent!");
        setAuthEmailToVerify(res.data.email);
        setAuthOtpRequired(true);
      } else {
        toast.success(res.data.message || "Authority account created successfully");
        setAuthForm({ name: "", email: "", password: "" });
        const uRes = await api.get("/admin/users");
        setUsers(uRes.data.users);
        setActiveTab("users");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create authority account");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyAuthorityEmail = async (e) => {
    e.preventDefault();
    if (authOtp.length !== 6) {
      return toast.error("Please enter a valid 6-digit OTP code");
    }
    setAuthVerifying(true);
    try {
      const res = await api.post("/admin/verify-authority", { email: authEmailToVerify, otp: authOtp });
      toast.success(res.data.message || "Authority account email verified and activated!");
      
      // Reset forms and verification states
      setAuthForm({ name: "", email: "", password: "" });
      setAuthOtpRequired(false);
      setAuthOtp("");
      setAuthEmailToVerify("");
      
      // Refresh user list and switch tab
      const uRes = await api.get("/admin/users");
      setUsers(uRes.data.users);
      setActiveTab("users");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to verify authority email");
    } finally {
      setAuthVerifying(false);
    }
  };

  useEffect(() => {
    Promise.all([
      api.get("/admin/users"),
      api.get("/admin/stats"),
      api.get("/complaints/all"),
    ]).then(([uRes, sRes, cRes]) => {
      setUsers(uRes.data.users);
      setStats(sRes.data);
      setComplaints(cRes.data.complaints || []);
    }).catch(() => toast.error("Failed to load admin data"))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role });
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, role } : u));
      toast.success("Role updated!");
    } catch { toast.error("Failed to update role"); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success("User deleted");
    } catch { toast.error("Failed to delete user"); }
  };

  const handleDeleteComplaint = async (id) => {
    if (!window.confirm("Delete this complaint?")) return;
    try {
      await api.delete(`/complaints/${id}`);
      setComplaints((prev) => prev.filter((c) => c._id !== id));
      toast.success("Complaint deleted");
    } catch { toast.error("Failed to delete complaint"); }
  };

  const handleStatusUpdate = async () => {
    if (!selected || !updateForm.status) return;
    try {
      await api.patch(`/complaints/${selected._id}/status`, updateForm);
      setComplaints((prev) =>
        prev.map((c) => c._id === selected._id ? { ...c, status: updateForm.status } : c)
      );
      toast.success("Status updated!");
      setSelected(null);
    } catch { toast.error("Update failed"); }
  };

  const filteredUsers = insertionSort(linearSearch(users, search, ["name", "email", "role"]), "createdAt", "desc");
  const filteredComps = insertionSort(
    linearSearch(complaints, compSearch, ["title", "complaintId", "category"]).filter((c) => {
      const matchStatus = !filterStatus || c.status === filterStatus;
      return matchStatus;
    }),
    "createdAt", "desc"
  );

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  const tabIcons = { overview: "📊", users: "👥", complaints: "📋", categories: "🗂️", authority: "🏛️" };

  return (
    <div className="page">
      <div className="container">

        <div style={S.pageHeader}>
          <div>
            <h2 style={{ color: "#e2e8f0", marginBottom: 4 }}>🛡️ Admin Control Panel</h2>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Full system access — users, complaints, analytics</p>
          </div>
          <div style={S.adminBadge}>ADMIN</div>
        </div>

        <div style={S.powerNotice}>
          <span style={{ marginRight: 8 }}>🔐</span>
          You have <strong style={{ color: "#ef4444" }}>full system access</strong>: manage users, change roles,
          delete complaints, and override any status.
        </div>

        <div className="grid-4 mb-24">
          {[
            { label: "Total Complaints", value: stats.total    || 0,   color: "#4f8ef7" },
            { label: "Resolved",         value: stats.resolved || 0,   color: "#10b981" },
            { label: "Pending",          value: stats.pending  || 0,   color: "#f59e0b" },
            { label: "Total Users",      value: users.length,          color: "#a78bfa" },
          ].map((s) => (
            <div key={s.label} className="card stat-card">
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div style={S.tabs}>
          {TABS.map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              style={{ ...S.tab, ...(activeTab === t ? S.tabActive : {}) }}>
              {tabIcons[t]} {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="card">
              <h4 style={{ color: "#e2e8f0", marginBottom: 20 }}>👥 User Role Distribution</h4>
              {["citizen", "authority", "admin"].map((role) => {
                const count = users.filter((u) => u.role === role).length;
                const pct   = users.length ? Math.round((count / users.length) * 100) : 0;
                const color = role === "admin" ? "#ef4444" : role === "authority" ? "#4f8ef7" : "#10b981";
                return (
                  <div key={role} style={S.barRow}>
                    <span style={{ ...S.roleChip, ...S[`role_${role}`], width: 80, textAlign: "center" }}>{role}</span>
                    <div style={S.barTrack}>
                      <div style={{ ...S.barFill, width: `${pct}%`, background: color }} />
                    </div>
                    <span style={{ color: "#94a3b8", fontFamily: "monospace", width: 40 }}>{count}</span>
                    <span style={{ color: "#64748b", fontSize: "0.8rem" }}>{pct}%</span>
                  </div>
                );
              })}
            </div>

            <div className="card">
              <h4 style={{ color: "#e2e8f0", marginBottom: 20 }}>📋 Complaint Status Breakdown</h4>
              {[
                { key: "pending",     label: "Pending",     color: "#f59e0b", val: stats.pending    || 0 },
                { key: "assigned",    label: "Assigned",    color: "#4f8ef7", val: stats.assigned   || 0 },
                { key: "in-progress", label: "In Progress", color: "#a78bfa", val: stats.inProgress || 0 },
                { key: "resolved",    label: "Resolved",    color: "#10b981", val: stats.resolved   || 0 },
                { key: "rejected",    label: "Rejected",    color: "#ef4444", val: stats.rejected   || 0 },
              ].map((s) => (
                <div key={s.key} style={S.barRow}>
                  <span style={{ color: s.color, width: 90, fontSize: "0.85rem", fontWeight: 600 }}>{s.label}</span>
                  <div style={S.barTrack}>
                    <div style={{ ...S.barFill, width: `${Math.min((s.val / (stats.total || 1)) * 100, 100)}%`, background: s.color }} />
                  </div>
                  <span style={{ color: "#94a3b8", fontFamily: "monospace", width: 30 }}>{s.val}</span>
                </div>
              ))}
            </div>

            <div className="card">
              <h4 style={{ color: "#e2e8f0", marginBottom: 16 }}>🕒 Recent Complaints</h4>
              {(stats.recentComplaints || []).map((c) => (
                <div key={c._id} style={S.recentItem}>
                  <span className="font-mono" style={{ color: "#4f8ef7", fontSize: "0.75rem", minWidth: 120 }}>{c.complaintId}</span>
                  <span style={{ color: "#e2e8f0", flex: 1, fontSize: "0.875rem" }}>{c.title}</span>
                  <span className={`badge badge-${c.status}`}>{c.status}</span>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="card">
            <div style={S.tableHeader}>
              <div>
                <h4 style={{ color: "#e2e8f0" }}>User Management</h4>
                <p style={{ color: "#64748b", fontSize: "0.78rem", marginTop: 2 }}>
                  Change roles or remove users from the system
                </p>
              </div>
              <input className="form-control" style={{ width: 260 }} value={search}
                onChange={(e) => setSearch(e.target.value)} placeholder="Search name / email / role..." />
            </div>
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 16 }}>
              Found {filteredUsers.length} of {users.length} users
            </p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Change Role</th><th>Delete</th></tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u._id}>
                      <td style={{ color: "#e2e8f0", fontWeight: 500 }}>{u.name}</td>
                      <td style={{ fontSize: "0.85rem", color: "#94a3b8" }}>{u.email}</td>
                      <td><span style={{ ...S.roleChip, ...S[`role_${u.role}`] }}>{u.role}</span></td>
                      <td style={{ fontSize: "0.8rem", color: "#64748b" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)} style={S.roleSelect}>
                          <option value="citizen">Citizen</option>
                          <option value="authority">Authority</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <button onClick={() => handleDeleteUser(u._id)} style={S.deleteBtn}>🗑 Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "complaints" && (
          <div className="card">
            <div style={S.tableHeader}>
              <div>
                <h4 style={{ color: "#e2e8f0" }}>All Complaints</h4>
                <p style={{ color: "#64748b", fontSize: "0.78rem", marginTop: 2 }}>
                  Edit status or permanently delete any complaint
                </p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <input className="form-control" style={{ width: 220 }} value={compSearch}
                  onChange={(e) => setCompSearch(e.target.value)} placeholder="Search title / ID..." />
                <select className="form-control" style={{ width: 140 }} value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="">All Status</option>
                  {["pending","assigned","in-progress","resolved","rejected"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 16 }}>
              Showing {filteredComps.length} of {complaints.length} complaints
            </p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>ID</th><th>Title</th><th>Category</th><th>Priority</th><th>Status</th><th>Citizen</th><th>Date</th><th>Edit</th><th>Delete</th></tr>
                </thead>
                <tbody>
                  {filteredComps.length === 0 ? (
                    <tr><td colSpan={9} style={{ textAlign: "center", padding: 40, color: "#64748b" }}>No complaints found</td></tr>
                  ) : filteredComps.map((c) => (
                    <tr key={c._id}>
                      <td className="font-mono" style={{ fontSize: "0.75rem", color: "#4f8ef7" }}>{c.complaintId}</td>
                      <td style={{ maxWidth: 180, color: "#e2e8f0", fontSize: "0.875rem" }}>{c.title}</td>
                      <td style={{ textTransform: "capitalize", fontSize: "0.85rem" }}>{c.category}</td>
                      <td><span className={`badge badge-${c.priority}`}>{c.priority}</span></td>
                      <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                      <td style={{ fontSize: "0.85rem", color: "#94a3b8" }}>{c.citizen?.name || "—"}</td>
                      <td style={{ fontSize: "0.8rem", color: "#64748b" }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="btn btn-sm btn-secondary"
                          onClick={() => { setSelected(c); setUpdateForm({ status: c.status, remarks: c.remarks || "" }); }}>
                          Edit
                        </button>
                      </td>
                      <td>
                        <button onClick={() => handleDeleteComplaint(c._id)} style={S.deleteBtn}>🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "categories" && (
          <div className="card">
            <h4 style={{ color: "#e2e8f0", marginBottom: 20 }}>Category Analytics</h4>
            {(stats.byCategory || []).map((c) => (
              <div key={c._id} style={S.barRow}>
                <span style={{ textTransform: "capitalize", color: "#94a3b8", width: 110 }}>{c._id}</span>
                <div style={S.barTrack}>
                  <div style={{ ...S.barFill, width: `${Math.min((c.count / (stats.total || 1)) * 100, 100)}%` }} />
                </div>
                <span style={{ color: "#4f8ef7", fontFamily: "monospace", width: 30, textAlign: "right" }}>{c.count}</span>
              </div>
            ))}
            {(stats.byPriority || []).length > 0 && (
              <>
                <h4 style={{ color: "#e2e8f0", margin: "28px 0 16px" }}>Priority Distribution</h4>
                {stats.byPriority.map((p) => (
                  <div key={p._id} style={S.barRow}>
                    <span className={`badge badge-${p._id}`} style={{ width: 70 }}>{p._id}</span>
                    <div style={S.barTrack}>
                      <div style={{ ...S.barFill, width: `${Math.min((p.count / (stats.total || 1)) * 100, 100)}%` }} />
                    </div>
                    <span style={{ color: "#4f8ef7", fontFamily: "monospace", width: 30 }}>{p.count}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {activeTab === "authority" && (
          <div className="card" style={{ maxWidth: 500, margin: "0 auto" }}>
            {authOtpRequired ? (
              <>
                <h4 style={{ color: "#e2e8f0", marginBottom: 6 }}>🏛️ Verify Authority Email</h4>
                <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: 20 }}>
                  Enter the 6-digit OTP code sent to verify <strong style={{ color: "#4f8ef7" }}>{authEmailToVerify}</strong>
                </p>
                <form onSubmit={handleVerifyAuthorityEmail}>
                  <div className="form-group">
                    <label className="form-label">Verification Code (OTP)</label>
                    <input
                      className="form-control"
                      type="text"
                      value={authOtp}
                      onChange={(e) => setAuthOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="••••••"
                      style={{ textAlign: "center", fontSize: "1.3rem", letterSpacing: "8px", fontWeight: "bold" }}
                      required
                    />
                  </div>
                  <button className="btn btn-primary w-full" type="submit" disabled={authVerifying}>
                    {authVerifying ? "Verifying..." : "Verify & Activate Account"}
                  </button>
                </form>
                <button
                  className="btn btn-ghost w-full"
                  style={{ marginTop: 16, color: "#64748b", fontSize: "0.85rem", textTransform: "none" }}
                  onClick={() => { setAuthOtpRequired(false); setAuthOtp(""); setAuthEmailToVerify(""); }}
                >
                  ← Back to Creation
                </button>
              </>
            ) : (
              <>
                <h4 style={{ color: "#e2e8f0", marginBottom: 6 }}>🏛️ Create Authority Account</h4>
                <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: 20 }}>
                  Register a new official department or authority account
                </p>
                <form onSubmit={handleCreateAuthority}>
                  <div className="form-group">
                    <label className="form-label">Authority Name</label>
                    <input
                      className="form-control"
                      type="text"
                      name="name"
                      value={authForm.name}
                      onChange={handleAuthFormChange}
                      placeholder="e.g. Water Supply Department"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Authority Email</label>
                    <input
                      className="form-control"
                      type="email"
                      name="email"
                      value={authForm.email}
                      onChange={handleAuthFormChange}
                      placeholder="e.g. water@city.gov"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      className="form-control"
                      type="password"
                      name="password"
                      value={authForm.password}
                      onChange={handleAuthFormChange}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <button className="btn btn-primary w-full" type="submit" disabled={authLoading}>
                    {authLoading ? "Creating..." : "Create Authority Account"}
                  </button>
                </form>
              </>
            )}
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
                <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: 10 }}><strong>Summary:</strong> {selected.description}</p>
                <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: 16 }}><strong>Details:</strong> {selected.description}</p>
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
                    placeholder="Admin notes..." />
                </div>
                <button className="btn btn-primary w-full" onClick={handleStatusUpdate}>
                  Save Changes
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
  pageHeader:    { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 },
  adminBadge:    { background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", color: "#ef4444", padding: "6px 16px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em" },
  powerNotice:   { background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 24, fontSize: "0.85rem", color: "#94a3b8" },
  tabs:          { display: "flex", gap: 4, marginBottom: 24, background: "#131629", padding: 4, borderRadius: 10, width: "fit-content", flexWrap: "wrap" },
  tab:           { padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "0.875rem", fontWeight: 500, background: "transparent", color: "#64748b", transition: "all 0.2s" },
  tabActive:     { background: "#1a1d30", color: "#e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" },
  tableHeader:   { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 12 },
  roleChip:      { padding: "3px 10px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, textTransform: "capitalize", display: "inline-block" },
  role_citizen:  { background: "rgba(100,116,139,0.2)", color: "#94a3b8" },
  role_authority:{ background: "rgba(79,142,247,0.15)", color: "#4f8ef7" },
  role_admin:    { background: "rgba(239,68,68,0.15)", color: "#ef4444" },
  imageGrid:     { display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  imagePreview:  { width: 120, height: 90, objectFit: "cover", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer" },
  imageOverlay:  { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  imageModal:    { width: "80vw", maxWidth: 960, maxHeight: "80vh", overflow: "hidden", borderRadius: 16, boxShadow: "0 0 40px rgba(0,0,0,0.6)" },
  imageModalImg: { width: "100%", height: "100%", objectFit: "contain", display: "block" },
  roleSelect:    { background: "#131629", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 8px", color: "#e2e8f0", fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit" },
  deleteBtn:     { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: "0.78rem", fontFamily: "inherit" },
  barRow:        { display: "flex", alignItems: "center", gap: 14, marginBottom: 14 },
  barTrack:      { flex: 1, height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" },
  barFill:       { height: "100%", background: "linear-gradient(90deg,#4f8ef7,#7c3aed)", borderRadius: 4, transition: "width 0.5s" },
  recentItem:    { display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", flexWrap: "wrap" },
  overlay:       { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  modal:         { background: "#1a1d30", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 16, width: "100%", maxWidth: 520, maxHeight: "85vh", overflowY: "auto" },
  modalHeader:   { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" },
};