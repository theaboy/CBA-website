---
phase: 04-backend-foundation
plan: 02
subsystem: auth
tags: [jwt, bcrypt, express, rate-limiting, zod, typescript]

# Dependency graph
requires:
  - phase: 04-01
    provides: Express app skeleton, Prisma singleton, createError helper, AdminUser model

provides:
  - POST /admin/login endpoint with bcrypt password check and IP-based rate limiter (5/15min)
  - requireAuth middleware that validates Bearer JWTs and attaches admin payload to req.admin
  - AdminPayload interface and Express Request augmentation for req.admin

affects:
  - 04-03
  - 04-04
  - Any future admin CRUD routes that use requireAuth

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Timing-safe auth: bcrypt.compare always runs even when user is not found
    - Route-scoped rate limiting: loginLimiter applied only to POST /login, not all admin routes
    - Express Request augmentation via declare global namespace Express for typed req.admin
    - JWT error discrimination: JsonWebTokenError vs TokenExpiredError return distinct 401 messages

key-files:
  created:
    - /Users/bird/CBA-api/src/routes/admin/auth.ts
    - /Users/bird/CBA-api/src/middleware/auth.ts
  modified:
    - /Users/bird/CBA-api/src/index.ts

key-decisions:
  - "loginLimiter scoped to POST /login only — not applied to all admin routes to avoid rate-limiting legitimate API calls"
  - "adminAuthRouter mounted at /admin without requireAuth so login itself is publicly reachable"
  - "Comment block preserved in index.ts marking where future admin routers behind requireAuth will be added"

patterns-established:
  - "Timing-safe login: bcrypt.compare always executes regardless of user existence"
  - "JWT error type discrimination: handle JsonWebTokenError and TokenExpiredError separately"
  - "Route-scoped rate limiting: attach limiter only to the specific endpoint, not the entire router"

requirements-completed: [BE-02]

# Metrics
duration: 5min
completed: 2026-05-21
---

# Phase 4 Plan 02: Admin JWT Auth Summary

**POST /admin/login with timing-safe bcrypt check and 5/15min IP rate limiter, plus requireAuth middleware validating Bearer JWTs on all protected admin routes**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-05-21T22:21:18Z
- **Completed:** 2026-05-21T22:22:12Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- POST /admin/login endpoint with Zod validation, bcrypt password check (timing-safe), and JWT signing
- IP-based rate limiter: max 5 login attempts per 15 minutes, returns 429 with error message on breach
- requireAuth middleware: validates Bearer JWT, attaches AdminPayload to req.admin, discriminates JsonWebTokenError from TokenExpiredError
- index.ts updated to mount adminAuthRouter at /admin (public) with comment slots for future protected routes

## Task Commits

Each task was committed atomically:

1. **Task 1: Build POST /admin/login with bcrypt and rate limiter** - `01ffad8` (feat)
2. **Task 2: Build requireAuth middleware and wire admin routes into app** - `c4429c1` (feat)

**Plan metadata:** (pending docs commit)

## Files Created/Modified
- `src/routes/admin/auth.ts` - POST /admin/login: Zod body validation, timing-safe bcrypt compare, JWT signing, IP rate limiter scoped to this route
- `src/middleware/auth.ts` - requireAuth: validates Bearer JWT, attaches req.admin, handles token errors with appropriate 401 messages
- `src/index.ts` - Mounts adminAuthRouter at /admin (public); preserves comment slots for future admin routers behind requireAuth

## Decisions Made
- Rate limiter scoped to POST /login only, not the entire admin router — avoids penalizing legitimate API calls in later plans
- adminAuthRouter mounted without requireAuth guard so the login endpoint itself is reachable unauthenticated
- Comment block in index.ts documents exactly where Plans 03+ should mount their routers behind requireAuth

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## Admin Login Example

With a seeded admin user (email: admin@cba.local, password: changeme-in-production):

```bash
# Successful login — returns signed JWT
curl -X POST http://localhost:3001/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cba.local","password":"changeme-in-production"}'
# Response: {"token":"eyJ..."}

# Wrong password — 401
curl -X POST http://localhost:3001/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cba.local","password":"wrong"}'
# Response: {"error":"Invalid credentials"}

# Protected route without token — 401
curl http://localhost:3001/admin/some-route
# Response: {"error":"Unauthorized"}

# Protected route with expired/invalid token — 401
curl http://localhost:3001/admin/some-route \
  -H "Authorization: Bearer invalid.token.here"
# Response: {"error":"Unauthorized"}
```

## JWT Payload Shape

```json
{
  "sub": "<admin user UUID>",
  "email": "admin@cba.local",
  "iat": 1748736000,
  "exp": 1749340800
}
```

## User Setup Required

None — no external service configuration required beyond the JWT_SECRET env var already documented in 04-01.

## Next Phase Readiness
- requireAuth is exported and ready for Plans 04-03 and 04-04 to import and apply to their admin routers
- index.ts comment block marks exactly where new admin routers should be added behind requireAuth
- No blockers

---
*Phase: 04-backend-foundation*
*Completed: 2026-05-21*
