import { useState, useEffect } from "react";
import { Upload, Save, CheckCircle2 } from "lucide-react";
import { updateMyAgent } from "../../services/agents.js";
import { uploadImage } from "../../services/properties.js";
import { useAuth } from "../../context/AuthContext.jsx";

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-charcoal/50">
        {label}
      </span>
      {children}
    </label>
  );
}

export default function AgentProfileEdit() {
  const { user, agent, refreshAgent } = useAuth();
  const [form, setForm] = useState({
    name: "",
    designation: "",
    phone: "",
    whatsapp: "",
    avatar: "",
    bio: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (agent) {
      setForm({
        name: agent.name || "",
        designation: agent.designation || "",
        phone: agent.phone || "",
        whatsapp: agent.whatsapp || "",
        avatar: agent.avatar || "",
        bio: agent.bio || "",
      });
    }
  }, [agent]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleUpload = async (file) => {
    if (!file) return;
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, avatar: url }));
    } catch (e) {
      alert(e.message || "Upload failed");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await updateMyAgent(user.id, form);
      await refreshAgent();
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      setError(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold text-charcoal">My Profile</h1>

      {saved && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          Profile saved.
        </div>
      )}
      {error && (
        <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="card-luxe space-y-5 p-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-mist">
            {form.avatar && (
              <img src={form.avatar} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <div className="flex-1">
            <Field label="Photo URL">
              <input
                value={form.avatar}
                onChange={set("avatar")}
                placeholder="https://…"
                className="field-luxe"
              />
            </Field>
          </div>
          <label className="mt-5 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-charcoal/10 text-charcoal transition hover:border-gold hover:text-gold">
            <Upload className="h-4 w-4" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files?.[0])}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full Name">
            <input
              required
              value={form.name}
              onChange={set("name")}
              className="field-luxe"
            />
          </Field>
          <Field label="Designation">
            <input
              value={form.designation}
              onChange={set("designation")}
              className="field-luxe"
            />
          </Field>
          <Field label="Phone">
            <input value={form.phone} onChange={set("phone")} className="field-luxe" />
          </Field>
          <Field label="WhatsApp">
            <input
              value={form.whatsapp}
              onChange={set("whatsapp")}
              className="field-luxe"
            />
          </Field>
        </div>

        <Field label="Bio">
          <textarea
            rows={4}
            value={form.bio}
            onChange={set("bio")}
            placeholder="Short professional bio…"
            className="field-luxe resize-none"
          />
        </Field>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
