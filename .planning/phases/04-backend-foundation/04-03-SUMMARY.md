---
phase: 04-backend-foundation
plan: 03
subsystem: api
tags: [express, prisma, typescript, zod, beats, filtering, crud, jwt]

# Dependency graph
requires:
  - phase: 04-backend-foundation/04-01
    provides: Express skeleton, Prisma Beat model, createError helper, prisma singleton
  - phase: 04-backend-foundation/04-02
    provides: requireAuth middleware and adminAuthRouter already mounted in index.ts

provides:
  - Public GET /beats with server-side filtering by genre, mood, bpm range, price range, featured flag
  - Six sort modes (latest, popular, price-low, price-high, bpm-low, bpm-high)
  - Public GET /beats/:id returning beat detail or 404
  - Admin GET/POST/PUT/DELETE /beats behind requireAuth JWT guard
  - fullKey never exposed in any public response

affects: [04-04, 05-01, 05-02, 06-01, 06-02, 06-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Explicit select blocks on all public endpoints to prevent accidental field leakage"
    - "Prisma.Decimal conversion on write for all price fields; raw number accepted in request body"
    - "Two app.use('/admin', ...) calls stack correctly in Express — auth router handles login, beats router handles CRUD"

key-files:
  created:
    - /Users/bird/CBA-api/src/routes/beats.ts
    - /Users/bird/CBA-api/src/routes/admin/beats.ts
  modified:
    - /Users/bird/CBA-api/src/index.ts

key-decisions:
  - "fullKey excluded from all public responses via explicit select — only previewKey/artworkKey exposed; fullKey reserved for post-purchase download (Phase 5)"
  - "Admin PUT uses beatBodySchema.partial() so callers can send only changed fields; still validates all provided fields"
  - "Admin beats mounted as second app.use('/admin') call after requireAuth — Express stacks them correctly; login remains unprotected"

patterns-established:
  - "Public select: always enumerate fields explicitly — new Beat model columns don't auto-leak to public API"
  - "Price writes always convert to Prisma.Decimal — avoids floating-point precision errors in database"

requirements-completed: [BE-03]

# Metrics
duration: 8min
completed: 2026-05-21
---

# Phase 4 Plan 03: Beat Catalog API Summary

**Beat catalog API with server-side filtering/sorting on GET /beats and protected admin CRUD — fullKey never exposed in public responses**

## Performance

- **Duration:** 8 min
- **Started:** 2026-05-21T22:22:34Z
- **Completed:** 2026-05-21T22:23:43Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Built public `GET /beats` with filtering by genre, mood, bpmMin/bpmMax, priceMin/priceMax, featured and six sort modes
- Built public `GET /beats/:id` returning beat detail or 404, with fullKey excluded from response
- Built admin CRUD (GET/POST/PUT/DELETE at /admin/beats) behind requireAuth JWT guard, with zod validation and Decimal price conversion
- Updated index.ts to mount beatsRouter at /beats and adminBeatsRouter behind requireAuth at /admin

## Task Commits

Each task was committed atomically:

1. **Task 1: Build public GET /beats and GET /beats/:id endpoints** - `afe0a0a` (feat)
2. **Task 2: Build admin beat CRUD and wire all routes into app** - `f4f716e` (feat)

## Files Created/Modified
- `/Users/bird/CBA-api/src/routes/beats.ts` — Public read endpoints with filtering, sorting, explicit select (fullKey excluded)
- `/Users/bird/CBA-api/src/routes/admin/beats.ts` — Admin CRUD with zod validation, Decimal price conversion, 404 on missing beats
- `/Users/bird/CBA-api/src/index.ts` — Mounts beatsRouter at /beats; mounts adminBeatsRouter at /admin behind requireAuth

## Decisions Made
- **fullKey excluded from public select:** Only previewKey and artworkKey are included in public responses. fullKey is reserved for post-purchase download generation in Phase 5.
- **Admin PUT uses `.partial()`:** Allows callers to update only changed fields while still validating all provided fields through zod. Existing beat fetched first to confirm it exists (404 if not).
- **Two `app.use('/admin', ...)` calls:** Express stacks route handlers — the first handles login (no auth), the second handles beats admin routes (behind requireAuth). This is idiomatic Express and avoids a single monolithic admin router.

## Deviations from Plan

None - plan executed exactly as written.

Note: Plan 02 (admin JWT auth) appeared incomplete based on git log showing only Plan 01 commits in STATE.md, but upon inspection all Plan 02 files (`src/middleware/auth.ts`, `src/routes/admin/auth.ts`, updated `src/index.ts`) were already tracked and committed (`01ffad8`, `c4429c1`). STATE.md was outdated. No work needed — proceeded directly with Plan 03.

## Issues Encountered

None.

## Curl Examples

**List all beats:**
```bash
curl http://localhost:3001/beats
# Returns: {"beats":[...]}
```

**Filter by genre and sort by price (high to low):**
```bash
curl "http://localhost:3001/beats?genre=Trap&sort=price-high"
```

**Filter by BPM range and mood:**
```bash
curl "http://localhost:3001/beats?bpmMin=120&bpmMax=150&mood=Cinematic"
```

**Filter featured beats:**
```bash
curl "http://localhost:3001/beats?featured=true&sort=popular"
```

**Get beat by ID:**
```bash
curl http://localhost:3001/beats/BEAT_ID
# Returns: {"beat":{...}} or 404 {"error":"Beat not found"}
```

**Unauthenticated admin request (returns 401):**
```bash
curl -X POST http://localhost:3001/admin/beats \
  -H "Content-Type: application/json" \
  -d '{"slug":"test-beat"}'
# Returns: {"error":"Unauthorized"}
```

**Admin beat creation (with JWT token):**
```bash
# First, get a token:
TOKEN=$(curl -s -X POST http://localhost:3001/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cba.local","password":"changeme-in-production"}' | jq -r .token)

# Then create a beat:
curl -X POST http://localhost:3001/admin/beats \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "slug": "midnight-drip",
    "title": "Midnight Drip",
    "tagline": "Smooth nocturnal trap",
    "description": "A late-night trap beat with heavy 808s and melodic keys",
    "bpm": 140,
    "musicalKey": "F# minor",
    "genre": "Trap",
    "mood": "Nocturnal",
    "priceBasic": 29.99,
    "pricePremium": 59.99,
    "priceExclusive": 299.99,
    "previewKey": "beats/midnight-drip/preview.mp3",
    "fullKey": "beats/midnight-drip/full.wav",
    "artworkKey": "beats/midnight-drip/artwork.jpg",
    "tags": ["trap", "808", "melodic"],
    "bestFor": ["rap", "drill"],
    "mixPalette": ["dark", "smooth"],
    "featured": false
  }'
# Returns: 201 {"beat":{...}}
```

## Next Phase Readiness

- Plan 04 (S3 signed URLs) can start immediately — will wrap previewKey and artworkKey from these endpoints into signed URLs
- beatsRouter select blocks are already structured to be extended by Plan 04 (previewKey replaced with signedPreviewUrl)
- Admin beats router is complete; no changes needed in Plan 04 for admin endpoints

---
*Phase: 04-backend-foundation*
*Completed: 2026-05-21*
