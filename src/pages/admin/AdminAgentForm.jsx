import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, Upload } from "lucide-react";
import {
  getAgentById,
  createAgent,
  updateAgent,
} from "../../services/agents.js";
import { uploadImage } from "../../services/properties.js";
import { isSupabaseConfigured } from "../../lib/supabase.js";

const empty = {
  name: "",
  designation: "Property Advisor",
  email: "",
  phone: "",
  whatsapp: "",
  rating: "5.0",
  reviews: "0",
  avatar: "",
  bio: "",
};

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

export default function AdminAgentForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    getAgentById(id)
      .then((a) => a && setForm({ ...empty, ...a }))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleUpload = async (file) => {
    if (!file) return;
    try {
      const url = await uploadImage(file);
      set("avatar", url);
    } catch (e) {
      alert(e.message || "Upload failed");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!isSupabaseConfigured) {
      setError("Connect Supabase (.env) to register agents.");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) await updateAgent(id, form);
      else await createAgent(form);
      navigate("/admin/agents");
    } catch (err) {
      setError(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-charcoal/50">Loading…</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to="/admin/agents"
        className="mb-4 inline-flex items-center gap-2 text-sm text-charcoal/60 transition hover:text-gold"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to agents
      </Link>
      <h1 className="mb-6 text-2xl font-semibold text-charcoal">
        {isEdit ? "Edit Agent" : "Register Agent"}
      </h1>

      {error && (
        <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="card-luxe space-y-5 p-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-mist">
            {form.avatar && (
              <img
                src={form.avatar}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="flex-1">
            <Field label="Photo URL">
              <input
                value={form.avatar}
                onChange={(e) => set("avatar", e.target.value)}
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
              onChange={(e) => set("name", e.target.value)}
              className="field-luxe"
            />
          </Field>
          <Field label="Designation">
            <input
              value={form.designation}
              onChange={(e) => set("designation", e.target.value)}
              className="field-luxe"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className="field-luxe"
            />
          </Field>
          <Field label="Phone">
            <input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+41 44 123 45 67"
              className="field-luxe"
            />
          </Field>
          <Field label="WhatsApp (number)">
            <input
              value={form.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value)}
              placeholder="+41791234567"
              className="field-luxe"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Rating">
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={form.rating}
                onChange={(e) => set("rating", e.target.value)}
                className="field-luxe"
              />
            </Field>
            <Field label="Reviews">
              <input
                type="number"
                min="0"
                value={form.reviews}
                onChange={(e) => set("reviews", e.target.value)}
                className="field-luxe"
              />
            </Field>
          </div>
        </div>

        <Field label="Bio (shown on profile)">
          <textarea
            rows={4}
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            placeholder="Short professional bio…"
            className="field-luxe resize-none"
          />
        </Field>

        <div className="flex justify-end gap-3">
          <Link to="/admin/agents" className="btn-outline">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Register Agent"}
          </button>
        </div>
      </form>
    </div>
  );
}
