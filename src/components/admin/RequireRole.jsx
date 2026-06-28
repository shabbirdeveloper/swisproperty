import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * Guards a route to a specific role ("admin" or "agent").
 * - Signed out  -> the matching login page.
 * - Wrong role  -> redirected to that user's own area.
 */
export default function RequireRole({ role, children }) {
  const { user, role: userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-charcoal/50">
        Loading…
      </div>
    );
  }

  const homeFor = (r) =>
    r === "admin" ? "/admin" : r === "agent" ? "/agent" : "/account";
  const loginFor = (r) =>
    r === "admin"
      ? "/admin/login"
      : r === "agent"
      ? "/agent/login"
      : "/customer/login";

  if (!user) {
    return (
      <Navigate to={loginFor(role)} state={{ from: location }} replace />
    );
  }

  if (role && userRole !== role) {
    return <Navigate to={homeFor(userRole)} replace />;
  }

  return children;
}
