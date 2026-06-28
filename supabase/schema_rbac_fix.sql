-- ============================================================
-- SwissProperty — RBAC fix + backfill
-- Run AFTER schema_rbac.sql. Safe to run multiple times.
-- Lets a newly signed-up user create their own profile + agent record,
-- and backfills records for any agents that got stuck without one.
-- ============================================================

-- 1) Allow self-creation on signup ---------------------------
drop policy if exists "insert own profile" on public.profiles;
create policy "insert own profile" on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

drop policy if exists "agent insert own record" on public.agents;
create policy "agent insert own record" on public.agents
  for insert to authenticated
  with check (user_id = auth.uid() and coalesce(approved, false) = false);

-- 2) Backfill missing profiles (default role 'agent') --------
insert into public.profiles (id, role)
select u.id, 'agent'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- 3) Backfill missing agent records for agent-role users -----
insert into public.agents (user_id, name, email, designation, approved)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  u.email,
  coalesce(u.raw_user_meta_data->>'designation', 'Property Advisor'),
  false
from auth.users u
join public.profiles p on p.id = u.id and p.role = 'agent'
left join public.agents a on a.user_id = u.id
where a.user_id is null
on conflict (email) do update set user_id = excluded.user_id;
