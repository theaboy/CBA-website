# Roadmap: CBA Official Website

## Overview

This roadmap moves from brand and architecture foundations into the two core business flows first: beats and studio booking. It then layers in supporting public pages, account-ready UX, and the real internal admin dashboard before closing with launch hardening for SEO, legal, analytics, and content quality. The structure deliberately keeps payments and full consumer-auth backend work out of the first milestone while preserving a clean path to add them later.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation and Brand System** - Establish the design language, app structure, and shared layout foundations.
- [ ] **Phase 2: Marketplace Browsing and Playback** - Deliver the public beats browsing experience and persistent audio player.
- [ ] **Phase 3: Beat Detail and Inquiry Conversion** - Turn beat discovery into structured lead capture with license-aware detail pages.
- [ ] **Phase 4: Studio Booking Flow** - Ship the second primary business path with availability and booking requests.
- [ ] **Phase 5: Secondary Public Pages and Trust Content** - Complete the broader public site for events, DJ services, story, and contact.
- [ ] **Phase 6: Accounts and Favorites UX** - Add account-ready surfaces and favorite interactions without making backend auth a blocker.
- [ ] **Phase 7: Admin Auth and Dashboard Foundation** - Secure the internal area and establish stable admin data boundaries.
- [ ] **Phase 8: Admin Operations and Content Management** - Deliver the real management tools CBA needs to run the site.
- [ ] **Phase 9: Launch Hardening and Discoverability** - Finish SEO, legal, analytics, QA, and launch polish.

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
- [ ] 01-01: Audit assets, define design tokens, and establish visual system primitives.
- [ ] 01-02: Set up Next.js app structure, layouts, navigation, and route groups.
- [ ] 01-03: Build foundational public shell sections and responsive patterns.
- [ ] 01-04: Scaffold protected admin shell layout without deep features yet.

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
- [ ] 02-01: Define beat data shape and placeholder content strategy.
- [ ] 02-02: Implement centralized audio state and one-track-at-a-time behavior.
- [ ] 02-03: Build beats listing page with cards, filters, and sort controls.
- [ ] 02-04: Integrate featured beats and CTA behavior into the homepage.
- [ ] 02-05: Polish marketplace interactions, responsiveness, and loading/empty states.

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
- [ ] 03-01: Build beat detail template and waveform-ready presentation.
- [ ] 03-02: Design and implement license-selection and inquiry form UX.
- [ ] 03-03: Wire submission handling, confirmations, and admin notification path.

### Phase 4: Studio Booking Flow
**Goal**: Deliver the studio booking surface for availability discovery and request capture.
**Depends on**: Phase 2
**Requirements**: [STUD-01, STUD-02, STUD-03]
**Success Criteria** (what must be TRUE):
  1. Visitor can understand studio offerings, pricing, and package options from the Studio page.
  2. Visitor can view available dates and time slots.
  3. Visitor can submit a studio booking request with the required scheduling and contact details.
  4. Studio requests create records that can later be managed from admin tooling.
**Plans**: 4 plans

Plans:
- [ ] 04-01: Define studio data model for packages, availability, and booking requests.
- [ ] 04-02: Build the Studio marketing page and package presentation.
- [ ] 04-03: Implement availability browsing and booking request form flow.
- [ ] 04-04: Add confirmations, validations, and responsive/mobile polish.

### Phase 5: Secondary Public Pages and Trust Content
**Goal**: Complete the broader brand website with events, DJ services, story, contact, and trust-building content.
**Depends on**: Phase 1
**Requirements**: [HOME-03, EVNT-01, EVNT-02, DJ-01, DJ-02]
**Success Criteria** (what must be TRUE):
  1. Visitor can explore events with intentional placeholder or live-event presentation.
  2. Visitor can submit ticket inquiries or reservation requests.
  3. Visitor can understand DJ services and submit a DJ booking inquiry.
  4. Visitor can access About and Contact experiences that reinforce brand credibility and Montreal roots.
**Plans**: 4 plans

Plans:
- [ ] 05-01: Build events listing/promo surfaces and request flow.
- [ ] 05-02: Build DJ services page and inquiry flow.
- [ ] 05-03: Build About, Contact, testimonials, newsletter, and social sections.
- [ ] 05-04: Refine public trust cues and placeholder content strategy across all secondary pages.

### Phase 6: Accounts and Favorites UX
**Goal**: Add account-ready public UX and favorites behavior without blocking launch on full auth implementation.
**Depends on**: Phase 2
**Requirements**: [ACCT-01, ACCT-02, ACCT-03]
**Success Criteria** (what must be TRUE):
  1. Visitor can open polished signup and login screens from the public site.
  2. Visitor can favorite beats from marketplace surfaces.
  3. Favorites and account UI are structured so real backend auth can be integrated later without redesign.
**Plans**: 3 plans

Plans:
- [ ] 06-01: Design account-ready navigation states and auth screen UI.
- [ ] 06-02: Implement favorite interactions and local/session persistence strategy.
- [ ] 06-03: Add account-area shell and future-auth integration boundaries.

### Phase 7: Admin Auth and Dashboard Foundation
**Goal**: Establish secure admin access and the structural backbone for internal operations.
**Depends on**: Phase 1
**Requirements**: [ADMIN-01]
**Success Criteria** (what must be TRUE):
  1. Authorized admin can access a protected dashboard area.
  2. Core admin navigation and dashboard information architecture are in place.
  3. Shared data models exist for the content and operations features scheduled next.
**Plans**: 3 plans

Plans:
- [ ] 07-01: Decide and implement admin authentication approach appropriate for v1.
- [ ] 07-02: Build protected admin route handling and dashboard shell.
- [ ] 07-03: Define stable schemas and server actions/endpoints for admin-managed entities.

### Phase 8: Admin Operations and Content Management
**Goal**: Make the site operationally manageable by CBA without code edits.
**Depends on**: Phase 7
**Requirements**: [ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-05, ADMIN-06, OPS-03]
**Success Criteria** (what must be TRUE):
  1. Admin can manage homepage content sections from the dashboard.
  2. Admin can create and edit events, including placeholders.
  3. Admin can manage studio availability and review booking requests.
  4. Admin can review DJ inquiries and beat purchase inquiries.
  5. Admin can create and edit beat metadata records in preparation for future uploads.
**Plans**: 5 plans

Plans:
- [ ] 08-01: Build homepage content-management forms and preview workflows.
- [ ] 08-02: Build events CRUD and placeholder-event management.
- [ ] 08-03: Build studio availability management and booking request review.
- [ ] 08-04: Build DJ/beat inquiry review tooling and notifications surfaces.
- [ ] 08-05: Build beat metadata management and upload-ready admin fields.

### Phase 9: Launch Hardening and Discoverability
**Goal**: Prepare the site for a credible public launch with stronger discoverability, compliance, analytics, and QA.
**Depends on**: Phase 8
**Requirements**: [OPS-01, OPS-02]
**Success Criteria** (what must be TRUE):
  1. Public pages ship with strong metadata and launch-ready SEO foundations.
  2. Legal and licensing pages are accessible and aligned with manual inquiry flows.
  3. Analytics cover key public conversion and playback behaviors.
  4. Performance, accessibility, and placeholder content quality are reviewed before launch.
**Plans**: 4 plans

Plans:
- [ ] 09-01: Implement metadata, schema groundwork, and SEO surface checks.
- [ ] 09-02: Add legal, privacy, refund, and licensing content.
- [ ] 09-03: Instrument analytics for key browsing and inquiry events.
- [ ] 09-04: Run QA, accessibility, performance, and launch-content hardening.

## Progress

**Execution Order:**
Phases execute in numeric order: 2 → 2.1 → 2.2 → 3 → 3.1 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation and Brand System | 0/4 | Not started | - |
| 2. Marketplace Browsing and Playback | 0/5 | Not started | - |
| 3. Beat Detail and Inquiry Conversion | 0/3 | Not started | - |
| 4. Studio Booking Flow | 0/4 | Not started | - |
| 5. Secondary Public Pages and Trust Content | 0/4 | Not started | - |
| 6. Accounts and Favorites UX | 0/3 | Not started | - |
| 7. Admin Auth and Dashboard Foundation | 0/3 | Not started | - |
| 8. Admin Operations and Content Management | 0/5 | Not started | - |
| 9. Launch Hardening and Discoverability | 0/4 | Not started | - |
