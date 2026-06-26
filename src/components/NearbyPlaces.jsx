import {
  Building2,
  GraduationCap,
  Stethoscope,
  ShoppingBag,
  TrainFront,
  Plane,
  MapPin,
} from "lucide-react";

const iconFor = (type) => {
  const map = {
    "City Center": Building2,
    School: GraduationCap,
    Hospital: Stethoscope,
    "Shopping Mall": ShoppingBag,
    "Public Transport": TrainFront,
    Airport: Plane,
  };
  return map[type] || MapPin;
};

export default function NearbyPlaces({ places = [] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {places.map((place) => {
        const Icon = iconFor(place.type);
        return (
          <div
            key={place.type + place.name}
            className="flex items-center gap-4 rounded-2xl border border-charcoal/[0.06] bg-white p-4 shadow-soft transition hover:shadow-card"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cloud text-gold">
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-charcoal">
                {place.name}
              </p>
              <p className="text-xs text-charcoal/50">{place.type}</p>
            </div>
            <span className="ml-auto shrink-0 rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
              {place.distance}
            </span>
          </div>
        );
      })}
    </div>
  );
}
