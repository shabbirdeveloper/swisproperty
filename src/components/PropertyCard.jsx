import { Link } from "react-router-dom";
import {
  Heart,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Navigation,
  Car,
  Sofa,
  ArrowRight,
} from "lucide-react";
import { useSaved } from "../context/SavedContext.jsx";
import { imgUrl } from "../utils/media.js";

export default function PropertyCard({ property }) {
  const { isSaved, toggleSaved } = useSaved();
  const saved = isSaved(property.id);

  return (
    <article className="card-luxe group overflow-hidden hover:-translate-y-1 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link to={`/property/${property.slug}`}>
          <img
            src={imgUrl(property.gallery[0])}
            alt={property.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent opacity-60" />
        </Link>

        {/* Badges */}
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {property.featured && (
            <span className="rounded-full bg-gold px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-soft">
              Featured
            </span>
          )}
          <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-charcoal shadow-soft">
            {property.status}
          </span>
        </div>

        {/* Save */}
        <button
          onClick={() => toggleSaved(property.id)}
          aria-label="Save property"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-charcoal shadow-soft transition hover:scale-110 hover:text-gold"
        >
          <Heart
            className={`h-5 w-5 transition ${
              saved ? "fill-gold text-gold" : ""
            }`}
          />
        </button>

        <div className="absolute bottom-4 left-4">
          <span className="rounded-lg bg-charcoal/85 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur">
            {property.price}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-1 flex items-center gap-1.5 text-xs text-charcoal/50">
          <MapPin className="h-3.5 w-3.5 text-gold" />
          {property.location} · {property.propertyType}
        </div>
        <h3 className="mb-3 font-serif text-lg font-semibold uppercase leading-snug text-charcoal">
          <Link
            to={`/property/${property.slug}`}
            className="transition hover:text-gold"
          >
            {property.title}
          </Link>
        </h3>

        {/* Primary specs */}
        <div className="grid grid-cols-3 gap-2 border-y border-charcoal/[0.06] py-3 text-sm text-charcoal/70">
          <span className="flex items-center gap-1.5">
            <BedDouble className="h-4 w-4 text-gold" />
            {property.bedrooms} Beds
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="h-4 w-4 text-gold" />
            {property.bathrooms} Baths
          </span>
          <span className="flex items-center gap-1.5">
            <Maximize className="h-4 w-4 text-gold" />
            {property.size}
          </span>
        </div>

        {/* Secondary specs */}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-charcoal/55">
          <span className="flex items-center gap-1.5">
            <Car className="h-3.5 w-3.5 text-gold" />
            {property.parking}
          </span>
          <span className="flex items-center gap-1.5">
            <Sofa className="h-3.5 w-3.5 text-gold" />
            {property.furnished}
          </span>
        </div>

        {/* Landmark distances (excludes city centre & school) */}
        {(() => {
          const hide = ["City Center", "City Centre", "School"];
          const landmarks = (property.nearbyPlaces || []).filter(
            (n) => !hide.includes(n.type)
          );
          if (!landmarks.length) return null;
          return (
            <div className="mt-2 flex flex-col gap-1 text-xs text-charcoal/60">
              {landmarks.slice(0, 2).map((n) => (
                <span key={n.type + n.name} className="flex items-center gap-1.5">
                  <Navigation className="h-3 w-3 text-gold" />
                  {n.distance} to {n.type}
                </span>
              ))}
            </div>
          );
        })()}

        <Link
          to={`/property/${property.slug}`}
          className="mt-5 flex items-center justify-between rounded-xl bg-cloud px-4 py-3 text-sm font-medium text-charcoal transition hover:bg-charcoal hover:text-white"
        >
          View Details
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
