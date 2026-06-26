import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import { getAllAgents as sampleAgents } from "../data/sampleProperties.js";

export const slugifyName = (name = "") =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function normalize(row) {
  return {
    id: row.id,
    name: row.name,
    slug: slugifyName(row.name),
    designation: row.designation,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    rating: row.rating ?? 5.0,
    reviews: row.reviews ?? 0,
    avatar: row.avatar,
    bio: row.bio || "",
    approved: row.approved ?? true,
    userId: row.user_id || null,
  };
}

export async function getAgents() {
  if (!isSupabaseConfigured) {
    return sampleAgents().map((a) => ({ ...a, slug: slugifyName(a.name) }));
  }
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data || []).map(normalize);
}

export async function getAgentBySlug(slug) {
  const agents = await getAgents();
  return agents.find((a) => a.slug === slug) || null;
}

export async function getAgentById(id) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? normalize(data) : null;
}

function toRow(input) {
  return {
    name: input.name,
    designation: input.designation,
    phone: input.phone,
    whatsapp: input.whatsapp,
    email: input.email,
    rating: input.rating === "" || input.rating == null ? 5.0 : Number(input.rating),
    reviews: Number(input.reviews) || 0,
    avatar: input.avatar || null,
    bio: input.bio || null,
  };
}

export async function createAgent(input) {
  const { data, error } = await supabase
    .from("agents")
    .insert(toRow(input))
    .select()
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateAgent(id, input) {
  const { error } = await supabase.from("agents").update(toRow(input)).eq("id", id);
  if (error) throw error;
  return id;
}

export async function deleteAgent(id) {
  const { error } = await supabase.from("agents").delete().eq("id", id);
  if (error) throw error;
}

// ---- Agent self-service & admin approval ----

export async function getMyAgent(userId) {
  if (!isSupabaseConfigured || !userId) return null;
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ? normalize(data) : null;
}

export async function updateMyAgent(userId, input) {
  const { error } = await supabase
    .from("agents")
    .update({
      name: input.name,
      designation: input.designation,
      phone: input.phone,
      whatsapp: input.whatsapp,
      avatar: input.avatar || null,
      bio: input.bio || null,
    })
    .eq("user_id", userId);
  if (error) throw error;
}

export async function getPendingAgents() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("approved", false)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(normalize);
}

export async function setAgentApproval(id, approved) {
  const { error } = await supabase
    .from("agents")
    .update({ approved })
    .eq("id", id);
  if (error) throw error;
}
