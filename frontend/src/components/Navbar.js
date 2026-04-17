import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const ROLE_STYLE = {
  admin:     { color: "#ef4444", background: "rgba(239,68,68,0.12)",  border: "1px solid rgba(239,68,68,0.3)" },
  authority: { color: "#4f8ef7", background: "rgba(79,142,247,0.12)", border: "1px solid rgba(79,142,247,0.3)" },
  citizen:   { color: "#10b981", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)" },
};

const NAV_BY_ROLE = {
  citizen: [
    { to: "/home",     label: "🏠 Home" },
    { to: "/history",  label: "📋 My Complaints" },
    { to: "/services", label: "🔧 Services" },
    { to: "/contact",  label: "📞 Contact" },
  ],
  authority: [
    { to: "/dashboard", label: "🏛️ Dashboard" },
    { to: "/services",  label: "🔧 Services" },
    { to: "/contact",   label: "📞 Contact" },
  ],
  admin: [
    { to: "/admin",    label: "🛡️ Control Panel" },
    { to: "/services", label: "🔧 Services" },
    { to: "/contact",  label: "📞 Contact" },
  ],
};

const GUEST_LINKS = [
  { to: "/services", label: "Services" },
  { to: "/contact",  label: "Contact" },
];

export default function Navbar() {
  const { dbUser, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/");
  };

  const links = dbUser ? (NAV_BY_ROLE[dbUser.role] || []) : GUEST_LINKS;
  const roleStyle = ROLE_STYLE[dbUser?.role] || ROLE_STYLE.citizen;

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.brand}>
          <span style={styles.brandIcon}>🏙️</span>
          <span style={styles.brandText}>Civic<span style={styles.brandAccent}>Pulse</span></span>
        </Link>

        <div style={styles.links}>
          {links.map((link) => (
            <Link key={link.to} to={link.to}
              style={{ ...styles.link, ...(location.pathname === link.to ? styles.linkActive : {}) }}>
              {link.label}
            </Link>
          ))}
        </div>

        <div style={styles.actions}>
          {dbUser ? (
            <div style={styles.userMenu}>
              <div style={styles.avatar}>
                <span>{(dbUser.name || dbUser.email || "U")[0].toUpperCase()}</span>
              </div>
              <div style={styles.userInfo}>
                <span style={styles.userName}>{dbUser.name || dbUser.email?.split("@")[0]}</span>
                <span style={{ ...styles.userRole, ...roleStyle }}>
                  {dbUser.role === "admin" ? "🛡️" : dbUser.role === "authority" ? "🏛️" : "👤"} {dbUser.role}
                </span>
              </div>
              <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            </div>
          ) : (
            <div style={styles.authBtns}>
              <Link to="/login"    className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav:         { background: "rgba(13,15,26,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.08)", position: "sticky", top: 0, zIndex: 100, height: 64 },
  container:   { maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: "100%", display: "flex", alignItems: "center", gap: 32 },
  brand:       { display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 },
  brandIcon:   { fontSize: "1.4rem" },
  brandText:   { fontSize: "1.2rem", fontWeight: 700, color: "#e2e8f0" },
  brandAccent: { color: "#4f8ef7" },
  links:       { display: "flex", alignItems: "center", gap: 4, flex: 1 },
  link:        { padding: "6px 12px", borderRadius: 8, fontSize: "0.875rem", fontWeight: 500, color: "#94a3b8", textDecoration: "none", transition: "all 0.2s" },
  linkActive:  { color: "#4f8ef7", background: "rgba(79,142,247,0.1)" },
  actions:     { flexShrink: 0 },
  userMenu:    { display: "flex", alignItems: "center", gap: 10 },
  avatar:      { width: 36, height: 36, borderRadius: "50%", background: "rgba(79,142,247,0.2)", border: "2px solid rgba(79,142,247,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", fontWeight: 700, color: "#4f8ef7" },
  userInfo:    { display: "flex", flexDirection: "column", gap: 2 },
  userName:    { fontSize: "0.85rem", fontWeight: 600, color: "#e2e8f0" },
  userRole:    { fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, padding: "1px 7px", borderRadius: 10 },
  logoutBtn:   { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", padding: "5px 12px", borderRadius: 8, cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, fontFamily: "inherit", transition: "all 0.2s" },
  authBtns:    { display: "flex", gap: 8 },
};