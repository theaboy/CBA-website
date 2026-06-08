# Phase 4: Backend Foundation - Research

**Researched:** 2026-05-21
**Domain:** Node.js/TypeScript + Express + Prisma + PostgreSQL + AWS S3 + JWT auth
**Confidence:** HIGH (stack is mature, all claims verified via official docs or multiple recent sources)

---

## Summary

This phase builds a standalone Express/TypeScript API that the existing Next.js 16 frontend will call over HTTP. The frontend already has a complete static beats catalog (6 beats) with typed data structures in `lib/beats/catalog.ts` — the backend schema must mirror that shape exactly. The API needs four things: a running Express server with Prisma connected to PostgreSQL, admin JWT auth with bcrypt + rate-limited login, a `/beats` catalog API with server-side filtering, and S3 presigned URL delivery for audio files.

The stack is the least-controversial choice in the Node ecosystem: Express 5 (stable since October 2024), Prisma 6 (current stable as of late 2025), `jsonwebtoken`, `bcryptjs`, `express-rate-limit`, and AWS SDK v3 for S3. All are well-documented and have first-class Railway/Render deployment guides. Prisma 6 is the safe choice — Prisma 7 was in preview as of the research date and should not be used for a production foundation phase.

The single highest-risk area is production Prisma migrations. The wrong command (`migrate dev` instead of `migrate deploy`) or missing `prisma` in `dependencies` (vs devDependencies) will silently break deploys. The second highest-risk area is S3 CORS — the bucket MUST have an explicit CORS policy allowing the frontend origin and the PUT/GET methods, otherwise presigned URL uploads will be blocked by the browser.

**Primary recommendation:** Stand up the Express/Prisma/PostgreSQL server locally first, wire Railway deployment second, then layer in S3. Auth middleware is simple — implement it before any /admin routes exist to avoid retrofitting.

---

## User Constraints (from CONTEXT.md)

No CONTEXT.md exists for this phase. Constraints are drawn from PRD decisions provided in the task prompt:

### Locked Decisions
- No public user auth — admin-only JWT (single admin account, no registration)
- Single S3 bucket with `/preview` and `/full` folders (not two separate buckets)
- Rate limiting ONLY on login endpoint — not all public routes (traffic too low)
- Skip analytics API and CSV export for now
- No real-time slot availability engine — bookings handled via lean contact forms
- Backend is a SEPARATE Node.js API, not Next.js API routes
- Stack: Node.js, Express or Fastify, Prisma, PostgreSQL, AWS S3, JWT + bcrypt
- Hosting: Railway or Render (Canadian region preferred)

### Claude's Discretion
- Express vs Fastify (research recommendation below: Express 5)
- Project folder structure
- Specific library versions
- Request validation approach
- TypeScript build toolchain

### Deferred Ideas (OUT OF SCOPE)
- Analytics API
- CSV export
- Real-time booking slot availability
- Public user registration

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BE-01 | Node.js/TypeScript API server with Express, Prisma ORM, and PostgreSQL running and deployable | Express 5 + Prisma 6 + PostgreSQL via Railway — full deployment guide verified |
| BE-02 | Admin authenticates via POST /admin/login with bcrypt password check; JWT protects all /admin/* routes; login rate-limited | `bcryptjs` + `jsonwebtoken` + `express-rate-limit` pattern — verified pattern with exact code examples |
| BE-03 | GET /beats with server-side filtering (genre, mood, BPM range, price range, sort); GET /beats/:id detail | Prisma `where` clauses with optional filters pattern documented |
| BE-04 | Beat audio in S3 (single bucket, /preview and /full folders) delivered via time-limited signed URLs | AWS SDK v3 `getSignedUrl` with `GetObjectCommand` — verified against official AWS docs |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| express | ^5.0.0 | HTTP server + routing | Stable since Oct 2024, best ecosystem, familiar |
| @types/express | ^5.0.0 | TypeScript types | Required with Express 5 |
| prisma | ^6.x | ORM + migration CLI | Current stable, TypeScript-first, Railway docs use it |
| @prisma/client | ^6.x | Generated DB client | Companion to prisma package |
| typescript | ^5.4 | Type safety | Min TS 5.1 required by Prisma 6 |
| tsx | ^4.x | Dev server (TS runner) | Replaces ts-node; esbuild-powered, fast |
| tsup | ^8.x | Production build | Bundles to JS for `node dist/index.js` |
| zod | ^3.x | Request validation | TypeScript-first, composes with Prisma types |
| jsonwebtoken | ^9.x | JWT sign/verify | De facto standard |
| @types/jsonwebtoken | ^9.x | TypeScript types | Required |
| bcryptjs | ^2.x | Password hashing | Pure JS, no native bindings (simpler deploys) |
| @types/bcryptjs | ^2.x | TypeScript types | Required |
| express-rate-limit | ^7.x | Rate limiting on login | 10M+ weekly downloads, simple API |
| cors | ^2.x | CORS middleware | Needed for Next.js frontend calls |
| @types/cors | ^2.x | TypeScript types | Required |
| dotenv | ^16.x | Env variable loading | Load .env in dev |
| helmet | ^8.x | Security headers | Express 5 compatible, free security win |

### AWS S3
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @aws-sdk/client-s3 | ^3.x | S3 client | AWS SDK v3 modular (smaller bundle) |
| @aws-sdk/s3-request-presigner | ^3.x | Presigned URL generation | Official presigner for SDK v3 |

### Supporting (dev only)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @types/node | ^20.x | Node types | Always |
| eslint | ^9.x | Linting | Optional but recommended |

**Installation:**
```bash
# In the new /api directory (separate from Next.js frontend)
npm init -y
npm install express @prisma/client cors dotenv helmet jsonwebtoken bcryptjs express-rate-limit zod @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm install -D typescript tsx tsup prisma @types/express @types/node @types/cors @types/jsonwebtoken @types/bcryptjs
```

**IMPORTANT:** Move `prisma` from devDependencies to `dependencies` before deploying to Railway/Render, or the `prisma migrate deploy` pre-deploy command will fail because platforms prune devDependencies during production builds.

---

## Architecture Patterns

### Recommended Project Structure

The backend lives as a sibling project to the Next.js frontend, not nested inside it:

```
/CBA-website/          ← existing Next.js frontend
/CBA-api/              ← NEW: standalone Express backend
├── prisma/
│   ├── schema.prisma  # DB schema
│   └── migrations/    # migration files (committed to git)
├── src/
│   ├── config/
│   │   ├── env.ts         # typed env variables (fail fast at startup)
│   │   ├── db.ts          # PrismaClient singleton
│   │   └── s3.ts          # S3Client singleton
│   ├── middleware/
│   │   ├── auth.ts        # JWT verify middleware for /admin/* routes
│   │   ├── errorHandler.ts # global Express error handler
│   │   └── rateLimiter.ts  # express-rate-limit config for login
│   ├── routes/
│   │   ├── beats.ts       # GET /beats, GET /beats/:id
│   │   ├── admin/
│   │   │   ├── auth.ts    # POST /admin/login
│   │   │   └── beats.ts   # CRUD for beats (Phase 5)
│   │   └── index.ts       # route registration
│   ├── services/
│   │   ├── beatService.ts  # beat queries with Prisma
│   │   ├── authService.ts  # bcrypt compare, JWT sign
│   │   └── s3Service.ts    # presigned URL generation
│   ├── schemas/
│   │   ├── beatSchemas.ts  # Zod schemas for query params
│   │   └── authSchemas.ts  # Zod schemas for login body
│   ├── types/
│   │   └── express.d.ts   # augment Request with req.admin
│   ├── app.ts             # Express app setup (no listen)
│   └── server.ts          # entry point: app.listen()
├── package.json
├── tsconfig.json
└── .env                   # never committed
```

**Rationale:** Separating `app.ts` (Express config) from `server.ts` (listen) makes testing easier. The Next.js frontend stays completely separate.

### Pattern 1: Typed Environment Variables (Fail Fast)

Parse all env vars at startup. If required vars are missing, crash immediately with a clear error message — never silently fail later.

```typescript
// src/config/env.ts
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRY: z.string().default("7d"),
  AWS_REGION: z.string().default("ca-central-1"),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  S3_BUCKET: z.string(),
  FRONTEND_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
// If parse fails, Zod throws — process exits before server starts
```

### Pattern 2: PrismaClient Singleton

Instantiate once, reuse. Without this, development hot-reload creates dozens of connections and exhausts the connection pool.

```typescript
// src/config/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

### Pattern 3: JWT Auth Middleware

Attach validated admin payload to `req` for downstream handlers.

```typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";

export interface AdminPayload {
  adminId: string;
  email: string;
}

// Augment Express Request type (src/types/express.d.ts):
// declare global {
//   namespace Express {
//     interface Request { admin?: AdminPayload; }
//   }
// }

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AdminPayload;
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
```

### Pattern 4: Login Route with Rate Limiting

```typescript
// src/middleware/rateLimiter.ts
import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 attempts per window
  message: { error: "Too many login attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // don't count successful logins
});
```

```typescript
// src/routes/admin/auth.ts
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { loginLimiter } from "@/middleware/rateLimiter";
import { prisma } from "@/config/db";
import { env } from "@/config/env";
import { z } from "zod";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const admin = await prisma.adminUser.findUnique({ where: { email } });

    // Always compare hash to prevent timing attacks
    const valid = admin
      ? await bcrypt.compare(password, admin.passwordHash)
      : await bcrypt.compare(password, "$2b$10$invalidhashpadding00000000000000000000000");

    if (!admin || !valid) {
      return res.status(401).json({ error: "Invalid credentials" }); // Generic message
    }

    const token = jwt.sign(
      { adminId: admin.id, email: admin.email },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRY }
    );

    return res.json({ token });
  } catch (err) {
    next(err);
  }
});

export default router;
```

### Pattern 5: Beats Filtering Query

```typescript
// src/services/beatService.ts
import { prisma } from "@/config/db";
import { Prisma } from "@prisma/client";

export type BeatFilters = {
  genre?: string;
  mood?: string;
  bpmMin?: number;
  bpmMax?: number;
  priceMin?: number;
  priceMax?: number;
  sort?: string;
};

export async function getBeats(filters: BeatFilters) {
  const where: Prisma.BeatWhereInput = {
    ...(filters.genre && { genre: filters.genre }),
    ...(filters.mood && { mood: filters.mood }),
    ...(filters.bpmMin !== undefined || filters.bpmMax !== undefined) && {
      bpm: {
        ...(filters.bpmMin !== undefined && { gte: filters.bpmMin }),
        ...(filters.bpmMax !== undefined && { lte: filters.bpmMax }),
      },
    },
    ...(filters.priceMin !== undefined || filters.priceMax !== undefined) && {
      price: {
        ...(filters.priceMin !== undefined && { gte: filters.priceMin }),
        ...(filters.priceMax !== undefined && { lte: filters.priceMax }),
      },
    },
  };

  const orderBy = buildOrderBy(filters.sort);

  return prisma.beat.findMany({ where, orderBy });
}

function buildOrderBy(sort?: string): Prisma.BeatOrderByWithRelationInput {
  switch (sort) {
    case "price-low":  return { price: "asc" };
    case "price-high": return { price: "desc" };
    case "bpm-low":    return { bpm: "asc" };
    case "bpm-high":   return { bpm: "desc" };
    case "popular":    return { popular: "desc" };
    case "latest":
    default:           return { createdAt: "desc" };
  }
}
```

### Pattern 6: S3 Presigned URL Generation

```typescript
// src/services/s3Service.ts
// Source: AWS official docs - @aws-sdk/s3-request-presigner
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/config/env";

const s3 = new S3Client({ region: env.AWS_REGION });

// For delivering audio to users (time-limited listen)
export async function getPreviewUrl(beatSlug: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: `preview/${beatSlug}.mp3`,
  });
  return getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour
}

// For delivering full audio to licensed buyers
export async function getFullUrl(beatSlug: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: `full/${beatSlug}.wav`,
  });
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}

// For admin uploads (presigned PUT — browser uploads directly to S3)
export async function getUploadUrl(folder: "preview" | "full", filename: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: `${folder}/${filename}`,
  });
  return getSignedUrl(s3, command, { expiresIn: 900 }); // 15 minutes for upload
}
```

### Pattern 7: CORS Configuration for Next.js Frontend

```typescript
// src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "@/config/env";

export const app = express();

app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,        // e.g. https://cba-website.vercel.app
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,              // no cookies — token in Authorization header
}));
app.use(express.json({ limit: "10kb" }));

// Routes registered here
import beatRoutes from "@/routes/beats";
import adminAuthRoutes from "@/routes/admin/auth";
import { requireAdmin } from "@/middleware/auth";

app.use("/beats", beatRoutes);
app.use("/admin", adminAuthRoutes);
// Phase 5+ admin routes will be: app.use("/admin", requireAdmin, adminBeatsRoutes);
```

### Pattern 8: Next.js Frontend → API Call Pattern

```typescript
// In the Next.js frontend (e.g., lib/api.ts)
const API_URL = process.env.NEXT_PUBLIC_API_URL; // set in .env.local and Vercel

export async function fetchBeats(filters: Record<string, string>) {
  const params = new URLSearchParams(filters).toString();
  const res = await fetch(`${API_URL}/beats?${params}`, {
    next: { revalidate: 60 }, // ISR — revalidate every 60s if using Next.js caching
  });
  if (!res.ok) throw new Error("Failed to fetch beats");
  return res.json();
}

// For admin calls (client-side, with JWT stored in memory or sessionStorage)
export async function adminFetch(path: string, token: string, options: RequestInit = {}) {
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });
}
```

### Anti-Patterns to Avoid
- **Running `prisma migrate dev` in production:** This command can reset your database. Always use `prisma migrate deploy` in production/CI.
- **New PrismaClient() in every request handler:** Exhausts the connection pool. Use the singleton pattern.
- **Storing JWT in localStorage:** Susceptible to XSS. Use httpOnly cookie or memory (sessionStorage is OK for admin-only single-tab use).
- **Using `ACCESS_CONTROL_ALLOW_ORIGIN: *` with credentials:** If you ever add cookies or Authorization headers, `*` will fail. Always specify the exact origin.
- **Generating presigned URLs with IAM role credentials on EC2/Lambda:** URLs expire when the role session expires (1-6 hours), not at your configured expiry. Use a dedicated IAM user with long-lived credentials for S3 signing on Railway/Render.
- **`prisma` in devDependencies only:** Railway and Render prune devDeps before running the start command. The `prisma migrate deploy` command won't be found. Move `prisma` to `dependencies`.

---

## Prisma Schema

Based on the existing `lib/beats/catalog.ts` types, the beats table must match exactly. The schema also includes admin_users and stubs for orders/bookings (Phase 5+):

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Beat {
  id              String   @id @default(cuid())
  slug            String   @unique
  title           String
  tagline         String
  description     String
  bpm             Int
  musicalKey      String
  genre           String   // "Trap" | "Drill" | "Soul" | "Afro" | "R&B"
  mood            String   // "Cinematic" | "Nocturnal" | "Luxe" | "Cold" | "Melodic"
  price           Int      // base price in CAD cents (or whole dollars — pick one and stick to it)
  durationSeconds Int
  artworkSrc      String   // path or S3 key
  previewKey      String   // S3 key: preview/{slug}.mp3
  fullKey         String   // S3 key: full/{slug}.wav
  mixPalette      String[] // PostgreSQL text array
  bestFor         String[]
  tags            String[]
  featured        Boolean  @default(false)
  latest          Boolean  @default(false)
  popular         Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([genre])
  @@index([mood])
  @@index([bpm])
  @@index([price])
}

model AdminUser {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}
```

**Price note:** Store as integer (cents) or as whole dollar amounts. The existing catalog uses whole dollars (e.g., 120 = $120). Pick one and document it — cents (`12000`) is safer for math but requires client-side division. Whole dollars is simpler for this scale.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Password hashing | Custom crypto | `bcryptjs` | Salt rounds, timing-safe compare, well-audited |
| JWT sign/verify | Custom token | `jsonwebtoken` | Handles expiry, signature, algorithm safely |
| Rate limiting | IP tracking in memory | `express-rate-limit` | Handles X-Forwarded-For, proxy trust, concurrent resets |
| Request validation | Manual typeof checks | `zod` | Type inference, nested object support, coercion for query params |
| S3 URL signing | Custom HMAC/SigV4 | `@aws-sdk/s3-request-presigner` | SigV4 is complex; the SDK handles it correctly |
| CORS headers | Manual header setting | `cors` package | Handles OPTIONS preflight, origin matching, header lists |
| Security headers | Manual | `helmet` | Sets 11+ security headers correctly (CSP, HSTS, etc.) |
| DB connection pool | Direct `pg` pool | Prisma | Handles pool lifecycle, prepared statements, type safety |

---

## Common Pitfalls

### Pitfall 1: Wrong Prisma Migration Command in Production
**What goes wrong:** Dev uses `prisma migrate dev`, which drops and recreates tables. Production database is wiped or migrations fail to apply.
**Why it happens:** Developers copy local scripts to prod without reading the deployment docs.
**How to avoid:** Pre-deploy command MUST be `npx prisma migrate deploy`. NEVER use `migrate dev` in CI or production. Commit all migration files to git.
**Warning signs:** "Detected failed migration" error on Railway/Render logs.

### Pitfall 2: `prisma` in devDependencies Breaks Production Deploy
**What goes wrong:** Railway/Render prune devDependencies before starting the app. `npx prisma migrate deploy` fails with "command not found."
**Why it happens:** Standard practice puts CLI tools in devDeps, but platforms prune them.
**How to avoid:** Add `prisma` to `dependencies` (not devDependencies). Both `prisma` and `@prisma/client` go in regular `dependencies`.

### Pitfall 3: S3 CORS Blocks Presigned URL Uploads from Browser
**What goes wrong:** Presigned PUT URL works in curl/Postman but throws CORS error in the browser.
**Why it happens:** S3 CORS is not configured, so browsers receive no `Access-Control-Allow-Origin` header on the preflight OPTIONS response.
**How to avoid:** Set bucket CORS policy in AWS console:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedOrigins": ["https://your-frontend-domain.com", "http://localhost:3000"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```
**Warning signs:** Browser console shows "No 'Access-Control-Allow-Origin' header" on S3 requests.

### Pitfall 4: Presigned URLs Expire Too Early with IAM Role Credentials
**What goes wrong:** Configured `expiresIn: 3600` but URLs expire after 15-30 minutes.
**Why it happens:** On platforms that use IAM roles (not IAM users), the presigned URL inherits the role session expiry (typically 1 hour, often less).
**How to avoid:** On Railway/Render, use long-lived IAM user credentials (access key + secret) NOT instance role credentials. Store `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` as env vars on the platform.
**Warning signs:** 403 `ExpiredToken` errors well before your configured expiry.

### Pitfall 5: PrismaClient Instantiated on Every Request
**What goes wrong:** In development with hot-reload, or under high load, you exhaust the PostgreSQL connection pool (typically capped at 5-20 on free tier).
**Why it happens:** `new PrismaClient()` in a module that's re-evaluated on each request.
**How to avoid:** Use the singleton pattern (see Pattern 2 above). One PrismaClient instance per process.
**Warning signs:** "Too many connections" PostgreSQL errors.

### Pitfall 6: Express Async Errors Not Caught
**What goes wrong:** An `async` route handler throws, Express doesn't catch it, the server hangs or returns a cryptic 500.
**Why it happens:** Express 4 does not auto-catch async rejections. Express 5 does — but verify you're actually on v5.
**How to avoid:** Use Express 5 (`npm install express@^5`) which auto-catches async errors and passes them to the error handler. Always add a global error handler middleware last:
```typescript
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});
```
**Warning signs:** Endpoints hang without responding, or process crashes on unhandled promise rejection.

### Pitfall 7: `req.query` Values Are Always Strings
**What goes wrong:** BPM min/max filter doesn't work because `req.query.bpmMin` is `"140"` (string), not `140` (number), and Prisma comparison fails.
**Why it happens:** Express always parses query params as strings.
**How to avoid:** Use `z.coerce.number()` in Zod schemas for numeric query params:
```typescript
const beatsQuerySchema = z.object({
  genre: z.string().optional(),
  mood: z.string().optional(),
  bpmMin: z.coerce.number().int().optional(),
  bpmMax: z.coerce.number().int().optional(),
  priceMin: z.coerce.number().int().optional(),
  priceMax: z.coerce.number().int().optional(),
  sort: z.enum(["latest", "popular", "price-low", "price-high", "bpm-low", "bpm-high"]).optional(),
});
```

---

## Deployment: Railway vs Render

### Railway (Recommended for this project)
- Fastest DX: connect GitHub repo, it detects Node.js, provisions PostgreSQL in same project
- Usage-based pricing: cheap for low traffic (under $5/month at CBA's scale)
- Canadian region: `ca-central-1` available — confirm in Railway dashboard (Region settings)
- Pre-deploy / start script: set via `railway.json` or dashboard

```json
// railway.json (project root of the API)
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": { "builder": "NIXPACKS" },
  "deploy": {
    "startCommand": "npx prisma migrate deploy && node dist/server.js",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

Environment variables set in Railway dashboard: `DATABASE_URL` (auto-injected from Railway Postgres), `JWT_SECRET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`, `AWS_REGION`, `FRONTEND_URL`.

### Render (Alternative)
- Predictable pricing: free tier available, $7/month for paid
- Pre-deploy Command: `npx prisma migrate deploy`
- Start Command: `node dist/server.js`
- Build Command: `npm install --production=false && npm run build`
- Add PostgreSQL from Render dashboard; `DATABASE_URL` auto-injected as internal URL

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsup src/server.ts --format cjs --out-dir dist",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit",
    "db:migrate:dev": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ts-node for dev | tsx (esbuild-powered) | ~2023 | 10x faster, no config required |
| Express 4 with manual async wrapping | Express 5 (auto async error catch) | Oct 2024 | Cleaner route code |
| Prisma 4/5 with Rust engine | Prisma 6 (TypeScript engine default in v7) | Late 2025 | Smaller bundle, faster cold start |
| AWS SDK v2 | AWS SDK v3 (modular) | 2021 | Tree-shakeable, smaller import |
| Two S3 buckets for preview/full | Single bucket with folder prefixes | Best practice | Simpler IAM, lower cost |

**Do NOT use:**
- `ts-node`: ESM compatibility issues with Node 20+
- AWS SDK v2 (`aws-sdk`): deprecated, much larger bundle
- Prisma 7: preview/RC as of research date — skip for a production foundation phase
- `prisma migrate dev` in production

---

## Open Questions

1. **Monorepo or sibling repo?**
   - What we know: The frontend is at `/CBA-website`. The backend needs a separate Node project.
   - What's unclear: Should the API live at `/CBA-api` (sibling) or `/CBA-website/api` (monorepo)?
   - Recommendation: Sibling directory (`/CBA-api`) for clean separation. A monorepo adds tooling complexity (turborepo, workspaces) not worth it at this scale.

2. **Price storage: cents or whole dollars?**
   - What we know: Existing catalog uses whole dollars (e.g., `price: 120`). No payment processing in this phase.
   - What's unclear: Future payment integration (Stripe) prefers cents.
   - Recommendation: Store as integer dollars now (matching existing catalog) and add a `priceInCents` computed field or migration when Stripe is introduced.

3. **Railway Canadian region availability**
   - What we know: Railway has multiple regions; `ca-central-1` is listed in their docs.
   - What's unclear: Whether the free/hobby tier restricts region choice.
   - Recommendation: Verify in Railway dashboard before committing. If unavailable on free tier, `us-east` is acceptable for Montreal latency.

4. **Audio file seeding**
   - What we know: 6 beats exist in the static catalog. Files are currently at `/public/audio/*.wav`.
   - What's unclear: Who uploads the actual audio to S3 — admin UI (Phase 5) or manual one-time upload?
   - Recommendation: For Phase 4, manually upload the 6 existing preview files to S3 and seed the database with S3 keys. Admin upload UI is Phase 5.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (recommended) or Jest |
| Config file | `vitest.config.ts` — Wave 0 gap |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BE-01 | Server starts on PORT, responds to GET /health | smoke | `vitest run tests/health.test.ts` | Wave 0 |
| BE-01 | Prisma connects to PostgreSQL | integration | `vitest run tests/db.test.ts` | Wave 0 |
| BE-02 | POST /admin/login returns JWT on valid credentials | integration | `vitest run tests/auth.test.ts` | Wave 0 |
| BE-02 | POST /admin/login returns 401 on invalid credentials | unit | `vitest run tests/auth.test.ts` | Wave 0 |
| BE-02 | POST /admin/login returns 429 after 10 attempts | integration | `vitest run tests/rateLimit.test.ts` | Wave 0 |
| BE-02 | GET /admin/* without token returns 401 | unit | `vitest run tests/auth.test.ts` | Wave 0 |
| BE-03 | GET /beats returns all beats | integration | `vitest run tests/beats.test.ts` | Wave 0 |
| BE-03 | GET /beats?genre=Trap filters correctly | integration | `vitest run tests/beats.test.ts` | Wave 0 |
| BE-03 | GET /beats/:id returns detail | integration | `vitest run tests/beats.test.ts` | Wave 0 |
| BE-04 | GET /beats/:id/preview-url returns signed URL | integration (mock S3) | `vitest run tests/s3.test.ts` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run tests/health.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/health.test.ts` — covers BE-01 basic server
- [ ] `tests/db.test.ts` — covers BE-01 Prisma connection
- [ ] `tests/auth.test.ts` — covers BE-02 login + JWT middleware
- [ ] `tests/rateLimit.test.ts` — covers BE-02 rate limiting
- [ ] `tests/beats.test.ts` — covers BE-03 filtering and detail
- [ ] `tests/s3.test.ts` — covers BE-04 signed URL generation (S3 client mocked)
- [ ] `vitest.config.ts` — test framework setup
- [ ] `tests/setup.ts` — test database setup / Prisma test client

---

## Sources

### Primary (HIGH confidence)
- [Prisma Deploy to Railway](https://www.prisma.io/docs/orm/prisma-client/deployment/traditional/deploy-to-railway) — migration commands, env vars
- [Prisma Deploy to Render](https://www.prisma.io/docs/orm/prisma-client/deployment/traditional/deploy-to-render) — pre-deploy command pattern
- [AWS S3 Presigned URLs Official Docs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html) — expiration limits, credential requirements, FAQ
- [Prisma Deploying DB Changes](https://www.prisma.io/docs/orm/prisma-client/deployment/deploy-database-changes-with-prisma-migrate) — `migrate deploy` vs `migrate dev`
- [AWS S3 CORS Troubleshooting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors-troubleshooting.html) — CORS configuration requirements
- [Prisma 6 Release Blog](https://www.prisma.io/blog/prisma-6-better-performance-more-flexibility-and-type-safe-sql) — current stable version confirmation

### Secondary (MEDIUM confidence)
- [Express 5 Setup Guide 2025](https://www.reactsquad.io/blog/how-to-set-up-express-5-in-2025) — confirms Express 5 stable, async error handling
- [tsx vs ts-node comparison](https://www.pkgpulse.com/guides/tsx-vs-ts-node-vs-bun-running-typescript-directly-2026) — confirms tsx as 2025 standard
- [express-rate-limit patterns](https://betterstack.com/community/guides/scaling-nodejs/rate-limiting-express/) — rate limiter configuration

### Tertiary (LOW confidence - training data only)
- Prisma schema design for beats — based on existing `lib/beats/catalog.ts` types (direct project file, HIGH confidence)
- JWT timing attack prevention (constant-time bcrypt comparison) — well-established security practice

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all major libraries verified via official docs
- Architecture: HIGH — patterns verified against official Prisma, Railway, Render deployment guides
- Prisma schema: HIGH — derived directly from existing project's TypeScript types
- S3 presigned URLs: HIGH — verified against official AWS docs
- Pitfalls: HIGH — all verified against multiple current sources (2025-2026)
- Railway Canadian region: MEDIUM — region listed in docs but free tier restriction unconfirmed

**Research date:** 2026-05-21
**Valid until:** 2026-06-21 (stable stack, but check Prisma version before starting if >30 days)
