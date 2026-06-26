/**
 * SwissProperty — one-time database seed.
 *
 * Loads the local sample data and inserts it into Supabase so you start with
 * a populated catalog. Run AFTER applying schema.sql.
 *
 * Usage (PowerShell / CMD):
 *   set SUPABASE_URL=https://xxxx.supabase.co
 *   set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...        (Settings → API → service_role)
 *   node supabase/seed.mjs
 *
 * The service_role key bypasses RLS — keep it secret, never put it in frontend code.
 */
import { createClient } from "@supabase/supabase-js";
import { sampleProperties, getAllAgents } from "../src/data/sampleProperties.js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
  );
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

async function run() {
  // 1) Agents — upsert by email, keep an email -> id map
  const agents = getAllAgents();
  const agentIdByEmail = {};

  for (const a of agents) {
    const { data, error } = await db
      .from("agents")
      .upsert(
        {
          name: a.name,
          designation: a.designation,
          phone: a.phone,
          whatsapp: a.whatsapp,
          email: a.email,
          rating: a.rating,
          reviews: a.reviews,
          avatar: a.avatar,
        },
        { onConflict: "email" }
      )
      .select()
      .single();
    if (error) throw error;
    agentIdByEmail[a.email] = data.id;
  }
  console.log(`Seeded ${agents.length} agents.`);

  // 2) Properties (+ images + nearby places)
  for (const p of sampleProperties) {
    const { data: prop, error: pErr } = await db
      .from("properties")
      .upsert(
        {
          slug: p.slug,
          title: p.title,
          location: p.location,
          address: p.address,
          price: p.price,
          numeric_price: p.numericPrice,
          property_type: p.propertyType,
          status: p.status,
          availability: p.availability,
          short_description: p.shortDescription,
          full_description: p.fullDescription,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          size: p.size,
          numeric_size: p.numericSize,
          distance_from_city_center: p.distanceFromCityCenter,
          numeric_distance: p.numericDistance,
          parking: p.parking,
          furnished: p.furnished,
          featured: p.featured,
          year_built: p.yearBuilt,
          floor: p.floor,
          total_floors: p.totalFloors,
          heating: p.heating,
          map_image: p.mapImage || null,
          amenities: p.amenities || [],
          highlights: p.highlights || [],
          agent_id: agentIdByEmail[p.agent?.email] || null,
        },
        { onConflict: "slug" }
      )
      .select()
      .single();
    if (pErr) throw pErr;

    // Replace child rows for idempotent re-seeding
    await db.from("property_images").delete().eq("property_id", prop.id);
    await db.from("nearby_places").delete().eq("property_id", prop.id);

    const images = (p.gallery || []).map((g, i) => ({
      property_id: prop.id,
      url: typeof g === "string" ? g : g.url,
      label: typeof g === "string" ? null : g.label,
      sort_order: i,
    }));
    if (images.length) {
      const { error } = await db.from("property_images").insert(images);
      if (error) throw error;
    }

    const places = (p.nearbyPlaces || []).map((n, i) => ({
      property_id: prop.id,
      type: n.type,
      name: n.name,
      distance: n.distance,
      sort_order: i,
    }));
    if (places.length) {
      const { error } = await db.from("nearby_places").insert(places);
      if (error) throw error;
    }

    console.log(`Seeded property: ${p.title}`);
  }

  console.log("\n✅ Seed complete.");
}

run().catch((e) => {
  console.error("Seed failed:", e.message || e);
  process.exit(1);
});
