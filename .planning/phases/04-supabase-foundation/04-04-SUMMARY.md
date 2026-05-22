---
phase: 04-supabase-foundation
plan: 04
subsystem: beats-catalog
tags: [supabase, beats, typescript, queries, rls, storage, tdd]

# Dependency graph
requires:
  - phase: 04-03
    provides: Storage URL helpers (getPreviewAudioUrl, getArtworkUrl) and RLS policies
  - phase: 04-01
    provides: createClient() for server-side Supabase reads
  - phase: 04-02
    provides: beats table schema with full_key, price_basic/premium/exclusive, preview_key, artwork_key
provides:
  - lib/beats/queries.ts with getPublishedBeats, getBeatBySlug, getFeaturedBeats
  - Beat type updated to match DB schema (snake_case, three price tiers, no full_key in public type)
  - All pages and components wired to Supabase — no static catalog data remains
  - 7 passing unit tests enforcing full_key exclusion and query shape contracts
affects:
  - 05-frontend (beat playback and licensing forms use live DB data)
  - 06-admin-dashboard (admin CRUD affects the same beats table now driving the site)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - PUBLIC_BEAT_COLUMNS constant with explicit column list excluding full_key (column-level security)
    - resolveUrls() helper maps RawBeat (no audio_src/artwork_url) to Beat (with HTTPS URLs)
    - Server Components fetch beats via getPublishedBeats/getBeatBySlug/getFeaturedBeats; pass as props to Client Components
    - force-dynamic on beats pages ensures fresh DB reads on every request
    - Client Components (LightCatalog, BeatsMarketplace, EditorialCatalog) accept beats as props; no internal data fetching

key-files:
  created:
    - lib/beats/queries.ts
  modified:
    - lib/beats/catalog.ts
    - tests/beats-queries.test.ts
    - components/beats/beat-detail-hero.tsx
    - components/beats/beat-card.tsx
    - components/beats/beat-waveform.tsx
    - components/beats/beats-marketplace.tsx
    - components/beats/light-catalog.tsx
    - lib/audio/audio-context.tsx
    - components/audio/mini-player.tsx
    - components/home/editorial-catalog.tsx
    - components/home/featured-beats.tsx
    - components/home/beats-bento.tsx
    - app/(marketing)/beats/page.tsx
    - app/(marketing)/beats/[slug]/page.tsx
    - app/(marketing)/beats/[slug]/actions.ts
    - app/(hero)/page.tsx

key-decisions:
  - "PUBLIC_BEAT_COLUMNS constant enforces full_key exclusion structurally — not relying on RLS alone"
  - "getFeaturedBeats returns latest 6 published beats (no featured=true filter) — with only 3 seed beats, the featured boolean filter would be too restrictive"
  - "relatedBeats stubbed as empty array in beat-detail-hero.tsx — Phase 5 will wire related beats from Supabase"
  - "Home page converted from use client to async Server Component to enable getFeaturedBeats() call"
  - "mini-player.tsx: beat.duration replaced with formatTime(duration) — real duration from audio element loadedmetadata event"

# Metrics
duration: 8min
completed: 2026-05-22
---

# Phase 4 Plan 04: Beat Catalog Supabase Integration Summary

**Beat type migrated to snake_case DB schema; static catalog removed; query layer with full_key exclusion, URL resolution, and 7 passing unit tests; all pages and components wired to live Supabase data**

## Performance

- **Duration:** 8 min
- **Started:** 2026-05-22T04:37:14Z
- **Completed:** 2026-05-22T04:45:07Z
- **Tasks:** 3 of 4 complete (Task 4 is a human-verify checkpoint)
- **Files modified:** 16

## Accomplishments

- Replaced `Beat` type with snake_case DB-schema fields: `price_basic`, `price_premium`, `price_exclusive`, `musical_key`, `best_for`, `mix_palette`, `audio_src`, `artwork_url`
- Removed `beatsCatalog` static array and all catalog-level data functions from `catalog.ts`
- Created `lib/beats/queries.ts` with `getPublishedBeats()`, `getBeatBySlug()`, `getFeaturedBeats()`; `PUBLIC_BEAT_COLUMNS` explicitly omits `full_key`
- Updated all 7+ components consuming Beat to use new field names
- Converted `LightCatalog`, `BeatsMarketplace`, `EditorialCatalog`, `FeaturedBeats`, `BeatsBento` to accept `beats: Beat[]` as a prop (no internal catalog import)
- Wired `app/(marketing)/beats/page.tsx` and `beats/[slug]/page.tsx` to fetch live Supabase data with `force-dynamic`
- Updated `app/(hero)/page.tsx` from `"use client"` to async Server Component to pass beats to `EditorialCatalog`
- Implemented 7 real vitest assertions in `tests/beats-queries.test.ts` replacing all `it.todo` stubs — all pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Update Beat type and fix all downstream TypeScript errors** - `7bba6a7` (feat)
2. **Task 2: Create queries.ts and implement beats-queries tests** - `eae6876` (feat)
3. **Task 3: Wire pages and homepage components to Supabase** - `4ecd1db` (feat)
4. **Task 4: Visual verification** - checkpoint:human-verify (pending)

## Files Created/Modified

- `lib/beats/catalog.ts` - Beat type with snake_case DB fields, no beatsCatalog array, updated getBeatLicenseOptions using price tiers
- `lib/beats/queries.ts` (new) - getPublishedBeats, getBeatBySlug, getFeaturedBeats; PUBLIC_BEAT_COLUMNS excludes full_key; resolveUrls maps storage keys to HTTPS URLs
- `tests/beats-queries.test.ts` - 7 real assertions: full_key exclusion, price field shape, resolved URL format, null for unknown slug
- `components/beats/beat-detail-hero.tsx` - artwork_url, price_basic, best_for, mix_palette, musical_key; relatedBeats stubbed
- `components/beats/beat-card.tsx` - artwork_url, price_basic; remove duration display
- `components/beats/beat-waveform.tsx` - remove beat.duration span
- `components/beats/beats-marketplace.tsx` - accept beats prop; price_basic; inline sort using play_count/created_at
- `components/beats/light-catalog.tsx` - accept beats prop; artwork_url, price_basic, musical_key; index passed to RackSleeve
- `lib/audio/audio-context.tsx` - audio_src; remove durationSeconds (real duration from loadedmetadata)
- `components/audio/mini-player.tsx` - artwork_url; formatTime(duration) instead of beat.duration
- `components/home/editorial-catalog.tsx` - accept beats prop; artwork_url, price_basic
- `components/home/featured-beats.tsx` - accept beats prop; price_basic; Server Component (no use client)
- `components/home/beats-bento.tsx` - accept beats prop; artwork_url, price_basic; Server Component
- `app/(marketing)/beats/page.tsx` - async Server Component; getPublishedBeats() with filter params; force-dynamic
- `app/(marketing)/beats/[slug]/page.tsx` - async Server Component; getBeatBySlug(); remove generateStaticParams; force-dynamic
- `app/(marketing)/beats/[slug]/actions.ts` - await getBeatBySlug from queries.ts; getBeatLicenseOptions from catalog.ts
- `app/(hero)/page.tsx` - async Server Component; getFeaturedBeats(); pass beats to EditorialCatalog

## Decisions Made

- `PUBLIC_BEAT_COLUMNS` constant is the structural mechanism for BE-04 — full_key exclusion happens at the query level, not relying on RLS column-level policies alone.
- `getFeaturedBeats()` returns latest 6 published beats without the `featured=true` filter — with only 3 seed beats, filtering by featured would be too restrictive. The featured boolean filter should be re-added once the catalog grows.
- Related beats stubbed as `[]` in `beat-detail-hero.tsx` for Phase 5 to wire from Supabase (requires a similarity query or a related_beats join table).
- `app/(hero)/page.tsx` converted from `"use client"` to Server Component — necessary to call `getFeaturedBeats()` directly. The child client components (`EditorialCatalog`) retain `"use client"` for interactivity.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] Fixed mini-player.tsx for new Beat type**
- **Found during:** Task 1
- **Issue:** `mini-player.tsx` used `currentBeat.artworkSrc` and `currentBeat.duration` — both removed from Beat type
- **Fix:** Updated to `artwork_url` and `formatTime(duration)` (duration comes from audio element loadedmetadata, already in context)
- **Files modified:** `components/audio/mini-player.tsx`
- **Commit:** 7bba6a7

**2. [Rule 3 - Blocking] Fixed editorial-catalog.tsx, featured-beats.tsx, beats-bento.tsx to accept beats prop**
- **Found during:** Task 1 (tsc errors)
- **Issue:** These components imported `beatsCatalog` / `getFeaturedBeats` from catalog, blocking compilation
- **Fix:** Converted all three to accept `beats: Beat[]` as a prop; removed internal data imports
- **Commit:** 7bba6a7

**3. [Rule 3 - Blocking] Converted app/(hero)/page.tsx to async Server Component**
- **Found during:** Task 3
- **Issue:** Home page was `"use client"` but needed to call `getFeaturedBeats()` (server-side async function)
- **Fix:** Removed `"use client"`, made it `async`, added `getFeaturedBeats()` call and `dynamic = "force-dynamic"`
- **Commit:** 4ecd1db

**4. [Rule 1 - Bug] queries.ts created before Task 2 to unblock tsc**
- **Found during:** Task 1
- **Issue:** pages importing `@/lib/beats/queries` caused tsc failures before the file existed
- **Fix:** Created `lib/beats/queries.ts` as part of Task 1 to allow tsc to exit 0
- **Commit:** eae6876

## Issues Encountered

None beyond the deviations noted above — all were auto-fixed per plan deviation rules.

## Next Phase Readiness

- All beats pages are database-driven and ready for Task 4 human verification
- `lib/beats/queries.ts` is complete and tested — Phase 5 can extend with additional filters
- Related beats functionality is intentionally deferred (Phase 5)
- `featured` boolean filter can be re-enabled once catalog has more than 3 beats

---
*Phase: 04-supabase-foundation*
*Completed: 2026-05-22*

## Self-Check

- lib/beats/queries.ts — FOUND (committed eae6876)
- lib/beats/catalog.ts — FOUND (committed 7bba6a7)
- tests/beats-queries.test.ts — FOUND (committed eae6876)
- Task 1 commit 7bba6a7 — confirmed in git log
- Task 2 commit eae6876 — confirmed in git log
- Task 3 commit 4ecd1db — confirmed in git log
- vitest run: 16/16 tests pass (7 new beats-queries tests + 9 existing signed-urls tests)
- TypeScript: no errors (tsc --noEmit exits 0)

## Self-Check: PASSED
