import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import Logo from "../../components/Logo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AgentSignup() {
  const { signUpAgent } = useAuth();
  const [form, setForm] = useState({
    name: "",
    designation: "Property Advisor",
    email: "",
    phone: "",
    whatsapp: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signUpAgent(form);
      setDone(true);
    } catch (err) {
      setError(err.message || "Sign up failed.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cloud px-5">
        <div className="w-full max-w-md text-center">
          <div className="mb-8 flex justify-center">
            <Logo />
          </div>
          <div className="card-luxe p-8">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <h1 className="mt-5 text-2xl font-semibold text-charcoal">
              Account created
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-charcoal/60">
              Your agent account is pending admin approval. Once approved, your
              profile and listings will appear on the site. You can sign in now
              to set up your profile.
            </p>
            <Link to="/agent/login" className="btn-primary mt-6 w-full">
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cloud px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="card-luxe p-8">
          <span className="eyebrow">Join SwissProperty</span>
          <h1 className="mt-2 text-2xl font-semibold text-charcoal">
            Register as an Agent
          </h1>
          <p className="mt-2 text-sm text-charcoal/55">
            Create your account — an admin will approve it before it goes live.
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
              value={form.name}
              onChange={set("name")}
              placeholder="Full name"
              className="field-luxe"
            />
            <input
              value={form.designation}
              onChange={set("designation")}
              placeholder="Designation (e.g. Property Advisor)"
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
            <div className="grid grid-cols-2 gap-3">
              <input
                value={form.phone}
                onChange={set("phone")}
                placeholder="Phone"
                className="field-luxe"
              />
              <input
                value={form.whatsapp}
                onChange={set("whatsapp")}
                placeholder="WhatsApp"
                className="field-luxe"
              />
            </div>
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
              {busy ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-charcoal/55">
            Already have an account?{" "}
            <Link to="/agent/login" className="font-semibold text-gold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
