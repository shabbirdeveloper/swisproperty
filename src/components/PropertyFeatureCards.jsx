import {
  BedDouble,
  Bath,
  Maximize,
  Navigation,
  Car,
  Sofa,
} from "lucide-react";

export default function PropertyFeatureCards({ property }) {
  const features = [
    { icon: BedDouble, label: "Bedrooms", value: `${property.bedrooms} Rooms` },
    { icon: Bath, label: "Bathrooms", value: `${property.bathrooms} Baths` },
    { icon: Maximize, label: "Property Size", value: property.size },
    {
      icon: Navigation,
      label: "City Center",
      value: property.distanceFromCityCenter,
    },
    { icon: Car, label: "Parking", value: property.parking },
    { icon: Sofa, label: "Furnished", value: property.furnished },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {features.map(({ icon: Icon, label, value }) => (
        <div
          key={label}
          className="flex flex-col items-center rounded-2xl border border-charcoal/[0.06] bg-white p-4 text-center shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold">
            <Icon className="h-5 w-5" />
          </span>
          <span className="mt-3 text-[11px] font-medium uppercase tracking-wide text-charcoal/45">
            {label}
          </span>
          <span className="mt-1 text-sm font-semibold text-charcoal">
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}
