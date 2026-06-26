/**
 * Pure filtering + sorting logic for property listings.
 * Kept framework-agnostic so it can be reused once data comes from Supabase.
 */

export const defaultFilters = {
  keyword: "",
  location: "",
  propertyType: "",
  minPrice: "",
  maxPrice: "",
  bedrooms: "",
  bathrooms: "",
  minSize: "",
  status: "",
  furnished: "",
  parking: "", // "" | "yes" | "no"
  featuredOnly: false,
  sort: "latest",
};

export const sortOptions = [
  { value: "latest", label: "Latest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "size-desc", label: "Biggest Size" },
  { value: "distance-asc", label: "Nearest to City Center" },
];

const hasParking = (parking) =>
  !!parking && !/^(no|none|on-street)/i.test(parking);

export function filterProperties(properties, filters) {
  const f = { ...defaultFilters, ...filters };

  let result = properties.filter((p) => {
    // Keyword — title, location, type, address
    if (f.keyword) {
      const q = f.keyword.toLowerCase();
      const haystack = `${p.title} ${p.location} ${p.address} ${p.propertyType} ${p.shortDescription}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (f.location && p.location !== f.location) return false;
    if (f.propertyType && p.propertyType !== f.propertyType) return false;
    if (f.status && p.status !== f.status) return false;
    if (f.furnished && p.furnished !== f.furnished) return false;

    if (f.minPrice && p.numericPrice < Number(f.minPrice)) return false;
    if (f.maxPrice && p.numericPrice > Number(f.maxPrice)) return false;

    if (f.bedrooms && p.bedrooms < Number(f.bedrooms)) return false;
    if (f.bathrooms && p.bathrooms < Number(f.bathrooms)) return false;
    if (f.minSize && p.numericSize < Number(f.minSize)) return false;

    if (f.parking === "yes" && !hasParking(p.parking)) return false;
    if (f.parking === "no" && hasParking(p.parking)) return false;

    if (f.featuredOnly && !p.featured) return false;

    return true;
  });

  switch (f.sort) {
    case "price-asc":
      result = [...result].sort((a, b) => a.numericPrice - b.numericPrice);
      break;
    case "price-desc":
      result = [...result].sort((a, b) => b.numericPrice - a.numericPrice);
      break;
    case "size-desc":
      result = [...result].sort((a, b) => b.numericSize - a.numericSize);
      break;
    case "distance-asc":
      result = [...result].sort((a, b) => a.numericDistance - b.numericDistance);
      break;
    case "latest":
    default:
      result = [...result].sort((a, b) => b.id - a.id);
      break;
  }

  return result;
}

/**
 * Build a list of active filter "chips" for display.
 * Returns [{ key, label }] where key matches a filter field to clear.
 */
export function getActiveFilterChips(filters) {
  const f = { ...defaultFilters, ...filters };
  const chips = [];
  if (f.keyword) chips.push({ key: "keyword", label: `“${f.keyword}”` });
  if (f.location) chips.push({ key: "location", label: f.location });
  if (f.propertyType) chips.push({ key: "propertyType", label: f.propertyType });
  if (f.status) chips.push({ key: "status", label: f.status });
  if (f.furnished) chips.push({ key: "furnished", label: f.furnished });
  if (f.minPrice) chips.push({ key: "minPrice", label: `Min ${Number(f.minPrice).toLocaleString()}` });
  if (f.maxPrice) chips.push({ key: "maxPrice", label: `Max ${Number(f.maxPrice).toLocaleString()}` });
  if (f.bedrooms) chips.push({ key: "bedrooms", label: `${f.bedrooms}+ Beds` });
  if (f.bathrooms) chips.push({ key: "bathrooms", label: `${f.bathrooms}+ Baths` });
  if (f.minSize) chips.push({ key: "minSize", label: `${f.minSize}+ m²` });
  if (f.parking === "yes") chips.push({ key: "parking", label: "Parking" });
  if (f.parking === "no") chips.push({ key: "parking", label: "No Parking" });
  if (f.featuredOnly) chips.push({ key: "featuredOnly", label: "Featured" });
  return chips;
}

export function countActiveFilters(filters) {
  return getActiveFilterChips(filters).length;
}
