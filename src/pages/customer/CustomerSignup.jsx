import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import Logo from "../../components/Logo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function CustomerSignup() {
  const { signUpCustomer, signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signUpCustomer(form);
      // Confirm-email is off, so sign in straight away.
      try {
        await signIn(form.email, form.password);
      } catch {
        /* fall through to login */
      }
      navigate("/account", { replace: true });
    } catch (err) {
      setError(err.message || "Sign up failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cloud px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="card-luxe p-8">
          <span className="eyebrow">Create Account</span>
          <h1 className="mt-2 text-2xl font-semibold text-charcoal">
            Sign Up
          </h1>
          <p className="mt-2 text-sm text-charcoal/55">
            Save properties, message agents, and track your requests.
          </p>

          {error && (
            <div className="mt-5 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <input
              required
              value={form.fullName}
              onChange={set("fullName")}
              placeholder="Full name"
              className="field-luxe"
            />
            <input
              type="email"
              required
              value={form.email}
              onChange={set("email")}
              placeholder="Email"
              className="field-luxe"
            />
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={set("password")}
              placeholder="Password (min 6 chars)"
              className="field-luxe"
            />
            <button
              type="submit"
              disabled={busy}
              className="btn-primary w-full py-3.5 disabled:opacity-60"
            >
              {busy ? "Creating…" : "Create Account"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-charcoal/55">
            Already have an account?{" "}
            <Link to="/customer/login" className="font-semibold text-gold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
