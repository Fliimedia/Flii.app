-- ============================================================
-- Flii.app CMS — Supabase schema
-- Run this once in Supabase → SQL Editor → New query → Run.
-- ============================================================

create table if not exists reviews (
  id         text primary key,
  quote      text,
  name       text,
  role       text,
  org        text,
  rating     int  default 5,
  created_at timestamptz default now()
);

create table if not exists certs (
  id         text primary key,
  name       text,
  tier       text,
  blurb      text,
  href       text,
  created_at timestamptz default now()
);

create table if not exists apps (
  id         text primary key,
  title      text,
  client     text,
  tag        text,
  summary    text,
  body       text,
  link       text,
  metrics    jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists articles (
  id         text primary key,
  title      text,
  cat        text,
  "date"     text,
  excerpt    text,
  body       text,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- Public READ for the website, plus anon WRITE so the built-in
-- CMS works straight from the browser with only the anon key.
--
-- This means anyone with the anon key can edit content. That is
-- fine while it's just you. To harden for production, drop the
-- "anon write" policies below and either (a) require an
-- authenticated user, or (b) move writes to a Vercel serverless
-- route that uses the service_role key. (See README.)
-- ============================================================

do $$
declare t text;
begin
  foreach t in array array['reviews','certs','apps','articles'] loop
    execute format('alter table %I enable row level security;', t);

    execute format('drop policy if exists "public read %1$s" on %1$I;', t);
    execute format('create policy "public read %1$s" on %1$I for select using (true);', t);

    -- anon write (remove these three for a read-only public DB)
    execute format('drop policy if exists "anon insert %1$s" on %1$I;', t);
    execute format('create policy "anon insert %1$s" on %1$I for insert with check (true);', t);
    execute format('drop policy if exists "anon update %1$s" on %1$I;', t);
    execute format('create policy "anon update %1$s" on %1$I for update using (true) with check (true);', t);
    execute format('drop policy if exists "anon delete %1$s" on %1$I;', t);
    execute format('create policy "anon delete %1$s" on %1$I for delete using (true);', t);
  end loop;
end $$;

-- Tables start empty. On first load the app auto-seeds them with
-- the built-in defaults, or use the CMS "Reset to defaults" button.
