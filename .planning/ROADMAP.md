# Roadmap: CBA Official Website

## Overview

This roadmap moves from brand and architecture foundations into the two core business flows first: beats and studio booking. It then layers in a real backend (API, database, payments, email) before building the admin dashboard and launch hardening. Studio booking, DJ services, and the calendar system are scoped to Milestone 2 once the core commerce and admin infrastructure is proven.

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
- [ ] **Phase 4: Backend Foundation** - Stand up the Node.js API server, PostgreSQL database, admin JWT auth, and beat catalog API with S3 cloud storage.
- [ ] **Phase 5: Payments, Email and Ticketing** - Implement Stripe payment flows for beats and event tickets, transactional email, and QR code generation.
- [ ] **Phase 6: Admin Backend API** - Build all admin CRUD endpoints for beats, events, and orders so the frontend dashboard has a real data layer.
- [ ] **Phase 7: Admin Dashboard Frontend** - Connect the admin UI to the Phase 6 backend API with full beat, event, and order management.
- [ ] **Phase 8: Launch Hardening** - SEO, legal pages, analytics instrumentation, performance, and launch QA.

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

### Phase 4: Backend Foundation
**Goal**: Stand up the complete backend server — Node.js API, PostgreSQL database, admin JWT authentication, and beat catalog API with S3 cloud storage. This is the foundation every subsequent backend phase builds on.
**Depends on**: Phase 3
**Requirements**: [BE-01, BE-02, BE-03, BE-04]
**Success Criteria** (what must be TRUE):
  1. API server runs and responds to health check — deployable to Railway or Render.
  2. Admin can POST /admin/login and receive a JWT; all /admin/* routes reject unauthenticated requests.
  3. GET /beats returns filtered beat list; GET /beats/:id returns detail with a valid signed preview URL.
  4. Beat audio files are stored in S3 and delivered via time-limited signed URLs — never via public bucket access.
**Plans**: 4 plans

Plans:
- [x] 04-01: Project setup — Node.js, TypeScript, Express, Prisma, PostgreSQL, env structure, health check.
- [x] 04-02: Admin authentication — JWT, bcrypt, login endpoint, rate limiting, protected middleware.
- [ ] 04-03: Beat catalog API — metadata endpoints, server-side filtering, admin CRUD.
- [ ] 04-04: S3 integration — bucket setup, signed URLs, upload flow, wire into beat endpoints.

### Phase 5: Payments, Email and Ticketing
**Goal**: Implement Stripe payment for beat purchases and event tickets, transactional email for all purchase events, and QR token generation per ticket.
**Depends on**: Phase 4
**Requirements**: [BE-05, BE-06, BE-07, BE-08, EVNT-01, EVNT-02]
**Success Criteria** (what must be TRUE):
  1. Visitor can complete a beat purchase via Stripe; license type validated server-side; exclusive locks correctly.
  2. Visitor can purchase event tickets; inventory decremented atomically; overselling prevented.
  3. Unique QR token generated per ticket and stored in database.
  4. Purchase confirmation emails sent: beat buyer receives download link + license, ticket buyer receives QR code + event details.
**Plans**: 4 plans

Plans:
- [ ] 05-01: Stripe setup — beat purchase flow, license tier validation, PaymentIntent, webhook handler with signature verification.
- [ ] 05-02: Event and ticket system — event records, inventory tracking, ticket purchase flow, QR token generation.
- [ ] 05-03: Transactional email — Resend setup, templates for all 5 trigger types, wired to webhook events.
- [ ] 05-04: Frontend checkout integration — Stripe Elements on beat and ticket pages, replace inquiry forms where applicable.

### Phase 6: Admin Backend API
**Goal**: Build all admin CRUD endpoints for beats, events, and orders so the frontend dashboard has a real, stable data layer to consume.
**Depends on**: Phase 5
**Requirements**: [BE-09, BE-10, BE-11, ADMIN-03, ADMIN-05, ADMIN-06]
**Success Criteria** (what must be TRUE):
  1. Admin can create, edit, and delete beats via API; per-beat order data is accessible.
  2. Admin can create, edit, and publish/unpublish events via API.
  3. Admin can list all orders (beat purchases + ticket purchases) and view individual records.
  4. Studio and DJ booking requests are saved via lean contact forms and retrievable by admin.
**Plans**: 4 plans

Plans:
- [ ] 06-01: Admin beats CRUD — upload metadata, edit, delete, view per-beat orders.
- [ ] 06-02: Admin events CRUD — create, edit, publish/unpublish events.
- [ ] 06-03: Admin orders and tickets — list all purchases, per-order detail.
- [ ] 06-04: Lean booking system — studio and DJ contact forms, save to DB, email admin on submission.

### Phase 7: Admin Dashboard Frontend
**Goal**: Connect the admin UI to the Phase 6 backend API with full beat, event, and order management accessible from the protected dashboard.
**Depends on**: Phase 6
**Requirements**: [ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-05, ADMIN-06]
**Success Criteria** (what must be TRUE):
  1. Admin can sign in via the dashboard login and access all protected routes.
  2. Admin can manage beats (create, edit, delete, view orders) from the dashboard.
  3. Admin can manage events (create, edit, publish/unpublish) from the dashboard.
  4. Admin can view all orders and booking request submissions.
**Plans**: 4 plans

Plans:
- [ ] 07-01: Admin auth UI — login screen, JWT storage, protected route handling, session expiry.
- [ ] 07-02: Beat management dashboard — list, create, edit, delete beats; view per-beat sales.
- [ ] 07-03: Event management dashboard — list, create, edit, publish/unpublish events.
- [ ] 07-04: Orders, tickets, and booking request views.

### Phase 8: Launch Hardening
**Goal**: Prepare the site for a credible public launch with strong discoverability, compliance, analytics, and QA.
**Depends on**: Phase 7
**Requirements**: [OPS-01, OPS-02, OPS-03]
**Success Criteria** (what must be TRUE):
  1. Public pages ship with strong metadata and launch-ready SEO foundations.
  2. Legal and licensing pages are accessible and aligned with the Stripe purchase flows.
  3. Analytics cover key public conversion and playback behaviors.
  4. Performance, accessibility, and content quality are reviewed before launch.
**Plans**: 4 plans

Plans:
- [ ] 08-01: SEO metadata, Open Graph, schema markup for music and event discovery.
- [ ] 08-02: Legal pages — Terms, Privacy Policy, Refund Policy, Licensing information.
- [ ] 08-03: Analytics instrumentation — key browsing, playback, and purchase events.
- [ ] 08-04: QA, accessibility, performance audit, and launch-content hardening.

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation and Brand System | 4/4 | Complete | 2026-02-28 |
| 2. Marketplace Browsing and Playback | 5/5 | Complete | 2026-02-28 |
| 3. Beat Detail and Inquiry Conversion | 3/3 | Complete | 2026-02-28 |
| 4. Backend Foundation | 2/4 | In progress | - |
| 5. Payments, Email and Ticketing | 0/4 | Not started | - |
| 6. Admin Backend API | 0/4 | Not started | - |
| 7. Admin Dashboard Frontend | 0/4 | Not started | - |
| 8. Launch Hardening | 0/4 | Not started | - |

## Milestone 2 (Planned)

Deferred phases for after Milestone 1 ships:

- **M2-Phase 1**: Studio & DJ pages — marketing pages, package info, service details
- **M2-Phase 2**: Booking backend — availability records, lean booking DB, admin notification
- **M2-Phase 3**: Calendar system — frontend availability picker, slot management, admin calendar UI
- **M2-Phase 4**: Studio booking flow — form, deposit payment (Stripe), confirmation
- **M2-Phase 5**: Admin booking management — review requests, update status, DJ inquiry review
