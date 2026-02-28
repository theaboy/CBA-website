# Pitfalls Research

**Project:** CBA Official Website
**Dimension:** Pitfalls
**Researched:** 2026-02-28
**Confidence:** MEDIUM

## Critical Pitfalls

### 1. Building “fake checkout” that feels broken

If beat and ticket flows visually imply instant purchase but end in manual email handling without clarity, users will feel misled.

**Avoid by:**
- explicitly presenting request, reserve, or inquire states
- showing what happens next after submission
- matching CTA copy to the real operational flow

### 2. Fragmented audio playback

Independent player instances across cards and pages create overlapping playback, broken route transitions, and confusing controls.

**Avoid by:**
- centralizing playback state
- enforcing one-track-at-a-time behavior
- designing mini-player requirements before implementation

### 3. Overbuilding admin before content models are stable

A rich dashboard built before agreeing on homepage sections, beat fields, event structure, and booking states leads to rewrites.

**Avoid by:**
- defining core entities first
- building admin around stable schemas
- phasing CRUD screens after content structure is agreed

### 4. Shipping empty or weak content states

The project starts without a real beat catalog or real event inventory, so empty grids can make the site feel unfinished.

**Avoid by:**
- designing premium placeholder states
- using curated sample content structures
- making “coming soon” or preview states feel intentional, not broken

### 5. Treating account UI as full auth too early

If the team promises too much around accounts before auth/persistence exists, later integration becomes painful or misleading.

**Avoid by:**
- clearly marking UI-first scope in requirements
- separating visual account flows from backend auth implementation
- storing only low-risk local preferences unless real auth is added

### 6. Neglecting legal/licensing clarity

Beat licensing, event reservation terms, privacy, and refund expectations are part of trust, especially when conversion is manual.

**Avoid by:**
- including licensing/terms surfaces in launch scope
- aligning request forms and confirmation messaging with legal copy
- leaving room for future payment/refund policy integration

## Roadmap Implications

- Solve public UX truthfulness before payment automation.
- Establish audio architecture before polishing marketplace interactions.
- Define shared schemas before admin tooling.
- Reserve a dedicated hardening phase for legal, SEO, analytics, and content quality.

## Sources

- [BeatStars](https://www.beatstars.com/)
- Product context from `.planning/PROJECT.md`

---
*Research completed: 2026-02-28*
