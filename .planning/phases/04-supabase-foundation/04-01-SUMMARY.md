---
phase: 04-supabase-foundation
plan: 01
subsystem: database
tags: [supabase, typescript, vitest, ssr, middleware, cookies]

# Dependency graph
requires: []
provides:
  - Browser-safe Supabase client (createBrowserClient via @supabase/ssr)
  - SSR-safe server Supabase client (createServerClient with cookie adapter)
  - Service-role admin client (no NEXT_PUBLIC_ prefix on service role key)
  - middleware.ts wired for session cookie refresh on every request
  - vitest config and test stubs defining verification contracts for Plans 04-03 and 04-04
affects:
  - 04-02-PLAN (SQL migrations need connection layer)
  - 04-03-PLAN (Storage/signed URLs use service client)
  - 04-04-PLAN (query layer tests fill in stubs created here)
  - 06-admin-dashboard (Auth uses server client from this layer)

# Tech tracking
tech-stack:
  added: ["@supabase/supabase-js@2", "@supabase/ssr@0.10", "vitest@4"]
  patterns:
    - Three-client pattern (browser/server/service) — one factory per runtime context
    - SSR cookie adapter with getAll/setAll — required for Next.js App Router
    - Service role key always server-only (never NEXT_PUBLIC_ prefix)
    - middleware.ts calls auth.getUser() on every request to keep session fresh

key-files:
  created:
    - lib/supabase/client.ts
    - lib/supabase/server.ts
    - lib/supabase/service.ts
    - middleware.ts
    - vitest.config.ts
    - tests/beats-queries.test.ts
    - tests/signed-urls.test.ts
    - tests/rls.test.ts
  modified:
    - package.json

key-decisions:
  - "Three-client pattern: browser client for client components, server client for server components/routes, service client for admin writes"
  - "Service role key uses SUPABASE_SERVICE_ROLE_KEY (no NEXT_PUBLIC_ prefix) — never exposed to browser"
  - "vitest test stubs created as todos to define contract before implementation (TDD Wave 0)"
  - "middleware.ts matcher excludes _next/static, _next/image, favicon.ico to avoid overhead on static assets"

patterns-established:
  - "Import createClient from lib/supabase/client.ts for browser components"
  - "Import createClient from lib/supabase/server.ts (async) for server components and API routes"
  - "Import createServiceClient from lib/supabase/service.ts for admin writes only"
  - "Test stubs use it.todo() — no implementation needed until referenced plan"

requirements-completed: [BE-01]

# Metrics
duration: 12min
completed: 2026-05-21
---

# Phase 4 Plan 01: Supabase Foundation Summary

**Three Supabase client factories (browser/server/service-role) plus session-refresh middleware and vitest test stubs establishing the verification contract for all subsequent backend plans**

## Performance

- **Duration:** 12 min
- **Started:** 2026-05-21T23:32:00Z
- **Completed:** 2026-05-21T23:44:00Z
- **Tasks:** 2 (Task 0 was pre-completed by user before execution)
- **Files modified:** 9

## Accomplishments
- Installed @supabase/supabase-js and @supabase/ssr packages
- Created three client factories covering all runtime contexts (browser, SSR, service-role)
- Wired middleware.ts to refresh session cookies on every request via auth.getUser()
- Installed vitest and created three test stub files defining the contract for Plans 04-03 and 04-04
- All 13 test stubs run as todos with vitest exit 0 and TypeScript compiles cleanly

## Task Commits

Each task was committed atomically:

1. **Task 0: Create Supabase project and populate .env.local** - pre-completed by user (no commit needed)
2. **Task 1: Install packages, create client factories, wire middleware** - `bc959e1` (feat)
3. **Task 2: Install vitest and write test stubs** - `cf4dcae` (chore)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `lib/supabase/client.ts` - Browser-safe client factory using createBrowserClient
- `lib/supabase/server.ts` - Async SSR-safe client factory with getAll/setAll cookie adapter
- `lib/supabase/service.ts` - Service-role admin client (SUPABASE_SERVICE_ROLE_KEY, never NEXT_PUBLIC_)
- `middleware.ts` - Session refresh on every request, matcher excludes static assets
- `vitest.config.ts` - Node environment, @ alias resolving to project root
- `tests/beats-queries.test.ts` - 6 todo stubs for Plan 04-04 query layer
- `tests/signed-urls.test.ts` - 3 todo stubs for Plan 04-03 URL helper
- `tests/rls.test.ts` - 4 todo stubs for BE-01 RLS behavior
- `package.json` - Added "test": "vitest run" script; Supabase packages added to dependencies

## Decisions Made
- Three-client pattern isolates runtime boundaries: browser components use client.ts, server components/routes use server.ts, admin operations use service.ts
- Service role key kept strictly server-side with no NEXT_PUBLIC_ prefix — confirmed in verification grep
- Test stubs use it.todo() so vitest exits 0 without needing real DB or implementations

## Deviations from Plan

None - plan executed exactly as written. Task 0 (human-action checkpoint) was already satisfied — .env.local was populated before execution began.

## Issues Encountered
None

## User Setup Required

.env.local was already populated with all three required environment variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

No further setup required for this plan.

## Next Phase Readiness
- Supabase connection layer is complete and type-checked
- middleware.ts is in place for session management
- Test stubs define the shape and security contract for Plans 04-03 and 04-04
- Plan 04-02 (SQL migrations) can proceed immediately — connection layer is ready

---
*Phase: 04-supabase-foundation*
*Completed: 2026-05-21*
