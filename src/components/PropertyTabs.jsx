import { useState } from "react";
import { Quote } from "lucide-react";
import AmenitiesGrid from "./AmenitiesGrid.jsx";
import NearbyPlaces from "./NearbyPlaces.jsx";
import PropertyHighlights from "./PropertyHighlights.jsx";

const tabs = [
  "Overview",
  "Details",
  "Amenities",
  "Location",
  "Nearby Places",
  "Highlights",
];

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-cloud px-4 py-3">
      <span className="text-sm text-charcoal/55">{label}</span>
      <span className="text-sm font-semibold text-charcoal">{value}</span>
    </div>
  );
}

export default function PropertyTabs({ property }) {
  const [active, setActive] = useState("Overview");

  const details = [
    ["Property Type", property.propertyType],
    ["Property ID", `SP-${String(property.id).padStart(4, "0")}`],
    ["Status", property.status],
    ["Availability", property.availability],
    ["Year Built", property.yearBuilt],
    ["Floor", property.floor === 0 ? "Ground" : property.floor],
    ["Total Floors", property.totalFloors],
    ["Heating", property.heating],
    ["Parking", property.parking],
    ["Furnished", property.furnished],
    ["Price", property.price],
    ["Size", property.size],
    ["Bedrooms", property.bedrooms],
    ["Bathrooms", property.bathrooms],
  ];

  return (
    <div className="card-luxe p-6 sm:p-8">
      {/* Tab nav */}
      <div className="no-scrollbar -mx-1 mb-8 flex gap-2 overflow-x-auto border-b border-charcoal/[0.06] pb-px">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`relative whitespace-nowrap px-4 py-3 text-sm font-medium transition ${
              active === t
                ? "text-charcoal"
                : "text-charcoal/45 hover:text-charcoal"
            }`}
          >
            {t}
            {active === t && (
              <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-gold" />
            )}
          </button>
        ))}
      </div>

      {/* Panels */}
      {active === "Overview" && (
        <div className="space-y-6 animate-fadeUp">
          <p className="leading-relaxed text-charcoal/70">
            {property.fullDescription}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Bedrooms", property.bedrooms],
              ["Bathrooms", property.bathrooms],
              ["Size", property.size],
              ["To Centre", property.distanceFromCityCenter],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-cloud p-4 text-center">
                <p className="text-lg font-semibold text-charcoal">{v}</p>
                <p className="text-xs uppercase tracking-wide text-charcoal/45">
                  {k}
                </p>
              </div>
            ))}
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-charcoal p-7 text-white">
            <Quote className="absolute right-5 top-5 h-12 w-12 text-gold/20" />
            <p className="font-serif text-xl italic leading-relaxed sm:text-2xl">
              "A perfect blend of luxury, location, and lifestyle."
            </p>
            <p className="mt-3 text-sm text-gold">— SwissProperty</p>
          </div>
        </div>
      )}

      {active === "Details" && (
        <div className="grid grid-cols-1 gap-3 animate-fadeUp sm:grid-cols-2">
          {details.map(([label, value]) => (
            <DetailRow key={label} label={label} value={value} />
          ))}
        </div>
      )}

      {active === "Amenities" && (
        <div className="animate-fadeUp">
          <AmenitiesGrid amenities={property.amenities} />
        </div>
      )}

      {active === "Location" && (
        <div className="space-y-5 animate-fadeUp">
          <p className="leading-relaxed text-charcoal/70">
            Located at{" "}
            <span className="font-medium text-charcoal">
              {property.address}
            </span>
            , this property enjoys an enviable position in {property.location},
            just {property.distanceFromCityCenter} from the city center with
            excellent access to transport, schools, and amenities.
          </p>
          <div className="relative h-72 overflow-hidden rounded-2xl border border-charcoal/[0.06]">
            <iframe
              title="Map"
              className="h-full w-full grayscale-[0.2]"
              loading="lazy"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                property.address || `${property.location}, Switzerland`
              )}&z=16&output=embed`}
            />
          </div>
        </div>
      )}

      {active === "Nearby Places" && (
        <div className="animate-fadeUp">
          <NearbyPlaces places={property.nearbyPlaces} />
        </div>
      )}

      {active === "Highlights" && (
        <div className="animate-fadeUp">
          <PropertyHighlights highlights={property.highlights} />
        </div>
      )}
    </div>
  );
}
