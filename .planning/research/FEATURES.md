# Feature Research

**Project:** CBA Official Website
**Dimension:** Features
**Researched:** 2026-02-28
**Confidence:** MEDIUM

## Domain Framing

This product sits between a music storefront, a premium band website, and a service-booking platform. The feature set therefore needs to combine three expectations:

1. fast, audio-first browsing
2. clear trust signals and brand storytelling
3. friction-light inquiry or booking conversion paths

## Table Stakes

### Music Discovery and Playback

- Beat grid with cover art, metadata, and strong play affordances
- Single active playback session across browsing surfaces
- Persistent mini-player or sticky playback controls
- Beat detail page with larger player and deeper metadata
- Genre, mood, BPM, and sort/filter controls

### Conversion Paths

- Clear CTA hierarchy on the homepage
- Dedicated public pages for beats, studio, events, and DJ services
- Inquiry or request forms with useful structured fields
- Confirmation states after submission
- Trust-building sections: testimonials, about/story, contact, and social proof

### Admin/Operations

- Ability to manage public homepage or section content without code changes
- Ability to manage events, inquiries, and booking availability
- Beat catalog management, even if audio assets come later
- Internal visibility into incoming requests

### Quality Baseline

- Responsive mobile layout
- Good page speed
- Metadata and SEO structure
- Legal pages and licensing language

## Differentiators

- Cinematic home hero with a branded visual identity rather than generic SaaS styling
- Editorial presentation of CBA's Montreal roots and music identity
- Premium player interactions, hover states, and transitions
- Unified public/admin system rather than a stitched-together collection of tools
- Future-ready architecture for payments, storage, and richer account features

## Anti-Features

- Full automated ticketing and secure purchase orchestration before core browse/inquiry flows are proven
- Complex marketplace mechanics like bidding, subscriptions, or creator ecosystems in launch scope
- Overloaded social/community features that distract from selling beats and services
- Backend-heavy account features such as purchase history before payments actually exist

## Complexity Notes

| Feature Area | Complexity | Notes |
|-------------|------------|-------|
| Persistent audio player | Medium | Route transitions and state coordination need careful planning |
| Inquiry-driven beat licensing | Medium | UX must still feel premium without full checkout |
| Studio availability management | Medium | Needs clear admin/public data flow even if booking fulfillment is manual |
| Internal dashboard | High | Requires auth, CRUD tooling, and role separation from public site |
| User accounts UI-first | Medium | Must avoid fake complexity while leaving room for future backend integration |

## Dependencies

- Playback architecture should be solved before finalizing beat browse/detail UX.
- Admin content model should be defined before building editable homepage sections.
- Studio booking schema should be defined before public forms and admin review tooling.
- SEO/legal surfaces should be integrated near launch hardening, but metadata strategy should start early.

## Implications

- The roadmap should front-load design system, routing, and playback foundations.
- Beats and studio flows should ship before secondary revenue paths.
- Admin should be phased, starting with secure shell/data models before full management tools.
- Account UI should be separated from full auth infrastructure so it does not block launch.

## Sources

- [BeatStars](https://www.beatstars.com/)
- Product context from `.planning/PROJECT.md`

---
*Research completed: 2026-02-28*
