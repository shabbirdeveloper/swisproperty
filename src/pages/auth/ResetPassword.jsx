import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import Logo from "../../components/Logo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { supabase, isSupabaseConfigured } from "../../lib/supabase.js";

/**
 * Opened from the password-reset email link. Supabase parses the recovery
 * token from the URL and creates a temporary session, then we set the new
 * password via updateUser.
 */
export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    // A valid recovery session means the link worked.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await updatePassword(password);
      setDone(true);
      setTimeout(() => navigate("/agent/login", { replace: true }), 2500);
    } catch (err) {
      setError(err.message || "Could not update password.");
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
          <h1 className="text-2xl font-semibold text-charcoal">
            Set a New Password
          </h1>

          {done ? (
            <div className="mt-6 flex items-center gap-3 rounded-xl bg-green-50 px-4 py-4 text-sm text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              Password updated. Redirecting to sign in…
            </div>
          ) : !ready ? (
            <p className="mt-4 text-sm text-charcoal/60">
              Open this page from the reset link in your email. If you got here
              by mistake,{" "}
              <Link to="/forgot-password" className="font-semibold text-gold">
                request a new link
              </Link>
              .
            </p>
          ) : (
            <>
              <p className="mt-2 text-sm text-charcoal/55">
                Choose a new password for your account.
              </p>
              {error && (
                <div className="mt-5 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              <form onSubmit={submit} className="mt-6 space-y-4">
                <div className="relative flex items-center">
                  <Lock className="pointer-events-none absolute left-3 h-4 w-4 text-gold" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password (min 6 chars)"
                    className="field-luxe pl-9"
                  />
                </div>
                <div className="relative flex items-center">
                  <Lock className="pointer-events-none absolute left-3 h-4 w-4 text-gold" />
                  <input
                    type="password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Confirm new password"
                    className="field-luxe pl-9"
                  />
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="btn-primary w-full py-3.5 disabled:opacity-60"
                >
                  {busy ? "Updating…" : "Update Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
