import { useEffect } from "react";
import { X } from "lucide-react";
import FilterFields from "./FilterFields.jsx";

/**
 * Mobile slide-over filter drawer.
 */
export default function FilterDrawer({
  open,
  onClose,
  filters,
  set,
  resultCount,
  onClearAll,
}) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-[60] lg:hidden ${
        open ? "" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-charcoal/50 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Panel */}
      <div
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-lift transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-charcoal/[0.06] px-6 py-5">
          <h3 className="text-lg font-semibold text-charcoal">
            Filters &amp; Sort
          </h3>
          <button
            onClick={onClose}
            aria-label="Close filters"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/10 text-charcoal transition hover:border-gold hover:text-gold"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <FilterFields filters={filters} set={set} />
        </div>

        <div className="flex gap-3 border-t border-charcoal/[0.06] px-6 py-4">
          <button onClick={onClearAll} className="btn-outline flex-1">
            Clear All
          </button>
          <button onClick={onClose} className="btn-primary flex-1">
            Show {resultCount} {resultCount === 1 ? "result" : "results"}
          </button>
        </div>
      </div>
    </div>
  );
}
