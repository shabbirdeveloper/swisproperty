-- ============================================================
-- SwissProperty — remove the seeded DEMO data
-- Run in the Supabase SQL Editor when you want only your real listings to show.
-- Deletes the 6 demo properties (their images / nearby places / requests
-- cascade automatically) and the 4 demo agents. Your own data is untouched.
-- ============================================================

delete from public.properties
where slug in (
  'luxury-apartment-near-city-center-zurich',
  'modern-family-villa-geneva',
  'lake-view-apartment-lugano',
  'swiss-alps-chalet-zermatt',
  'downtown-studio-apartment-basel',
  'premium-penthouse-lausanne'
);

delete from public.agents
where email in (
  'elena.vogel@swissproperty.ch',
  'marco.bianchi@swissproperty.ch',
  'sophie.keller@swissproperty.ch',
  'lukas.meier@swissproperty.ch'
)
and user_id is null;   -- only the seeded agents (real agents have a login)
