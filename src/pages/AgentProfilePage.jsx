import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Star,
  Phone,
  Mail,
  MessageCircle,
  ChevronRight,
  BadgeCheck,
  Home,
} from "lucide-react";
import PropertyCard from "../components/PropertyCard.jsx";
import Reveal from "../components/Reveal.jsx";
import CTASection from "../components/CTASection.jsx";
import { getAgentBySlug } from "../services/agents.js";
import { useProperties } from "../hooks/useProperties.js";

export default function AgentProfilePage() {
  const { slug } = useParams();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { properties } = useProperties();

  useEffect(() => {
    setLoading(true);
    getAgentBySlug(slug)
      .then(setAgent)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="container-luxe py-32 text-center text-charcoal/50">
        Loading profile…
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="container-luxe py-32 text-center">
        <h1 className="text-3xl font-semibold text-charcoal">
          Agent not found
        </h1>
        <Link to="/agents" className="btn-primary mt-8">
          Back to Agents
        </Link>
      </div>
    );
  }

  const listings = properties.filter(
    (p) => p.agent?.email && p.agent.email === agent.email
  );

  const bio =
    agent.bio ||
    `${agent.name} is a ${agent.designation.toLowerCase()} at SwissProperty, ` +
      `pairing deep local market knowledge with a discreet, client-first approach. ` +
      `Trusted by ${agent.reviews}+ clients, ${
        agent.name.split(" ")[0]
      } guides buyers and sellers through Switzerland's premium property market with clarity and care.`;

  const whatsapp = (agent.whatsapp || "").replace(/[^0-9]/g, "");

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-charcoal/[0.06] bg-cloud">
        <div className="container-luxe flex items-center gap-1.5 py-4 text-sm text-charcoal/50">
          <Link to="/" className="transition hover:text-gold">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/agents" className="transition hover:text-gold">
            Agents
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-charcoal">{agent.name}</span>
        </div>
      </div>

      {/* Profile header */}
      <section className="container-luxe py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left: avatar + contact card */}
          <div className="lg:col-span-1">
            <div className="card-luxe overflow-hidden lg:sticky lg:top-24">
              <div className="aspect-square w-full overflow-hidden bg-mist">
                {agent.avatar && (
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center gap-1.5 text-sm">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  <span className="font-semibold text-charcoal">
                    {agent.rating}
                  </span>
                  <span className="text-charcoal/45">
                    ({agent.reviews} reviews)
                  </span>
                </div>
                <div className="mt-5 space-y-2.5">
                  {agent.phone && (
                    <a
                      href={`tel:${agent.phone}`}
                      className="flex items-center gap-3 rounded-xl bg-cloud px-4 py-3 text-sm text-charcoal transition hover:bg-charcoal hover:text-white"
                    >
                      <Phone className="h-4 w-4 text-gold" />
                      {agent.phone}
                    </a>
                  )}
                  {whatsapp && (
                    <a
                      href={`https://wa.me/${whatsapp}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-xl bg-cloud px-4 py-3 text-sm text-charcoal transition hover:bg-charcoal hover:text-white"
                    >
                      <MessageCircle className="h-4 w-4 text-gold" />
                      WhatsApp
                    </a>
                  )}
                  {agent.email && (
                    <a
                      href={`mailto:${agent.email}`}
                      className="flex items-center gap-3 rounded-xl bg-cloud px-4 py-3 text-sm text-charcoal transition hover:bg-charcoal hover:text-white"
                    >
                      <Mail className="h-4 w-4 text-gold" />
                      <span className="truncate">{agent.email}</span>
                    </a>
                  )}
                </div>
                <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-gold/10 py-2.5 text-xs font-semibold text-gold">
                  <BadgeCheck className="h-4 w-4" />
                  SwissProperty Verified Agent
                </div>
              </div>
            </div>
          </div>

          {/* Right: name, bio, stats */}
          <div className="lg:col-span-2">
            <span className="eyebrow">Property Advisor</span>
            <h1 className="mt-3 text-4xl font-bold text-charcoal sm:text-5xl">
              {agent.name}
            </h1>
            <p className="mt-2 text-lg text-gold">{agent.designation}</p>

            <p className="mt-6 max-w-2xl leading-relaxed text-charcoal/65">
              {bio}
            </p>

            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { value: listings.length, label: "Active Listings", icon: Home },
                { value: agent.rating, label: "Rating", icon: Star },
                { value: `${agent.reviews}+`, label: "Reviews", icon: BadgeCheck },
              ].map(({ value, label, icon: Icon }) => (
                <div
                  key={label}
                  className="card-luxe flex flex-col items-center p-5 text-center"
                >
                  <Icon className="h-5 w-5 text-gold" />
                  <span className="mt-2 text-2xl font-bold text-charcoal">
                    {value}
                  </span>
                  <span className="text-xs text-charcoal/45">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Agent's listings */}
      <section className="container-luxe pb-16">
        <h2 className="mb-7 text-2xl font-bold text-charcoal">
          Listings by {agent.name.split(" ")[0]}
        </h2>
        {listings.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-charcoal/15 bg-cloud px-6 py-16 text-center text-charcoal/50">
            No active listings at the moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 80}>
                <PropertyCard property={p} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <section className="pb-16">
        <CTASection />
      </section>
    </>
  );
}
