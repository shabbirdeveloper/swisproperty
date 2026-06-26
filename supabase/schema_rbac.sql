-- ============================================================
-- SwissProperty — Role-based access control (admin vs agent)
-- Run this AFTER schema.sql (and migration_agents_bio.sql).
-- Adds: profiles/roles, agent ownership + approval, auto-signup trigger,
-- and role-scoped row-level security.
-- ============================================================

-- 1) Profiles: one row per auth user, carrying their role -------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'agent' check (role in ('admin', 'agent')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select using (id = auth.uid());

-- 2) Agents: link to a login + approval flag --------------------------
alter table public.agents add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.agents add column if not exists approved boolean default false;

-- Seeded agents (no login) should be visible immediately
update public.agents set approved = true where user_id is null;

-- 3) Helper functions -------------------------------------------------
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.current_agent_id()
returns uuid language sql security definer stable as $$
  select id from public.agents where user_id = auth.uid() limit 1;
$$;

-- 4) Auto-create profile + agent record on signup --------------------
-- Agent metadata (name, designation, phone, whatsapp) is passed at signUp.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  v_role text := coalesce(new.raw_user_meta_data->>'role', 'agent');
begin
  insert into public.profiles (id, role) values (new.id, v_role)
  on conflict (id) do nothing;

  if v_role = 'agent' then
    insert into public.agents (user_id, name, designation, email, phone, whatsapp, approved)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'name', 'New Agent'),
      coalesce(new.raw_user_meta_data->>'designation', 'Property Advisor'),
      new.email,
      new.raw_user_meta_data->>'phone',
      new.raw_user_meta_data->>'whatsapp',
      false
    )
    on conflict (email) do nothing;
  end if;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5) Prevent agents from self-approving or stealing ownership ---------
create or replace function public.guard_agent_update()
returns trigger language plpgsql security definer as $$
begin
  if not public.is_admin() then
    new.approved := old.approved;   -- only admins change approval
    new.user_id  := old.user_id;    -- ownership is fixed
  end if;
  return new;
end $$;

drop trigger if exists agents_guard on public.agents;
create trigger agents_guard before update on public.agents
  for each row execute function public.guard_agent_update();

-- ============================================================
-- 6) Replace catalog RLS with role-aware policies
-- ============================================================

-- AGENTS ----------------------------------------------------
drop policy if exists "public read agents"  on public.agents;
drop policy if exists "admin write agents"  on public.agents;

create policy "read approved or own agents" on public.agents
  for select using (approved = true or user_id = auth.uid() or public.is_admin());

create policy "admin manage agents" on public.agents
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "agent update own record" on public.agents
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- PROPERTIES ------------------------------------------------
drop policy if exists "admin write properties" on public.properties;

create policy "admin manage properties" on public.properties
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "agent insert own property" on public.properties
  for insert to authenticated
  with check (agent_id = public.current_agent_id());

create policy "agent update own property" on public.properties
  for update to authenticated
  using (agent_id = public.current_agent_id())
  with check (agent_id = public.current_agent_id());

create policy "agent delete own property" on public.properties
  for delete to authenticated
  using (agent_id = public.current_agent_id());

-- PROPERTY IMAGES (scoped to the owning property) -----------
drop policy if exists "admin write images" on public.property_images;

create policy "manage own property images" on public.property_images
  for all to authenticated
  using (
    public.is_admin() or exists (
      select 1 from public.properties p
      where p.id = property_images.property_id
        and p.agent_id = public.current_agent_id()
    )
  )
  with check (
    public.is_admin() or exists (
      select 1 from public.properties p
      where p.id = property_images.property_id
        and p.agent_id = public.current_agent_id()
    )
  );

-- NEARBY PLACES (scoped to the owning property) -------------
drop policy if exists "admin write nearby" on public.nearby_places;

create policy "manage own property nearby" on public.nearby_places
  for all to authenticated
  using (
    public.is_admin() or exists (
      select 1 from public.properties p
      where p.id = nearby_places.property_id
        and p.agent_id = public.current_agent_id()
    )
  )
  with check (
    public.is_admin() or exists (
      select 1 from public.properties p
      where p.id = nearby_places.property_id
        and p.agent_id = public.current_agent_id()
    )
  );

-- CONTACT MESSAGES — only admins read (agents cannot) -------
drop policy if exists "admin read contact" on public.contact_messages;
create policy "admin read contact" on public.contact_messages
  for select to authenticated using (public.is_admin());

-- ============================================================
-- 7) Make YOUR existing login an admin (edit the email!)
-- ============================================================
-- insert into public.profiles (id, role)
-- select id, 'admin' from auth.users where email = 'YOUR_ADMIN_EMAIL'
-- on conflict (id) do update set role = 'admin';
