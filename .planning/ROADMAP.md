# Roadmap: CBA Official Website

## Overview

This roadmap moves from brand and architecture foundations into the two core business flows first: beats and studio booking. It then layers in Supabase (database, storage, auth), payments, and the admin dashboard before launch hardening. Studio booking, DJ services, and the calendar system are scoped to Milestone 2 once the core commerce and admin infrastructure is proven.

**Architecture decision (2026-05-21):** Pivoted from a custom Express/Node.js API to Supabase. No separate backend server. Supabase provides hosted PostgreSQL (with RLS), Storage (for audio and artwork files), and Auth (for admin). Stripe webhooks and transactional email are handled via Next.js API routes. This eliminates infrastructure overhead and is right-sized for the current traffic baseline (under 1k/month). The archived Express implementation lives at `/Users/bird/CBA-api-archived-express` for reference.

## Milestones

- **Milestone 1 (current):** Core commerce — beats, events/ticketing, admin dashboard, launch hardening
- **Milestone 2 (planned):** Bookings & Services — studio booking, DJ services, calendar system

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation and Brand System** - Establish the design language, app structure, and shared layout foundations. (completed 2026-02-28)
- [x] **Phase 2: Marketplace Browsing and Playback** - Deliver the public beats browsing experience and persistent audio player. (completed 2026-02-28)
- [x] **Phase 3: Beat Detail and Inquiry Conversion** - Turn beat discovery into structured lead capture with license-aware detail pages. (completed 2026-02-28)
- [ ] **Phase 4: Supabase Foundation** - Configure Supabase project, run schema migrations, set RLS policies, set up Storage buckets, and wire the Next.js frontend to live Supabase data.
- [ ] **Phase 5: Payments, Email and Ticketing** - Implement Stripe payment for beat purchases and event tickets via Next.js API routes, transactional email, and QR token generation per ticket.
- [ ] **Phase 6: Admin Dashboard** - Build the protected admin UI with Supabase Auth, full beat and event management, and order/submission views.
- [ ] **Phase 7: Launch Hardening** - SEO, legal pages, analytics instrumentation, performance, and launch QA.

## Phase Details

### Phase 1: Foundation and Brand System
**Goal**: Create the premium visual system, route structure, responsive shell, and implementation foundation for both the public site and admin.
**Depends on**: Nothing (first phase)
**Requirements**: [FND-01, FND-02, FND-03]
**Success Criteria** (what must be TRUE):
  1. Visitor can navigate all primary public routes in a cohesive responsive shell.
  2. The site clearly reflects CBA's dark, premium, music-first visual direction.
  3. Core layout, typography, theming, and route boundaries exist for public and admin work.
  4. Existing customer brand assets and mockup references are represented in the implementation direction.
**Plans**: 4 plans

Plans:
- [x] 01-01: Audit assets, define design tokens, and establish visual system primitives.
- [x] 01-02: Set up Next.js app structure, layouts, navigation, and route groups.
- [x] 01-03: Build foundational public shell sections and responsive patterns.
- [x] 01-04: Scaffold protected admin shell layout without deep features yet.

### Phase 2: Marketplace Browsing and Playback
**Goal**: Deliver the core audio-first beats browsing experience with persistent single-track playback.
**Depends on**: Phase 1
**Requirements**: [HOME-01, HOME-02, BEAT-01, BEAT-02, BEAT-03, BEAT-04]
**Success Criteria** (what must be TRUE):
  1. Visitor can browse a beat grid with metadata and strong play controls.
  2. Visitor can filter and sort beats by the expected music-specific controls.
  3. Only one track can play at a time across all public pages.
  4. Visitor can continue playback and control the current track through a persistent mini-player while navigating.
**Plans**: 5 plans

Plans:
- [x] 02-01: Define beat data shape and placeholder content strategy.
- [x] 02-02: Implement centralized audio state and one-track-at-a-time behavior.
- [x] 02-03: Build beats listing page with cards, filters, and sort controls.
- [x] 02-04: Integrate featured beats and CTA behavior into the homepage.
- [x] 02-05: Polish marketplace interactions, responsiveness, and loading/empty states.

### Phase 3: Beat Detail and Inquiry Conversion
**Goal**: Convert beat browsing into credible, structured licensing inquiries.
**Depends on**: Phase 2
**Requirements**: [BEAT-05, BEAT-06]
**Success Criteria** (what must be TRUE):
  1. Visitor can open a beat detail page with expanded playback and metadata.
  2. Visitor can review license options and understand the inquiry-first purchase flow.
  3. Visitor can submit a beat inquiry that captures the selected beat and license tier.
  4. Inquiry confirmations clearly explain what happens next.
**Plans**: 3 plans

Plans:
- [x] 03-01: Build beat detail template and waveform-ready presentation.
- [x] 03-02: Design and implement license-selection and inquiry form UX.
- [x] 03-03: Wire submission handling, confirmations, and admin notification path.

### Phase 4: Supabase Foundation
**Goal**: Configure the Supabase project, run SQL schema migrations for all tables, set Row Level Security policies, configure Storage buckets for audio and artwork, and wire the Next.js frontend to read live beat data from Supabase.
**Depends on**: Phase 3
**Requirements**: [BE-01, BE-03, BE-04]
**Success Criteria** (what must be TRUE):
  1. Supabase project is configured with all tables (beats, events, orders_beat, orders_ticket, tickets, bookings) and correct column types.
  2. RLS policies are in place: public can read published beats/events; service role key required for writes.
  3. Storage buckets configured: `preview-audio` (public), `full-audio` (private, signed URLs only), `artwork` (public).
  4. Next.js beats listing and detail pages fetch live data from Supabase — static placeholder data replaced.
  5. Beat preview audio URLs are signed and time-limited; `full_key` is never exposed in public responses.
**Plans**: 4 plans

Plans:
- [ ] 04-01: Supabase project setup — create project, configure env vars in Next.js, install `@supabase/supabase-js` and `@supabase/ssr`.
- [ ] 04-02: Schema migrations — write SQL migration for all tables and enums; run via Supabase dashboard or CLI; seed dev data.
- [ ] 04-03: RLS policies and Storage — configure row-level security for all tables; create Storage buckets; implement signed URL generation helper.
- [ ] 04-04: Wire frontend — replace static beat data with Supabase client reads; update beat listing and detail pages to use live data and signed preview URLs.

### Phase 5: Payments, Email and Ticketing
**Goal**: Implement Stripe payment for beat purchases and event tickets via Next.js API routes, transactional email for all purchase events, and QR token generation per ticket.
**Depends on**: Phase 4
**Requirements**: [BE-05, BE-06, BE-07, BE-08, EVNT-01, EVNT-02]
**Success Criteria** (what must be TRUE):
  1. Visitor can complete a beat purchase via Stripe; license type validated server-side; exclusive license locks on purchase.
  2. Visitor can purchase event tickets; inventory decremented atomically in Supabase; overselling prevented.
  3. Unique non-guessable QR token generated per ticket and stored in database.
  4. Purchase confirmation emails sent: beat buyer receives download link + license info, ticket buyer receives QR code + event details.
**Plans**: 4 plans

Plans:
- [ ] 05-01: Stripe beat purchase — Next.js API route for PaymentIntent creation, webhook handler with signature verification, license tier validation, exclusive lock on purchase.
- [ ] 05-02: Event and ticket system — event records in Supabase, inventory tracking, Stripe checkout for tickets, QR token generation, atomic decrement.
- [ ] 05-03: Transactional email — Resend setup, templates for all 5 trigger types (beat purchase, ticket purchase, booking inquiry × 3), wired to webhook events.
- [ ] 05-04: Frontend checkout integration — Stripe Elements on beat and ticket pages, replace inquiry forms where applicable.

### Phase 6: Admin Dashboard
**Goal**: Build the protected admin UI using Supabase Auth — login, beat management, event management, and order/submission views — all talking directly to Supabase via the service role key.
**Depends on**: Phase 5
**Requirements**: [ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-05, ADMIN-06, BE-09, BE-10, BE-11]
**Success Criteria** (what must be TRUE):
  1. Admin can sign in via Supabase Auth and access all protected dashboard routes; unauthenticated requests redirect to login.
  2. Admin can create, edit, and delete beats; upload audio to Supabase Storage; view per-beat sales.
  3. Admin can create, edit, publish, and unpublish events.
  4. Admin can view all orders (beat purchases + ticket purchases) and booking/DJ inquiry submissions.
**Plans**: 4 plans

Plans:
- [ ] 06-01: Admin auth — Supabase Auth login screen, session management via `@supabase/ssr`, protected route middleware, session expiry handling.
- [ ] 06-02: Beat management dashboard — list, create, edit, delete beats; audio upload to Supabase Storage; per-beat sales view.
- [ ] 06-03: Event management dashboard — list, create, edit, publish/unpublish events.
- [ ] 06-04: Orders, tickets, and booking request views — all purchases and incoming inquiry submissions.

### Phase 7: Launch Hardening
**Goal**: Prepare the site for a credible public launch with strong discoverability, compliance, analytics, and QA.
**Depends on**: Phase 6
**Requirements**: [OPS-01, OPS-02, OPS-03]
**Success Criteria** (what must be TRUE):
  1. Public pages ship with strong metadata and launch-ready SEO foundations.
  2. Legal and licensing pages are accessible and aligned with the Stripe purchase flows.
  3. Analytics cover key public conversion and playback behaviors.
  4. Performance, accessibility, and content quality are reviewed before launch.
**Plans**: 4 plans

Plans:
- [ ] 07-01: SEO metadata, Open Graph, schema markup for music and event discovery.
- [ ] 07-02: Legal pages — Terms, Privacy Policy, Refund Policy, Licensing information.
- [ ] 07-03: Analytics instrumentation — key browsing, playback, and purchase events.
- [ ] 07-04: QA, accessibility, performance audit, and launch-content hardening.

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation and Brand System | 4/4 | Complete | 2026-02-28 |
| 2. Marketplace Browsing and Playback | 5/5 | Complete | 2026-02-28 |
| 3. Beat Detail and Inquiry Conversion | 3/3 | Complete | 2026-02-28 |
| 4. Supabase Foundation | 1/4 | In Progress|  |
| 5. Payments, Email and Ticketing | 0/4 | Not started | - |
| 6. Admin Dashboard | 0/4 | Not started | - |
| 7. Launch Hardening | 0/4 | Not started | - |

## Milestone 2 (Planned)

Deferred phases for after Milestone 1 ships:

- **M2-Phase 1**: Studio & DJ pages — marketing pages, package info, service details
- **M2-Phase 2**: Booking backend — availability records, lean booking DB, admin notification
- **M2-Phase 3**: Calendar system — frontend availability picker, slot management, admin calendar UI
- **M2-Phase 4**: Studio booking flow — form, deposit payment (Stripe), confirmation
- **M2-Phase 5**: Admin booking management — review requests, update status, DJ inquiry review
