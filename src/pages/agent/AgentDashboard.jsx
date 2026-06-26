import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, Plus, Clock, CheckCircle2 } from "lucide-react";
import { getMyProperties, deleteProperty } from "../../services/properties.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { imgUrl } from "../../utils/media.js";

export default function AgentDashboard() {
  const { agent } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    if (!agent?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getMyProperties(agent.id)
      .then(setProperties)
      .finally(() => setLoading(false));
  };

  useEffect(load, [agent?.id]);

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.title}"?`)) return;
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

  const approved = agent?.approved;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-charcoal">My Listings</h1>
          <p className="text-sm text-charcoal/55">
            {properties.length} {properties.length === 1 ? "listing" : "listings"}
          </p>
        </div>
        <Link
          to="/agent/new"
          className={`btn-primary ${
            approved ? "" : "pointer-events-none opacity-40"
          }`}
        >
          <Plus className="h-4 w-4" />
          Add Listing
        </Link>
      </div>

      {/* Approval status */}
      {approved ? (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          Your account is approved and live on the site.
        </div>
      ) : (
        <div className="mb-6 flex items-start gap-2 rounded-xl bg-gold/10 px-4 py-3 text-sm text-gold">
          <Clock className="mt-0.5 h-4 w-4 shrink-0" />
          Your account is pending admin approval. You can set up your profile
          now; adding listings unlocks once you're approved.
        </div>
      )}

      {loading ? (
        <p className="text-charcoal/50">Loading…</p>
      ) : properties.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-charcoal/15 bg-white px-6 py-16 text-center text-charcoal/50">
          No listings yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => (
            <div key={p.id} className="card-luxe overflow-hidden">
              <img
                src={imgUrl(p.gallery[0])}
                alt=""
                className="h-36 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="truncate font-semibold text-charcoal">
                  {p.title}
                </h3>
                <p className="text-sm text-gold">{p.price}</p>
                <div className="mt-3 flex gap-2">
                  <Link
                    to={`/agent/edit/${p.slug}`}
                    className="btn-outline flex-1 py-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(p)}
                    disabled={busyId === p.id}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/10 text-charcoal transition hover:border-red-500 hover:text-red-600 disabled:opacity-40"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
