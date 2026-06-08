-- ============================================================
-- CBA Website — Initial Schema Migration
-- Run via Supabase Dashboard > SQL Editor
-- ============================================================

-- Enums
create type license_type as enum ('basic', 'premium', 'exclusive');
create type booking_type as enum ('studio', 'dj');
create type booking_status as enum ('pending', 'confirmed', 'cancelled');

-- ============================================================
-- beats
-- NOTE: full_key is the private storage path for full-quality audio.
-- It must NEVER appear in public Supabase queries.
-- All public queries must use an explicit .select() column list that omits full_key.
-- ============================================================
create table beats (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  title             text not null,
  tagline           text not null,
  description       text not null,
  bpm               int not null,
  musical_key       text not null,
  genre             text not null,
  mood              text not null,
  price_basic       numeric(10,2) not null,
  price_premium     numeric(10,2) not null,
  price_exclusive   numeric(10,2) not null,
  preview_key       text not null,
  full_key          text not null,
  artwork_key       text not null,
  tags              text[] not null default '{}',
  best_for          text[] not null default '{}',
  mix_palette       text[] not null default '{}',
  featured          boolean not null default false,
  is_exclusive_sold boolean not null default false,
  play_count        int not null default 0,
  published         boolean not null default false,
  created_at        timestamptz not null default now()
);

-- events
create table events (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  slug             text unique not null,
  description      text,
  date             timestamptz not null,
  venue            text,
  location         text not null,
  poster_key       text,
  ticket_price     numeric(10,2) not null,
  ticket_capacity  int not null,
  tickets_sold     int not null default 0,
  published        boolean not null default false,
  created_at       timestamptz not null default now()
);

-- orders_beat
create table orders_beat (
  id                       uuid primary key default gen_random_uuid(),
  beat_id                  uuid not null references beats(id),
  license_type             license_type not null,
  stripe_payment_intent_id text,
  buyer_email              text not null,
  buyer_name               text not null,
  amount_paid              numeric(10,2) not null,
  full_download_token      uuid not null default gen_random_uuid(),
  download_count           int not null default 0,
  created_at               timestamptz not null default now()
);

-- orders_ticket
create table orders_ticket (
  id                       uuid primary key default gen_random_uuid(),
  event_id                 uuid not null references events(id),
  stripe_payment_intent_id text,
  buyer_email              text not null,
  buyer_name               text not null,
  amount_paid              numeric(10,2) not null,
  quantity                 int not null,
  created_at               timestamptz not null default now()
);

-- tickets
create table tickets (
  id              uuid primary key default gen_random_uuid(),
  order_ticket_id uuid not null references orders_ticket(id),
  qr_token        uuid not null default gen_random_uuid(),
  checked_in      boolean not null default false,
  checked_in_at   timestamptz,
  created_at      timestamptz not null default now(),
  constraint tickets_qr_token_unique unique (qr_token)
);

-- bookings
create table bookings (
  id             uuid primary key default gen_random_uuid(),
  type           booking_type not null,
  name           text not null,
  email          text not null,
  phone          text,
  message        text,
  event_date     timestamptz,
  duration_hours int,
  notes          text,
  status         booking_status not null default 'pending',
  created_at     timestamptz not null default now()
);

-- Indexes
create index beats_genre_idx    on beats(genre);
create index beats_mood_idx     on beats(mood);
create index beats_published_idx on beats(published);
create index beats_featured_idx  on beats(featured);
create index events_published_idx on events(published);
create index events_date_idx     on events(date);

-- ============================================================
-- Seed data — 3 dev beats (published = true)
-- preview_key paths reference placeholder audio in /public/audio/
-- full_key paths are placeholder — real uploads happen in Phase 6 admin
-- artwork_key paths reference placeholder artwork in /public/images/
-- ============================================================
insert into beats (
  slug, title, tagline, description,
  bpm, musical_key, genre, mood,
  price_basic, price_premium, price_exclusive,
  preview_key, full_key, artwork_key,
  tags, best_for, mix_palette,
  featured, published
) values
(
  'after-hours-anthem',
  'After Hours Anthem',
  'Luxurious synth stacks for a late Montreal skyline.',
  'A glossy late-night trap instrumental with patient synth builds, heavyweight low end, and enough open air for a melodic hook or direct rap pocket.',
  142, 'F# min', 'Trap', 'Nocturnal',
  120.00, 198.00, 420.00,
  'preview/after-hours-anthem.mp3',
  'full/after-hours-anthem.wav',
  'artwork/after-hours-anthem.jpg',
  ARRAY['trap', 'late-night', 'synth', 'melodic'],
  ARRAY['melodic hooks', 'rap', 'R&B bridges'],
  ARRAY['midnight blue', 'gold', 'deep plum'],
  true, true
),
(
  'north-line',
  'North Line',
  'Drill edge with a cinematic undertow.',
  'Dark UK-influenced drill production with cold hi-hat patterns, sub pressure, and a cinematic string layer that lifts the whole track.',
  140, 'D min', 'Drill', 'Cold',
  95.00, 156.75, 332.50,
  'preview/north-line.mp3',
  'full/north-line.wav',
  'artwork/north-line.jpg',
  ARRAY['drill', 'dark', 'cinematic', 'strings'],
  ARRAY['rap verses', 'drill hooks', 'aggressive delivery'],
  ARRAY['charcoal', 'ice blue', 'steel grey'],
  true, true
),
(
  'golden-frequency',
  'Golden Frequency',
  'Soul-drenched chords with a warm Afro pulse.',
  'A soulful Afrobeats-influenced instrumental layering live-feeling guitar chords, percussive grooves, and a warm low-end pocket.',
  98, 'A maj', 'Afro', 'Melodic',
  110.00, 181.50, 385.00,
  'preview/golden-frequency.mp3',
  'full/golden-frequency.wav',
  'artwork/golden-frequency.jpg',
  ARRAY['afro', 'soul', 'guitar', 'warm'],
  ARRAY['melodic hooks', 'afropop', 'R&B'],
  ARRAY['gold', 'terracotta', 'warm white'],
  false, true
);
