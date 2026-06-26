import {
  Wifi,
  Car,
  ShieldCheck,
  Sun,
  Flame,
  ArrowUpDown,
  Trees,
  Building,
  Mountain,
  ChefHat,
  Check,
} from "lucide-react";

const iconFor = (name) => {
  const map = {
    WiFi: Wifi,
    Parking: Car,
    Security: ShieldCheck,
    Balcony: Sun,
    Heating: Flame,
    Elevator: ArrowUpDown,
    Garden: Trees,
    "City View": Building,
    "Mountain View": Mountain,
    "Modern Kitchen": ChefHat,
  };
  return map[name] || Check;
};

export default function AmenitiesGrid({ amenities = [] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {amenities.map((a) => {
        const Icon = iconFor(a);
        return (
          <div
            key={a}
            className="flex items-center gap-3 rounded-xl border border-charcoal/[0.06] bg-white p-3.5 shadow-soft transition hover:border-gold/40"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/10 text-gold">
              <Icon className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium text-charcoal">{a}</span>
          </div>
        );
      })}
    </div>
  );
}
