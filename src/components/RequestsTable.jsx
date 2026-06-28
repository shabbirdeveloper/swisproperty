import { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Tag,
  CalendarCheck,
  Inbox,
} from "lucide-react";
import { getMyRequests, updateRequestStatus } from "../services/requests.js";
import { isSupabaseConfigured } from "../lib/supabase.js";
import { useToast } from "../context/ToastContext.jsx";

const TYPE_ICON = { Buy: ShoppingBag, Sell: Tag, Booking: CalendarCheck };

const STATUS_STYLE = {
  Pending: "bg-gold/10 text-gold",
  Accepted: "bg-blue-50 text-blue-700",
  Rejected: "bg-red-50 text-red-600",
  Completed: "bg-green-50 text-green-700",
};

const STATUSES = ["Pending", "Accepted", "Rejected", "Completed"];

/**
 * Shared requests management table for both agent and admin dashboards.
 * RLS scopes the rows: agents see their own, admins see all.
 */
export default function RequestsTable({ title = "Requests" }) {
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    getMyRequests()
      .then(setRequests)
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  const changeStatus = async (req, status) => {
    setBusyId(req.id);
    try {
      await updateRequestStatus(req.id, status);
      setRequests((prev) =>
        prev.map((r) => (r.id === req.id ? { ...r, status } : r))
      );
      toast.success(`Marked as ${status}.`);
    } catch (e) {
      toast.error(e.message || "Update failed.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-charcoal">{title}</h1>
      <p className="mb-6 text-sm text-charcoal/55">
        Buy, sell and booking requests from clients.
      </p>

      {!isSupabaseConfigured && (
        <div className="mb-6 rounded-xl bg-gold/10 px-4 py-3 text-sm text-gold">
          Connect Supabase (.env) to receive client requests.
        </div>
      )}

      {loading ? (
        <p className="text-charcoal/50">Loading…</p>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-charcoal/15 bg-white px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold">
            <Inbox className="h-7 w-7" />
          </span>
          <h3 className="mt-4 font-semibold text-charcoal">No requests yet</h3>
          <p className="mt-1 text-sm text-charcoal/50">
            Client requests for your properties will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => {
            const TypeIcon = TYPE_ICON[r.requestType] || ShoppingBag;
            return (
              <div key={r.id} className="card-luxe p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 rounded-full bg-cloud px-2.5 py-1 text-xs font-semibold text-charcoal">
                        <TypeIcon className="h-3.5 w-3.5 text-gold" />
                        {r.requestType}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          STATUS_STYLE[r.status] || "bg-cloud text-charcoal"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                    <h3 className="mt-2 font-semibold text-charcoal">
                      {r.customerName}
                    </h3>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-charcoal/60">
                      {r.customerEmail && (
                        <a
                          href={`mailto:${r.customerEmail}`}
                          className="flex items-center gap-1.5 hover:text-gold"
                        >
                          <Mail className="h-3.5 w-3.5 text-gold" />
                          {r.customerEmail}
                        </a>
                      )}
                      {r.customerPhone && (
                        <a
                          href={`tel:${r.customerPhone}`}
                          className="flex items-center gap-1.5 hover:text-gold"
                        >
                          <Phone className="h-3.5 w-3.5 text-gold" />
                          {r.customerPhone}
                        </a>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-charcoal/45">
                    {new Date(r.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="mt-3 rounded-xl bg-cloud px-4 py-3">
                  <p className="flex items-center gap-1.5 text-sm font-medium text-charcoal">
                    <MapPin className="h-3.5 w-3.5 text-gold" />
                    {r.propertyTitle}
                    <span className="text-charcoal/45">· {r.propertyLocation}</span>
                  </p>
                  {r.message && (
                    <p className="mt-2 text-sm leading-relaxed text-charcoal/65">
                      {r.message}
                    </p>
                  )}
                </div>

                {/* Status controls */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => changeStatus(r, s)}
                      disabled={busyId === r.id || r.status === s}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition disabled:opacity-100 ${
                        r.status === s
                          ? "bg-charcoal text-white"
                          : "border border-charcoal/10 text-charcoal/70 hover:border-gold hover:text-gold disabled:opacity-40"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
