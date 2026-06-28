import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import Logo from "../../components/Logo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message || "Could not send reset email.");
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
            Reset Password
          </h1>
          <p className="mt-2 text-sm text-charcoal/55">
            Enter your account email and we'll send you a reset link.
          </p>

          {sent ? (
            <div className="mt-6 flex items-start gap-3 rounded-xl bg-green-50 px-4 py-4 text-sm text-green-700">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <span>
                If an account exists for <strong>{email}</strong>, a password
                reset link is on its way. Check your inbox (and spam).
              </span>
            </div>
          ) : (
            <>
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
                      className="field-luxe pl-9"
                    />
                  </div>
                </label>
                <button
                  type="submit"
                  disabled={busy}
                  className="btn-primary w-full py-3.5 disabled:opacity-60"
                >
                  {busy ? "Sending…" : "Send Reset Link"}
                </button>
              </form>
            </>
          )}

          <p className="mt-5 text-center text-sm text-charcoal/55">
            <Link to="/agent/login" className="font-semibold text-gold hover:underline">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
