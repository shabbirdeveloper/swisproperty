/**
 * Dual-thumb price range bar (min + max).
 * value = { min, max }; onChange receives the updated { min, max }.
 */
export default function PriceRangeSlider({
  min = 0,
  max = 10000000,
  step = 50000,
  value,
  onChange,
}) {
  const lo = value?.min ?? min;
  const hi = value?.max ?? max;
  const pct = (v) => ((v - min) / (max - min)) * 100;

  const fmt = (v) =>
    v >= 1000000
      ? `CHF ${(v / 1000000).toFixed(v % 1000000 === 0 ? 0 : 1)}M`
      : `CHF ${(v / 1000).toFixed(0)}K`;

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-xs font-medium text-charcoal/70">
        <span>Price Range</span>
        <span className="text-charcoal">
          {fmt(lo)} – {fmt(hi)}
          {hi >= max ? "+" : ""}
        </span>
      </div>
      <div className="relative h-5">
        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-charcoal/15" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-gold"
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
        />
        <input
          type="range"
          className="dual-range"
          min={min}
          max={max}
          step={step}
          value={lo}
          onChange={(e) =>
            onChange({
              min: Math.min(Number(e.target.value), hi - step),
              max: hi,
            })
          }
        />
        <input
          type="range"
          className="dual-range"
          min={min}
          max={max}
          step={step}
          value={hi}
          onChange={(e) =>
            onChange({
              min: lo,
              max: Math.max(Number(e.target.value), lo + step),
            })
          }
        />
      </div>
    </div>
  );
}
