# Requirements: CBA Official Website

**Defined:** 2026-02-28
**Core Value:** Make it easy for visitors to discover CBA's sound and convert into beat or studio-booking leads through a premium, trustworthy experience.

## v1 Requirements

### Foundation

- [x] **FND-01**: Visitor can navigate a fully responsive public site with pages for Home, Beats, Events, Studio, DJ Services, About, and Contact.
- [x] **FND-02**: Public site reflects the approved dark, premium, music-first brand direction using the provided customer assets as reference.
- [x] **FND-03**: Visitor can use the site comfortably on mobile and desktop layouts.

### Homepage and Brand Content

- [ ] **HOME-01**: Visitor sees a cinematic hero with clear calls to action for browsing beats and booking studio time.
- [ ] **HOME-02**: Visitor can browse featured beats and upcoming-event highlights from the homepage.
- [ ] **HOME-03**: Visitor can view CBA story, testimonials, newsletter signup, and social links from public pages.

### Beat Marketplace

- [ ] **BEAT-01**: Visitor can browse a grid of beats showing title, BPM, genre, price, play control, favorite action, and inquiry/add-to-cart affordance.
- [ ] **BEAT-02**: Visitor can filter or sort beats by genre, BPM range, mood, price range, and latest/popular.
- [ ] **BEAT-03**: Only one beat plays at a time across the site.
- [ ] **BEAT-04**: Visitor can keep controlling the current beat from a persistent mini-player while moving between pages.
- [ ] **BEAT-05**: Visitor can open a beat detail page with a larger player, waveform-ready presentation, description, and license options.
- [ ] **BEAT-06**: Visitor can submit a beat purchase inquiry that captures selected beat, license tier, and contact details.

### Studio Booking

- [ ] **STUD-01**: Visitor can open a dedicated Studio page with pricing, packages, and booking information.
- [ ] **STUD-02**: Visitor can view available dates and time slots for studio sessions.
- [ ] **STUD-03**: Visitor can submit a studio booking request with date, time, duration, package, contact details, and notes.

### Events and DJ Services

- [ ] **EVNT-01**: Visitor can browse upcoming placeholder or real events with poster, date, location, and ticket-price information.
- [ ] **EVNT-02**: Visitor can submit an event ticket inquiry or reservation request from the public site.
- [ ] **DJ-01**: Visitor can view DJ services information including experience, equipment, and event types.
- [ ] **DJ-02**: Visitor can submit a DJ booking inquiry with event details, duration, budget, and contact information.

### Accounts and Favorites

- [ ] **ACCT-01**: Visitor can access account signup and login UI from the public site.
- [ ] **ACCT-02**: Visitor can save favorite beats from the marketplace experience.
- [ ] **ACCT-03**: Favorites behavior is implemented in a way that can later connect to real user accounts without redesigning the UI.

### Admin Dashboard

- [ ] **ADMIN-01**: Authorized admin can sign in to a protected internal dashboard.
- [ ] **ADMIN-02**: Admin can manage homepage content sections without editing code.
- [ ] **ADMIN-03**: Admin can create and edit event entries, including placeholder events.
- [ ] **ADMIN-04**: Admin can manage studio availability and review incoming studio booking requests.
- [ ] **ADMIN-05**: Admin can review incoming DJ service inquiries.
- [ ] **ADMIN-06**: Admin can create and edit beat metadata records so real audio uploads can be attached later.

### Backend API

- [ ] **BE-01**: A Node.js/TypeScript API server with Express, Prisma ORM, and PostgreSQL is running and deployable.
- [ ] **BE-02**: Admin can authenticate via POST /admin/login with bcrypt password check; JWT protects all /admin/* routes; login is rate-limited.
- [ ] **BE-03**: GET /beats supports server-side filtering by genre, mood, BPM range, price range, and sort; GET /beats/:id returns detail.
- [ ] **BE-04**: Beat audio files are stored in S3 (single bucket, /preview and /full folders) and delivered via time-limited signed URLs.
- [ ] **BE-05**: Visitor can complete a beat purchase via Stripe; license tier validated server-side; exclusive license locks on purchase.
- [ ] **BE-06**: Visitor can purchase event tickets via Stripe; inventory tracked atomically; overselling prevented.
- [ ] **BE-07**: Unique non-guessable QR token generated per ticket on successful payment and stored in database.
- [ ] **BE-08**: Transactional emails sent via Resend or SendGrid for all purchase events (beat purchase, ticket purchase, booking notifications).
- [ ] **BE-09**: Admin can create, edit, and delete beat metadata records via API.
- [ ] **BE-10**: Admin can create, edit, publish, and unpublish event records via API.
- [ ] **BE-11**: Admin can list and view all orders (beat purchases + ticket purchases) via API.

### SEO, Legal, and Operations

- [ ] **OPS-01**: Public pages include SEO-ready metadata structure for music, location, and event discovery.
- [ ] **OPS-02**: Site includes Terms and Conditions, Privacy Policy, Refund Policy, and Licensing information pages or equivalent surfaces.
- [ ] **OPS-03**: Admin receives notification of new beat, booking, ticket, and DJ inquiries.

## v2 Requirements

### Payments and Fulfillment

- **PAY-02**: Visitor can pay studio deposits through Stripe. *(deferred to Milestone 2)*
- **PAY-04**: Waveform data generated automatically from uploaded audio. *(deferred)*

### User Accounts

- **ACCT-04**: User account data persists through a real authentication backend.
- **ACCT-05**: User can view purchase history and previous downloads.
- **ACCT-06**: Favorites sync across devices for signed-in users.

### Catalog Expansion

- **BEAT-07**: Admin can upload and manage beat audio files and related media assets directly in the dashboard.
- **BEAT-08**: Visitor can preview waveform data generated from uploaded audio automatically.

### Growth Features

- **GROW-01**: Visitor can subscribe to an unlimited-beats or membership plan.
- **GROW-02**: Platform supports sample-pack sales or other digital products.
- **GROW-03**: Platform supports affiliate, collaboration marketplace, or similar ecosystem features.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real Stripe payment processing in v1 | User explicitly wants inquiry and request flows first |
| Automated post-purchase delivery | Depends on payment flow and asset management not in launch scope |
| Purchase history UI | Not needed until real purchases exist |
| Full backend auth implementation for consumer accounts | User asked to keep UI in mind now and defer deeper implementation |
| Subscription marketplace extensions | Future monetization, not required for first launch |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FND-01 | Phase 1 | Complete |
| FND-02 | Phase 1 | Complete |
| FND-03 | Phase 1 | Complete |
| HOME-01 | Phase 2 | Complete |
| HOME-02 | Phase 2 | Complete |
| HOME-03 | Milestone 2 | Deferred |
| BEAT-01 | Phase 2 | Complete |
| BEAT-02 | Phase 2 | Complete |
| BEAT-03 | Phase 2 | Complete |
| BEAT-04 | Phase 2 | Complete |
| BEAT-05 | Phase 3 | Complete |
| BEAT-06 | Phase 3 | Complete |
| STUD-01 | Milestone 2 | Deferred |
| STUD-02 | Milestone 2 | Deferred |
| STUD-03 | Milestone 2 | Deferred |
| EVNT-01 | Phase 5 | Pending |
| EVNT-02 | Phase 5 | Pending |
| DJ-01 | Milestone 2 | Deferred |
| DJ-02 | Milestone 2 | Deferred |
| ACCT-01 | Milestone 2 | Deferred |
| ACCT-02 | Milestone 2 | Deferred |
| ACCT-03 | Milestone 2 | Deferred |
| BE-01 | Phase 4 | Pending |
| BE-02 | Phase 4 | Pending |
| BE-03 | Phase 4 | Pending |
| BE-04 | Phase 4 | Pending |
| BE-05 | Phase 5 | Pending |
| BE-06 | Phase 5 | Pending |
| BE-07 | Phase 5 | Pending |
| BE-08 | Phase 5 | Pending |
| BE-09 | Phase 6 | Pending |
| BE-10 | Phase 6 | Pending |
| BE-11 | Phase 6 | Pending |
| ADMIN-01 | Phase 7 | Pending |
| ADMIN-02 | Phase 7 | Pending |
| ADMIN-03 | Phase 6 | Pending |
| ADMIN-04 | Milestone 2 | Deferred |
| ADMIN-05 | Phase 6 | Pending |
| ADMIN-06 | Phase 6 | Pending |
| OPS-01 | Phase 8 | Pending |
| OPS-02 | Phase 8 | Pending |
| OPS-03 | Phase 5 | Pending |

**Coverage:**
- Milestone 1 v1 requirements: 30 active
- Mapped to phases: 30
- Deferred to Milestone 2: 11
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-28*
*Last updated: 2026-02-28 after Phase 3 completion*
