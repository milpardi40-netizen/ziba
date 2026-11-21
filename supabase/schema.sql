-- ════════════════════════════════════════════════════════════════════
-- Vernajewel — real backend schema (Supabase / Postgres, free tier)
-- Run this once in: Supabase Dashboard → SQL Editor → New query → Run
-- ════════════════════════════════════════════════════════════════════

-- 1) Published site content: one row, the whole CMS config as JSON.
create table if not exists public.site_config (
  id         text primary key,
  config     jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Seed the row (the app merges it over its built-in defaults, and the
-- owner’s first signed-in save replaces it with the full config).
insert into public.site_config (id, config)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;

-- 2) Buyer inquiries from the site’s forms.
create table if not exists public.inquiries (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  name             text not null,
  contact          text not null,
  message          text not null default '',
  specimen_id      text,
  specimen_name    text,
  specimen_catalog text,
  status           text not null default 'new' check (status in ('new', 'replied'))
);

-- 3) Row Level Security — the heart of the security model.
alter table public.site_config enable row level security;
alter table public.inquiries    enable row level security;

-- Site config: the whole world may READ the published content…
drop policy if exists "Public read site config" on public.site_config;
create policy "Public read site config"
  on public.site_config for select
  using (true);

-- …but only the signed-in owner may write it.
drop policy if exists "Owner write site config" on public.site_config;
create policy "Owner write site config"
  on public.site_config for insert
  to authenticated
  with check (true);

drop policy if exists "Owner update site config" on public.site_config;
create policy "Owner update site config"
  on public.site_config for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Owner delete site config" on public.site_config;
create policy "Owner delete site config"
  on public.site_config for delete
  to authenticated
  using (true);

-- Inquiries: any visitor may SUBMIT…
drop policy if exists "Public submit inquiry" on public.inquiries;
create policy "Public submit inquiry"
  on public.inquiries for insert
  with check (true);

-- …but only the signed-in owner may read / manage them.
drop policy if exists "Owner read inquiries" on public.inquiries;
create policy "Owner read inquiries"
  on public.inquiries for select
  to authenticated
  using (true);

drop policy if exists "Owner update inquiries" on public.inquiries;
create policy "Owner update inquiries"
  on public.inquiries for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Owner delete inquiries" on public.inquiries;
create policy "Owner delete inquiries"
  on public.inquiries for delete
  to authenticated
  using (true);

-- 4) Realtime: visitors receive the owner’s edits live.
-- (If this line errors because the table is already in the
-- publication, simply ignore that error.)
alter publication supabase_realtime add table public.site_config;
