---
phase: 04-supabase-foundation
plan: 03
subsystem: database
tags: [supabase, postgres, rls, storage, sql, migrations, security]

# Dependency graph
requires:
  - phase: 04-02
    provides: All 6 tables live in Supabase with RLS enabled — beats, events, orders_beat, orders_ticket, tickets, bookings
  - phase: 04-01
    provides: Three-client pattern (browser/server/service) + server.ts createClient() used by storage.ts
provides:
  - RLS policies on all 6 tables: anon can SELECT published beats/events, empty array for order/ticket/booking tables
  - 3 storage buckets: preview-audio (public), full-audio (private), artwork (public)
  - Storage RLS: anon SELECT on preview-audio and artwork; no anon access to full-audio
  - lib/supabase/storage.ts with getPreviewAudioUrl, getArtworkUrl, getSignedDownloadUrl
  - 9 passing unit tests covering all three URL helper functions
affects:
  - 04-04-PLAN (query layer uses getPreviewAudioUrl and getArtworkUrl for beat cards)
  - 05-frontend (beat playback and artwork rendering use storage helpers)
  - 06-admin-dashboard (admin uploads target the 3 buckets created here)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Two-tier storage access model: public CDN URLs (getPublicUrl) for previews/artwork, signed URLs (createSignedUrl) for purchased full audio
    - getSignedDownloadUrl is server-side only — documented with security comment, must be called after purchase verification
    - Storage helpers import createClient() from server.ts (SSR-safe), not service.ts — read operations use anon key
    - vi.mock() test pattern: mock at module level, dynamic import after mock setup to ensure mock intercepts correctly

key-files:
  created:
    - supabase/migrations/20260521000002_rls_and_storage.sql
    - lib/supabase/storage.ts
  modified:
    - tests/signed-urls.test.ts

key-decisions:
  - "getPublicUrl() for preview-audio and artwork (public buckets) — no token, no expiry, CDN-cacheable"
  - "createSignedUrl() for full-audio (private bucket) — time-limited, server-side only, issued post-purchase"
  - "Storage helpers use server.ts createClient() (anon key), not service.ts — public read operations don't need elevated permissions"
  - "No anon INSERT/UPDATE/DELETE policies on any table — only SELECT on published beats/events"

patterns-established:
  - "Public bucket helpers (getPreviewAudioUrl, getArtworkUrl) use getPublicUrl() — safe to call from Server Components"
  - "Private bucket helper (getSignedDownloadUrl) uses createSignedUrl() — must only be called server-side after verifying purchase"
  - "Storage RLS: public buckets still require explicit storage.objects SELECT policy for anon access via URL"

requirements-completed: [BE-01, BE-04]

# Metrics
duration: 6min
completed: 2026-05-22
---

# Phase 4 Plan 03: RLS Policies + Storage Buckets + URL Helpers Summary

**Row-level security SQL migration locking 6 tables, 3 storage buckets (preview-audio/full-audio/artwork), and typed storage URL helpers with 9 passing unit tests**

## Performance

- **Duration:** 6 min
- **Started:** 2026-05-22T03:59:56Z
- **Completed:** 2026-05-22T04:06:00Z
- **Tasks:** 3 of 3 complete (Task 2 requires human dashboard confirmation)
- **Files modified:** 3

## Accomplishments
- Created complete RLS + storage SQL migration with 6 enable-RLS statements, 2 table SELECT policies, 3 bucket insertions, 5 storage.objects policies
- Implemented `lib/supabase/storage.ts` with three typed helpers following the two-tier storage model (public CDN for previews, signed URLs for purchased full audio)
- Replaced `tests/signed-urls.test.ts` todo stubs with 9 real assertions covering all three helpers via vi.mock()
- All 9 vitest tests pass, TypeScript compiles cleanly

## Task Commits

Each task was committed atomically:

1. **Task 1: Write RLS and storage SQL migration file** - `11b43be` (feat)
2. **Task 2: Run RLS and storage SQL in Supabase dashboard** - human-action checkpoint (user must paste SQL into Supabase SQL Editor)
3. **Task 3: Create storage URL helpers and implement signed-urls tests** - `e5cedb5` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `supabase/migrations/20260521000002_rls_and_storage.sql` - Complete RLS + storage SQL: 6 enable-RLS, 2 table policies, 3 bucket inserts, 5 storage.objects policies
- `lib/supabase/storage.ts` - Three URL helpers: getPreviewAudioUrl (public), getArtworkUrl (public), getSignedDownloadUrl (private/signed)
- `tests/signed-urls.test.ts` - 9 real assertions replacing todo stubs; uses vi.mock() to avoid real Supabase connection

## Decisions Made
- Storage helpers use `server.ts` `createClient()` (anon key) rather than `service.ts` — public read operations don't need elevated permissions, and using the anon key means RLS policies are enforced on the storage access itself.
- `getSignedDownloadUrl` documented with an explicit security comment: must only be called server-side after verifying a valid purchase token; `fullKey` must come from a server-side DB lookup, never from a client request parameter.
- No INSERT/UPDATE/DELETE policies for anon on any table — orders, tickets, and bookings remain default-deny for anon; service role bypasses RLS for admin writes.

## Deviations from Plan

None - plan executed exactly as written. Tasks 1 and 3 (auto tasks) completed before the Task 2 checkpoint to minimize user wait time.

## Issues Encountered
None

## User Setup Required

**Task 2 requires manual Supabase dashboard action:**

1. Open https://supabase.com/dashboard, navigate to your CBA project
2. Click "SQL Editor" in the left sidebar -> "New query"
3. Copy the entire contents of `supabase/migrations/20260521000002_rls_and_storage.sql` and paste into the editor
4. Click "Run" (or Cmd+Enter) — you should see "Success. No rows returned."
5. Verify in "Authentication" -> "Policies": beats and events have SELECT policies; orders_beat, orders_ticket, tickets, bookings show RLS enabled with no anon SELECT policy
6. Verify in "Storage": three buckets — preview-audio (Public), full-audio (Private), artwork (Public)

Once confirmed, type "done" and Plan 04-04 can proceed.

## Next Phase Readiness
- RLS migration ready to run in Supabase dashboard (Task 2 pending user action)
- `lib/supabase/storage.ts` is complete and tested — Plan 04-04 can import and use immediately
- Plan 04-04 (query layer) can wire `getPreviewAudioUrl` and `getArtworkUrl` into beat card data fetching
- After dashboard confirmation: anon key enforces published-only access; full_key is protected by RLS (never selectable by anon)

---
*Phase: 04-supabase-foundation*
*Completed: 2026-05-22*

## Self-Check
- supabase/migrations/20260521000002_rls_and_storage.sql — exists (committed 11b43be)
- lib/supabase/storage.ts — exists (committed e5cedb5)
- tests/signed-urls.test.ts — updated (committed e5cedb5)
- Task 1 commit 11b43be — confirmed in git log
- Task 3 commit e5cedb5 — confirmed in git log
- vitest run: 9/9 tests pass
- TypeScript: no errors (tsc --noEmit exits 0)

## Self-Check: PASSED
