# CBA API

Node.js/TypeScript Express API for the CBA (Chris Brown Audio) platform.

## Stack

- **Runtime**: Node.js + TypeScript (tsx for dev, tsup for build)
- **Framework**: Express 5
- **ORM**: Prisma 6 + PostgreSQL
- **Auth**: JWT (jsonwebtoken + bcrypt)
- **Storage**: AWS S3 (signed URLs — never public bucket access)
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

## AWS Credentials Note

**Use IAM user credentials (not IAM role) for AWS.** Role session credentials (from instance profiles, assumed roles, etc.) expire independently of the configured `expiresIn` when deployed on Railway or Render. This causes silent S3 failures mid-session. Set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` explicitly from a dedicated IAM user with minimal S3 permissions.

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
