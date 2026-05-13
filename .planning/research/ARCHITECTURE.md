# Architecture Research

**Project:** CBA Official Website
**Dimension:** Architecture
**Researched:** 2026-02-28
**Confidence:** MEDIUM-HIGH

## Recommended System Shape

The project should be structured as one Next.js application with clearly separated public and admin surfaces sharing a common domain/data layer. That keeps the public experience cohesive while avoiding duplication between marketing, marketplace, and operations tooling.

## Major Components

### 1. Public Experience

Responsibilities:
- Home, beats, beat details, events, studio, DJ services, about, contact
- Persistent global audio player state
- Inquiry and booking forms
- Account UI shells and favorites interaction

### 2. Admin Experience

Responsibilities:
- Auth-gated routes
- Dashboard overview and operational views
- Homepage/content section editing
- Events management
- Studio availability and booking request management
- DJ inquiry management
- Beat metadata management and upload-ready workflows

### 3. Domain/Data Layer

Responsibilities:
- Content sections
- Beats and licensing metadata
- Events
- Studio availability slots
- Inquiry and booking request records
- Favorites/account-ready models

### 4. Service Integrations Layer

Responsibilities:
- Email notifications
- Future payment integration
- Future object/file storage
- Analytics/event tracking

## Data Flow

1. Admin creates or edits content, events, availability, and beats metadata.
2. Data is stored in the central database/domain layer.
3. Public pages render that data through server components or server-side fetches where appropriate.
4. Interactive client components handle playback, filters, favorites UI, and inquiry forms.
5. Form submissions write back to the database and trigger notifications to admin.
6. Future Stripe/storage integrations plug into the service layer without restructuring public pages.

## Suggested Boundaries

- **`app/(marketing)`**: public-facing routes and layouts
- **`app/(admin)`**: internal dashboard routes and protected layouts
- **`components/public`** and **`components/admin`**: visual separation
- **`lib/audio`**: single-source playback state and audio orchestration
- **`lib/data` / `server`**: server-side queries and mutations
- **`lib/validation`**: shared Zod schemas for forms and admin actions

## Build Order Implications

1. Design tokens, layout shell, and route structure
2. Shared data model and admin/public boundaries
3. Audio playback architecture
4. Public beats experience
5. Studio booking flow
6. Secondary public pages and lead flows
7. Secure admin shell
8. Admin CRUD tooling
9. Launch hardening for SEO, legal, and analytics

## Risks to Design Around

- Public and admin content models can drift if homepage content is hardcoded too long.
- Audio state can become brittle if every card controls its own player.
- UI-first accounts can create dead-end UX unless labeled and scoped carefully.
- Placeholder events and beat inventory need content fallback patterns to avoid empty-looking screens.

## Sources

### Primary

- [Next.js App Router docs](https://nextjs.org/docs/app)
- [Supabase official docs](https://supabase.com/docs)

### Secondary

- Product context from `.planning/PROJECT.md`
- [BeatStars](https://www.beatstars.com/)

---
*Research completed: 2026-02-28*
