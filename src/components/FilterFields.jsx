import {
  Search,
  MapPin,
  Home,
  BedDouble,
  Bath,
  Maximize,
  Tag,
  Sofa,
} from "lucide-react";
import { propertyTypes, locations, statuses } from "../data/sampleProperties.js";
import { sortOptions } from "../utils/filterProperties.js";

// Defined at module scope so text inputs keep focus across re-renders.
const Labelled = ({ label, children }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-xs font-medium uppercase tracking-wide text-charcoal/50">
      {label}
    </span>
    {children}
  </label>
);

const IconField = ({ icon: Icon, children }) => (
  <div className="relative flex items-center">
    <Icon className="pointer-events-none absolute left-3 h-4 w-4 text-gold" />
    {children}
  </div>
);

/**
 * Shared set of filter controls used by both the desktop FilterBar
 * and the mobile FilterDrawer. `set(key, value)` updates a single field.
 */
export default function FilterFields({ filters, set, includeSort = true }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Labelled label="Keyword">
        <IconField icon={Search}>
          <input
            value={filters.keyword}
            onChange={(e) => set("keyword", e.target.value)}
            placeholder="Title, area, type…"
            className="field-luxe pl-9"
          />
        </IconField>
      </Labelled>

      <Labelled label="Location">
        <IconField icon={MapPin}>
          <select
            value={filters.location}
            onChange={(e) => set("location", e.target.value)}
            className="field-luxe pl-9 appearance-none"
          >
            <option value="">All Locations</option>
            {locations.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </IconField>
      </Labelled>

      <Labelled label="Property Type">
        <IconField icon={Home}>
          <select
            value={filters.propertyType}
            onChange={(e) => set("propertyType", e.target.value)}
            className="field-luxe pl-9 appearance-none"
          >
            <option value="">All Types</option>
            {propertyTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </IconField>
      </Labelled>

      <Labelled label="Min Price (CHF)">
        <input
          type="number"
          min="0"
          value={filters.minPrice}
          onChange={(e) => set("minPrice", e.target.value)}
          placeholder="0"
          className="field-luxe"
        />
      </Labelled>

      <Labelled label="Max Price (CHF)">
        <input
          type="number"
          min="0"
          value={filters.maxPrice}
          onChange={(e) => set("maxPrice", e.target.value)}
          placeholder="Any"
          className="field-luxe"
        />
      </Labelled>

      <Labelled label="Bedrooms">
        <IconField icon={BedDouble}>
          <select
            value={filters.bedrooms}
            onChange={(e) => set("bedrooms", e.target.value)}
            className="field-luxe pl-9 appearance-none"
          >
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </select>
        </IconField>
      </Labelled>

      <Labelled label="Bathrooms">
        <IconField icon={Bath}>
          <select
            value={filters.bathrooms}
            onChange={(e) => set("bathrooms", e.target.value)}
            className="field-luxe pl-9 appearance-none"
          >
            <option value="">Any</option>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </select>
        </IconField>
      </Labelled>

      <Labelled label="Min Size (m²)">
        <IconField icon={Maximize}>
          <input
            type="number"
            min="0"
            value={filters.minSize}
            onChange={(e) => set("minSize", e.target.value)}
            placeholder="Any"
            className="field-luxe pl-9"
          />
        </IconField>
      </Labelled>

      <Labelled label="Status">
        <IconField icon={Tag}>
          <select
            value={filters.status}
            onChange={(e) => set("status", e.target.value)}
            className="field-luxe pl-9 appearance-none"
          >
            <option value="">Any</option>
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </IconField>
      </Labelled>

      <Labelled label="Furnished">
        <IconField icon={Sofa}>
          <select
            value={filters.furnished}
            onChange={(e) => set("furnished", e.target.value)}
            className="field-luxe pl-9 appearance-none"
          >
            <option value="">Any</option>
            <option value="Furnished">Furnished</option>
            <option value="Unfurnished">Unfurnished</option>
          </select>
        </IconField>
      </Labelled>

      <Labelled label="Parking">
        <select
          value={filters.parking}
          onChange={(e) => set("parking", e.target.value)}
          className="field-luxe appearance-none"
        >
          <option value="">Any</option>
          <option value="yes">With Parking</option>
          <option value="no">No Parking</option>
        </select>
      </Labelled>

      {includeSort && (
        <Labelled label="Sort By">
          <select
            value={filters.sort}
            onChange={(e) => set("sort", e.target.value)}
            className="field-luxe appearance-none"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Labelled>
      )}

      <label className="flex items-center gap-3 sm:col-span-2 lg:col-span-3">
        <button
          type="button"
          role="switch"
          aria-checked={filters.featuredOnly}
          onClick={() => set("featuredOnly", !filters.featuredOnly)}
          className={`relative h-6 w-11 rounded-full transition ${
            filters.featuredOnly ? "bg-gold" : "bg-charcoal/15"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
              filters.featuredOnly ? "left-[22px]" : "left-0.5"
            }`}
          />
        </button>
        <span className="text-sm font-medium text-charcoal/70">
          Featured properties only
        </span>
      </label>
    </div>
  );
}
