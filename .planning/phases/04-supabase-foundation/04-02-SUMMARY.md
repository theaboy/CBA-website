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

patterns-established:
  - "Migration files live in supabase/migrations/ and are run manually via Supabase Dashboard SQL Editor"
  - "Public queries on beats must use .select('id, slug, title, tagline, bpm, musical_key, genre, mood, price_basic, price_premium, price_exclusive, preview_key, artwork_key, tags, best_for, mix_palette, featured, is_exclusive_sold, play_count, published, created_at') — never select(*)"

requirements-completed: [BE-01]

# Metrics
duration: 4min
completed: 2026-05-22
---

# Phase 4 Plan 02: Initial Schema Migration Summary

**Complete PostgreSQL schema for all 6 CBA tables (beats, events, orders_beat, orders_ticket, tickets, bookings) with 3 enums, 6 indexes, and 3 seed beats — committed as reproducible migration file**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-22T03:46:58Z
- **Completed:** 2026-05-22T03:50:00Z
- **Tasks:** 1 of 2 auto-completed (Task 2 is human-action: run in Supabase dashboard)
- **Files modified:** 1

## Accomplishments
- Created `supabase/migrations/` directory and wrote the complete initial schema migration
- All 6 tables defined with correct column types, foreign key references, and constraints
- beats table includes price_basic, price_premium, price_exclusive (tiered licensing model)
- full_key column documented with inline SQL comment warning against public query exposure
- 3 seed beats inserted: after-hours-anthem (Trap, featured), north-line (Drill, featured), golden-frequency (Afro)

## Task Commits

Each task was committed atomically:

1. **Task 1: Write complete SQL migration file** - `6230196` (feat)
2. **Task 2: Run migration in Supabase dashboard** - human-action checkpoint (no commit — user runs SQL in dashboard)

**Plan metadata:** see docs commit below

## Files Created/Modified
- `supabase/migrations/20260521000001_initial_schema.sql` - Complete schema: 3 enums, 6 tables, 6 indexes, 3 seed beats

## Decisions Made
- Seed data uses placeholder storage keys (e.g., `preview/after-hours-anthem.mp3`) because real audio/artwork uploads happen in Phase 6 admin. The frontend can render cards and prices without real files.
- full_key column has an SQL block comment marking it server-side only — complements the 04-01 pattern where all public queries must use explicit column selects.
- No Supabase CLI migration tooling set up — migration is manually run via dashboard SQL Editor. This is intentional for the free-tier Supabase project where direct CLI access may not be configured.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required

**Manual action required.** Task 2 is a human-action checkpoint:

1. Go to https://supabase.com/dashboard
2. Open your CBA project
3. Click "SQL Editor" in the left sidebar
4. Click "New query"
5. Copy the full contents of `supabase/migrations/20260521000001_initial_schema.sql` and paste it
6. Click "Run" (or Cmd+Enter)
7. Go to "Table Editor" — verify all 6 tables appear: beats, events, orders_beat, orders_ticket, tickets, bookings
8. Click "beats" table — confirm 3 seed rows exist and columns include price_basic, price_premium, price_exclusive

## Next Phase Readiness
- Migration file is in the repo and reproducible
- Once user runs the migration in Supabase, the tables are live
- Plan 04-03 (Storage buckets + RLS policies) can proceed after tables are confirmed live
- Plan 04-04 (query layer) targets the beats and events tables defined here

---
*Phase: 04-supabase-foundation*
*Completed: 2026-05-22*
