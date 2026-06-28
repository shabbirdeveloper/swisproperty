import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Lock, Mail, AlertCircle } from "lucide-react";
import Logo from "../../components/Logo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AdminLogin() {
  const { signIn, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Sign in failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cloud px-5">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="card-luxe p-8">
          <h1 className="text-2xl font-semibold text-charcoal">Admin Sign In</h1>
          <p className="mt-2 text-sm text-charcoal/55">
            Manage listings and enquiries.
          </p>

          {!isConfigured && (
            <div className="mt-5 flex items-start gap-2 rounded-xl bg-gold/10 px-4 py-3 text-sm text-gold">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              Supabase isn't configured yet. Add your keys to <code>.env</code>{" "}
              to enable login.
            </div>
          )}

          {error && (
            <div className="mt-5 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-charcoal/50">
                Email
              </span>
              <div className="relative flex items-center">
                <Mail className="pointer-events-none absolute left-3 h-4 w-4 text-gold" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@swissproperty.ch"
                  className="field-luxe pl-9"
                />
              </div>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-charcoal/50">
                Password
              </span>
              <div className="relative flex items-center">
                <Lock className="pointer-events-none absolute left-3 h-4 w-4 text-gold" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="field-luxe pl-9"
                />
              </div>
            </label>
            <button
              type="submit"
              disabled={busy}
              className="btn-primary w-full py-3.5 disabled:opacity-60"
            >
              {busy ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm">
            <Link
              to="/forgot-password"
              className="font-medium text-charcoal/60 hover:text-gold"
            >
              Forgot password?
            </Link>
          </p>
        </div>
        <p className="mt-6 text-center text-sm text-charcoal/50">
          <Link to="/" className="transition hover:text-gold">
            ← Back to website
          </Link>
        </p>
      </div>
    </div>
  );
}
