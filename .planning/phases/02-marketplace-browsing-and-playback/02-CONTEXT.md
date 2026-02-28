# Phase 2: Marketplace Browsing and Playback - Context

**Gathered:** 2026-02-28
**Status:** Ready for planning
**Source:** Synthesized from executed Phase 1 code, roadmap, requirements, and project context

<domain>
## Phase Boundary

Phase 2 converts the current branded public shell into a real beat-browsing experience. This phase is specifically about discovery and playback, not the detailed licensing inquiry flow yet. It must establish the beat data model, the browse grid, filters/sort behavior, strong play affordances, homepage featured-beat integration, and a persistent mini-player with one-track-at-a-time control across public pages.

This phase must satisfy:
- `HOME-01`: cinematic homepage with clear CTA support for beat browsing
- `HOME-02`: featured beats surfaced on the homepage
- `BEAT-01`: beat grid with title, BPM, genre, price, play control, favorite action, and inquiry/add-to-cart affordance
- `BEAT-02`: filtering and sorting controls
- `BEAT-03`: only one track plays at a time
- `BEAT-04`: visitor can control current playback from a persistent mini-player across pages

</domain>

<decisions>
## Implementation Decisions

### Locked Decisions

- The Phase 1 custom CSS token system remains the styling baseline; Phase 2 should extend it rather than replace it.
- The beats experience must feel premium and music-first, not like a generic ecommerce product grid.
- Placeholder beat data is acceptable in this phase because the real beat catalog is not available yet.
- Playback must be centralized so one-track-at-a-time behavior is guaranteed across route transitions.
- The homepage should start surfacing beats in a way that feels integrated with the existing editorial composition.
- Public route structure already exists and should be reused, especially `app/(marketing)/beats/page.tsx` and the homepage route.

### Claude's Discretion

- Exact client-side state solution for beat playback and filters
- Whether favorites remain visual-only in this phase or store lightweight local state
- Exact card, waveform, and mini-player presentation details as long as they respect the brand system
- Exact placeholder audio strategy, including use of a small local sample if needed

</decisions>

<specifics>
## Specific Ideas

- Phase 1 already established:
  - `app/(marketing)/beats/page.tsx`
  - `app/(marketing)/page.tsx`
  - `app/globals.css`
  - `lib/site.ts`
  - shared marketing shell components
- The current beats page is still a structured placeholder and explicitly calls out the upcoming player dock, filters, and metadata-heavy cards.
- The homepage already has strong visual identity; the featured-beats integration should preserve that tone rather than dropping in a plain utility grid.
- Future Phase 3 will handle beat detail pages and licensing inquiry forms, so Phase 2 should stop short of full conversion flow implementation.

</specifics>

<deferred>
## Deferred Ideas

- Beat detail pages and license selection flow
- Purchase inquiry form submission
- Real favorites/account persistence
- Real beat uploads and waveform generation from uploaded media
- Stripe checkout and fulfillment

</deferred>

---

*Phase: 02-marketplace-browsing-and-playback*
*Context gathered: 2026-02-28 via executed project state and roadmap synthesis*
