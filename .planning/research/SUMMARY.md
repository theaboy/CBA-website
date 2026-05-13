# Project Research Summary

**Project:** CBA Official Website
**Domain:** Music storefront, band website, and service-booking platform
**Researched:** 2026-02-28
**Confidence:** MEDIUM-HIGH

## Executive Summary

CBA Official Website should be built as a single modern Next.js application that blends a premium marketing site, an audio-first beat marketplace, inquiry-led service flows, and a real internal admin dashboard. Research points toward a server-rendered React stack with a Postgres-backed data model because the project needs both a polished public brand surface and authenticated internal operations.

The recommended launch approach is to optimize for truthful conversion rather than premature automation. That means the site should make beats and studio booking feel premium and usable now through request flows, while leaving explicit seams for future payments, media storage, and full account persistence. The main risks are misleading pseudo-checkout UX, fragmented audio playback, and overbuilding admin before content models stabilize.

## Key Findings

### Recommended Stack

The strongest fit is Next.js App Router + TypeScript + PostgreSQL, with Tailwind-based theming and an admin/public split inside one codebase. Supabase or a similar Postgres-hosted backend is a good future-ready option because it bundles database, auth, and storage services that the project can adopt incrementally.

**Core technologies:**
- **Next.js App Router**: public marketing and authenticated admin in one framework — recommended by current official docs for latest features
- **TypeScript**: shared domain models and safer admin workflows — reduces maintenance risk
- **PostgreSQL**: content, beats metadata, availability, events, and inquiries — matches structured operational data
- **Validation/forms stack**: predictable form handling for public inquiries and admin CRUD

### Expected Features

Users in this domain expect immediate music discovery, strong playback affordances, and clear conversion paths. For this project, public trust and internal manageability matter almost as much as the browse UI itself.

**Must have (table stakes):**
- Audio-first beat discovery with persistent playback
- Public pages for beats, studio, events, DJ services, about, and contact
- Structured inquiry and booking flows with confirmation states
- Real admin controls for content, events, availability, and leads
- Responsive design, metadata, and legal surfaces

**Should have (competitive):**
- Cinematic brand presentation
- Strong editorial framing around Montreal roots
- Favorites/account-ready UX
- Smooth transitions and polished player interactions

**Defer (v2+):**
- Stripe payments
- Download fulfillment after purchase
- Purchase history
- Subscription or marketplace extensions

### Architecture Approach

Use one app with clear boundaries between marketing routes, admin routes, shared domain schemas, and service integrations. Public pages should read from the same content/data models that admin screens edit, while playback state is centralized in a dedicated client-side module to guarantee one-track-at-a-time behavior.

**Major components:**
1. **Public experience** — marketing pages, beat browse/detail, inquiries, player
2. **Admin dashboard** — protected operations and content management
3. **Domain/data layer** — beats, events, bookings, sections, inquiries, favorites-ready models
4. **Service layer** — email now, payments/storage later

### Critical Pitfalls

1. **Misleading manual-commerce UX** — keep CTA copy and confirmations honest about inquiry-based fulfillment
2. **Broken multi-player behavior** — centralize audio state before polishing marketplace cards
3. **Admin rewrites from unstable schemas** — define entities before building deep CRUD screens
4. **Weak placeholder content** — design empty and placeholder states to feel intentional
5. **Premature auth complexity** — keep account/favorites scope explicit and incremental

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation and Brand System
**Rationale:** Establishes the visual language, route structure, and shared shell before feature work.
**Delivers:** Public shell, admin shell scaffold, design tokens, responsive layout base.
**Addresses:** Core design fidelity and maintainability.
**Avoids:** Generic design drift and layout rewrites.

### Phase 2: Audio and Marketplace Core
**Rationale:** Beats are the top business priority, and playback architecture is a dependency for the rest of the storefront.
**Delivers:** Beat browse, filters, player state, mini-player, beat cards.
**Uses:** Public route architecture and shared UI foundation.
**Implements:** Public browsing and playback components.

### Phase 3: Beat Detail and Conversion Flow
**Rationale:** Marketplace browsing should turn into real lead capture before secondary flows expand.
**Delivers:** Beat detail pages, license selection, inquiry flow, confirmation states.

### Phase 4: Studio Booking
**Rationale:** Studio bookings are the second v1 business priority and require structured scheduling UX.
**Delivers:** Availability presentation and booking request flow.

### Phase 5: Secondary Public Revenue Pages
**Rationale:** Events and DJ services matter for brand completeness but depend less on the core audio flow.
**Delivers:** Events, DJ services, about, contact, testimonials/newsletter/social surfaces.

### Phase 6: Accounts and Favorites UI
**Rationale:** User-facing account surfaces can be built after core conversion pages are stable, without blocking launch.
**Delivers:** Signup/login shells, local favorites behavior, account-ready navigation states.

### Phase 7: Admin Auth and Data Foundations
**Rationale:** Admin must be real, but stable entities should exist before deep management tooling.
**Delivers:** Protected admin routes, base schemas, operational dashboard foundation.

### Phase 8: Admin Operations
**Rationale:** Turns the system from demo-ready to manageable by CBA.
**Delivers:** Manage homepage sections, events, studio availability, booking requests, DJ inquiries, beat metadata.

### Phase 9: Launch Hardening
**Rationale:** Public trust and discoverability depend on legal, SEO, analytics, and content polish.
**Delivers:** Metadata, schema markup groundwork, legal pages, QA, performance, placeholder quality.

### Phase Ordering Rationale

- Public design and playback must come before polishing marketplace conversion.
- Core beat and studio flows come before secondary pages.
- Admin should follow stable content/data modeling, not precede it.
- Hardening belongs at the end, but metadata and legal implications should inform earlier decisions.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2:** persistent audio/state patterns across route transitions
- **Phase 4:** calendar availability UX and booking-state modeling
- **Phase 8:** admin auth and content-management ergonomics

Phases with standard patterns (skip research-phase if needed):
- **Phase 1:** design system and route scaffolding
- **Phase 5:** marketing/about/contact/event information architecture

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official framework/database docs strongly support the recommended baseline |
| Features | MEDIUM | Feature prioritization is solid, but some launch details depend on content readiness |
| Architecture | MEDIUM-HIGH | Public/admin split and centralized playback are well-supported patterns |
| Pitfalls | MEDIUM | Based on product shape and domain patterns more than bespoke implementation evidence |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- Exact admin authentication implementation should be decided during phase planning.
- File/media upload architecture should be finalized when beat assets become real.
- Account persistence versus local-only favorites needs a clear implementation decision when auth work becomes active.

## Sources

### Primary (HIGH confidence)

- [Next.js App Router docs](https://nextjs.org/docs/app) — framework direction
- [Next.js installation docs](https://nextjs.org/docs/app/getting-started/installation) — runtime support details
- [Supabase official docs](https://supabase.com/docs) — database/auth/storage platform capabilities
- [Prisma PostgreSQL connector docs](https://docs.prisma.io/docs/orm/core-concepts/supported-databases/postgresql) — Postgres/provider compatibility
- [Resend official site](https://www.resend.com/) — email integration option

### Secondary (MEDIUM confidence)

- [BeatStars](https://www.beatstars.com/) — marketplace UX reference

### Tertiary (LOW confidence)

- User-provided PRD and repo assets — valuable for product intent but not implementation standards

---
*Research completed: 2026-02-28*
*Ready for roadmap: yes*
