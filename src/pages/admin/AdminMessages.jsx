import { useState, useEffect } from "react";
import { Mail, Phone, AlertCircle } from "lucide-react";
import { getContactMessages } from "../../services/contact.js";
import { isSupabaseConfigured } from "../../lib/supabase.js";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getContactMessages()
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-charcoal">Enquiries</h1>
      <p className="mb-6 text-sm text-charcoal/55">
        Messages submitted through the contact form.
      </p>

      {!isSupabaseConfigured && (
        <div className="mb-6 flex items-start gap-2 rounded-xl bg-gold/10 px-4 py-3 text-sm text-gold">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          Connect Supabase (.env) to receive and view enquiries.
        </div>
      )}

      {loading ? (
        <p className="text-charcoal/50">Loading…</p>
      ) : messages.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-charcoal/15 bg-white px-6 py-16 text-center text-charcoal/50">
          No enquiries yet.
        </p>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="card-luxe p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-charcoal">{m.name}</h3>
                <span className="text-xs text-charcoal/45">
                  {new Date(m.created_at).toLocaleString()}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-4 text-sm text-charcoal/60">
                <a
                  href={`mailto:${m.email}`}
                  className="flex items-center gap-1.5 hover:text-gold"
                >
                  <Mail className="h-3.5 w-3.5 text-gold" />
                  {m.email}
                </a>
                {m.phone && (
                  <a
                    href={`tel:${m.phone}`}
                    className="flex items-center gap-1.5 hover:text-gold"
                  >
                    <Phone className="h-3.5 w-3.5 text-gold" />
                    {m.phone}
                  </a>
                )}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                {m.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
