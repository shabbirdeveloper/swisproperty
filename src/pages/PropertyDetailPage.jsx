import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  MapPin,
  BadgeCheck,
  Phone,
  MessageCircle,
  Download,
  Heart,
  Share2,
  ShoppingBag,
} from "lucide-react";
import RequestModal from "../components/RequestModal.jsx";
import PropertyGallery from "../components/PropertyGallery.jsx";
import PropertyFeatureCards from "../components/PropertyFeatureCards.jsx";
import PropertyTabs from "../components/PropertyTabs.jsx";
import ContactAgentCard from "../components/ContactAgentCard.jsx";
import PropertyCard from "../components/PropertyCard.jsx";
import { useProperty, useProperties } from "../hooks/useProperties.js";
import { useSaved } from "../context/SavedContext.jsx";

export default function PropertyDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { property, loading } = useProperty(slug);
  const { properties: allProperties } = useProperties();
  const { isSaved, toggleSaved } = useSaved();
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestType, setRequestType] = useState("Buy");

  const openRequest = (type) => {
    setRequestType(type);
    setRequestOpen(true);
  };

  if (loading) {
    return (
      <div className="container-luxe py-32 text-center text-charcoal/50">
        Loading property…
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container-luxe py-32 text-center">
        <h1 className="font-serif text-3xl font-semibold text-charcoal">
          Property not found
        </h1>
        <p className="mt-3 text-charcoal/60">
          This listing may have been removed or the link is incorrect.
        </p>
        <Link to="/listings" className="btn-primary mt-8">
          Back to Listings
        </Link>
      </div>
    );
  }

  const saved = isSaved(property.id);

  // Opens the print-ready A4 brochure; user exports via Save as PDF.
  const handleDownloadBrochure = () => {
    navigate(`/brochure/${property.slug}`);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: property.title, url });
      } catch {
        /* user cancelled */
      }
    } else {
      navigator.clipboard?.writeText(url);
      alert("Link copied to clipboard");
    }
  };

  const related = allProperties
    .filter((p) => p.id !== property.id && p.location === property.location)
    .concat(allProperties.filter((p) => p.id !== property.id))
    .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
    .slice(0, 3);

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-charcoal/[0.06] bg-cloud">
        <div className="container-luxe flex items-center gap-1.5 py-4 text-sm text-charcoal/50">
          <Link to="/" className="transition hover:text-gold">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/listings" className="transition hover:text-gold">
            Listings
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate font-medium text-charcoal">
            {property.title}
          </span>
        </div>
      </div>

      <div className="container-luxe py-8">
        {/* Title row */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-gold px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                {property.status}
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-charcoal/5 px-3 py-1 text-[11px] font-semibold text-charcoal">
                <BadgeCheck className="h-3.5 w-3.5 text-gold" />
                SwissProperty Verified
              </span>
            </div>
            <h1 className="mt-3 font-serif text-3xl font-semibold uppercase text-charcoal sm:text-4xl">
              {property.title}
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-charcoal/55">
              <MapPin className="h-4 w-4 text-gold" />
              {property.address}
            </p>
          </div>
          <div className="text-left lg:text-right">
            <p className="text-xs uppercase tracking-wide text-charcoal/45">
              {property.status === "For Rent" ? "Monthly Rent" : "Asking Price"}
            </p>
            <p className="font-serif text-3xl font-semibold text-charcoal sm:text-4xl">
              {property.price}
            </p>
          </div>
        </div>

        <p className="mt-4 max-w-3xl leading-relaxed text-charcoal/65">
          {property.shortDescription}
        </p>

        {/* Action buttons */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={() => openRequest("Buy")} className="btn-primary">
            <ShoppingBag className="h-4 w-4" />
            Buy / Book / Sell
          </button>
          <a href={`tel:${property.agent.phone}`} className="btn-outline">
            <Phone className="h-4 w-4" />
            Contact Agent
          </a>
          <a
            href={`https://wa.me/${property.agent.whatsapp.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="btn-gold"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
          <button onClick={handleDownloadBrochure} className="btn-outline">
            <Download className="h-4 w-4" />
            Download Brochure
          </button>
          <button
            onClick={() => toggleSaved(property.id)}
            className="btn-outline"
          >
            <Heart className={`h-4 w-4 ${saved ? "fill-gold text-gold" : ""}`} />
            {saved ? "Saved" : "Save Property"}
          </button>
          <button onClick={handleShare} className="btn-ghost border border-charcoal/15">
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>

        {/* Gallery */}
        <div className="mt-8">
          <PropertyGallery images={property.gallery} title={property.title} />
        </div>

        {/* Feature cards */}
        <div className="mt-8">
          <PropertyFeatureCards property={property} />
        </div>

        {/* Two-column content */}
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <PropertyTabs property={property} />

            {/* Exact-address location map */}
            <div className="card-luxe overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-charcoal/[0.06] px-6 py-4">
                <h2 className="font-serif text-lg font-semibold text-charcoal">
                  Location
                </h2>
                <span className="flex items-center gap-1.5 text-sm text-charcoal/55">
                  <MapPin className="h-4 w-4 text-gold" />
                  {property.address}
                </span>
              </div>
              <iframe
                title={`Map of ${property.address}`}
                className="h-[420px] w-full"
                loading="lazy"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  property.address || `${property.location}, Switzerland`
                )}&z=16&output=embed`}
              />
            </div>
          </div>
          <div>
            <ContactAgentCard
              property={property}
              onDownloadBrochure={handleDownloadBrochure}
              onRequestViewing={() => openRequest("Booking")}
            />
          </div>
        </div>

        {/* Related */}
        <div className="mt-16">
          <h2 className="mb-7 font-serif text-2xl font-semibold text-charcoal">
            Similar Properties
          </h2>
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      </div>

      <RequestModal
        property={property}
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        defaultType={requestType}
      />
    </>
  );
}
