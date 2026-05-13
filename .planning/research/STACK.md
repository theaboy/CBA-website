# Stack Research

**Project:** CBA Official Website
**Dimension:** Stack
**Researched:** 2026-02-28
**Confidence:** MEDIUM-HIGH

## Recommendation

For this project, the standard fit is a modern React/Next.js application with the App Router, TypeScript, and a PostgreSQL-backed admin/data layer. That stack matches the need for a premium content-heavy frontend, server-rendered marketing pages, authenticated internal tooling, and a future path to commerce and media management.

Because the user explicitly wants inquiry-first flows and only UI-first user accounts initially, the stack should avoid overcommitting to payment or consumer-auth complexity in the first milestone. The backend should still be shaped so Supabase or another Postgres-compatible provider can be introduced cleanly for auth, storage, and row-level security when those requirements become real.

## Recommended Technologies

### Core App

- **Next.js App Router** — best fit for a mixed marketing + app surface, with server-rendered public pages and authenticated admin routes. Next.js docs position App Router as the current recommended model and note it uses React's latest framework features.
- **TypeScript** — standard for maintainable admin logic, CMS-like forms, and shared domain models.
- **React 19 via Next.js App Router** — aligns with the current framework model documented by Next.js.

### UI and Design System

- **Tailwind CSS v4** — practical for rapid design system iteration and custom theming around an existing brand guide.
- **shadcn/ui-style primitives or Radix-based primitives** — useful for accessible admin controls, drawers, dialogs, and forms without dictating the public visual language.
- **Motion library only where needed** — use subtle animation for audio/player transitions, page reveals, and hover states; avoid animation-heavy dependencies unless they serve the music-first browsing experience.

### Data and Backend

- **PostgreSQL** — appropriate for beats metadata, inquiries, bookings, events, admin content sections, and future commerce records.
- **Supabase-backed Postgres or Neon/Postgres equivalent** — good path for hosted Postgres plus future auth/storage needs. Supabase's official docs show the platform bundling Postgres, Auth, Storage, Realtime, and Edge Functions.
- **ORM layer**: favor **Prisma** for admin-heavy CRUD and developer familiarity, or **Drizzle** if the implementation later optimizes for SQL clarity and lighter abstractions. Prisma's official PostgreSQL docs explicitly support PostgreSQL plus serverless providers such as Neon and Supabase.

### Forms, Uploads, and Email

- **React Hook Form + Zod** — good default for admin and inquiry forms with strong validation.
- **File upload abstraction prepared for later** — the first release can stub beat/audio uploads in admin, but architecture should isolate uploads behind a service boundary so object storage can be attached later.
- **Resend or equivalent transactional email provider** — suitable for inquiry confirmations and admin notifications; Resend's official site documents direct Next.js/Node integration.

### Search, Audio, and Observability

- **Client-side filtering first, server-side later** — acceptable while beat inventory is small or placeholder-only.
- **Howler/Web Audio wrapper or native HTMLAudioElement orchestrated through a single playback store** — the key requirement is one-track-at-a-time playback with persistent mini-player behavior across routes.
- **Basic analytics instrumentation** — page views, beat plays, favorites, studio booking requests, DJ inquiries, and CTA clicks should be measured from the start.

## What Not To Use Yet

- **Stripe-first architecture** — the user explicitly deferred payments.
- **Heavy marketplace plugins or WordPress commerce layers** — poor fit for the custom playback UX and internal dashboard needs.
- **Overbuilt event-ticketing integrations** — placeholder events and manual fulfillment make a bespoke lightweight data model more appropriate at launch.
- **Full consumer auth dependency in phase one** — the UI can be planned now without making auth a launch blocker.

## Version and Ecosystem Notes

- Next.js official docs were updated February 11, 2026 and recommend the App Router for the latest framework features.
- Next.js installation docs list Node.js 20.9 as the minimum supported version.
- Prisma's official PostgreSQL connector docs confirm compatibility with standard PostgreSQL and serverless providers including Supabase and Neon.

## Confidence Notes

- **High confidence**: Next.js App Router, TypeScript, PostgreSQL, server-rendered marketing + admin split.
- **Medium confidence**: exact choice between Prisma and Drizzle should be finalized during implementation planning after reviewing team preferences and admin/data complexity.
- **Medium confidence**: exact auth/storage provider can remain open until the project reaches real account persistence and media upload work.

## Sources

### Primary

- [Next.js App Router docs](https://nextjs.org/docs/app)
- [Next.js installation docs](https://nextjs.org/docs/app/getting-started/installation)
- [Supabase official docs](https://supabase.com/docs)
- [Prisma PostgreSQL connector docs](https://docs.prisma.io/docs/orm/core-concepts/supported-databases/postgresql)
- [Resend official site](https://www.resend.com/)

### Secondary

- [BeatStars](https://www.beatstars.com/)

---
*Research completed: 2026-02-28*
