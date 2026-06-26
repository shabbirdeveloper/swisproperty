import { useState } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import FilterFields from "./FilterFields.jsx";
import { getActiveFilterChips } from "../utils/filterProperties.js";

/**
 * Desktop premium top filter bar with collapsible advanced panel,
 * active filter chips, results count and clear control.
 */
export default function FilterBar({
  filters,
  set,
  resultCount,
  onClearAll,
  onClearOne,
}) {
  const [expanded, setExpanded] = useState(false);
  const chips = getActiveFilterChips(filters);

  return (
    <div className="rounded-3xl border border-charcoal/[0.06] bg-white p-5 shadow-soft sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold">
            <SlidersHorizontal className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-charcoal">
              {resultCount} {resultCount === 1 ? "property" : "properties"} found
            </p>
            <p className="text-xs text-charcoal/50">
              {chips.length > 0
                ? `${chips.length} active ${chips.length === 1 ? "filter" : "filters"}`
                : "Refine your search with advanced filters"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="btn-outline"
        >
          {expanded ? "Hide Filters" : "Advanced Filters"}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {expanded && (
        <div className="mt-6 border-t border-charcoal/[0.06] pt-6">
          <FilterFields filters={filters} set={set} />
        </div>
      )}

      {chips.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-charcoal/[0.06] pt-5">
          {chips.map((chip) => (
            <button
              key={chip.key + chip.label}
              onClick={() => onClearOne(chip.key)}
              className="group flex items-center gap-1.5 rounded-full bg-cloud px-3 py-1.5 text-xs font-medium text-charcoal transition hover:bg-gold hover:text-white"
            >
              {chip.label}
              <X className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
            </button>
          ))}
          <button
            onClick={onClearAll}
            className="ml-1 text-xs font-semibold text-gold underline-offset-2 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
