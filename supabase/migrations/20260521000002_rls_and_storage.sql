-- ============================================================
-- CBA Website — RLS Policies + Storage Buckets
-- Run via Supabase Dashboard > SQL Editor after migration 000001
-- ============================================================

-- ── Enable RLS on all 6 tables ─────────────────────────────
alter table beats          enable row level security;
alter table events         enable row level security;
alter table orders_beat    enable row level security;
alter table orders_ticket  enable row level security;
alter table tickets        enable row level security;
alter table bookings       enable row level security;

-- ── Table RLS policies ─────────────────────────────────────

-- beats: anon and authenticated users can read published rows only
create policy "Public can read published beats"
  on beats for select
  to anon, authenticated
  using (published = true);

-- events: anon and authenticated users can read published rows only
create policy "Public can read published events"
  on events for select
  to anon, authenticated
  using (published = true);

-- orders_beat, orders_ticket, tickets, bookings:
-- No policies for anon — default-deny means anon gets empty array.
-- Service role bypasses RLS entirely; these tables are admin-only.
-- (No INSERT/UPDATE/DELETE policies for anon on any table.)

-- ── Storage buckets ─────────────────────────────────────────
-- preview-audio: public bucket — getPublicUrl() works without auth
insert into storage.buckets (id, name, public)
  values ('preview-audio', 'preview-audio', true)
  on conflict (id) do nothing;

-- full-audio: private bucket — createSignedUrl() required for each access
insert into storage.buckets (id, name, public)
  values ('full-audio', 'full-audio', false)
  on conflict (id) do nothing;

-- artwork: public bucket — getPublicUrl() works without auth
insert into storage.buckets (id, name, public)
  values ('artwork', 'artwork', true)
  on conflict (id) do nothing;

-- ── Storage RLS policies ────────────────────────────────────
-- Public buckets still need SELECT policies for anon to read via URL

create policy "Public preview audio read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'preview-audio');

create policy "Public artwork read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'artwork');

-- full-audio: no anon read policy — signed URLs are issued server-side
-- after purchase verification; service role handles all writes.

-- Authenticated users (future admin uploads via Phase 6) can upload to all buckets
create policy "Authenticated users can upload preview audio"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'preview-audio');

create policy "Authenticated users can upload full audio"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'full-audio');

create policy "Authenticated users can upload artwork"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'artwork');
