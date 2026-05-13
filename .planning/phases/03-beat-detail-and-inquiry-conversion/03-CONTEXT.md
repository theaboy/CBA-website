# Phase 3: Beat Detail and Inquiry Conversion - Context

**Gathered:** 2026-02-28
**Status:** Ready for planning
**Source:** Synthesized from Phase 2 implementation, roadmap, requirements, and confirmed inquiry-first product scope

<domain>
## Phase Boundary

Phase 3 turns the new browse-and-play marketplace into a real conversion surface for beat leads. This phase is about the beat detail experience, license communication, and inquiry capture. It should expand the current beat catalog into individual detail routes with larger playback treatment, deeper metadata, and a clear inquiry-first explanation of how licensing works before Stripe exists.

This phase must satisfy:
- `BEAT-05`: beat detail page with larger player, waveform-ready presentation, description, and license options
- `BEAT-06`: beat inquiry flow that captures the selected beat, chosen license tier, and contact details

</domain>

<decisions>
## Implementation Decisions

### Locked Decisions

- Payments remain out of v1 for this phase; the beat detail page must set expectation around manual follow-up instead of pretending checkout exists.
- The beat detail route should build directly on the shared Phase 2 beat catalog and root audio system rather than creating a second playback model.
- License options should be presented as credible commercial tiers for inquiry and later Stripe integration.
- Inquiry UX should feel premium and confident, not like a generic contact form dropped onto a product page.
- Inquiry submissions need a server-side boundary now so later admin review and notification work can plug into it cleanly.

### Claude's Discretion

- Exact route shape for beat detail pages as long as it uses stable slugs and clean public URLs
- Exact waveform-ready presentation strategy while real uploaded waveform data does not exist yet
- Exact validation and confirmation UX for the inquiry flow
- Exact storage/notification placeholder strategy for submissions before the admin tooling phase lands

</decisions>

<specifics>
## Specific Ideas

- Phase 2 already established:
  - shared beat model and helpers in `lib/beats/*`
  - root audio state and persistent mini-player in `lib/audio/*`
  - beat cards and homepage features that can deep-link into beat detail routes
- The detail page should make the current placeholder catalog feel more premium by adding:
  - larger artwork/player composition
  - denser metadata and descriptive copy
  - visually distinct license tiers
  - strong inquiry CTA with selected license context
- The form should capture enough operational detail for manual sales follow-up without overbuilding commerce:
  - selected beat
  - selected license
  - artist/contact info
  - intended usage or notes

</specifics>

<deferred>
## Deferred Ideas

- Real Stripe checkout and automatic delivery
- Generated waveform data from uploaded audio
- Purchase history and licensed download fulfillment
- Real consumer auth integration for saved inquiry state
- Full admin review tooling beyond the submission boundary needed now

</deferred>

---

*Phase: 03-beat-detail-and-inquiry-conversion*
*Context gathered: 2026-02-28 via roadmap, requirements, and Phase 2 implementation state*
