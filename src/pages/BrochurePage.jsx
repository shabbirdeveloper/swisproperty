import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Printer, ArrowLeft } from "lucide-react";
import {
  BedDouble,
  Bath,
  Maximize,
  Navigation,
  Car,
  Sofa,
} from "lucide-react";
import { useProperty } from "../hooks/useProperties.js";
import { imgUrl, imgLabel } from "../utils/media.js";

/**
 * Print-ready A4 property brochure.
 * Design: charcoal band (1 inch) with a thin gold accent line at top and bottom
 * of every page, the title + a 2-line description, and 1–2 photos per page.
 *
 * Open at /brochure/:slug and use "Save as PDF" (or the button) to export.
 * The "Download Brochure" buttons on the detail page route here.
 *
 * Image-per-page rule: portrait/large photos render one-per-page; the rest are
 * paired two-per-page. (`oneUp()` is the single switch to tune that heuristic.)
 */

// Google Maps embed centered on the EXACT address, zoomed to street level.
// `property.mapImage` (admin-uploaded map) takes priority when present.
function buildMapEmbed(property) {
  const q = encodeURIComponent(
    property.address || `${property.location}, Switzerland`
  );
  return `https://maps.google.com/maps?q=${q}&z=16&output=embed`;
}

function chunkPairs(arr) {
  const out = [];
  for (let i = 0; i < arr.length; i += 2) out.push(arr.slice(i, i + 2));
  return out;
}

// Bands are intentionally empty — solid charcoal bars with the gold line only.
function Band({ position }) {
  return <div className={`br-band br-band-${position}`} />;
}

function Page({ children, page }) {
  return (
    <div className="br-page">
      <Band position="top" />
      <div className="br-content">{children}</div>
      <Band position="bottom" page={page} />
    </div>
  );
}

export default function BrochurePage() {
  const { slug } = useParams();
  const { property, loading } = useProperty(slug);
  const [mapFailed, setMapFailed] = useState(false);

  if (loading) {
    return (
      <div style={{ padding: "4rem", textAlign: "center" }}>Loading…</div>
    );
  }

  if (!property) {
    return (
      <div style={{ padding: "4rem", textAlign: "center" }}>
        <h1>Brochure not found</h1>
        <Link to="/listings" className="btn-primary" style={{ marginTop: 16 }}>
          Back to Listings
        </Link>
      </div>
    );
  }

  const [cover, ...rest] = property.gallery;
  const galleryPages = chunkPairs(rest);

  const specRow = [
    { icon: BedDouble, label: `${property.bedrooms} Bedrooms` },
    { icon: Bath, label: `${property.bathrooms} Bathrooms` },
    { icon: Maximize, label: property.size },
    { icon: Navigation, label: `${property.distanceFromCityCenter} to centre` },
    { icon: Car, label: property.parking },
    { icon: Sofa, label: property.furnished },
  ];

  const details = [
    ["Property Type", property.propertyType],
    ["Property ID", `SP-${String(property.id).padStart(4, "0")}`],
    ["Status", property.status],
    ["Availability", property.availability],
    ["Year Built", property.yearBuilt],
    ["Floor", property.floor === 0 ? "Ground" : property.floor],
    ["Total Floors", property.totalFloors],
    ["Heating", property.heating],
    ["Price", property.price],
    ["Size", property.size],
  ];

  const mapEmbed = buildMapEmbed(property);

  let pageNo = 0;
  const nextPage = () => (pageNo += 1);

  return (
    <div className="br-root">
      {/* Toolbar (hidden in print) */}
      <div className="br-toolbar no-print">
        <Link to={`/property/${property.slug}`} className="btn-outline">
          <ArrowLeft className="h-4 w-4" />
          Back to Property
        </Link>
        <button onClick={() => window.print()} className="btn-primary">
          <Printer className="h-4 w-4" />
          Save as PDF
        </button>
      </div>

      {/* COVER */}
      <Page page={nextPage()}>
        <div className="br-eyebrow">
          {property.status} · {property.location}
        </div>
        <h1 className="br-title">{property.title}</h1>
        <p className="br-desc">{property.shortDescription}</p>
        <div className="br-photo" style={{ flex: 1, marginTop: "8mm" }}>
          <img src={imgUrl(cover)} alt={property.title} />
          {imgLabel(cover) && <span className="br-caption">{imgLabel(cover)}</span>}
        </div>
        <div className="br-pricerow">
          <span className="br-price">{property.price}</span>
          <span className="br-specs-min">
            {property.bedrooms} Beds · {property.bathrooms} Baths ·{" "}
            {property.size}
          </span>
        </div>
      </Page>

      {/* OVERVIEW + FEATURES */}
      <Page page={nextPage()}>
        <h2 className="br-h2">Overview</h2>
        <p className="br-body">{property.fullDescription}</p>
        <div className="br-feature-grid">
          {specRow.map(({ icon: Icon, label }) => (
            <div key={label} className="br-feature">
              <Icon className="h-4 w-4" style={{ color: "#B8924A" }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div className="br-quote">
          A perfect blend of luxury, location, and lifestyle.
        </div>
        <div className="br-photo" style={{ flex: 1, marginTop: "6mm" }}>
          <img
            src={imgUrl(property.gallery[1] || cover)}
            alt={property.title}
          />
          {imgLabel(property.gallery[1]) && (
            <span className="br-caption">{imgLabel(property.gallery[1])}</span>
          )}
        </div>
      </Page>

      {/* GALLERY PAGES — 2 photos each */}
      {galleryPages.map((pair, idx) => (
        <Page key={idx} page={nextPage()}>
          {pair.map((item, i) => (
            <div
              key={i}
              className="br-photo"
              style={{ flex: 1, marginTop: i === 0 ? "0" : "5mm" }}
            >
              <img
                src={imgUrl(item)}
                alt={imgLabel(item) || `${property.title} ${i + 1}`}
              />
              {imgLabel(item) && (
                <span className="br-caption">{imgLabel(item)}</span>
              )}
            </div>
          ))}
        </Page>
      ))}

      {/* LOCATION MAP — 2nd-last page (backend uploads map to property.mapImage) */}
      <Page page={nextPage()}>
        <h2 className="br-h2">Location</h2>
        <p className="br-body" style={{ marginBottom: "4mm" }}>
          {property.address} · {property.distanceFromCityCenter} from{" "}
          {property.location} city center.
        </p>
        <div className="br-photo" style={{ flex: 1 }}>
          {property.mapImage && !mapFailed ? (
            <img
              src={property.mapImage}
              alt={`Map of ${property.address}`}
              onError={() => setMapFailed(true)}
            />
          ) : (
            <iframe
              title={`Map of ${property.address}`}
              src={mapEmbed}
              className="br-map"
            />
          )}
          <span className="br-caption">{property.address || property.location}</span>
        </div>
      </Page>

      {/* DETAILS + AGENT — final page */}
      <Page page={nextPage()}>
        <h2 className="br-h2">Property Details</h2>
        <table className="br-table">
          <tbody>
            {details.map(([k, v]) => (
              <tr key={k}>
                <td className="br-td-key">{k}</td>
                <td className="br-td-val">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="br-h2" style={{ marginTop: "8mm" }}>
          Amenities
        </h2>
        <div className="br-chips">
          {property.amenities.map((a) => (
            <span key={a} className="br-chip">
              {a}
            </span>
          ))}
        </div>

        <div className="br-agent">
          <img src={property.agent.avatar} alt={property.agent.name} />
          <div>
            <div className="br-agent-name">{property.agent.name}</div>
            <div className="br-agent-role">{property.agent.designation}</div>
            <div className="br-agent-contact">
              {property.agent.phone} · {property.agent.email}
            </div>
          </div>
          <div className="br-verified">SwissProperty Verified</div>
        </div>
      </Page>
    </div>
  );
}
