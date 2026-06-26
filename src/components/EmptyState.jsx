import { SearchX } from "lucide-react";

export default function EmptyState({
  title = "No properties found",
  message = "We couldn't find any listings matching your criteria. Try adjusting or clearing your filters.",
  onClear,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-charcoal/15 bg-cloud px-6 py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-gold">
        <SearchX className="h-8 w-8" />
      </span>
      <h3 className="mt-6 text-xl font-semibold text-charcoal">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-charcoal/60">{message}</p>
      {onClear && (
        <button onClick={onClear} className="btn-primary mt-6">
          Clear All Filters
        </button>
      )}
    </div>
  );
}
