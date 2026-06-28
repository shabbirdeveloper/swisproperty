import { supabase, isSupabaseConfigured } from "../lib/supabase.js";

/**
 * Property buy / sell / booking requests.
 * A client submits against a property; it routes to that property's agent.
 */

function normalize(row) {
  return {
    id: row.id,
    propertyId: row.property_id,
    agentId: row.agent_id,
    propertyTitle: row.property_title,
    propertyLocation: row.property_location,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    requestType: row.request_type,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function submitPropertyRequest({
  property,
  customerName,
  customerEmail,
  customerPhone,
  requestType,
  message,
}) {
  if (!isSupabaseConfigured) {
    // Frontend-only fallback: pretend success so the UI flow still works.
    return { ok: true, stored: false };
  }
  const { error } = await supabase.from("property_requests").insert({
    property_id: property.id,
    agent_id: property.agentId || null,
    property_title: property.title,
    property_location: property.location,
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone,
    request_type: requestType,
    message,
  });
  if (error) throw error;
  return { ok: true, stored: true };
}

/** Agent: requests for my properties. */
export async function getMyRequests() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("property_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(normalize);
}

/** Admin: all requests (RLS lets admins read everything). */
export const getAllRequests = getMyRequests;

export async function updateRequestStatus(id, status) {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase
    .from("property_requests")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}
