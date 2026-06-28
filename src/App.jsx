import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { SavedProvider } from "./context/SavedContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import RequireRole from "./components/admin/RequireRole.jsx";
import { supabase, isSupabaseConfigured } from "./lib/supabase.js";

import HomePage from "./pages/HomePage.jsx";
import ListingsPage from "./pages/ListingsPage.jsx";
import PropertyDetailPage from "./pages/PropertyDetailPage.jsx";
import AgentsPage from "./pages/AgentsPage.jsx";
import AgentProfilePage from "./pages/AgentProfilePage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import BrochurePage from "./pages/BrochurePage.jsx";
import WishlistPage from "./pages/WishlistPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminPropertyForm from "./pages/admin/AdminPropertyForm.jsx";
import AdminAgents from "./pages/admin/AdminAgents.jsx";
import AdminAgentForm from "./pages/admin/AdminAgentForm.jsx";
import AdminMessages from "./pages/admin/AdminMessages.jsx";
import AdminRequests from "./pages/admin/AdminRequests.jsx";

import AgentLogin from "./pages/agent/AgentLogin.jsx";
import AgentSignup from "./pages/agent/AgentSignup.jsx";
import AgentLayout from "./pages/agent/AgentLayout.jsx";
import AgentDashboard from "./pages/agent/AgentDashboard.jsx";
import AgentPropertyForm from "./pages/agent/AgentPropertyForm.jsx";
import AgentProfileEdit from "./pages/agent/AgentProfileEdit.jsx";
import AgentRequests from "./pages/agent/AgentRequests.jsx";

import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

// Whenever Supabase detects a password-recovery link (wherever it lands),
// send the user straight to the set-new-password screen.
function RecoveryRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const hash = window.location.hash || "";
    if (hash.includes("type=recovery")) navigate("/reset-password");
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") navigate("/reset-password");
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);
  return null;
}

export default function App() {
  const { pathname } = useLocation();
  // Portal/print pages render without the public navbar + footer.
  const isBare =
    pathname.startsWith("/brochure") ||
    pathname.startsWith("/admin") ||
    pathname === "/agent" ||
    pathname.startsWith("/agent/") ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  return (
    <AuthProvider>
      <ToastProvider>
        <SavedProvider>
          <ScrollToTop />
          <RecoveryRedirect />
        <div className="flex min-h-screen flex-col">
          {!isBare && <Navbar />}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/listings" element={<ListingsPage />} />
              <Route path="/property/:slug" element={<PropertyDetailPage />} />
              <Route path="/brochure/:slug" element={<BrochurePage />} />
              <Route path="/agents" element={<AgentsPage />} />
              <Route path="/agents/:slug" element={<AgentProfilePage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />

              {/* Password reset (shared by admin + agent) */}
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />


              {/* Admin portal */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <RequireRole role="admin">
                    <AdminLayout />
                  </RequireRole>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="new" element={<AdminPropertyForm />} />
                <Route path="edit/:slug" element={<AdminPropertyForm />} />
                <Route path="agents" element={<AdminAgents />} />
                <Route path="agents/new" element={<AdminAgentForm />} />
                <Route path="agents/:id/edit" element={<AdminAgentForm />} />
                <Route path="requests" element={<AdminRequests />} />
                <Route path="messages" element={<AdminMessages />} />
              </Route>

              {/* Agent portal */}
              <Route path="/agent/login" element={<AgentLogin />} />
              <Route path="/agent/signup" element={<AgentSignup />} />
              <Route
                path="/agent"
                element={
                  <RequireRole role="agent">
                    <AgentLayout />
                  </RequireRole>
                }
              >
                <Route index element={<AgentDashboard />} />
                <Route path="new" element={<AgentPropertyForm />} />
                <Route path="edit/:slug" element={<AgentPropertyForm />} />
                <Route path="requests" element={<AgentRequests />} />
                <Route path="profile" element={<AgentProfileEdit />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          {!isBare && <Footer />}
        </div>
        </SavedProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
