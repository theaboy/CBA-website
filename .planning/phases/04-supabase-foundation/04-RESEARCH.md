# Phase 4: Supabase Foundation - Research

**Researched:** 2026-05-21
**Domain:** Supabase (PostgreSQL + Storage + RLS) + Next.js App Router data layer
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BE-01 | Supabase project configured with all tables (beats, events, orders, tickets, bookings), RLS policies, and Storage buckets for audio and artwork | SQL schema migration patterns, RLS policy SQL syntax, storage bucket creation via SQL INSERT into storage.buckets |
| BE-03 | Beat catalog queryable from Next.js with server-side filtering by genre, mood, BPM range, price range, and sort; beat detail returns preview URL | createServerClient pattern for Server Components, Supabase .select() with .eq()/.gte()/.lte()/.order(), signed URL generation via createSignedUrl |
| BE-04 | Beat audio files stored in Supabase Storage; preview audio served from public bucket; full-quality audio delivered via time-limited signed URLs only | Storage bucket public/private configuration, createSignedUrl API, full_key column exclusion via explicit .select() column list |
</phase_requirements>

---

## Summary

Phase 4 wires the CBA Next.js frontend to a real Supabase backend. The core work is three distinct layers: (1) schema — write and run SQL migrations for all six tables plus enums and indexes, (2) security — enable RLS on every table and write policies so the anon key can only read published rows while the service role key handles writes, and (3) frontend integration — replace the static `lib/beats/catalog.ts` source with live Supabase queries in Server Components, and build a signed-URL helper so preview audio is fetched from the public `preview-audio` bucket while the private `full_key` column is never returned in public queries.

The Supabase JavaScript stack for Next.js App Router is `@supabase/supabase-js` (the core client) plus `@supabase/ssr` (the SSR cookie-handling wrapper). Two client factories are needed: a browser client (`createBrowserClient`) for Client Components and a server client (`createServerClient`) for Server Components, Server Actions, and API routes. The server client requires a middleware layer in `middleware.ts` that refreshes session cookies on every request — without this, auth tokens silently expire. For Phase 4 specifically, auth (Phase 6) is not wired yet, so the server client factory for public reads can use the anon key without cookie refresh complexity; the service role client for any server-side writes must never be exposed to the browser.

The `full_key` column is the single most important security constraint in this phase. Because Supabase auto-generates a REST API that returns all columns by default, every public query against the `beats` table must use an explicit `.select()` column list that omits `full_key`. RLS alone is not sufficient because RLS controls row-level visibility, not column-level. Using `.select('id, slug, title, ...')` (everything except `full_key`) is the correct enforcement mechanism.

**Primary recommendation:** Use `@supabase/ssr` + `createServerClient` in Server Components for all public data reads; use a service-role `createClient` (plain `@supabase/supabase-js`) only in API routes and Server Actions for writes; never expose the service role key via `NEXT_PUBLIC_` prefix; and enforce `full_key` exclusion in every public `.select()` call rather than relying solely on RLS.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | ^2.x | Core Supabase client (DB queries, Storage, Auth) | Official Supabase client; all platform features |
| @supabase/ssr | ^0.x | SSR-safe cookie handling for Next.js App Router | Required for server-side session management; replaces deprecated auth-helpers |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/headers (built-in) | Next.js 15+ | Read/write cookies in Server Components and Middleware | Required by createServerClient for cookie-based auth |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @supabase/ssr | @supabase/auth-helpers-nextjs | auth-helpers is deprecated; ssr is the current replacement |
| SQL migrations via dashboard | Supabase CLI + local dev | CLI is better for teams; dashboard is acceptable for solo/prototype work at this stage |
| Server Component data fetching | SWR/React Query client-side | SSR gives better SEO and no client-side waterfall for beat listing |

**Installation:**
```bash
npm install @supabase/supabase-js @supabase/ssr
```

---

## Architecture Patterns

### Recommended Project Structure
```
lib/
├── supabase/
│   ├── client.ts          # createBrowserClient — for Client Components
│   ├── server.ts          # createServerClient — for Server Components / API routes
│   └── service.ts         # service role client — for admin writes only (API routes)
├── beats/
│   ├── catalog.ts         # KEEP for static type definitions and license tier data
│   └── queries.ts         # NEW: Supabase query functions replacing static data
└── storage/
    └── signed-urls.ts     # NEW: signed URL helpers for preview-audio and full-audio

middleware.ts              # Token refresh (required for future auth; wire now)
.env.local                 # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
                           # SUPABASE_SERVICE_ROLE_KEY (no NEXT_PUBLIC_ prefix)
```

### Pattern 1: Browser Client (Client Components)
**What:** Singleton browser-side Supabase client
**When to use:** Client Components that need to interact with Supabase directly (audio player state, favorites, etc.)
**Example:**
```typescript
// lib/supabase/client.ts
// Source: https://supabase.com/docs/guides/auth/server-side/creating-a-client
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Pattern 2: Server Client (Server Components, API Routes)
**What:** SSR-safe server-side Supabase client with cookie handling
**When to use:** All Server Components, Server Actions, and Route Handlers that read data
**Example:**
```typescript
// lib/supabase/server.ts
// Source: https://supabase.com/docs/guides/auth/server-side/creating-a-client
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component — safe to ignore (middleware handles refresh)
          }
        },
      },
    }
  )
}
```

### Pattern 3: Service Role Client (Admin Writes Only)
**What:** Plain `createClient` with service role key — bypasses all RLS
**When to use:** Server-only: API routes, Server Actions that insert/update/delete data (Phase 5+ admin ops). NEVER use in client-side code or with NEXT_PUBLIC_ env prefix.
**Example:**
```typescript
// lib/supabase/service.ts
// Source: https://supabase.com/docs/guides/api/securing-your-api
import { createClient } from '@supabase/supabase-js'

export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!  // NOT NEXT_PUBLIC_
  )
}
```

### Pattern 4: Middleware for Token Refresh
**What:** Next.js middleware that refreshes Supabase session cookies on every request
**When to use:** Required now so auth works correctly when Phase 6 wires Supabase Auth
**Example:**
```typescript
// middleware.ts
// Source: https://supabase.com/docs/guides/auth/server-side/nextjs
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

### Pattern 5: Public Beat Query (Exclude full_key)
**What:** Server Component query that fetches beats without ever returning full_key
**When to use:** Beat listing page, beat detail page, homepage featured beats
**Example:**
```typescript
// lib/beats/queries.ts
import { createClient } from '@/lib/supabase/server'

// Column list — full_key is intentionally absent
const PUBLIC_BEAT_COLUMNS = `
  id, slug, title, tagline, description,
  bpm, musical_key, genre, mood,
  price_basic, price_premium, price_exclusive,
  preview_key, artwork_key,
  tags, best_for, mix_palette,
  featured, is_exclusive_sold, play_count, published, created_at
`

export async function getPublishedBeats() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('beats')
    .select(PUBLIC_BEAT_COLUMNS)
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getBeatBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('beats')
    .select(PUBLIC_BEAT_COLUMNS)
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error) return null
  return data
}
```

### Pattern 6: Signed URL Helper for Preview Audio
**What:** Server-side function that generates time-limited signed URLs for preview audio
**When to use:** Beat listing page data fetch, beat detail page, any Server Component that needs audio URLs. Note: preview-audio is a PUBLIC bucket, so you can use getPublicUrl() instead of createSignedUrl(). Signed URLs are only required for the full-audio private bucket.
**Example:**
```typescript
// lib/storage/signed-urls.ts
import { createClient } from '@/lib/supabase/server'

// Preview audio is in a PUBLIC bucket — use public URL directly
export async function getPreviewAudioUrl(previewKey: string): Promise<string> {
  const supabase = await createClient()
  const { data } = supabase.storage
    .from('preview-audio')
    .getPublicUrl(previewKey)
  return data.publicUrl
}

// Full audio is in a PRIVATE bucket — must use signed URL (post-purchase only)
export async function getFullAudioSignedUrl(
  fullKey: string,
  expiresInSeconds = 3600
): Promise<string> {
  const supabase = await createClient()
  const { data, error } = await supabase.storage
    .from('full-audio')
    .createSignedUrl(fullKey, expiresInSeconds)

  if (error || !data) throw new Error('Could not generate signed URL')
  return data.signedUrl
}
```

### Pattern 7: SQL Schema Migration
**What:** Complete SQL migration script run once via Supabase dashboard SQL editor or CLI
**When to use:** Initial schema setup

```sql
-- Enums
create type license_type as enum ('basic', 'premium', 'exclusive');
create type booking_type as enum ('studio', 'dj');
create type booking_status as enum ('pending', 'confirmed', 'cancelled');

-- beats
create table beats (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  title            text not null,
  tagline          text not null,
  description      text not null,
  bpm              int not null,
  musical_key      text not null,
  genre            text not null,
  mood             text not null,
  price_basic      numeric(10,2) not null,
  price_premium    numeric(10,2) not null,
  price_exclusive  numeric(10,2) not null,
  preview_key      text not null,
  full_key         text not null,
  artwork_key      text not null,
  tags             text[] not null default '{}',
  best_for         text[] not null default '{}',
  mix_palette      text[] not null default '{}',
  featured         boolean not null default false,
  is_exclusive_sold boolean not null default false,
  play_count       int not null default 0,
  published        boolean not null default false,
  created_at       timestamptz not null default now()
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
  id               uuid primary key default gen_random_uuid(),
  order_ticket_id  uuid not null references orders_ticket(id),
  qr_token         uuid not null default gen_random_uuid(),
  checked_in       boolean not null default false,
  checked_in_at    timestamptz,
  created_at       timestamptz not null default now(),
  constraint tickets_qr_token_unique unique (qr_token)
);

-- bookings
create table bookings (
  id               uuid primary key default gen_random_uuid(),
  type             booking_type not null,
  name             text not null,
  email            text not null,
  phone            text,
  message          text,
  event_date       timestamptz,
  duration_hours   int,
  notes            text,
  status           booking_status not null default 'pending',
  created_at       timestamptz not null default now()
);

-- Indexes
create index beats_genre_idx on beats(genre);
create index beats_mood_idx on beats(mood);
create index beats_published_idx on beats(published);
create index beats_featured_idx on beats(featured);
create index events_published_idx on events(published);
create index events_date_idx on events(date);
```

### Pattern 8: RLS Policies
```sql
-- Enable RLS on all tables
alter table beats enable row level security;
alter table events enable row level security;
alter table orders_beat enable row level security;
alter table orders_ticket enable row level security;
alter table tickets enable row level security;
alter table bookings enable row level security;

-- beats: anon can read published rows only
create policy "Public can read published beats"
  on beats for select
  to anon, authenticated
  using (published = true);

-- events: anon can read published rows only
create policy "Public can read published events"
  on events for select
  to anon, authenticated
  using (published = true);

-- orders_beat, orders_ticket, tickets, bookings:
-- no anon access — only service role (bypasses RLS) can read/write
-- No policies needed for anon; service role bypasses RLS entirely
```

### Pattern 9: Storage Bucket Creation
```sql
-- Run in SQL editor or include in migration
-- preview-audio: public bucket (anyone with URL can read)
insert into storage.buckets (id, name, public)
  values ('preview-audio', 'preview-audio', true);

-- full-audio: private bucket (signed URLs only)
insert into storage.buckets (id, name, public)
  values ('full-audio', 'full-audio', false);

-- artwork: public bucket
insert into storage.buckets (id, name, public)
  values ('artwork', 'artwork', true);

-- Storage RLS: anon can SELECT from public buckets (needed even for public buckets)
create policy "Public preview audio read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'preview-audio');

create policy "Public artwork read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'artwork');

-- full-audio: no anon access; service role handles all access
```

### Anti-Patterns to Avoid
- **Returning full_key in any public query:** Always use explicit `.select()` column list without `full_key`. RLS controls rows, not columns.
- **Using service role key in client-side code:** Never use `SUPABASE_SERVICE_ROLE_KEY` in a `NEXT_PUBLIC_` env var. It gives full database access to any browser.
- **Calling `supabase.auth.getSession()` for page protection:** Use `getUser()` instead — `getSession()` trusts the cookie without re-validating the JWT with the Auth server.
- **Using `generateStaticParams` for beat detail pages:** Beat data will now be dynamic (database-driven). Remove the static params export; let Next.js render detail pages dynamically. Or use `revalidate` with ISR if SEO performance is important.
- **Forgetting middleware.ts:** Without it, session cookies don't refresh and auth silently breaks when Phase 6 wires login.
- **Creating buckets via dashboard only:** Include bucket creation in the SQL migration so the schema is reproducible.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Signed URL generation for private audio | Custom signed URL logic with crypto | `supabase.storage.from('full-audio').createSignedUrl(key, seconds)` | Handles HMAC signing, expiry, Supabase CDN integration |
| SSR cookie session management | Manual cookie read/write | `@supabase/ssr` with `createServerClient` | Auth token refresh race conditions are subtle and break silently |
| Column-level security for full_key | RLS policy to hide column | Explicit `.select()` without `full_key` | Postgres RLS is row-level only; column masking requires explicit select lists |
| Database connection pooling | Direct `pg` client | Supabase client (uses PostgREST HTTP layer) | Supabase handles pooling, retries, and auth header injection automatically |
| Filter/sort query building | String concatenation | Supabase `.eq()`, `.gte()`, `.lte()`, `.order()`, `.range()` chainable API | Type-safe, injection-safe, handles URL encoding |

**Key insight:** Supabase's PostgREST layer and storage APIs handle the hard parts (connection pooling, auth, signed URLs, CDN caching). The integration work in this phase is primarily configuration and wiring, not custom implementation.

---

## Common Pitfalls

### Pitfall 1: full_key Leaks via Default select()
**What goes wrong:** `supabase.from('beats').select('*')` returns all columns including `full_key`, which then reaches the browser response.
**Why it happens:** Supabase REST auto-exposes all columns by default. RLS doesn't hide columns.
**How to avoid:** Always pass an explicit column string to `.select()` that omits `full_key`. Define a `PUBLIC_BEAT_COLUMNS` constant and reuse it everywhere.
**Warning signs:** Beat JSON responses in browser dev tools containing a `full_key` field.

### Pitfall 2: Service Role Key Exposed in Browser
**What goes wrong:** `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` — the `NEXT_PUBLIC_` prefix bakes the key into client-side JS bundles, visible to anyone.
**Why it happens:** Developers copy the pattern from anon key setup and forget the prefix matters.
**How to avoid:** Service role key env var must be `SUPABASE_SERVICE_ROLE_KEY` (no NEXT_PUBLIC_ prefix). Only read in server-side code (API routes, Server Actions).
**Warning signs:** Can inspect page source or JS bundle and find the service role key string.

### Pitfall 3: Next.js Cache Serving Stale Beat Data
**What goes wrong:** After updating a beat in Supabase, the Next.js page still shows old data because the fetch was cached.
**Why it happens:** Next.js 15 aggressively caches Server Component data fetches. Supabase client uses `fetch` under the hood which Next.js patches for caching.
**How to avoid:** Export `export const dynamic = 'force-dynamic'` from the beats listing page, or use `revalidate = 60` for ISR. For the beats detail page, same pattern.
**Warning signs:** Changes in Supabase dashboard don't appear on the site without a redeploy.

### Pitfall 4: Missing Middleware Breaks Future Auth
**What goes wrong:** Without `middleware.ts`, Supabase auth tokens expire silently. Users appear logged out randomly in Phase 6.
**Why it happens:** Next.js Server Components can't write cookies; only middleware can refresh tokens across requests.
**How to avoid:** Wire `middleware.ts` now even though auth isn't implemented until Phase 6.
**Warning signs:** Random auth expiry, sessions that don't survive page navigation.

### Pitfall 5: generateStaticParams with Dynamic Database Data
**What goes wrong:** Beat detail page uses `generateStaticParams` seeded from static catalog. After switching to Supabase, new beats added to the DB won't have static pages generated.
**Why it happens:** `generateStaticParams` runs at build time against static data; DB data isn't available.
**How to avoid:** Either (a) remove `generateStaticParams` entirely and let pages render dynamically, or (b) update it to query Supabase at build time and add ISR revalidation. For this phase, option (a) is simpler.
**Warning signs:** 404s for beat slugs that exist in the database but weren't in the static catalog at build time.

### Pitfall 6: RLS Blocks All Reads if No Policy Exists
**What goes wrong:** Enabling RLS without adding a SELECT policy causes all anon reads to return empty arrays (no error, just empty data).
**Why it happens:** RLS default-deny. Empty result set, not an error, makes it look like a data problem.
**How to avoid:** After enabling RLS, immediately add the `published = true` SELECT policy for anon/authenticated. Test with a Supabase query in the dashboard using the anon role.
**Warning signs:** API returns `[]` with no error; data visible in Supabase table editor but not in app.

### Pitfall 7: Preview Audio URL Construction
**What goes wrong:** `preview_key` is stored as a path like `"preview/north-line.mp3"`, not a full URL. Passing it directly to an `<audio>` `src` attribute returns 404.
**Why it happens:** Keys are storage object paths, not URLs. The Supabase CDN URL prefix must be prepended at render time.
**How to avoid:** Always call `supabase.storage.from('preview-audio').getPublicUrl(preview_key)` to get the full URL. Never pass raw keys to the frontend.
**Warning signs:** Audio player shows the key string as the URL; audio fails to load.

---

## Code Examples

Verified patterns from official sources:

### Creating a signed URL for private storage
```typescript
// Source: https://supabase.com/docs/reference/javascript/storage-from-createsignedurl
const { data, error } = await supabase.storage
  .from('full-audio')
  .createSignedUrl('beats/north-line-full.wav', 3600) // expires in 1 hour

if (data) {
  console.log(data.signedUrl)
}
```

### Getting a public URL from a public bucket
```typescript
// Source: https://supabase.com/docs/guides/storage/quickstart
const { data } = supabase.storage
  .from('preview-audio')
  .getPublicUrl('preview/north-line.mp3')

console.log(data.publicUrl)
// => https://<project>.supabase.co/storage/v1/object/public/preview-audio/preview/north-line.mp3
```

### Filtered beat query with RLS-enforced published filter
```typescript
// Source: https://supabase.com/docs/reference/javascript/select
const { data, error } = await supabase
  .from('beats')
  .select('id, slug, title, bpm, genre, mood, price_basic, preview_key, artwork_key, featured')
  .eq('published', true)
  .gte('bpm', 100)
  .lte('bpm', 160)
  .eq('genre', 'Trap')
  .order('created_at', { ascending: false })
```

### RLS policy for published content
```sql
-- Source: https://supabase.com/docs/guides/database/postgres/row-level-security
create policy "Public can read published beats"
  on beats for select
  to anon, authenticated
  using (published = true);
```

### Storage bucket creation via SQL migration
```sql
-- Source: https://supabase.com/docs/guides/storage/buckets/creating-buckets
insert into storage.buckets (id, name, public)
  values ('preview-audio', 'preview-audio', true);

insert into storage.buckets (id, name, public)
  values ('full-audio', 'full-audio', false);

insert into storage.buckets (id, name, public)
  values ('artwork', 'artwork', true);
```

### Beat listing page — Server Component with dynamic rendering
```typescript
// app/(marketing)/beats/page.tsx
export const dynamic = 'force-dynamic'  // prevent stale cache

import { getPublishedBeats } from '@/lib/beats/queries'

export default async function BeatsPage() {
  const beats = await getPublishedBeats()
  return <BeatsMarketplace beats={beats} />
}
```

### Beat detail page — Server Component replacing generateStaticParams
```typescript
// app/(marketing)/beats/[slug]/page.tsx
// Remove generateStaticParams — routes are now dynamic DB-driven
export const dynamic = 'force-dynamic'

import { getBeatBySlug } from '@/lib/beats/queries'
import { getPreviewAudioUrl } from '@/lib/storage/signed-urls'

export default async function BeatDetailPage({
  params
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const beat = await getBeatBySlug(slug)
  if (!beat) notFound()

  const previewUrl = await getPreviewAudioUrl(beat.preview_key)
  return (
    <div className="page-shell">
      <BeatDetailHero beat={{ ...beat, audioSrc: previewUrl }} />
      <BeatLicenseInquiry beat={beat} />
    </div>
  )
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | 2023-2024 | auth-helpers is deprecated; ssr is the current package |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` (JWT) | Same var name, now holds `sb_publishable_...` key | 2025 | Old JWT keys work until end of 2026; new publishable keys are preferred |
| `supabase.auth.getSession()` for page protection | `supabase.auth.getUser()` | 2024 | getSession trusts cookies without server validation; getUser re-validates with auth server |
| Static `generateStaticParams` from file | Supabase query at build time or force-dynamic | Phase 4 | DB-driven slugs require dynamic rendering or build-time DB query |

**Deprecated/outdated in this codebase:**
- `@supabase/auth-helpers-nextjs`: do not install; use `@supabase/ssr` instead
- Static `beatsCatalog` as data source: replaced by Supabase queries in Phase 4 (keep the file for TypeScript types and `beatLicenseTiers`)
- `artworkSrc`/`audioSrc` fields on Beat type: replaced by `artwork_key` and `preview_key` (paths, not URLs); URL construction happens at query time

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...   # public, safe in browser
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...             # server-only, NEVER expose to browser
```

---

## Data Model Translation Notes

The archived Prisma schema (`/Users/bird/CBA-api-archived-express/prisma/schema.prisma`) maps to Supabase SQL as follows:

| Prisma field | SQL column | Note |
|---|---|---|
| `musicalKey` | `musical_key` | snake_case in SQL |
| `priceBasic` | `price_basic` | Decimal(10,2) → numeric(10,2) |
| `isExclusiveSold` | `is_exclusive_sold` | boolean |
| `createdAt` | `created_at` | timestamptz default now() |
| `Event.name` | `events.title` | renamed to match roadmap spec |
| `Event.isPublished` | `events.published` | renamed for consistency |
| `Event.totalTickets` | `events.ticket_capacity` | renamed |
| `OrderBeat.customerEmail` | `orders_beat.buyer_email` | renamed |
| `OrderBeat.stripePaymentId` | `orders_beat.stripe_payment_intent_id` | full name |
| `OrderBeat.downloadKey` | omitted in Phase 4 | replaced by `full_download_token` UUID |
| `Booking.customerName` | `bookings.name` | simplified |
| `AdminUser` | not included | Supabase Auth handles this in Phase 6 |
| `LicenseType` enum | `license_type` enum (lowercase values) | BASIC → 'basic' |

The `Beat` type in `lib/beats/catalog.ts` has a flat `price: number` field. The Supabase schema has three price columns (`price_basic`, `price_premium`, `price_exclusive`). The frontend Beat type will need updating to match, or a mapping layer in `queries.ts` can compute `price` from `price_basic` for backward compatibility with existing components.

---

## Validation Architecture

`nyquist_validation` is absent from `.planning/config.json` — treating as enabled.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — no jest.config, vitest.config, or test files exist in the project |
| Config file | None — Wave 0 must create |
| Quick run command | `npx vitest run --reporter=verbose` (after Wave 0 setup) |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BE-01 | All 6 tables exist with correct columns and enums | manual | Supabase dashboard table inspector | N/A — schema |
| BE-01 | RLS policies active: anon gets published rows only | integration | `npx vitest run tests/rls.test.ts` | ❌ Wave 0 |
| BE-01 | Storage buckets created: preview-audio, full-audio, artwork | manual | Supabase Storage tab | N/A — infra |
| BE-03 | getPublishedBeats() returns beats without full_key | unit | `npx vitest run tests/beats-queries.test.ts` | ❌ Wave 0 |
| BE-03 | getBeatBySlug() returns null for unknown slug | unit | `npx vitest run tests/beats-queries.test.ts` | ❌ Wave 0 |
| BE-04 | getPreviewAudioUrl() returns full HTTPS URL | unit | `npx vitest run tests/signed-urls.test.ts` | ❌ Wave 0 |
| BE-04 | Public beat response never contains full_key field | unit | `npx vitest run tests/beats-queries.test.ts` | ❌ Wave 0 |

**Note:** BE-01 schema and bucket creation are infra-level and best verified manually via the Supabase dashboard. The testable unit is the query layer behavior.

### Sampling Rate
- **Per task commit:** `npx vitest run tests/beats-queries.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before moving to Phase 5

### Wave 0 Gaps
- [ ] `vitest` package install: `npm install -D vitest`
- [ ] `vitest.config.ts` — configure with `environment: 'node'`
- [ ] `tests/beats-queries.test.ts` — covers BE-03 and BE-04 full_key exclusion
- [ ] `tests/signed-urls.test.ts` — covers BE-04 URL shape
- [ ] `tests/rls.test.ts` — covers BE-01 RLS behavior (requires Supabase test project or mock)

**Practical note:** RLS integration tests require either a real Supabase project (use the dev project) or a local Supabase CLI instance. Unit tests for query functions can mock the Supabase client. Given the project has zero test infrastructure, Wave 0 setup should be kept minimal — install vitest, write pure unit tests for the query layer, and use manual verification for RLS and bucket policies.

---

## Open Questions

1. **Beat type shape mismatch: single `price` vs three tier prices**
   - What we know: Existing Beat type has `price: number`; Supabase schema has `price_basic`, `price_premium`, `price_exclusive`
   - What's unclear: Do existing components (BeatCard, BeatDetailHero, BeatLicenseInquiry) use `price` directly, or do they compute tier prices from it?
   - Recommendation: Audit component usages of `beat.price` in Phase 4 plan; either update the TypeScript type to match the DB or add a computed `price` field in the query layer for backward compatibility

2. **preview_key path convention in seed data**
   - What we know: Storage keys are paths like `"preview/slug.mp3"`, not full URLs
   - What's unclear: Have any real audio files been uploaded to Supabase Storage yet, or is seed data pointing to non-existent objects?
   - Recommendation: Plan 04-02 should seed the beats table with placeholder `preview_key` values that match local `/audio/` file names, with a note that real uploads happen when Phase 6 admin is wired

3. **featured beats homepage component**
   - What we know: `components/home/featured-beats.tsx` and `components/home/beats-bento.tsx` import from the static catalog
   - What's unclear: Should Phase 4 also update these homepage components to use Supabase, or only the `/beats` route?
   - Recommendation: Include homepage featured beats components in Phase 4 scope (they import the same static catalog); otherwise Phase 4 success criteria #4 is incomplete

---

## Sources

### Primary (HIGH confidence)
- [Supabase SSR — Creating a client](https://supabase.com/docs/guides/auth/server-side/creating-a-client) — createServerClient and createBrowserClient patterns
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) — RLS syntax, enable, policy creation
- [Supabase Storage createSignedUrl](https://supabase.com/docs/reference/javascript/storage-from-createsignedurl) — signed URL API
- [Supabase Storage Buckets — Creating Buckets](https://supabase.com/docs/guides/storage/buckets/creating-buckets) — SQL INSERT and JS createBucket
- [Supabase Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control) — storage.objects RLS policies, bucket_id pattern
- [Archived Prisma schema](file:///Users/bird/CBA-api-archived-express/prisma/schema.prisma) — authoritative data model reference

### Secondary (MEDIUM confidence)
- [Supabase Next.js Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) — env var names confirmed: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [Supabase API Key changes discussion](https://github.com/orgs/supabase/discussions/29260) — new `sb_publishable_` key format, old JWT keys work until end of 2026
- [Supabase Next.js stale data troubleshooting](https://supabase.com/docs/guides/troubleshooting/nextjs-1314-stale-data-when-changing-rls-or-table-data-85b8oQ) — `force-dynamic` / `revalidate` pattern

### Tertiary (LOW confidence — flag for validation)
- WebSearch community patterns for `createServerClient` cookie handler — verified shape against official docs but exact implementation may vary by `@supabase/ssr` minor version

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — official Supabase docs confirm `@supabase/supabase-js` + `@supabase/ssr`; env var names verified
- Architecture: HIGH — client/server/service split is the canonical pattern per official docs
- SQL schema: HIGH — derived from archived Prisma schema which is authoritative; column type translations are standard Postgres
- RLS patterns: HIGH — SQL syntax verified against official RLS docs
- Storage bucket patterns: HIGH — SQL INSERT into `storage.buckets` confirmed via official docs and community verification
- Signed URL helper: HIGH — `createSignedUrl` API signature confirmed
- Pitfalls: HIGH — full_key exposure, service role leakage, and cache staleness are all documented failure modes
- Test architecture: MEDIUM — vitest is appropriate but test strategy for Supabase integration is a judgment call given zero existing test infra

**Research date:** 2026-05-21
**Valid until:** 2026-06-21 (Supabase JS SDK moves quickly; re-verify `@supabase/ssr` cookie handler signature if package version bumps)
