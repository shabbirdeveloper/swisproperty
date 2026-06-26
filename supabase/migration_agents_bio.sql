-- Adds an optional bio column to agents (for the agent profile page).
-- Run once in the Supabase SQL Editor. Safe to run multiple times.
alter table public.agents add column if not exists bio text;
