-- ============================================================
-- SwissProperty — Property buy/sell/booking requests
-- Run AFTER schema.sql and schema_rbac.sql.
-- A client submits a request on a property; it routes to that property's agent.
-- ============================================================

create table if not exists public.property_requests (
  id                uuid primary key default gen_random_uuid(),
  property_id       uuid references public.properties(id) on delete cascade,
  agent_id          uuid references public.agents(id) on delete set null,
  property_title    text,            -- snapshot, so it survives property edits
  property_location text,
  customer_name     text not null,
  customer_email    text,
  customer_phone    text,
  request_type      text not null default 'Buy'
                      check (request_type in ('Buy', 'Sell', 'Booking')),
  message           text,
  status            text not null default 'Pending'
                      check (status in ('Pending', 'Accepted', 'Rejected', 'Completed')),
  created_at        timestamptz default now()
);

create index if not exists property_requests_agent_idx on public.property_requests (agent_id);
create index if not exists property_requests_status_idx on public.property_requests (status);

alter table public.property_requests enable row level security;

-- Anyone (a public client) can submit a request
drop policy if exists "public submit request" on public.property_requests;
create policy "public submit request" on public.property_requests
  for insert with check (true);

-- Agents see only requests for their own properties; admins see all
drop policy if exists "read own or admin requests" on public.property_requests;
create policy "read own or admin requests" on public.property_requests
  for select to authenticated
  using (public.is_admin() or agent_id = public.current_agent_id());

-- Agents update status on their own requests; admins on all
drop policy if exists "update own or admin requests" on public.property_requests;
create policy "update own or admin requests" on public.property_requests
  for update to authenticated
  using (public.is_admin() or agent_id = public.current_agent_id())
  with check (public.is_admin() or agent_id = public.current_agent_id());

-- ============================================================
-- Wishlist note:
-- The existing `saved_properties` table already serves as the wishlist
-- (client_id + property_id, created in schema.sql). No new table needed.
-- ============================================================
