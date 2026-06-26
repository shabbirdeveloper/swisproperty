import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, Plus, Star, AlertCircle } from "lucide-react";
import { getAllProperties, deleteProperty } from "../../services/properties.js";
import { isSupabaseConfigured } from "../../lib/supabase.js";
import { imgUrl } from "../../utils/media.js";

export default function AdminDashboard() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    getAllProperties()
      .then(setProperties)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    setBusyId(p.id);
    try {
      await deleteProperty(p.id);
      setProperties((prev) => prev.filter((x) => x.id !== p.id));
    } catch (e) {
      alert(e.message || "Delete failed.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-charcoal">Listings</h1>
          <p className="text-sm text-charcoal/55">
            {properties.length} {properties.length === 1 ? "property" : "properties"}
          </p>
        </div>
        <Link to="/admin/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          Add Property
        </Link>
      </div>

      {!isSupabaseConfigured && (
        <div className="mb-6 flex items-start gap-2 rounded-xl bg-gold/10 px-4 py-3 text-sm text-gold">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          Read-only preview using sample data. Connect Supabase (.env) to add,
          edit, and delete real listings.
        </div>
      )}

      {loading ? (
        <p className="text-charcoal/50">Loading…</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-charcoal/[0.06] bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-charcoal/[0.06] bg-cloud text-left text-xs uppercase tracking-wide text-charcoal/50">
              <tr>
                <th className="px-4 py-3 font-medium">Property</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Location</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Price</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/[0.06]">
              {properties.map((p) => (
                <tr key={p.id} className="hover:bg-cloud/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={imgUrl(p.gallery[0])}
                        alt=""
                        className="h-11 w-14 rounded-lg object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 font-medium text-charcoal">
                          {p.title}
                          {p.featured && (
                            <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                          )}
                        </div>
                        <div className="text-xs text-charcoal/45">
                          {p.propertyType}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-charcoal/70 sm:table-cell">
                    {p.location}
                  </td>
                  <td className="hidden px-4 py-3 text-charcoal/70 md:table-cell">
                    {p.price}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span className="rounded-full bg-cloud px-2.5 py-1 text-xs font-medium text-charcoal">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/edit/${p.slug}`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-charcoal/10 text-charcoal transition hover:border-gold hover:text-gold"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p)}
                        disabled={busyId === p.id || !isSupabaseConfigured}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-charcoal/10 text-charcoal transition hover:border-red-500 hover:text-red-600 disabled:opacity-40"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
