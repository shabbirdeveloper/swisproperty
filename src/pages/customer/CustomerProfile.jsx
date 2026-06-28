import { useState, useEffect } from "react";
import { Save, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export default function CustomerProfile() {
  const { user, profile, updateMyProfile } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ fullName: "", avatar: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile)
      setForm({ fullName: profile.fullName || "", avatar: profile.avatar || "" });
  }, [profile]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateMyProfile(form);
      setSaved(true);
      toast.success("Profile updated.");
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      toast.error(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-semibold text-charcoal">My Profile</h1>
      <form onSubmit={submit} className="card-luxe space-y-5 p-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-mist">
            {form.avatar ? (
              <img src={form.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-2xl font-semibold text-gold">
                {(form.fullName || "U").slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-charcoal/50">
                Photo URL
              </span>
              <input
                value={form.avatar}
                onChange={(e) => setForm((f) => ({ ...f, avatar: e.target.value }))}
                placeholder="https://…"
                className="field-luxe"
              />
            </label>
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-charcoal/50">
            Full Name
          </span>
          <input
            required
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            className="field-luxe"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-charcoal/50">
            Email
          </span>
          <input value={user?.email || ""} disabled className="field-luxe opacity-60" />
        </label>

        <div className="flex items-center justify-between">
          {saved ? (
            <span className="flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" /> Saved
            </span>
          ) : (
            <span />
          )}
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
