import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import {
  sampleProperties,
  getAllAgents as sampleAgents,
} from "../data/sampleProperties.js";

/**
 * Property data access.
 *
 * Reads come back in the SAME shape the UI already expects (camelCase, nested
 * agent, gallery as { url, label }, nearbyPlaces, etc.) so no component needs
 * to change. When Supabase isn't configured, everything falls back to the
 * local sample data.
 */

const SELECT = `
  *,
  agent:agents(*),
  images:property_images(*),
  nearby:nearby_places(*)
`;

function normalize(row) {
  const images = [...(row.images || [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );
  const nearby = [...(row.nearby || [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );
  const a = row.agent || {};

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    location: row.location,
    address: row.address,
    price: row.price,
    numericPrice: row.numeric_price,
    propertyType: row.property_type,
    status: row.status,
    availability: row.availability,
    shortDescription: row.short_description,
    fullDescription: row.full_description,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    size: row.size,
    numericSize: row.numeric_size,
    distanceFromCityCenter: row.distance_from_city_center,
    numericDistance: row.numeric_distance,
    parking: row.parking,
    furnished: row.furnished,
    featured: row.featured,
    yearBuilt: row.year_built,
    floor: row.floor,
    totalFloors: row.total_floors,
    heating: row.heating,
    agentId: row.agent_id || null,
    mapImage: row.map_image || "",
    amenities: row.amenities || [],
    highlights: row.highlights || [],
    gallery: images.map((i) => ({ url: i.url, label: i.label || "" })),
    nearbyPlaces: nearby.map((n) => ({
      type: n.type,
      name: n.name,
      distance: n.distance,
    })),
    agentUserId: a.user_id || null,
    agent: {
      name: a.name || "SwissProperty Advisor",
      designation: a.designation || "Property Advisor",
      phone: a.phone || "+41 44 123 45 67",
      whatsapp: a.whatsapp || "+41791234567",
      email: a.email || "hello@swissproperty.ch",
      rating: a.rating ?? 5.0,
      reviews: a.reviews ?? 0,
      avatar: a.avatar || "",
    },
  };
}

/** Convert a UI/admin input object into the DB column shape. */
function toRow(input) {
  return {
    slug: input.slug,
    title: input.title,
    location: input.location,
    address: input.address,
    price: input.price,
    numeric_price: Number(input.numericPrice) || 0,
    property_type: input.propertyType,
    status: input.status,
    availability: input.availability,
    short_description: input.shortDescription,
    full_description: input.fullDescription,
    bedrooms: Number(input.bedrooms) || 0,
    bathrooms: Number(input.bathrooms) || 0,
    size: input.size,
    numeric_size: Number(input.numericSize) || 0,
    distance_from_city_center: input.distanceFromCityCenter,
    numeric_distance: Number(input.numericDistance) || 0,
    parking: input.parking,
    furnished: input.furnished,
    featured: !!input.featured,
    year_built: input.yearBuilt ? Number(input.yearBuilt) : null,
    floor: input.floor === "" || input.floor == null ? null : Number(input.floor),
    total_floors: input.totalFloors ? Number(input.totalFloors) : null,
    heating: input.heating,
    map_image: input.mapImage || null,
    amenities: input.amenities || [],
    highlights: input.highlights || [],
    agent_id: input.agentId || null,
  };
}

// ---------------- READS ----------------

export async function getAllProperties() {
  if (!isSupabaseConfigured) return sampleProperties;
  const { data, error } = await supabase
    .from("properties")
    .select(SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(normalize);
}

export async function getPropertyBySlug(slug) {
  if (!isSupabaseConfigured) {
    return sampleProperties.find((p) => p.slug === slug) || null;
  }
  const { data, error } = await supabase
    .from("properties")
    .select(SELECT)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? normalize(data) : null;
}

export async function getFeaturedProperties(limit = 6) {
  const all = await getAllProperties();
  return all.filter((p) => p.featured).slice(0, limit);
}

/** Listings belonging to one agent (by agent id). */
export async function getMyProperties(agentId) {
  if (!agentId) return [];
  const all = await getAllProperties();
  return all.filter((p) => p.agentId === agentId);
}

// ---------------- WRITES (admin) ----------------

async function replaceChildren(propertyId, gallery = [], nearbyPlaces = []) {
  await supabase.from("property_images").delete().eq("property_id", propertyId);
  await supabase.from("nearby_places").delete().eq("property_id", propertyId);

  const images = gallery
    .filter((g) => (typeof g === "string" ? g : g.url))
    .map((g, i) => ({
      property_id: propertyId,
      url: typeof g === "string" ? g : g.url,
      label: typeof g === "string" ? null : g.label || null,
      sort_order: i,
    }));
  if (images.length) await supabase.from("property_images").insert(images);

  const places = (nearbyPlaces || [])
    .filter((n) => n.name)
    .map((n, i) => ({
      property_id: propertyId,
      type: n.type,
      name: n.name,
      distance: n.distance,
      sort_order: i,
    }));
  if (places.length) await supabase.from("nearby_places").insert(places);
}

export async function createProperty(input) {
  const { data, error } = await supabase
    .from("properties")
    .insert(toRow(input))
    .select()
    .single();
  if (error) throw error;
  await replaceChildren(data.id, input.gallery, input.nearbyPlaces);
  return data.id;
}

export async function updateProperty(id, input) {
  const { error } = await supabase
    .from("properties")
    .update(toRow(input))
    .eq("id", id);
  if (error) throw error;
  await replaceChildren(id, input.gallery, input.nearbyPlaces);
  return id;
}

export async function deleteProperty(id) {
  const { error } = await supabase.from("properties").delete().eq("id", id);
  if (error) throw error;
}

/** Upload a file to the property-images bucket and return its public URL. */
export async function uploadImage(file) {
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");
  const ext = file.name.split(".").pop();
  const path = `properties/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("property-images")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("property-images").getPublicUrl(path);
  return data.publicUrl;
}

// Re-export sample agents shape for fallback consumers.
export { sampleAgents };
