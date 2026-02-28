# CBA Official Website

## What This Is

CBA Official Website is a premium, music-first website for a Montreal band that combines brand storytelling, a beat marketplace, studio booking, event promotion, DJ service lead capture, and a real internal admin dashboard. The first release is designed to look polished enough to represent the brand publicly while enabling manual sales operations through inquiry-based flows instead of full payment automation.

The experience should feel closer to a modern music storefront than a generic band site: dark, high-contrast, audio-led, and responsive, with browsing and playback patterns inspired by BeatStars while preserving CBA's own Montreal-rooted identity.

## Core Value

Make it easy for visitors to discover CBA's sound and convert into beat or studio-booking leads through a premium, trustworthy experience.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Launch a premium public-facing marketing and commerce site centered on beats and studio bookings.
- [ ] Deliver a beat marketplace UX with persistent playback, detailed beat pages, and inquiry-driven licensing flow.
- [ ] Deliver a studio booking flow with availability browsing and request submission.
- [ ] Deliver a real internal admin dashboard for content, events, inquiries, studio availability, and future beat catalog operations.
- [ ] Keep user account and favorites scope UI-first so backend auth/purchase systems can be implemented in later work without redoing the interface.

### Out of Scope

- Automated Stripe checkout and payment capture — intentionally deferred so v1 can ship faster with manual inquiry handling.
- Beat file delivery after payment — depends on payment and licensing automation not in v1.
- Purchase history and previous-download management — deferred until real commerce and account persistence exist.
- Full production account backend and third-party auth integration — UI should anticipate this, but implementation can land in a later phase.
- Subscription beats, sample packs, collaboration marketplace, NFTs, and affiliate systems — future monetization options, not launch scope.

## Context

- CBA is a Montreal-based music band selling custom instrumentals, studio time, tickets, and DJ services.
- Existing assets already present in the repo include branding materials, a customer PDF with theme/font guidance, and page mockups for home and related screens.
- The user wants the site to feel premium, urban, professional, dark-themed, and strongly music-centric, with BeatStars as a UX reference point and a higher-end editorial feel.
- v1 business priority is beats plus studio bookings; events and DJ services still need public presence and admin management, but they are secondary to those two conversion paths.
- The launch should be capable of real business use even if some operations remain manual behind the scenes.
- Beat audio/catalog content and real events do not yet exist, so the system should support placeholder content now and smooth admin population later.
- Account creation and saved favorites should be represented in the UI, but if backend auth/storage is not yet justified, the architecture should preserve room for a later Supabase or equivalent implementation.

## Constraints

- **Design fidelity**: Public experience must feel premium and non-generic — this is central to brand positioning.
- **Audio UX**: Playback must be reliable and clear — the beats browse/play experience is core to conversion.
- **Commerce scope**: Inquiry/request flows first — avoids blocking launch on payments and legal automation.
- **Admin capability**: Internal dashboard must be real in v1 — content and operations cannot depend on hardcoded public pages forever.
- **Content readiness**: Beats and events are incomplete today — system needs placeholders and easy future content ingestion.
- **Mobile UX**: Responsive behavior is mandatory — music audiences will browse heavily on mobile.
- **SEO**: Public pages need strong metadata and event schema groundwork — supports discovery in Montreal/local music queries.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Prioritize beats and studio bookings in v1 | These are the primary business goals for launch | — Pending |
| Use inquiry/request flows before Stripe | Faster path to launch while preserving future payment upgrade path | — Pending |
| Build a real internal admin dashboard in v1 | Public content, bookings, and operations need maintainable management tools | — Pending |
| Keep accounts and favorites UI-first if backend auth is not yet implemented | Preserves product direction without forcing premature auth integration | — Pending |
| Use existing customer assets and mockups as design input | Brand materials already exist and should reduce design guesswork | — Pending |

---
*Last updated: 2026-02-28 after initialization*
