import { supabase, isSupabaseConfigured } from "../lib/supabase.js";

/**
 * Saved / favorite properties.
 *
 * Public visitors don't log in, so favorites are keyed by an anonymous client
 * id kept in localStorage. With Supabase configured they persist in the
 * saved_properties table; otherwise they persist in localStorage only.
 */

const CLIENT_KEY = "sp_client_id";
const LOCAL_SAVED_KEY = "sp_saved";

function getClientId() {
  let id = localStorage.getItem(CLIENT_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `c_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(CLIENT_KEY, id);
  }
  return id;
}

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_SAVED_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeLocal(ids) {
  localStorage.setItem(LOCAL_SAVED_KEY, JSON.stringify(ids));
}

export async function getSavedIds() {
  if (!isSupabaseConfigured) return readLocal();
  const { data, error } = await supabase
    .from("saved_properties")
    .select("property_id")
    .eq("client_id", getClientId());
  if (error) throw error;
  return (data || []).map((r) => r.property_id);
}

export async function addSaved(propertyId) {
  if (!isSupabaseConfigured) {
    const ids = readLocal();
    if (!ids.includes(propertyId)) writeLocal([...ids, propertyId]);
    return;
  }
  await supabase
    .from("saved_properties")
    .upsert(
      { client_id: getClientId(), property_id: propertyId },
      { onConflict: "client_id,property_id" }
    );
}

export async function removeSaved(propertyId) {
  if (!isSupabaseConfigured) {
    writeLocal(readLocal().filter((x) => x !== propertyId));
    return;
  }
  await supabase
    .from("saved_properties")
    .delete()
    .eq("client_id", getClientId())
    .eq("property_id", propertyId);
}
