import { Sparkles } from "lucide-react";

export default function PropertyHighlights({ highlights = [] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {highlights.map((h) => (
        <div
          key={h}
          className="flex items-center gap-3 rounded-2xl border border-charcoal/[0.06] bg-gradient-to-br from-white to-cloud p-4 shadow-soft"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-sm font-medium text-charcoal">{h}</span>
        </div>
      ))}
    </div>
  );
}
