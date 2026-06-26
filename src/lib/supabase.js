import { createClient } from "@supabase/supabase-js";

/**
 * Single Supabase client for the app.
 *
 * If env vars are missing, `supabase` is null and `isSupabaseConfigured` is
 * false — the service layer then falls back to local sample data, so the app
 * keeps working without a backend. Fill in .env to switch to the live database.
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey)
  : null;
