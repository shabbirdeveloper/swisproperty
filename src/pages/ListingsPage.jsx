import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import PropertyCard from "../components/PropertyCard.jsx";
import PropertyCardSkeleton from "../components/PropertyCardSkeleton.jsx";
import FilterBar from "../components/FilterBar.jsx";
import FilterDrawer from "../components/FilterDrawer.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Reveal from "../components/Reveal.jsx";
import { useProperties } from "../hooks/useProperties.js";
import {
  filterProperties,
  defaultFilters,
  countActiveFilters,
} from "../utils/filterProperties.js";
import { useSaved } from "../context/SavedContext.jsx";

// Map URL query params -> filter object (keeps deep links shareable).
function paramsToFilters(params) {
  const f = { ...defaultFilters };
  for (const key of Object.keys(defaultFilters)) {
    const val = params.get(key);
    if (val !== null) {
      f[key] = key === "featuredOnly" ? val === "true" || val === "1" : val;
    }
  }
  return f;
}

export default function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { saved } = useSaved();
  const savedOnly = searchParams.get("saved") === "1";

  const { properties, loading } = useProperties();
  const [filters, setFilters] = useState(() => paramsToFilters(searchParams));
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Re-sync when arriving via a new query string (e.g. from hero search / navbar).
  useEffect(() => {
    setFilters(paramsToFilters(searchParams));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  const set = (key, value) => {
    setFilters((prev) => {
      const nextFilters = { ...prev, [key]: value };
      // keep the URL in sync (only non-default values)
      const params = new URLSearchParams();
      Object.entries(nextFilters).forEach(([k, v]) => {
        if (v && v !== defaultFilters[k]) params.set(k, String(v));
      });
      if (savedOnly) params.set("saved", "1");
      setSearchParams(params, { replace: true });
      return nextFilters;
    });
  };

  const clearAll = () => {
    setFilters(defaultFilters);
    setSearchParams(savedOnly ? { saved: "1" } : {}, { replace: true });
  };

  const clearOne = (key) => set(key, defaultFilters[key]);

  const results = useMemo(() => {
    let list = filterProperties(properties, filters);
    if (savedOnly) list = list.filter((p) => saved.includes(p.id));
    return list;
  }, [properties, filters, savedOnly, saved]);

  const activeCount = countActiveFilters(filters);

  return (
    <>
      {/* Page header */}
      <section className="border-b border-charcoal/[0.06] bg-cloud">
        <div className="container-luxe py-14 text-center">
          <span className="eyebrow">Portfolio</span>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-charcoal sm:text-4xl lg:text-5xl">
            {savedOnly ? "Saved Properties" : "Premium Property Listings"}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-charcoal/60">
            {savedOnly
              ? "Your shortlisted residences, kept in one place."
              : "Explore verified luxury properties with advanced search and filters."}
          </p>
        </div>
      </section>

      <section className="container-luxe py-10">
        {/* Desktop filter bar */}
        <div className="hidden lg:block">
          <FilterBar
            filters={filters}
            set={set}
            resultCount={results.length}
            onClearAll={clearAll}
            onClearOne={clearOne}
          />
        </div>

        {/* Mobile filter trigger */}
        <div className="flex items-center justify-between lg:hidden">
          <p className="text-sm font-medium text-charcoal">
            {results.length} {results.length === 1 ? "result" : "results"}
          </p>
          <button
            onClick={() => setDrawerOpen(true)}
            className="btn-primary"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeCount > 0 && (
              <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/25 px-1 text-[10px]">
                {activeCount}
              </span>
            )}
          </button>
        </div>

        {/* Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              onClear={clearAll}
              title={
                savedOnly ? "No saved properties yet" : "No properties found"
              }
              message={
                savedOnly
                  ? "Tap the heart icon on any listing to save it here."
                  : "We couldn't find any listings matching your criteria. Try adjusting or clearing your filters."
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 80}>
                  <PropertyCard property={p} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        set={set}
        resultCount={results.length}
        onClearAll={clearAll}
      />
    </>
  );
}
