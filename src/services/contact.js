import { supabase, isSupabaseConfigured } from "../lib/supabase.js";

/**
 * Store a contact / enquiry submission.
 * When Supabase isn't configured this resolves successfully as a no-op so the
 * contact form still gives feedback during the frontend-only phase.
 */
export async function submitContactMessage({
  name,
  email,
  phone,
  message,
  propertyId = null,
}) {
  if (!isSupabaseConfigured) {
    return { ok: true, stored: false };
  }
  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    phone,
    message,
    property_id: propertyId,
  });
  if (error) throw error;
  return { ok: true, stored: true };
}

/** Admin: read all enquiries (requires authenticated session). */
export async function getContactMessages() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}
