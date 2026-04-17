import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CitizenHome from "./pages/CitizenHome";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import AdminPanel from "./pages/AdminPanel";
import Services from "./pages/Services";
import History from "./pages/History";
import Contact from "./pages/Contact";
import "./styles/global.css";

function ProtectedRoute({ children, roles }) {
  const { currentUser, dbUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" />;
  if (roles && dbUser && !roles.includes(dbUser.role)) {

    if (dbUser.role === "admin")     return <Navigate to="/admin" />;
    if (dbUser.role === "authority") return <Navigate to="/dashboard" />;
    return <Navigate to="/home" />;
  }
  return children;
}

function RoleHome() {
  const { dbUser } = useAuth();
  if (!dbUser) return <Navigate to="/login" />;
  if (dbUser.role === "admin")     return <Navigate to="/admin" />;
  if (dbUser.role === "authority") return <Navigate to="/dashboard" />;
  return <CitizenHome />;
}

function AppRoutes() {
  const { currentUser } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"          element={currentUser ? <RoleHome /> : <Landing />} />
        <Route path="/login"     element={currentUser ? <RoleHome /> : <Login />} />
        <Route path="/register"  element={currentUser ? <RoleHome /> : <Register />} />

        <Route path="/home"     element={<ProtectedRoute roles={["citizen"]}><CitizenHome /></ProtectedRoute>} />
        <Route path="/history"  element={<ProtectedRoute roles={["citizen"]}><History /></ProtectedRoute>} />

        <Route path="/dashboard" element={<ProtectedRoute roles={["authority"]}><AuthorityDashboard /></ProtectedRoute>} />

        <Route path="/admin"     element={<ProtectedRoute roles={["admin"]}><AdminPanel /></ProtectedRoute>} />

        <Route path="/services"  element={<Services />} />
        <Route path="/contact"   element={<Contact />} />
        <Route path="*"          element={currentUser ? <RoleHome /> : <Navigate to="/" />} />
      </Routes>
      <Footer />
      <Toaster position="top-right" toastOptions={{ style: { background: "#1a1a2e", color: "#e2e8f0", border: "1px solid #4a5568" } }} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}