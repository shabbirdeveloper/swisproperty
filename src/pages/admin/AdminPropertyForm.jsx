import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Upload, Save } from "lucide-react";
import {
  getPropertyBySlug,
  createProperty,
  updateProperty,
  uploadImage,
} from "../../services/properties.js";
import { getAgents } from "../../services/agents.js";
import {
  propertyTypes,
  locations,
  statuses,
  landmarkTypes,
} from "../../data/sampleProperties.js";
import { isSupabaseConfigured } from "../../lib/supabase.js";

const slugify = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const empty = {
  slug: "",
  title: "",
  location: "Zurich",
  address: "",
  price: "",
  numericPrice: "",
  propertyType: "Apartment",
  status: "For Sale",
  availability: "Available Now",
  shortDescription: "",
  fullDescription: "",
  bedrooms: "",
  bathrooms: "",
  size: "",
  numericSize: "",
  distanceFromCityCenter: "",
  numericDistance: "",
  parking: "",
  furnished: "Furnished",
  featured: false,
  yearBuilt: "",
  floor: "",
  totalFloors: "",
  heating: "",
  mapImage: "",
  amenities: [],
  highlights: [],
  gallery: [],
  nearbyPlaces: [],
  agentId: "",
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

export default function AdminPropertyForm({
  basePath = "/admin",
  fixedAgentId = null,
}) {
  const { slug } = useParams();
  const isEdit = Boolean(slug);
  const navigate = useNavigate();

  const [form, setForm] = useState(
    fixedAgentId ? { ...empty, agentId: fixedAgentId } : empty
  );
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [slugTouched, setSlugTouched] = useState(isEdit);

  useEffect(() => {
    if (fixedAgentId) return; // agents pick is hidden when locked
    getAgents().then(setAgents).catch(() => setAgents([]));
  }, [fixedAgentId]);

  useEffect(() => {
    if (!isEdit) return;
    getPropertyBySlug(slug)
      .then((p) => {
        if (!p) return;
        setForm({
          ...empty,
          ...p,
          agentId: fixedAgentId || p.agent?.id || "",
          gallery: p.gallery || [],
          nearbyPlaces: p.nearbyPlaces || [],
          amenities: p.amenities || [],
          highlights: p.highlights || [],
        });
      })
      .finally(() => setLoading(false));
  }, [slug, isEdit]);

  const set = (key, value) =>
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "title" && !slugTouched) next.slug = slugify(value);
      return next;
    });

  // Gallery helpers
  const addImage = () =>
    set("gallery", [...form.gallery, { url: "", label: "" }]);
  const updateImage = (i, k, v) =>
    set(
      "gallery",
      form.gallery.map((g, idx) => (idx === i ? { ...g, [k]: v } : g))
    );
  const removeImage = (i) =>
    set("gallery", form.gallery.filter((_, idx) => idx !== i));

  const handleUpload = async (i, file) => {
    if (!file) return;
    try {
      const url = await uploadImage(file);
      updateImage(i, "url", url);
    } catch (e) {
      alert(e.message || "Upload failed");
    }
  };

  // Nearby helpers
  const addNearby = () =>
    set("nearbyPlaces", [
      ...form.nearbyPlaces,
      { type: "City Center", name: "", distance: "" },
    ]);
  const updateNearby = (i, k, v) =>
    set(
      "nearbyPlaces",
      form.nearbyPlaces.map((n, idx) => (idx === i ? { ...n, [k]: v } : n))
    );
  const removeNearby = (i) =>
    set("nearbyPlaces", form.nearbyPlaces.filter((_, idx) => idx !== i));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!isSupabaseConfigured) {
      setError("Connect Supabase (.env) to save changes.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.title),
        agentId: fixedAgentId || form.agentId,
      };
      if (isEdit) await updateProperty(form.id, payload);
      else await createProperty(payload);
      navigate(basePath);
    } catch (err) {
      setError(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-charcoal/50">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to={basePath}
        className="mb-4 inline-flex items-center gap-2 text-sm text-charcoal/60 transition hover:text-gold"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to listings
      </Link>
      <h1 className="mb-6 text-2xl font-semibold text-charcoal">
        {isEdit ? "Edit Property" : "Add Property"}
      </h1>

      {error && (
        <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-8">
        {/* Basics */}
        <section className="card-luxe space-y-4 p-6">
          <h2 className="text-base font-semibold text-charcoal">Basics</h2>
          <Field label="Title">
            <input
              required
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className="field-luxe"
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Slug (URL)">
              <input
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", slugify(e.target.value));
                }}
                className="field-luxe"
              />
            </Field>
            <Field label="Property Type">
              <select
                value={form.propertyType}
                onChange={(e) => set("propertyType", e.target.value)}
                className="field-luxe"
              >
                {propertyTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Location">
              <select
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                className="field-luxe"
              >
                {locations.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </Field>
            <Field label="Address">
              <input
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                className="field-luxe"
              />
            </Field>
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="field-luxe"
              >
                {statuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Availability">
              <input
                value={form.availability}
                onChange={(e) => set("availability", e.target.value)}
                className="field-luxe"
              />
            </Field>
          </div>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set("featured", e.target.checked)}
              className="h-4 w-4 accent-gold"
            />
            <span className="text-sm text-charcoal/70">Featured property</span>
          </label>
        </section>

        {/* Pricing & specs */}
        <section className="card-luxe space-y-4 p-6">
          <h2 className="text-base font-semibold text-charcoal">
            Pricing &amp; Specs
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Price (display)">
              <input
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="CHF 2,450,000"
                className="field-luxe"
              />
            </Field>
            <Field label="Numeric Price (for filters)">
              <input
                type="number"
                value={form.numericPrice}
                onChange={(e) => set("numericPrice", e.target.value)}
                placeholder="2450000"
                className="field-luxe"
              />
            </Field>
            <Field label="Bedrooms">
              <input
                type="number"
                value={form.bedrooms}
                onChange={(e) => set("bedrooms", e.target.value)}
                className="field-luxe"
              />
            </Field>
            <Field label="Bathrooms">
              <input
                type="number"
                value={form.bathrooms}
                onChange={(e) => set("bathrooms", e.target.value)}
                className="field-luxe"
              />
            </Field>
            <Field label="Size (display)">
              <input
                value={form.size}
                onChange={(e) => set("size", e.target.value)}
                placeholder="142 m²"
                className="field-luxe"
              />
            </Field>
            <Field label="Numeric Size">
              <input
                type="number"
                value={form.numericSize}
                onChange={(e) => set("numericSize", e.target.value)}
                placeholder="142"
                className="field-luxe"
              />
            </Field>
            <Field label="Distance to centre (display)">
              <input
                value={form.distanceFromCityCenter}
                onChange={(e) => set("distanceFromCityCenter", e.target.value)}
                placeholder="0.4 km"
                className="field-luxe"
              />
            </Field>
            <Field label="Numeric Distance (km)">
              <input
                type="number"
                step="0.1"
                value={form.numericDistance}
                onChange={(e) => set("numericDistance", e.target.value)}
                className="field-luxe"
              />
            </Field>
            <Field label="Parking">
              <input
                value={form.parking}
                onChange={(e) => set("parking", e.target.value)}
                placeholder="1 Garage Space"
                className="field-luxe"
              />
            </Field>
            <Field label="Furnished">
              <select
                value={form.furnished}
                onChange={(e) => set("furnished", e.target.value)}
                className="field-luxe"
              >
                <option>Furnished</option>
                <option>Unfurnished</option>
              </select>
            </Field>
            <Field label="Year Built">
              <input
                type="number"
                value={form.yearBuilt}
                onChange={(e) => set("yearBuilt", e.target.value)}
                className="field-luxe"
              />
            </Field>
            <Field label="Heating">
              <input
                value={form.heating}
                onChange={(e) => set("heating", e.target.value)}
                className="field-luxe"
              />
            </Field>
            <Field label="Floor">
              <input
                type="number"
                value={form.floor}
                onChange={(e) => set("floor", e.target.value)}
                className="field-luxe"
              />
            </Field>
            <Field label="Total Floors">
              <input
                type="number"
                value={form.totalFloors}
                onChange={(e) => set("totalFloors", e.target.value)}
                className="field-luxe"
              />
            </Field>
          </div>
        </section>

        {/* Descriptions */}
        <section className="card-luxe space-y-4 p-6">
          <h2 className="text-base font-semibold text-charcoal">Descriptions</h2>
          <Field label="Short Description (2 lines)">
            <textarea
              rows={2}
              value={form.shortDescription}
              onChange={(e) => set("shortDescription", e.target.value)}
              className="field-luxe resize-none"
            />
          </Field>
          <Field label="Full Description">
            <textarea
              rows={5}
              value={form.fullDescription}
              onChange={(e) => set("fullDescription", e.target.value)}
              className="field-luxe resize-none"
            />
          </Field>
          <Field label="Amenities (comma separated)">
            <input
              value={form.amenities.join(", ")}
              onChange={(e) =>
                set(
                  "amenities",
                  e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                )
              }
              placeholder="WiFi, Parking, Security, Balcony"
              className="field-luxe"
            />
          </Field>
          <Field label="Highlights (comma separated)">
            <input
              value={form.highlights.join(", ")}
              onChange={(e) =>
                set(
                  "highlights",
                  e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                )
              }
              placeholder="Modern interior, Premium finishing"
              className="field-luxe"
            />
          </Field>
        </section>

        {/* Gallery */}
        <section className="card-luxe space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-charcoal">
              Gallery Photos
            </h2>
            <button type="button" onClick={addImage} className="btn-outline py-2">
              <Plus className="h-4 w-4" />
              Add Photo
            </button>
          </div>
          {form.gallery.length === 0 && (
            <p className="text-sm text-charcoal/45">No photos yet.</p>
          )}
          {form.gallery.map((g, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-xl bg-cloud p-3 sm:flex-row sm:items-center"
            >
              <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-mist">
                {g.url && (
                  <img src={g.url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <input
                value={g.url}
                onChange={(e) => updateImage(i, "url", e.target.value)}
                placeholder="Image URL"
                className="field-luxe flex-1"
              />
              <input
                value={g.label}
                onChange={(e) => updateImage(i, "label", e.target.value)}
                placeholder="Room label (e.g. Kitchen)"
                className="field-luxe sm:w-48"
              />
              <label className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-charcoal/10 text-charcoal transition hover:border-gold hover:text-gold">
                <Upload className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUpload(i, e.target.files?.[0])}
                />
              </label>
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-charcoal/10 text-charcoal transition hover:border-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </section>

        {/* Nearby + map */}
        <section className="card-luxe space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-charcoal">
              Nearby Places
            </h2>
            <button type="button" onClick={addNearby} className="btn-outline py-2">
              <Plus className="h-4 w-4" />
              Add Place
            </button>
          </div>
          {form.nearbyPlaces.map((n, i) => (
            <div key={i} className="flex flex-col gap-3 sm:flex-row">
              <select
                value={n.type}
                onChange={(e) => updateNearby(i, "type", e.target.value)}
                className="field-luxe sm:w-44"
              >
                {landmarkTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <input
                value={n.name}
                onChange={(e) => updateNearby(i, "name", e.target.value)}
                placeholder="Name"
                className="field-luxe flex-1"
              />
              <input
                value={n.distance}
                onChange={(e) => updateNearby(i, "distance", e.target.value)}
                placeholder="1.2 km"
                className="field-luxe sm:w-28"
              />
              <button
                type="button"
                onClick={() => removeNearby(i)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-charcoal/10 text-charcoal transition hover:border-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Field label="Location Map Image URL (brochure last page)">
            <input
              value={form.mapImage}
              onChange={(e) => set("mapImage", e.target.value)}
              placeholder="https://…"
              className="field-luxe"
            />
          </Field>
        </section>

        {/* Agent (hidden when an agent manages their own listing) */}
        {!fixedAgentId && (
          <section className="card-luxe space-y-4 p-6">
            <h2 className="text-base font-semibold text-charcoal">Agent</h2>
            <Field label="Assigned Agent">
              <select
                value={form.agentId}
                onChange={(e) => set("agentId", e.target.value)}
                className="field-luxe"
              >
                <option value="">— Select agent —</option>
                {agents.map((a) => (
                  <option key={a.id || a.email} value={a.id || ""}>
                    {a.name} · {a.designation}
                  </option>
                ))}
              </select>
            </Field>
          </section>
        )}

        <div className="flex justify-end gap-3">
          <Link to={basePath} className="btn-outline">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Property"}
          </button>
        </div>
      </form>
    </div>
  );
}
