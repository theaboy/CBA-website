# CBA API

Node.js/TypeScript Express API for the CBA (Chris Brown Audio) platform.

## Stack

- **Runtime**: Node.js + TypeScript (tsx for dev, tsup for build)
- **Framework**: Express 5
- **ORM**: Prisma 6 + PostgreSQL
- **Auth**: JWT (jsonwebtoken + bcrypt)
- **Storage**: Supabase Storage (signed URLs for private full-audio downloads)
- **Validation**: Zod

## Getting Started

1. Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run database migrations:
   ```bash
   npm run db:migrate
   ```

4. Seed the admin user:
   ```bash
   npm run db:seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The API runs on `http://localhost:3001` by default.

## Supabase Storage Note

The API uses `SUPABASE_SERVICE_ROLE_KEY` server-side to generate short-lived signed URLs from the private `full-audio` bucket. Keep the service role key out of frontend code and only expose public bucket URLs from the Next.js app.

## Admin Auth Note

Admin JWTs are signed with `HS256`, require a `JWT_SECRET` of at least 32 characters, and validate `JWT_ISSUER` / `JWT_AUDIENCE` claims. The defaults are `cba-api` and `cba-admin`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled server |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed admin user |
| `npm run db:generate` | Regenerate Prisma client |

## Project Structure

```
src/
  index.ts            — Express app entry point
  lib/
    prisma.ts         — Prisma singleton
  middleware/
    errorHandler.ts   — Global error handler
  routes/
    health.ts         — Health check endpoint
prisma/
  schema.prisma       — Database schema
  seed.ts             — Admin user seed
```
