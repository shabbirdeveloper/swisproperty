import { supabase, isSupabaseConfigured } from "../lib/supabase.js";

/**
 * Direct messaging between users (client<->agent, agent<->admin).
 * A "conversation" is the set of messages between the current user and one
 * other user. Names/avatars are resolved from the profiles table.
 */

async function myId() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id || null;
}

export async function resolveProfiles(ids = []) {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return {};
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, avatar, role")
    .in("id", unique);
  const map = {};
  (data || []).forEach((p) => {
    map[p.id] = {
      name: p.full_name || (p.role === "admin" ? "Admin" : "User"),
      avatar: p.avatar || "",
      role: p.role,
    };
  });
  return map;
}

export async function getThread(otherId) {
  if (!isSupabaseConfigured) return [];
  const me = await myId();
  if (!me) return [];
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${me},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${me})`
    )
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map((m) => ({ ...m, mine: m.sender_id === me }));
}

export async function sendMessage({ receiverId, body, imageUrl, propertyId }) {
  if (!isSupabaseConfigured) throw new Error("Messaging needs Supabase.");
  const me = await myId();
  const { data, error } = await supabase
    .from("messages")
    .insert({
      sender_id: me,
      receiver_id: receiverId,
      body: body || null,
      image_url: imageUrl || null,
      property_id: propertyId || null,
    })
    .select()
    .single();
  if (error) throw error;
  return { ...data, mine: true };
}

export async function getConversations() {
  if (!isSupabaseConfigured) return [];
  const me = await myId();
  if (!me) return [];
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${me},receiver_id.eq.${me}`)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const byOther = new Map();
  for (const m of data || []) {
    const other = m.sender_id === me ? m.receiver_id : m.sender_id;
    if (!byOther.has(other)) {
      byOther.set(other, {
        otherId: other,
        lastMessage: m.image_url ? "📷 Photo" : m.body,
        lastAt: m.created_at,
        unread: 0,
      });
    }
    if (m.receiver_id === me && !m.read_at) {
      byOther.get(other).unread += 1;
    }
  }
  const list = [...byOther.values()];
  const profiles = await resolveProfiles(list.map((c) => c.otherId));
  return list.map((c) => ({
    ...c,
    name: profiles[c.otherId]?.name || "User",
    avatar: profiles[c.otherId]?.avatar || "",
    role: profiles[c.otherId]?.role,
  }));
}

export async function markThreadRead(otherId) {
  if (!isSupabaseConfigured) return;
  const me = await myId();
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("receiver_id", me)
    .eq("sender_id", otherId)
    .is("read_at", null);
}

export async function unreadCount() {
  if (!isSupabaseConfigured) return 0;
  const me = await myId();
  if (!me) return 0;
  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("receiver_id", me)
    .is("read_at", null);
  return count || 0;
}

export async function uploadChatImage(file) {
  if (!isSupabaseConfigured) throw new Error("Needs Supabase.");
  const ext = file.name.split(".").pop();
  const path = `chat/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("property-images")
    .upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("property-images").getPublicUrl(path);
  return data.publicUrl;
}

/** First admin's user id, for agent -> admin messaging. */
export async function getAdminId() {
  if (!isSupabaseConfigured) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .limit(1)
    .maybeSingle();
  return data?.id || null;
}

/** Deterministic Jitsi room name shared by both participants. */
export function callRoomFor(a, b) {
  const [x, y] = [a, b].sort();
  return `swissproperty-${x}-${y}`.replace(/[^a-zA-Z0-9-]/g, "");
}
