---
phase: 04-backend-foundation
plan: 01
subsystem: api
tags: [node, express, prisma, postgresql, typescript, s3, jwt]

# Dependency graph
requires:
  - phase: 03-beat-detail-and-inquiry
    provides: Beat type definition from frontend catalog used to design Prisma Beat model

provides:
  - Express 5 API server at /Users/bird/CBA-api with health endpoint
  - Prisma 6 schema with all 7 models and 3 enums
  - PrismaClient singleton for use across all route files
  - Global error handler and createError helper
  - Admin seed script creating admin user from env vars
  - Build pipeline compiling TypeScript to dist/ via tsup

affects: [04-02, 04-03, 04-04, 05-01, 05-02, 06-01, 06-02, 06-03]

# Tech tracking
tech-stack:
  added:
    - express@5.0.1
    - prisma@6.0.0 (in dependencies, not devDependencies — required for Railway/Render deploy)
    - "@prisma/client@6.0.0"
    - bcrypt@5.1.1
    - jsonwebtoken@9.0.2
    - express-rate-limit@7.4.1
    - cors@2.8.5
    - "@aws-sdk/client-s3@3.700.x"
    - "@aws-sdk/s3-request-presigner@3.700.x"
    - zod@3.23.8
    - dotenv@16.4.5
    - tsx@4.19.0
    - tsup@8.3.0
    - typescript@5.7.0
  patterns:
    - "Prisma singleton via globalThis prevents connection pool exhaustion in dev hot reload"
    - "S3 keys stored in DB (never public URLs) — signed URLs generated at request time"
    - "Beat prices split into priceBasic/pricePremium/priceExclusive Decimal columns"
    - "errorHandler must be the last app.use() call in Express"
    - "prisma in dependencies (not devDependencies) for Railway/Render pre-deploy migrate step"

key-files:
  created:
    - /Users/bird/CBA-api/package.json
    - /Users/bird/CBA-api/tsconfig.json
    - /Users/bird/CBA-api/.env.example
    - /Users/bird/CBA-api/README.md
    - /Users/bird/CBA-api/.gitignore
    - /Users/bird/CBA-api/prisma/schema.prisma
    - /Users/bird/CBA-api/prisma/seed.ts
    - /Users/bird/CBA-api/src/index.ts
    - /Users/bird/CBA-api/src/lib/prisma.ts
    - /Users/bird/CBA-api/src/middleware/errorHandler.ts
    - /Users/bird/CBA-api/src/routes/health.ts
  modified: []

key-decisions:
  - "prisma kept in dependencies (not devDependencies) — Railway/Render prune devDependencies before pre-deploy prisma migrate runs"
  - "S3 keys (previewKey, fullKey, artworkKey) stored in Beat model — public URL access disabled, signed URLs generated per request"
  - "Beat prices modeled as three separate Decimal columns (priceBasic, pricePremium, priceExclusive) matching frontend BeatLicenseCode type"
  - "Admin seed reads ADMIN_EMAIL/ADMIN_PASSWORD from env vars with safe local defaults — idempotent (skips if user exists)"
  - "Use IAM user credentials (not IAM role) for AWS — role session tokens expire independently of expiresIn on Railway/Render"
  - "Database migration skipped in this plan — requires live PostgreSQL instance; documented for operator to run post-deploy"

patterns-established:
  - "Prisma singleton: globalForPrisma pattern prevents multiple PrismaClient instances in tsx watch mode"
  - "Error response shape: { error: string } — all errors (4xx, 5xx, 404) use same JSON envelope"
  - "createError(message, statusCode) helper for throwing typed errors from any route"

requirements-completed: [BE-01]

# Metrics
duration: 18min
completed: 2026-05-21
---

# Phase 4 Plan 01: Backend Foundation Summary

**Express 5 + Prisma 6 API skeleton with complete PostgreSQL schema (7 models, 3 enums), health endpoint, and admin seed script — ready to deploy on Railway or Render**

## Performance

- **Duration:** 18 min
- **Started:** 2026-05-21T22:05:00Z
- **Completed:** 2026-05-21T22:23:00Z
- **Tasks:** 3
- **Files modified:** 11

## Accomplishments
- Scaffolded complete Node.js/TypeScript project at /Users/bird/CBA-api with Express 5, Prisma 6, and all required dependencies
- Created full Prisma schema with 7 models (Beat, AdminUser, Event, OrderBeat, OrderTicket, Ticket, Booking) and 3 enums
- Built Express server with CORS, JSON parsing, /health endpoint, 404 handler, and global error handler

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold project structure and install dependencies** - `6cc65f7` (chore)
2. **Task 2: Write Prisma schema with all models** - `5fbbbc2` (feat)
3. **Task 3: Build Express server with health endpoint and error handler** - `d06e9ff` (feat)

## Files Created/Modified
- `/Users/bird/CBA-api/package.json` — project config with all dependencies; prisma in dependencies not devDependencies
- `/Users/bird/CBA-api/tsconfig.json` — TypeScript config targeting ES2022/CommonJS
- `/Users/bird/CBA-api/.env.example` — all required environment variable keys
- `/Users/bird/CBA-api/README.md` — setup docs including IAM user vs role credential note
- `/Users/bird/CBA-api/.gitignore` — excludes node_modules, dist, .env
- `/Users/bird/CBA-api/prisma/schema.prisma` — complete database schema with all models and enums
- `/Users/bird/CBA-api/prisma/seed.ts` — idempotent admin user seeder reading from env vars
- `/Users/bird/CBA-api/src/index.ts` — Express 5 entry point with middleware, routes, error handler
- `/Users/bird/CBA-api/src/lib/prisma.ts` — PrismaClient singleton preventing hot-reload connection pool exhaustion
- `/Users/bird/CBA-api/src/middleware/errorHandler.ts` — global error handler + createError helper
- `/Users/bird/CBA-api/src/routes/health.ts` — GET /health returning { status: 'ok', timestamp }

## Decisions Made
- **prisma in dependencies:** Railway and Render prune devDependencies before running prisma migrate in the pre-deploy step — if prisma is in devDependencies the deploy command fails silently.
- **S3 keys not URLs:** Beat model stores S3 object keys (previewKey, fullKey, artworkKey), never public URLs. Signed URLs are generated at request time with time limits.
- **Three price columns:** priceBasic, pricePremium, priceExclusive as separate Decimal(10,2) columns — maps cleanly to BeatLicenseCode from the frontend catalog type without needing runtime multipliers.
- **IAM user over IAM role:** Documented in README — role session credentials expire on their own schedule when deployed on managed platforms, causing mid-session S3 failures.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

- **Port 3001 occupied:** During verification, port 3001 was already in use by another local Node process (CraftyCrib project). Tested on port 3099 instead — server started correctly, health and 404 endpoints responded as expected. This is a local dev environment conflict only; the deployed server will bind to whatever PORT env var is set.
- **prisma validate requires DATABASE_URL:** `npx prisma validate` errors without a DATABASE_URL env var set. Ran with `DATABASE_URL="postgresql://user:password@localhost:5432/cba_db"` prefix — schema validated successfully.

## Database Migration Status

**Migration NOT run** — `prisma migrate dev` requires a live PostgreSQL instance with DATABASE_URL set. The schema is complete and validated. To initialize a real database:

```bash
cd /Users/bird/CBA-api
cp .env.example .env
# Edit .env with real DATABASE_URL
npm run db:migrate   # Creates all tables
npm run db:seed      # Creates admin user
```

## User Setup Required

Before running the API:

1. Copy `.env.example` to `.env` in `/Users/bird/CBA-api`
2. Set `DATABASE_URL` to a real PostgreSQL connection string
3. Set `JWT_SECRET` to a long random string
4. Set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` from an IAM user (not role)
5. Set `S3_BUCKET_NAME` to your S3 bucket
6. Run `npm run db:migrate` then `npm run db:seed`

## Next Phase Readiness

- API skeleton complete — Phase 4 Plan 2 (admin JWT auth) can start immediately
- All route files will import `prisma` from `src/lib/prisma.ts`
- All thrown errors should use `createError(message, statusCode)` from `src/middleware/errorHandler.ts`
- No blockers

---
*Phase: 04-backend-foundation*
*Completed: 2026-05-21*
