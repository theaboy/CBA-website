# Beat Page Rework + Mobile Responsiveness — Design

Date: 2026-06-20
Branch: integration/ui-plus-backend
Scope: Frontend only (no backend/auth/payments changes).

## Goals

1. **Rework the beat "buy" page** (`/beats/[slug]`) into a lean "hear it → buy it"
   page that fully follows the LightCatalog artistic direction.
2. **Make all non-hero pages responsive** (mobile).

## Decisions (from brainstorming)

- **Buy action:** compact inquiry form stays on-page (v1 sales are manual; reuse
  existing `submitBeatInquiry` server action — no backend changes).
- **Pricing:** one price per beat. Tiers (Basic/Premium/Exclusive) removed from the
  UI. Use `price_basic` as the single canonical price; the hidden `licenseCode`
  field is set to `"basic"` to satisfy the existing validator/action.
- **Keep on beat page:** artwork + play, waveform, title, one-line tagline,
  BPM + Key, tags (genre/mood), single price, inquiry form.
- **Cut from beat page:** long description, Mix Palette, Ideal Uses, the 3 license
  cards/selector, the empty related-beats section.
- **Responsive scope:** about, contact, events, reservation, radio, beats catalogue,
  and the new beat page. **Hero pages excluded.**

## Artistic direction (single source of truth)

The AD currently lives as inline constants in `components/beats/light-catalog.tsx`:
PAPER `#f5f1e8`, PAPER_DEEP `#ece6d7`, INK `#0d0c0a`, INK_SOFT `#3a342d`,
INK_MUTE `#8a8580`, INK_FAINT `#cdc4b3`, GOLD `#a47b3c`, GOLD_BRIGHT `#c9a961`,
LINE_LT/LINE_MED. Fonts: Cinzel/Cormorant serif, Space Grotesk sans, JetBrains mono.

These are extracted into `lib/beats/light-theme.ts` and imported by both
`light-catalog.tsx` and the new beat page so there is one source of truth.

## Part A — Beat page (`/beats/[slug]`)

- Delete `components/beats/beat-detail-hero.tsx` and
  `components/beats/beat-license-inquiry.tsx`.
- New `components/beats/beat-purchase.tsx` (`BeatPurchase`), inline-styled with the
  shared light-theme tokens, two-column on desktop:
  - Left: gold-framed artwork, overlaid `PlayToggle`, waveform strip beneath.
  - Right: breadcrumb → `genre / mood` eyebrow → title (serif) → tagline → spec row
    (BPM · KEY) → tag chips → single price → compact inquiry form.
- New `components/beats/beat-buy-form.tsx` (`BeatBuyForm`): compact, AD-styled,
  reuses `submitBeatInquiry`. Fields: name, email, artistName, intendedUse, notes
  (all still required by the validator), hidden `beatSlug` + `licenseCode="basic"`.
- `app/(marketing)/beats/[slug]/page.tsx` renders `<BeatPurchase beat={beat} />`.
- Remove now-unused `.beat-detail-*` / `.beat-license-*` / `.beat-inquiry-*` rules
  from `globals.css`.
- Built responsive from the start (stacks to one column on mobile).

## Part B — Responsive (audit-and-fix per page, in each page's own styling system)

- **Inline-style components** (`light-catalog`, new beat page): add a small
  `useIsMobile()` matchMedia hook (`components/ui/use-is-mobile.ts`) and branch the
  few layout values (column→stack, fixed `60px` padding → `clamp()`, font sizes).
- **globals.css pages** (about, contact, page-shell, Section, route-placeholder):
  add `@media (max-width: 768px)` / `(max-width: 480px)` blocks — collapse grids to
  one column, fluid padding, scale headings.
- **CSS-module pages** (events/marquee, reservation, radio): add/extend mobile media
  queries; collapse multi-column layouts, fix horizontal overflow, wrap controls.

## Verification

- `npm run typecheck` + `npm run build` pass.
- Spot-check beat page + each responsive page at 375px and 768px (no horizontal
  overflow, readable, controls reachable).

## Out of scope

Hero pages, admin, auth, payments, and any backend/data changes.
