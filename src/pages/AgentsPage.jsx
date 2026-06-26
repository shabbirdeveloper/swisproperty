import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, Phone, Mail, ArrowRight } from "lucide-react";
import CTASection from "../components/CTASection.jsx";
import Reveal from "../components/Reveal.jsx";
import { getAgents } from "../services/agents.js";

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    getAgents()
      .then(setAgents)
      .catch(() => setAgents([]));
  }, []);

  return (
    <>
      <section className="border-b border-charcoal/[0.06] bg-cloud">
        <div className="container-luxe py-14 text-center">
          <span className="eyebrow">Our Team</span>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-charcoal sm:text-4xl lg:text-5xl">
            Meet Our Property Advisors
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-charcoal/60">
            Trusted specialists with deep expertise across Switzerland's most
            sought-after locations.
          </p>
        </div>
      </section>

      <section className="container-luxe py-16">
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent, i) => (
            <Reveal
              as="article"
              key={agent.email}
              delay={(i % 3) * 90}
              className="card-luxe group overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-charcoal shadow-soft">
                  <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                  {agent.rating}
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-serif text-lg font-semibold text-charcoal">
                  {agent.name}
                </h3>
                <p className="text-sm text-gold">{agent.designation}</p>
                <p className="mt-1 text-xs text-charcoal/45">
                  {agent.reviews} client reviews
                </p>

                <div className="mt-5 space-y-2 text-sm text-charcoal/65">
                  <a
                    href={`tel:${agent.phone}`}
                    className="flex items-center gap-2.5 transition hover:text-gold"
                  >
                    <Phone className="h-4 w-4 text-gold" />
                    {agent.phone}
                  </a>
                  <a
                    href={`mailto:${agent.email}`}
                    className="flex items-center gap-2.5 transition hover:text-gold"
                  >
                    <Mail className="h-4 w-4 text-gold" />
                    <span className="truncate">{agent.email}</span>
                  </a>
                </div>

                <div className="mt-6 flex gap-3">
                  <a
                    href={`https://wa.me/${agent.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary flex-1 py-2.5"
                  >
                    Contact
                  </a>
                  <Link
                    to={`/agents/${agent.slug}`}
                    className="btn-outline flex-1 py-2.5"
                  >
                    View Profile
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-16">
        <CTASection />
      </section>
    </>
  );
}
