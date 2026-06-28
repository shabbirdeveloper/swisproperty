import { Link } from "react-router-dom";
import {
  Star,
  Phone,
  Mail,
  MessageCircle,
  CalendarCheck,
  Download,
  BadgeCheck,
} from "lucide-react";
import { slugifyName } from "../services/agents.js";

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-charcoal/55">{label}</span>
      <span className="text-sm font-semibold text-charcoal">{value}</span>
    </div>
  );
}

export default function ContactAgentCard({
  property,
  onDownloadBrochure,
  onRequestViewing,
}) {
  const { agent } = property;

  return (
    <div className="space-y-5 lg:sticky lg:top-24">
      {/* Agent card */}
      <div className="card-luxe p-6">
        <div className="flex items-center gap-4">
          <img
            src={agent.avatar}
            alt={agent.name}
            className="h-16 w-16 rounded-2xl object-cover"
          />
          <div>
            <Link
              to={`/agents/${slugifyName(agent.name)}`}
              className="font-serif text-lg font-semibold text-charcoal transition hover:text-gold"
            >
              {agent.name}
            </Link>
            <p className="text-sm text-charcoal/55">{agent.designation}</p>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" />
              <span className="font-semibold text-charcoal">
                {agent.rating}
              </span>
              <span className="text-charcoal/45">
                ({agent.reviews} reviews)
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-2.5">
          <a
            href={`tel:${agent.phone}`}
            className="flex items-center gap-3 rounded-xl bg-cloud px-4 py-3 text-sm text-charcoal transition hover:bg-charcoal hover:text-white"
          >
            <Phone className="h-4 w-4 text-gold" />
            {agent.phone}
          </a>
          <a
            href={`https://wa.me/${agent.whatsapp.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-xl bg-cloud px-4 py-3 text-sm text-charcoal transition hover:bg-charcoal hover:text-white"
          >
            <MessageCircle className="h-4 w-4 text-gold" />
            WhatsApp
          </a>
          <a
            href={`mailto:${agent.email}`}
            className="flex items-center gap-3 rounded-xl bg-cloud px-4 py-3 text-sm text-charcoal transition hover:bg-charcoal hover:text-white"
          >
            <Mail className="h-4 w-4 text-gold" />
            <span className="truncate">{agent.email}</span>
          </a>
        </div>

        <div className="mt-5 space-y-3">
          <button onClick={onRequestViewing} className="btn-primary w-full py-3.5">
            <CalendarCheck className="h-4 w-4" />
            Request a Viewing
          </button>
          <button
            onClick={onDownloadBrochure}
            className="btn-outline w-full py-3.5"
          >
            <Download className="h-4 w-4" />
            Download Brochure
          </button>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-gold/10 py-2.5 text-xs font-semibold text-gold">
          <BadgeCheck className="h-4 w-4" />
          SwissProperty Verified Agent
        </div>
      </div>

      {/* Property information card */}
      <div className="card-luxe p-6">
        <h4 className="mb-1 font-serif text-base font-semibold text-charcoal">
          Property Information
        </h4>
        <div className="divide-y divide-charcoal/[0.06]">
          <InfoRow label="Property Type" value={property.propertyType} />
          <InfoRow
            label="Property ID"
            value={`SP-${String(property.id).padStart(4, "0")}`}
          />
          <InfoRow label="Status" value={property.status} />
          <InfoRow label="Availability" value={property.availability} />
          <InfoRow label="Year Built" value={property.yearBuilt} />
          <InfoRow
            label="Floor"
            value={property.floor === 0 ? "Ground" : property.floor}
          />
          <InfoRow label="Total Floors" value={property.totalFloors} />
          <InfoRow label="Heating" value={property.heating} />
        </div>
      </div>
    </div>
  );
}
