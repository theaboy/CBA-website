# Phase 3: Beat Detail and Inquiry Conversion - Research

**Researched:** 2026-02-28
**Refreshed:** 2026-02-28
**Status:** Complete
**Phase:** 3
**Requirements:** BEAT-05, BEAT-06

## Objective

Answer: "What do we need to know to plan Phase 3 well?"

Phase 3 needs to convert browse intent into qualified beat leads without a real checkout yet. The planning emphasis should be on route architecture, reuse of the Phase 2 audio/catalog foundations, license communication, and a submission path that feels real now without overcommitting to backend systems scheduled later.

This refresh confirms there is no scope change from the original plan. The only meaningful new signal is that the Phase 2 marketplace and playback behavior was manually confirmed in-browser, so the Phase 3 detail route can safely build on those interaction assumptions.

## Findings

### 1. Beat detail should be a true route, not a modal bolted onto the grid

This project already has a premium editorial shell and a persistent player. A dedicated route gives enough space for:
- stronger visual hierarchy
- deeper metadata
- real license explanations
- a proper inquiry form

It also gives CBA a stable URL per beat for sharing and later SEO work.

### 2. The detail page should reuse the shared playback system instead of introducing local audio state

Phase 2 already solved the hard playback boundary. Phase 3 should keep using the same provider and controls so:
- only one track plays at a time
- the mini-player stays authoritative
- beat cards, homepage features, and detail pages all stay in sync

The detail page can feel bigger and richer without owning a second audio source of truth.

### 3. "Waveform-ready" means layout and component boundaries should exist now, even if real waveform data does not

Because uploaded audio and generated waveform data are deferred, the plan should create a presentation slot that can later accept waveform input. For this phase, a stylized progress/visualizer surface or placeholder waveform container is enough if the component boundary is reusable and clearly upgradeable.

### 4. License options need clear differences and one selected state

Without direct checkout, the license section becomes the conversion engine. The UI should make each tier legible by:
- naming the tier clearly
- showing relative price or price anchor
- explaining the intended usage level
- carrying the selected license directly into the inquiry form

If license selection is visually weak, the inquiry form will feel disconnected from the product.

### 5. Inquiry handling should create a durable integration boundary now

Even if admin management arrives later, Phase 3 should not leave submissions as purely client-side theater. A server action or endpoint boundary should validate and normalize payloads, then hand off to a notification/storage adapter that can later be replaced with real persistence and admin review tooling.

### 6. Confirmation copy matters because there is no instant purchase

The success state must explain:
- that the request was received
- what CBA will do next
- how the selected beat and license were captured
- expected response timing or next-step framing

This replaces the reassurance that a real checkout usually provides.

### 7. Phase 3 should preserve continuity from the already-confirmed marketplace behavior

Because the user confirmed the Phase 2 experience in a real browser, Phase 3 should assume:
- beat cards and homepage features are stable entry points
- persistent playback continuity is part of the user expectation now
- the detail route should feel like a deeper layer of the same product, not a disconnected microsite

## Planning Implications

- Plan 01 should build the dynamic beat detail route, large player composition, and waveform-ready module.
- Plan 02 should own the license tier presentation and inquiry form UX, including selected-license state.
- Plan 03 should own server-side submission handling, validation, success states, and a notification-ready integration boundary for admin follow-up.

## Risks

- A second audio implementation on the detail page would regress Phase 2's playback guarantees.
- A weak license hierarchy would make the inquiry form feel like a generic contact capture instead of a sales flow.
- Client-only form submissions would create rework when admin operations and notifications are added later.

## Recommended Plan Strategy

- Build the route and detail presentation first so the inquiry UX is anchored in a real product page.
- Keep license selection as a shared state between the detail surface and the inquiry form.
- Introduce the submission boundary before calling the phase complete, even if persistence is still lightweight.

---

*Research refreshed: 2026-02-28*
