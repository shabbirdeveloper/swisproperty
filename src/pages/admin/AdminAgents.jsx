import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, Plus, Star, AlertCircle, Check, Clock } from "lucide-react";
import {
  getAgents,
  deleteAgent,
  setAgentApproval,
} from "../../services/agents.js";
import { isSupabaseConfigured } from "../../lib/supabase.js";

export default function AdminAgents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    getAgents()
      .then(setAgents)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (a) => {
    if (!window.confirm(`Delete agent "${a.name}"?`)) return;
    setBusyId(a.id);
    try {
      await deleteAgent(a.id);
      setAgents((prev) => prev.filter((x) => x.id !== a.id));
    } catch (e) {
      alert(e.message || "Delete failed.");
    } finally {
      setBusyId(null);
    }
  };

  const toggleApproval = async (a) => {
    setBusyId(a.id);
    try {
      await setAgentApproval(a.id, !a.approved);
      setAgents((prev) =>
        prev.map((x) => (x.id === a.id ? { ...x, approved: !a.approved } : x))
      );
    } catch (e) {
      alert(e.message || "Update failed.");
    } finally {
      setBusyId(null);
    }
  };

  const pendingCount = agents.filter((a) => !a.approved).length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-charcoal">Agents</h1>
          <p className="text-sm text-charcoal/55">
            {agents.length} {agents.length === 1 ? "agent" : "agents"}
            {pendingCount > 0 && (
              <span className="ml-2 rounded-full bg-gold/10 px-2 py-0.5 text-xs font-semibold text-gold">
                {pendingCount} pending approval
              </span>
            )}
          </p>
        </div>
        <Link to="/admin/agents/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          Register Agent
        </Link>
      </div>

      {!isSupabaseConfigured && (
        <div className="mb-6 flex items-start gap-2 rounded-xl bg-gold/10 px-4 py-3 text-sm text-gold">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          Read-only preview using sample agents. Connect Supabase (.env) to
          register and manage agents.
        </div>
      )}

      {loading ? (
        <p className="text-charcoal/50">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((a) => (
            <div key={a.id || a.email} className="card-luxe overflow-hidden">
              <div className="flex items-center gap-4 p-5">
                <img
                  src={a.avatar}
                  alt={a.name}
                  className="h-14 w-14 rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-charcoal">
                    {a.name}
                  </h3>
                  <p className="truncate text-sm text-gold">{a.designation}</p>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-charcoal/45">
                    <Star className="h-3 w-3 fill-gold text-gold" />
                    {a.rating} · {a.reviews} reviews
                  </div>
                </div>
              </div>

              {/* Approval status */}
              <div className="px-5">
                {a.approved ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                    <Check className="h-3 w-3" /> Approved
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2.5 py-1 text-xs font-semibold text-gold">
                    <Clock className="h-3 w-3" /> Pending
                  </span>
                )}
              </div>

              <div className="mt-3 flex gap-2 border-t border-charcoal/[0.06] p-3">
                {isSupabaseConfigured && (
                  <button
                    onClick={() => toggleApproval(a)}
                    disabled={busyId === a.id}
                    className={`flex-1 rounded-full py-2 text-sm font-medium transition disabled:opacity-40 ${
                      a.approved
                        ? "border border-charcoal/10 text-charcoal hover:border-red-400 hover:text-red-600"
                        : "bg-charcoal text-white hover:bg-gold"
                    }`}
                  >
                    {a.approved ? "Revoke" : "Approve"}
                  </button>
                )}
                <Link
                  to={`/admin/agents/${a.id}/edit`}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/10 text-charcoal transition hover:border-gold hover:text-gold ${
                    !isSupabaseConfigured ? "pointer-events-none opacity-40" : ""
                  }`}
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleDelete(a)}
                  disabled={busyId === a.id || !isSupabaseConfigured}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/10 text-charcoal transition hover:border-red-500 hover:text-red-600 disabled:opacity-40"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
