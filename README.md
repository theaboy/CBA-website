# CBA-website

Phase 1 foundation for the CBA official site.

## Workspaces

- `.` — Next.js frontend
- `api/` — Express + Prisma backend

Public shell:
- Home
- Beats
- Events
- Studio
- DJ Services
- About
- Contact

Internal shell:
- `/admin`

The app is structured so later phases can add the beat marketplace, booking flows, and admin operations without reworking the route architecture or visual system.

## Backend

The backend lives in `api/` and connects to the existing Supabase Postgres schema through Prisma mappings.

```bash
cd api
cp .env.example .env
npm install
npm run db:generate
npm run dev
```

Useful root commands:

```bash
npm run api:dev
npm run api:test
npm run api:typecheck
npm run api:migrate
```
