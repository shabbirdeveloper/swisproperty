-- ============================================================
-- SwissProperty — Customer accounts + Messaging
-- Run AFTER schema_rbac.sql and schema_rbac_fix.sql. Safe to re-run.
-- Adds the 'customer' role, profile display fields, and a messages table
-- for client<->agent and agent<->admin chat (text + image + call rooms).
-- ============================================================

-- 1) Allow the 'customer' role + add display fields ----------
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('admin', 'agent', 'customer'));

alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists avatar text;

-- Any authenticated user can read basic profile info (names/avatars for chat)
drop policy if exists "authenticated read profiles" on public.profiles;
create policy "authenticated read profiles" on public.profiles
  for select to authenticated using (true);

-- Users can update their own profile (name/avatar)
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- 2) Messages ------------------------------------------------
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  sender_id   uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  body        text,
  image_url   text,
  property_id uuid references public.properties(id) on delete set null,
  read_at     timestamptz,
  created_at  timestamptz default now()
);

create index if not exists messages_pair_idx on public.messages (sender_id, receiver_id);
create index if not exists messages_receiver_idx on public.messages (receiver_id);

alter table public.messages enable row level security;

-- You can read messages you sent or received
drop policy if exists "read own messages" on public.messages;
create policy "read own messages" on public.messages
  for select to authenticated
  using (sender_id = auth.uid() or receiver_id = auth.uid());

-- You can send messages as yourself
drop policy if exists "send messages" on public.messages;
create policy "send messages" on public.messages
  for insert to authenticated
  with check (sender_id = auth.uid());

-- You can mark messages addressed to you as read
drop policy if exists "update received messages" on public.messages;
create policy "update received messages" on public.messages
  for update to authenticated
  using (receiver_id = auth.uid()) with check (receiver_id = auth.uid());

-- 3) Chat images reuse the public 'property-images' bucket
--    (uploaded under a chat/ prefix). Storage policies already allow
--    authenticated upload + public read from schema.sql.

-- 4) Helper: list the admin user ids (for agent -> admin chat)
create or replace function public.admin_user_ids()
returns setof uuid language sql security definer stable as $$
  select id from public.profiles where role = 'admin';
$$;

-- 5) Backfill display names/avatars for existing agent profiles
update public.profiles p
set full_name = a.name, avatar = coalesce(p.avatar, a.avatar)
from public.agents a
where a.user_id = p.id and (p.full_name is null or p.full_name = '');
