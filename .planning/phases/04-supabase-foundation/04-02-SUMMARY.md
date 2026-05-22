---
phase: 04-supabase-foundation
plan: 02
subsystem: database
tags: [supabase, postgres, sql, migrations, schema, beats, events, bookings]

# Dependency graph
requires:
  - phase: 04-01
    provides: Supabase connection layer (browser/server/service clients) + .env.local with project credentials
provides:
  - Reproducible SQL migration for all 6 tables (beats, events, orders_beat, orders_ticket, tickets, bookings)
  - 3 enum types: license_type, booking_type, booking_status
  - 6 performance indexes on beats and events tables
  - 3 seed beats with published=true for frontend development
  - beats table with price_basic, price_premium, price_exclusive (tiered licensing model)
  - full_key column on beats (private storage path — server-side only)
affects:
  - 04-03-PLAN (Storage/RLS policies reference these tables)
  - 04-04-PLAN (query layer targets beats/events tables created here)
  - 05-frontend (beats store queries beats table for catalog/playback)
  - 06-admin-dashboard (admin reads/writes all 6 tables)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - SQL migration file committed to repo for reproducibility — run via Supabase SQL Editor
    - full_key column documented in SQL with comment: must never appear in public queries
    - Tiered pricing model on beats (price_basic, price_premium, price_exclusive) — not a single price column
    - orders_beat.full_download_token is uuid — serves as download link token after payment
    - tickets.qr_token has unique constraint — used for event check-in scanning

key-files:
  created:
    - supabase/migrations/20260521000001_initial_schema.sql
  modified: []

key-decisions:
  - "beats.full_key must never appear in public Supabase .select() — always use explicit column list omitting it"
  - "Three price columns (price_basic, price_premium, price_exclusive) model the licensing tiers directly in DB — not a JSON blob or lookup table"
  - "Seed data uses placeholder storage paths (preview/*, full/*, artwork/*) — real uploads happen in Phase 6 admin"
  - "RLS enabled via Supabase warning dialog before running migration — all 6 tables have RLS active from creation"

patterns-established:
  - "Migration files live in supabase/migrations/ and are run manually via Supabase Dashboard SQL Editor"
  - "Public queries on beats must use .select('id, slug, title, tagline, bpm, musical_key, genre, mood, price_basic, price_premium, price_exclusive, preview_key, artwork_key, tags, best_for, mix_palette, featured, is_exclusive_sold, play_count, published, created_at') — never select(*)"

requirements-completed: [BE-01]

# Metrics
duration: 4min
completed: 2026-05-22
---

# Phase 4 Plan 02: Initial Schema Migration Summary

**Complete PostgreSQL schema for all 6 CBA tables (beats, events, orders_beat, orders_ticket, tickets, bookings) with 3 enums, 6 indexes, and 3 seed beats — live in Supabase with RLS enabled on all tables**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-22T03:46:58Z
- **Completed:** 2026-05-22T03:50:00Z
- **Tasks:** 2 of 2 complete
- **Files modified:** 1

## Accomplishments
- Created `supabase/migrations/` directory and wrote the complete initial schema migration
- All 6 tables defined with correct column types, foreign key references, and constraints
- beats table includes price_basic, price_premium, price_exclusive (tiered licensing model)
- full_key column documented with inline SQL comment warning against public query exposure
- 3 seed beats inserted and visible in Supabase Table Editor: after-hours-anthem (Trap, featured), north-line (Drill, featured), golden-frequency (Afro)
- RLS enabled on all 6 tables via Supabase warning dialog before running the migration

## Task Commits

Each task was committed atomically:

1. **Task 1: Write complete SQL migration file** - `6230196` (feat)
2. **Task 2: Run migration in Supabase dashboard** - human-action checkpoint (user confirmed: all 6 tables live, 3 seed beats visible, RLS enabled)

**Plan metadata:** `1d2130e` (docs: complete plan — checkpoint awaiting dashboard run)

## Files Created/Modified
- `supabase/migrations/20260521000001_initial_schema.sql` - Complete schema: 3 enums, 6 tables, 6 indexes, 3 seed beats

## Decisions Made
- Seed data uses placeholder storage keys (e.g., `preview/after-hours-anthem.mp3`) because real audio/artwork uploads happen in Phase 6 admin. The frontend can render cards and prices without real files.
- full_key column has an SQL block comment marking it server-side only — complements the 04-01 pattern where all public queries must use explicit column selects.
- No Supabase CLI migration tooling set up — migration is manually run via dashboard SQL Editor. This is intentional for the free-tier Supabase project where direct CLI access may not be configured.
- RLS was enabled via the Supabase warning dialog before running the migration — all 6 tables have Row Level Security active from the moment of creation (no gap period).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required

None - migration complete. All 6 tables are live in Supabase with RLS enabled and 3 seed beats visible in Table Editor.

## Next Phase Readiness
- All 6 tables are live in the Supabase project with correct schema, enums, indexes, and seed data
- RLS is enabled on all tables — 04-03 can now layer in the actual RLS policies
- Plan 04-03 (Storage buckets + RLS policies) can proceed immediately
- Plan 04-04 (query layer) targets the beats and events tables confirmed live here

---
*Phase: 04-supabase-foundation*
*Completed: 2026-05-22*

## Self-Check: PASSED
- supabase/migrations/20260521000001_initial_schema.sql — confirmed exists (committed at 6230196)
- Task 1 commit 6230196 — confirmed in git log
- Migration confirmed live by user: all 6 tables visible, 3 seed beats present, RLS enabled
