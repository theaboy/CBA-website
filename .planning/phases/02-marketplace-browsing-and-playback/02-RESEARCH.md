# Phase 2: Marketplace Browsing and Playback - Research

**Researched:** 2026-02-28
**Status:** Complete
**Phase:** 2
**Requirements:** HOME-01, HOME-02, BEAT-01, BEAT-02, BEAT-03, BEAT-04

## Objective

Answer: "What do we need to know to plan Phase 2 well?"

Phase 2 needs to turn the current visual shell into a working browse-and-play experience without overcommitting to backend commerce or full media infrastructure. The planning emphasis should be on data shape, client state boundaries, component reuse, and how to preserve the premium brand direction while adding denser interactive UI.

## Findings

### 1. The playback system should be introduced as a dedicated client boundary, not sprinkled across cards

One-track-at-a-time control and a persistent mini-player are cross-route concerns. The safest plan is to create:
- a central playback provider/store
- reusable play controls for cards and featured modules
- one shared audio element or tightly controlled audio instance strategy

If each beat card owns its own player, overlap and state drift are nearly guaranteed.

### 2. Placeholder beat data should be normalized early

Even with no real catalog yet, Phase 2 should define a stable beat model that later phases can reuse:
- id / slug
- title
- bpm
- genre
- mood
- price
- artwork
- duration
- audio source
- featured / latest / popular flags

This lets the listing page, homepage feature rail, filters, and mini-player all use the same source structure.

### 3. Featured beats on the homepage should feel editorial, not duplicated

The homepage already has a strong modular composition. Planning should treat featured beats as a curated block that reuses beat-card logic where possible but has its own composition and spacing so the page does not collapse into a generic grid.

### 4. Filters and sorting should be planned as composable UI, with simple local derivation first

Because the catalog is currently placeholder-scale, Phase 2 does not need server-backed search. Local filtering and sorting are sufficient if the code is organized so a future server/data-source swap is straightforward.

Recommended initial filters:
- genre
- mood
- BPM range
- price range
- sort by latest / popular

### 5. Visual density needs one dedicated polish pass

Beat browsing introduces more metadata, controls, and repeated cards than Phase 1. If the grid is added without deliberate polish, it will look like a different product. A dedicated final plan should focus on:
- card hierarchy
- metadata readability
- mini-player visual integration
- responsive density and spacing
- loading/empty placeholder quality

## Planning Implications

- Plan 01 should define the beat schema, placeholder dataset, and display helpers.
- Plan 02 should own centralized playback state and the persistent mini-player.
- Plan 03 should build the beats listing page with cards, filters, and sort controls.
- Plan 04 should integrate featured beats and beat-driven CTA structure into the homepage.
- Plan 05 should focus on polish, responsive density, empty states, and interaction refinement.

## Risks

- Audio state may force rework if introduced after cards are already built.
- Featured and listing card variants can drift if they share no common model or component base.
- Marketplace UI may undermine the existing brand quality if card density is added without a dedicated refinement pass.

## Recommended Plan Strategy

- Create the beat data shape first.
- Put playback infrastructure in place before completing card interactions.
- Keep homepage integration and browse-page implementation close enough to share primitives, but separate enough to preserve page-specific art direction.

---

*Research completed: 2026-02-28*
