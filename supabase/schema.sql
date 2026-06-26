-- ============================================================
-- SwissProperty — Supabase schema
-- Run this in the Supabase SQL Editor (one-time).
-- Creates tables, row-level security, and the image storage bucket.
-- ============================================================

-- Extensions ------------------------------------------------
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------
-- AGENTS
-- ----------------------------------------------------------------
create table if not exists public.agents (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  designation text,
  phone       text,
  whatsapp    text,
  email       text unique,
  rating      numeric(2,1) default 5.0,
  reviews     int default 0,
  avatar      text,
  created_at  timestamptz default now()
);

-- ----------------------------------------------------------------
-- PROPERTIES
-- ----------------------------------------------------------------
create table if not exists public.properties (
  id                        uuid primary key default gen_random_uuid(),
  slug                      text unique not null,
  title                     text not null,
  location                  text,
  address                   text,
  price                     text,            -- display string e.g. "CHF 2,450,000"
  numeric_price             bigint default 0,
  property_type             text,
  status                    text,            -- "For Sale" | "For Rent"
  availability              text,
  short_description         text,
  full_description          text,
  bedrooms                  int default 0,
  bathrooms                 int default 0,
  size                      text,            -- display string e.g. "142 m²"
  numeric_size              int default 0,
  distance_from_city_center text,
  numeric_distance          numeric default 0,
  parking                   text,
  furnished                 text,
  featured                  boolean default false,
  year_built                int,
  floor                     int,
  total_floors              int,
  heating                   text,
  map_image                 text,            -- uploaded location map (optional)
  amenities                 text[] default '{}',
  highlights                text[] default '{}',
  agent_id                  uuid references public.agents(id) on delete set null,
  created_at                timestamptz default now(),
  updated_at                timestamptz default now()
);

create index if not exists properties_slug_idx on public.properties (slug);
create index if not exists properties_featured_idx on public.properties (featured);

-- ----------------------------------------------------------------
-- PROPERTY IMAGES (gallery) — each row is one photo + room label
-- ----------------------------------------------------------------
create table if not exists public.property_images (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  url         text not null,
  label       text,             -- e.g. "Living Room", "Washroom"
  sort_order  int default 0,
  created_at  timestamptz default now()
);

create index if not exists property_images_property_idx on public.property_images (property_id);

-- ----------------------------------------------------------------
-- NEARBY PLACES
-- ----------------------------------------------------------------
create table if not exists public.nearby_places (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  type        text,             -- "City Center", "School", ...
  name        text,
  distance    text,
  sort_order  int default 0
);

create index if not exists nearby_places_property_idx on public.nearby_places (property_id);

-- ----------------------------------------------------------------
-- CONTACT MESSAGES (from the contact form / enquiries)
-- ----------------------------------------------------------------
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  message     text,
  property_id uuid references public.properties(id) on delete set null,
  created_at  timestamptz default now()
);

-- ----------------------------------------------------------------
-- SAVED PROPERTIES (favorites) — keyed by an anonymous client id
-- (lets public visitors save without logging in)
-- ----------------------------------------------------------------
create table if not exists public.saved_properties (
  id          uuid primary key default gen_random_uuid(),
  client_id   text not null,
  property_id uuid references public.properties(id) on delete cascade,
  created_at  timestamptz default now(),
  unique (client_id, property_id)
);

create index if not exists saved_client_idx on public.saved_properties (client_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- Public can READ catalog data + INSERT contact/saved.
-- Only authenticated (admin) users can WRITE catalog data.
-- ============================================================
alter table public.agents           enable row level security;
alter table public.properties       enable row level security;
alter table public.property_images  enable row level security;
alter table public.nearby_places    enable row level security;
alter table public.contact_messages enable row level security;
alter table public.saved_properties enable row level security;

-- Public read for catalog tables
create policy "public read agents"        on public.agents          for select using (true);
create policy "public read properties"    on public.properties      for select using (true);
create policy "public read images"        on public.property_images for select using (true);
create policy "public read nearby"        on public.nearby_places   for select using (true);

-- Authenticated (admin) full write for catalog tables
create policy "admin write agents"        on public.agents          for all to authenticated using (true) with check (true);
create policy "admin write properties"    on public.properties      for all to authenticated using (true) with check (true);
create policy "admin write images"        on public.property_images for all to authenticated using (true) with check (true);
create policy "admin write nearby"        on public.nearby_places   for all to authenticated using (true) with check (true);

-- Contact: anyone can submit; only admin can read
create policy "public insert contact"     on public.contact_messages for insert with check (true);
create policy "admin read contact"        on public.contact_messages for select to authenticated using (true);

-- Saved: open to everyone (low-risk, keyed by client_id)
create policy "anyone manage saved"       on public.saved_properties for all using (true) with check (true);

-- ============================================================
-- STORAGE — public bucket for property + map images
-- ============================================================
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

create policy "public read property images"
  on storage.objects for select
  using (bucket_id = 'property-images');

create policy "admin upload property images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'property-images');

create policy "admin update property images"
  on storage.objects for update to authenticated
  using (bucket_id = 'property-images');

create policy "admin delete property images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'property-images');

-- keep updated_at fresh on properties
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists properties_touch on public.properties;
create trigger properties_touch before update on public.properties
  for each row execute function public.touch_updated_at();
