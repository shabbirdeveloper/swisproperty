import { useState, useEffect } from "react";
import { X, Send, ShoppingBag, Tag, CalendarCheck } from "lucide-react";
import { submitPropertyRequest } from "../services/requests.js";
import { useToast } from "../context/ToastContext.jsx";

const TYPES = [
  { value: "Buy", label: "Buy", icon: ShoppingBag },
  { value: "Sell", label: "Sell", icon: Tag },
  { value: "Booking", label: "Booking", icon: CalendarCheck },
];

/**
 * Buy / Sell / Booking request modal. Submits a request that routes to the
 * property's agent. `defaultType` preselects the request type.
 */
export default function RequestModal({ property, open, onClose, defaultType = "Buy" }) {
  const toast = useToast();
  const [type, setType] = useState(defaultType);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setType(defaultType);
  }, [open, defaultType]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await submitPropertyRequest({
        property,
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
        requestType: type,
        message: form.message,
      });
      toast.success("Request sent to the agent.");
      setForm({ name: "", email: "", phone: "", message: "" });
      onClose();
    } catch (err) {
      toast.error(err.message || "Could not send request.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-lift">
        <div className="flex items-center justify-between border-b border-charcoal/[0.06] px-6 py-4">
          <div>
            <h3 className="font-serif text-lg font-semibold text-charcoal">
              Send a Request
            </h3>
            <p className="text-xs text-charcoal/50">{property.title}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-charcoal/10 text-charcoal transition hover:border-gold hover:text-gold"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 px-6 py-5">
          {/* Type selector */}
          <div className="grid grid-cols-3 gap-2">
            {TYPES.map(({ value, label, icon: Icon }) => (
              <button
                type="button"
                key={value}
                onClick={() => setType(value)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-sm font-medium transition ${
                  type === value
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-charcoal/10 text-charcoal/70 hover:border-gold/40"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              required
              value={form.name}
              onChange={set("name")}
              placeholder="Your name"
              className="field-luxe sm:col-span-2"
            />
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="Email"
              className="field-luxe"
            />
            <input
              value={form.phone}
              onChange={set("phone")}
              placeholder="Phone"
              className="field-luxe"
            />
          </div>
          <textarea
            rows={3}
            value={form.message}
            onChange={set("message")}
            placeholder="Tell the agent what you need…"
            className="field-luxe resize-none"
          />

          <button
            type="submit"
            disabled={busy}
            className="btn-primary w-full py-3.5 disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {busy ? "Sending…" : `Send ${type} Request`}
          </button>
        </form>
      </div>
    </div>
  );
}
