import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Send,
  CheckCircle2,
} from "lucide-react";
import { submitContactMessage } from "../services/contact.js";

const details = [
  {
    icon: MapPin,
    label: "Visit Us",
    value: "Bahnhofstrasse 42, 8001 Zurich, Switzerland",
  },
  { icon: Phone, label: "Call Us", value: "+41 44 123 45 67" },
  { icon: Mail, label: "Email Us", value: "hello@swissproperty.ch" },
  { icon: Clock, label: "Office Hours", value: "Mon–Fri · 9:00 – 18:00" },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await submitContactMessage(form);
      setSent(true);
      setForm({ name: "", email: "", phone: "", message: "" });
      setTimeout(() => setSent(false), 5000);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section className="border-b border-charcoal/[0.06] bg-cloud">
        <div className="container-luxe py-14 text-center">
          <span className="eyebrow">Get in Touch</span>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-charcoal sm:text-4xl lg:text-5xl">
            Contact SwissProperty
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-charcoal/60">
            Speak with an advisor about buying, renting, or listing a premium
            property. We respond within one business day.
          </p>
        </div>
      </section>

      <section className="container-luxe py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
          {/* Form */}
          <div className="lg:col-span-3">
            <div className="card-luxe p-7 sm:p-9">
              <h2 className="font-serif text-2xl font-semibold text-charcoal">
                Send us a message
              </h2>
              <p className="mt-2 text-sm text-charcoal/55">
                Fill in the form and our team will be in touch.
              </p>

              {sent && (
                <div className="mt-6 flex items-center gap-3 rounded-xl bg-gold/10 px-4 py-3 text-sm font-medium text-gold">
                  <CheckCircle2 className="h-5 w-5" />
                  Thank you — your message has been sent.
                </div>
              )}
              {error && (
                <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={submit} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium uppercase tracking-wide text-charcoal/50">
                      Full Name
                    </span>
                    <input
                      required
                      value={form.name}
                      onChange={update("name")}
                      placeholder="Your name"
                      className="field-luxe"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium uppercase tracking-wide text-charcoal/50">
                      Email
                    </span>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={update("email")}
                      placeholder="you@email.com"
                      className="field-luxe"
                    />
                  </label>
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-charcoal/50">
                    Phone
                  </span>
                  <input
                    value={form.phone}
                    onChange={update("phone")}
                    placeholder="+41 …"
                    className="field-luxe"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-charcoal/50">
                    Message
                  </span>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={update("message")}
                    placeholder="Tell us what you're looking for…"
                    className="field-luxe resize-none"
                  />
                </label>
                <button
                  type="submit"
                  disabled={busy}
                  className="btn-primary w-full py-4 disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {busy ? "Sending…" : "Send Message"}
                </button>
              </form>
            </div>
          </div>

          {/* Details + CTAs */}
          <div className="space-y-5 lg:col-span-2">
            <div className="card-luxe p-7">
              <h3 className="font-serif text-lg font-semibold text-charcoal">
                Contact Details
              </h3>
              <div className="mt-5 space-y-4">
                {details.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-charcoal/45">
                        {label}
                      </p>
                      <p className="text-sm font-medium text-charcoal">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <a
                href="https://wa.me/41791234567"
                target="_blank"
                rel="noreferrer"
                className="card-luxe flex flex-col items-center gap-2 p-6 text-center transition hover:-translate-y-1 hover:shadow-card"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold">
                  <MessageCircle className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold text-charcoal">
                  WhatsApp Us
                </span>
                <span className="text-xs text-charcoal/50">Quick replies</span>
              </a>
              <a
                href="mailto:hello@swissproperty.ch"
                className="card-luxe flex flex-col items-center gap-2 p-6 text-center transition hover:-translate-y-1 hover:shadow-card"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold">
                  <Mail className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold text-charcoal">
                  Email Us
                </span>
                <span className="text-xs text-charcoal/50">
                  Detailed enquiries
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="mt-10 overflow-hidden rounded-3xl border border-charcoal/[0.06] shadow-soft">
          <iframe
            title="SwissProperty Office"
            className="h-80 w-full grayscale-[0.2]"
            loading="lazy"
            src="https://maps.google.com/maps?q=Bahnhofstrasse%2042%20Zurich&t=&z=14&ie=UTF8&iwloc=&output=embed"
          />
        </div>
      </section>
    </>
  );
}
