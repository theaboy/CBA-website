# Unified Reservation Page (`/reservation`) — Design

**Date:** 2026-05-21
**Scope:** Replace `/studio` and `/dj-services` with a single booking page covering both services. Implements the structure from `design-handoff/design_handoff_reservation_studio_dj/` adapted to the existing `/desktop-fm` green-gold universe with a spinning 3D record as the hero ornament. Frontend only — submission is a typed stub ready for Supabase wiring.

---

## Goals

1. Single page at `/reservation` that books both **Session Studio** and **Réservation DJ** through a shared calendar.
2. Visual direction matches `/desktop-fm`: deep greens, warm gold, cream type, DM Serif Display + Cormorant + JetBrains Mono + DM Sans fonts.
3. Spinning 3D record in the hero (extracted/standalone component, lighter than reusing the full `/desktop-fm` turntable scene).
4. Typed `submitReservation(payload)` stub returning a fake reference — friend swaps body for Supabase later, component code never changes.
5. Delete obsolete routes/files: `app/(marketing)/studio/`, `app/(marketing)/dj-services/`, `lib/studio/`, `lib/inquiries/studio-booking.ts`, `components/studio/`.
6. Collapse two nav entries ("Réserver le Studio", "Réserver un DJ") into one ("Réserver" → `/reservation`).

## Non-goals

- No real backend / Supabase integration in this iteration. The friend handles that separately.
- No admin queue, no email delivery, no calendar API.
- No bilingual support (page stays Québec French).
- No payment integration (handoff explicitly says "Aucun paiement n'est prélevé maintenant").
- No reuse of the existing studio booking shell — it ships with the cleanup deletion.

---

## 1. Route & navigation

### Route

- New: `app/(marketing)/reservation/page.tsx` — server component, just renders `<ReservationShell />`.
- Sits inside the `(marketing)` route group so it inherits `MarketingShell` (grain overlay, ambient glows). The page-scoped reservation tokens override the marketing shell's palette under a `.reservationPage` wrapper.

### Cleanup

| Action | Path |
|---|---|
| Delete | `app/(marketing)/studio/` (whole folder: `page.tsx`, `actions.ts`) |
| Delete | `app/(marketing)/dj-services/` (whole folder: `page.tsx`) |
| Delete | `lib/studio/` (whole folder: `catalog.ts`, `index.ts`) |
| Delete | `lib/inquiries/studio-booking.ts` |
| Delete | `components/studio/` (whole folder: `studio-booking-shell.tsx`, `studio-booking-form.tsx`) |
| Delete | All `.studio-shell`, `.studio-*` global CSS rules in `app/globals.css` |
| Update | `app/(hero)/page.tsx` — `StudioSectionMockup`'s "Réserver" button must link to `/reservation`, not `/studio` |
| Update | `pageSummaries` in `lib/site.ts` — remove `/studio` and `/dj-services` entries |

### Nav update — `lib/site.ts`

`siteConfig.nav` becomes 5 entries (was 6):

```ts
nav: [
  { href: "/",            label: "Accueil",             icon: "⌂", shortLabel: "Accueil" },
  { href: "/beats",       label: "Nos Beats",           icon: "◈", shortLabel: "Beats"   },
  { href: "/reservation", label: "Réserver",            icon: "⬡", shortLabel: "Réserver"},
  { href: "/events",      label: "Nos Événements",      icon: "◷", shortLabel: "Agenda"  },
  { href: "/radio",       label: "Écouter la Radio",    icon: "◉", shortLabel: "Radio"   },
] satisfies NavLink[],
```

Removed: "Réserver un DJ" (`/dj-services`) and "Réserver le Studio" (`/studio`). Added: "Réserver" (`/reservation`). `secondaryNav` unchanged.

---

## 2. Page structure (top to bottom)

1. **Hero** — 2-column on desktop, single column ≤880px.
   - Left: eyebrow `RÉSERVATION · CBA` with pulse dot → h1 "Réserver une session" (DM Serif Display, `clamp(48px, 8vw, 128px)`, line-height 0.92) → lede (Cormorant italic, 18-22px, cream-mute).
   - Right: `<SpinningRecord />` canvas ~400×400 with a sibling radial gold glow.
   - Mobile: record drops below the title block at ~280×280 centered.
2. **Service switch** — segmented control with 2 tabs (`Session Studio`, `Réservation DJ`). Specs in §3.
3. **Booking grid** — 2 columns on desktop (`grid-template-columns: 1fr 420px`, gap 28px), single column ≤1080px (right column unsticks). Specs in §4–§7.
4. **Confirmation modal** — overlay, opens on successful submit. Specs in §8.

**Page wrapper:**
- `max-width: 1320px`, `margin-inline: auto`.
- Padding: `clamp(48px, 6vw, 96px) clamp(24px, 5vw, 80px) 160px`.
- Background: radial gradient stack from the handoff (gold gloss top-right + green wash top-left + deep green base) layered on top of `--bg-mid` → `--bg-deep` → `oklch(10% 0.025 150)`.
- Fixed SVG noise overlay at `opacity: 0.10`, `mix-blend-mode: overlay`, `pointer-events: none`.

**MarketingShell chrome:** the page lives inside `(marketing)`, so `MarketingShell` already renders `.grain-overlay` + two orange `.ambient` glows. Those would clash with the green/gold atmosphere. The reservation page CSS module includes overrides that hide both ambient glows and the grain overlay when the `.reservationPage` wrapper is present (e.g., `.reservationPage ~ .grain-overlay, .reservationPage ~ .ambient { display: none }` placed at the `marketing-shell` level, or scoped via `body[data-route="reservation"]`). Implementation picks whichever is cleanest in Next.js App Router.

---

## 3. Visual tokens & fonts

### Design tokens — scoped under `.reservationPage`

Imported verbatim from the handoff (already compatible with `/desktop-fm`):

```css
.reservationPage {
  --bg-deep:     oklch(13% 0.035 150);
  --bg-mid:      oklch(17% 0.045 148);
  --bg-glow:     oklch(28% 0.08 130);
  --bg-card:     oklch(15% 0.04 148);
  --bg-card-hi:  oklch(19% 0.05 145);
  --border:      oklch(35% 0.06 130);
  --border-hi:   oklch(55% 0.10 100);
  --border-dim:  oklch(28% 0.045 140);
  --gold:        oklch(74% 0.15 65);
  --gold-soft:   oklch(68% 0.14 62);
  --gold-deep:   oklch(54% 0.13 58);
  --gold-glow:   oklch(80% 0.17 68);
  --cream:       oklch(94% 0.025 90);
  --cream-mute:  oklch(78% 0.04 90);
  --cream-dim:   oklch(58% 0.04 95);
}
```

Tokens are local to this wrapper — homepage / `/beats` / `/radio` / `/desktop-fm` keep their existing palettes untouched.

### Fonts

| Family | Where it's used |
|---|---|
| `--font-display: "DM Serif Display"` | h1, formula h3, summary title, big total number |
| `--font-serif: "Cormorant Garamond"` | italic body, fineprint, empty-state copy, formula description |
| `--font-mono: "JetBrains Mono"` | eyebrows, labels, slot times, total label, reference badge |
| `--font-sans: "DM Sans"` | form inputs, generic body |

**Loading:** JetBrains Mono is already loaded in `app/layout.tsx` via the Google Fonts `<link>`. Three new families need to be added to that same URL: `DM Serif Display` (400/400i), `Cormorant Garamond` (400/500/600/700, italic), `DM Sans` (400/500/600). The existing preconnect block is reused.

### Service switch

- `width: fit-content`, padding 6px, radius 6px, bg `oklch(15% 0.04 148 / 0.6)`, border `--border`.
- Inactive tab: mono uppercase, color `--cream-dim`, small dot in `--cream-dim`.
- Active tab: bg `linear-gradient(180deg, oklch(22% 0.06 130 / 0.7), oklch(15% 0.04 148 / 0.7))`, color `--gold-glow`, inset 1px gold border + soft gold halo, dot `--gold-glow` with `0 0 8px` glow.

**Switching service:** dispatch `SET_SERVICE`. Reducer resets `formulaId` and `durationIdx`, **keeps** `selectedDate` and `selectedSlot` (shared calendar).

---

## 4. Formula card (Step 01)

- 3 columns desktop (`grid-template-columns: repeat(3, 1fr); gap: 14px`), 1 column ≤1080px.
- Each card: border 1px `oklch(30% 0.05 130 / 0.6)`, radius 4px, padding 22px.
- `f-tag` row: mono uppercase, 9.5px, letter-spacing 0.24em, color `--gold-soft`, with a 14px circular radio indicator.
- `h3` (formula name): DM Serif Display 22px, color `--cream`.
- Description: Cormorant italic 14px, `--cream-mute`.
- Price footer (dashed top border): `$XXX` in DM Serif Display 26px `--gold-glow` + unit in mono 10px uppercase `--cream-dim`.
- Hover: `translateY(-1px)`, border `--border-hi`, radial gold inset glow.
- Selected: border `--gold-soft`, gradient bg, gold radio dot filled, outer halo.

### Formula data (frozen in `lib/reservation/catalog.ts`)

**Studio:**

| id | tag | name | description | price | unit | durations |
|---|---|---|---|---|---|---|
| `rec` | Enregistrement | Sessions d'enregistrement | (per handoff) | 120 | `$ / h` | `2 h`, `4 h`, `Journée 8 h` |
| `mix` | Mixage | Mixage & Mastering | (per handoff) | 250 | `$ / titre` | `1 titre`, `EP · 4 titres` |
| `prod` | Production | Production sur mesure | (per handoff) | 500 | `$ / jour` | `1 jour`, `2 jours`, `Semaine` |

**DJ:**

| id | tag | name | description | price | unit | durations |
|---|---|---|---|---|---|---|
| `club` | Club / Bar | Set Club · 2 h | (per handoff) | 450 | `$ / set` | `2 h`, `3 h`, `4 h` |
| `priv` | Privé | Événement privé | (per handoff) | 850 | `$ / soirée` | `4 h`, `6 h`, `Soirée complète` |
| `fest` | Festival | Festival / Showcase | (per handoff) | 1200 | `$ / showcase` | `60 min`, `90 min`, `120 min` |

Descriptions copied verbatim from the handoff HTML. The exact strings are extracted during implementation; spec frozen on the shape only.

---

## 5. Calendar card (Step 02)

- Header: month + year (DM Serif Display 28px, year italic `--gold-deep`) + two 40px circular arrow buttons (`prev` left, `next` right).
- Weekday row: Mon–Sun (week starts Monday), mono uppercase 10px, `--cream-dim`.
- Grid: `grid-template-columns: repeat(7, 1fr)`, `gap: 6px`, cells `aspect-ratio: 1/1`.
- Cell types: `empty`, `past`, `avail`, `full`, `today`, `selected` — visual treatments per handoff §4.
- Each cell: day number (DM Serif Display 22px) + meta line ("dispo" / "complet") in mono 8.5px (`--cream-dim`).
- Legend row below grid: three swatches (Disponible · Sélection · Complet).
- ≤640px: day-meta hidden, day number drops to 16px.

### Availability (mock for this iteration)

`lib/reservation/availability.ts` exports two pure functions copied from the handoff:

```ts
export function hash(s: string): number;
export function dayStatus(d: Date): "past" | "avail" | "full";
export function slotsFor(date: Date): { time: string; taken: boolean }[];
```

`dayStatus` uses the deterministic hash logic from the handoff (Sundays mostly off, 1-in-11 random closures). `slotsFor` generates 13 hourly slots from 10:00 → 22:00 with deterministic taken flags.

When the friend ships Supabase, the body of each function becomes a call to a typed wrapper around the Supabase client. Signatures don't change.

---

## 6. Slot picker (Step 03)

- Empty state (no date selected): centered Cormorant italic message in a 1px dashed bordered box.
- After date pick:
  - Meta row: formatted French date in `--gold` + "· N créneaux libres" in `--cream-dim`.
  - Grid: `repeat(auto-fill, minmax(120px, 1fr))`, gap 10px.
  - Slot button: mono 13px time + small uppercase period label (`Matin` < 12, `PM` < 17, `Soir` < 21, else `Nuit`).
  - Taken: opacity 0.35, line-through, `disabled`.
  - Selected: gold gradient bg matching selected calendar cell.
- **Duration row** below slots: mono label "Durée" + pill buttons for `formula.durations`.

---

## 7. Summary card (right, sticky)

- Eyebrow "Récapitulatif" (mono uppercase, `--gold`).
- Service title (DM Serif Display 36px, `--cream`) — toggles between "Session Studio" / "Réservation DJ".
- Formula sub-title (Cormorant italic 16px, `--cream-mute`) — "Formule à choisir" when none selected.
- 4 recap rows (key / value):
  - Date — `formatDate()` = `D mois YYYY` (lowercase month).
  - Heure — selected slot.
  - Durée — selected duration label.
  - Lieu — `studio: "CBA Studio · Plateau-Mont-Royal"`, `dj: "Sur place · Montréal & environs"`.
- Empty values: italic `--cream-dim`, "À sélectionner".

### Contact form

2-column CSS grid, gap 14px:

| Field | Type | Width | Required |
|---|---|---|---|
| Prénom | text | 1 col | ✓ |
| Nom | text | 1 col | ✓ |
| Téléphone | tel | 2 col (full) | ✓ |
| Courriel | email | 2 col (full) | ✓ |
| Notes pour l'équipe | textarea | 2 col (full) | optional |

Inputs: dark bg `oklch(13% 0.035 150 / 0.7)`, 1px `--border`, radius 4px, padding 12×14px. Focus: border `--gold-soft`, 3px gold halo (`oklch(60% 0.15 65 / 0.12)`).

Below 640px: form collapses to single column (all fields full-width).

### Totals box

- Background `oklch(11% 0.03 148 / 0.7)`, 1px `--border`, radius 4px, padding 22px.
- Row 1: formula name → base amount (formatted `fr-CA` + " $").
- Row 2: "Taxes (estim.)" → `base × 0.14975` (TPS + TVQ, Québec).
- Grand row (dashed top border): "Total" in `--gold` mono uppercase → big number in DM Serif Display 38px `--gold-glow` + "CAD" superscript.

### CTAs

- Primary: "Confirmer la réservation" — gold gradient bg, dark text, mono uppercase, 18×22px padding, glow shadow. Disabled when `!formulaId || !selectedDate || !selectedSlot`.
- Secondary: "Réinitialiser" — outlined, mono uppercase. Dispatches `RESET_ALL`.

### Fineprint

Cormorant italic 13px, centered, `--cream-dim`:

> Aucun paiement n'est prélevé maintenant. Un membre de l'équipe CBA confirme par courriel sous 24 h.

---

## 8. Confirmation modal

- Triggered when `submitReservation` resolves successfully.
- Fixed full-viewport overlay: bg `oklch(8% 0.02 150 / 0.85)` + `backdrop-filter: blur(8px)`.
- Card (max 520px, radius 8px, shadow `0 0 80px oklch(72% 0.17 65 / 0.40)`):
  - 64px circular check icon with gold border + glow.
  - h3 "Demande envoyée." (DM Serif Display 42px).
  - Cormorant italic copy: "Merci. L'équipe CBA confirme ta réservation par courriel sous 24 heures. Garde ta référence à portée de main."
  - Reference badge (dashed border, mono uppercase, `--gold`): the `ref` string returned by `submitReservation` (e.g., `CBA · STD-A4F2P`).
  - Close button (secondary style).
- Dismiss: click backdrop or close button. On dismiss, page state is preserved (user can edit + resubmit if they want).

---

## 9. 3D spinning record component

### File

`components/experiences/spinning-record.tsx` — new, standalone, ~100–120 lines.

**Why standalone vs reusing `desktop-fm-scene.tsx`:** the full turntable scene is 696 lines including audio playback, tonearm geometry, scroll-driven camera, and `RADIO_TRACKS` data — none of which the reservation hero needs. A focused component keeps the `/reservation` bundle small and decouples the two pages.

### Implementation

- `"use client"`.
- `<Canvas>` from `@react-three/fiber` at ~400×400 px CSS, transparent bg, `dpr={[1, 2]}`.
- `<Environment preset="studio" />` from `@react-three/drei` for soft reflections.
- A single `<group>` rotated continuously around the Y axis via `useFrame` (~0.4 rad/sec).
  - Record disc: `<cylinderGeometry args={[1.14, 1.14, 0.014, 96]} />` + `<meshPhysicalMaterial color="#0a0a0a" metalness={0.1} roughness={0.45} clearcoat={1} clearcoatRoughness={0.12} />`.
  - Center label: thinner `<cylinderGeometry args={[0.32, 0.32, 0.016, 64]} />` with a warm gold `<meshPhysicalMaterial color="#d9a85a" metalness={0.3} roughness={0.5} />`.
  - Center hole: a tiny dark cylinder cut-through (or just a darker label center via emissive mask).
  - Optional: 2-3 concentric `<ringGeometry>` grooves at very low opacity for vinyl texture.
- Camera: `position={[0, 1.5, 2.5]}`, looking at origin so the disc reads as a 3D object, not a flat circle.
- Sibling absolute-positioned `<div>` behind the canvas with `radial-gradient(circle, oklch(74% 0.15 65 / 0.25), transparent 70%)` for the gold halo.

### Reused dependencies

Already in `package.json` from williams's commit `d96600f`:
- `@react-three/fiber@^9.6.1`
- `@react-three/drei@^10.7.7`
- `three@^0.183.2`
- `@types/three@^0.183.1`

No new installs needed.

### Mobile behavior

Below 880px, the hero column collapses. Record drops to ~280×280, centered, sits **below** the title block so the typography still leads the page.

### Performance note

The component mounts only on `/reservation`, no SSR concerns (`use client`). The canvas pauses rendering when the page tab is hidden (R3F default). No texture loading — all materials are procedural.

---

## 10. Data model (`lib/reservation/`)

### Files

```
lib/reservation/
├── catalog.ts       — SERVICES, Formula, Duration, ServiceId, FormulaId types
├── state.ts         — ReservationState type, initialState, reducer + action types
├── pricing.ts       — TAX_RATE, computePricing(state) → { base, tax, grand }, formatCAD(n)
├── availability.ts  — hash, dayStatus, slotsFor — mock data for now
└── submit.ts        — ReservationPayload, ReservationResult, submitReservation()
```

### `catalog.ts`

```ts
export type ServiceId = "studio" | "dj";
export type FormulaId =
  | "rec" | "mix" | "prod"
  | "club" | "priv" | "fest";

export type Duration = { label: string; h: number };

export type Formula = {
  id: FormulaId;
  tag: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  durations: Duration[];
};

export type ServiceConfig = {
  label: string;
  location: string;
  formulas: Formula[];
};

export const SERVICES: Record<ServiceId, ServiceConfig> = {
  studio: { label: "Session Studio", location: "CBA Studio · Plateau-Mont-Royal", formulas: [/* rec, mix, prod */] },
  dj:     { label: "Réservation DJ", location: "Sur place · Montréal & environs", formulas: [/* club, priv, fest */] },
};
```

### `state.ts`

```ts
export type ReservationState = {
  service: ServiceId;
  formulaId: FormulaId | null;
  durationIdx: number;
  viewYear: number;
  viewMonth: number;
  selectedDate: Date | null;
  selectedSlot: string | null;
  contact: { firstName: string; lastName: string; phone: string; email: string; notes: string };
};

export type Action =
  | { type: "SET_SERVICE"; id: ServiceId }
  | { type: "SET_FORMULA"; id: FormulaId }
  | { type: "SET_DURATION"; idx: number }
  | { type: "NAV_MONTH"; delta: -1 | 1 }
  | { type: "SET_DATE"; date: Date }
  | { type: "SET_SLOT"; time: string }
  | { type: "UPDATE_CONTACT"; field: keyof ReservationState["contact"]; value: string }
  | { type: "RESET_ALL" };

export const initialState: ReservationState;
export function reducer(state: ReservationState, action: Action): ReservationState;
```

Reducer enforces the handoff's behavior rules:
- `SET_SERVICE` → resets `formulaId` and `durationIdx`, keeps date + slot.
- `SET_FORMULA` → sets formula, resets `durationIdx` to 0.
- `SET_DATE` → sets date, clears `selectedSlot`.
- `NAV_MONTH` → handles year roll-over.
- `RESET_ALL` → returns initial state.

### `pricing.ts`

```ts
export const TAX_RATE = 0.14975;

export function computePricing(state: ReservationState): { base: number; tax: number; grand: number } | null;

export function formatCAD(n: number): string;  // "120,00 $" via toLocaleString("fr-CA")
```

`computePricing` returns `null` when `formulaId` is null (no math possible). Otherwise applies the 6-case unit logic from the handoff (`/ h`, `/ titre`, `/ jour`, `/ set`, `/ soirée`, `/ showcase`).

### `submit.ts` — Supabase handoff seam

```ts
export type ReservationPayload = {
  service: ServiceId;
  formulaId: FormulaId;
  durationIdx: number;
  date: string;     // "YYYY-MM-DD"
  time: string;     // "HH:MM"
  contact: ReservationState["contact"];
};

export type ReservationResult = { ref: string };

export async function submitReservation(payload: ReservationPayload): Promise<ReservationResult> {
  // Frontend stub. Friend replaces this body with a Supabase call.
  await new Promise(r => setTimeout(r, 600));
  const prefix = payload.service === "studio" ? "STD" : "DJ";
  const ref = `CBA · ${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  return { ref };
}
```

The contract is fixed. Backend wiring later means swapping the function body, nothing else.

---

## 11. Component structure (`components/reservation/`)

| File | Responsibility |
|---|---|
| `reservation-shell.tsx` (client) | Top-level. `useReducer<ReservationState>`. Renders hero, switch, grid, modal. Owns submit handler. |
| `reservation-hero.tsx` | Eyebrow + h1 + lede (left) + `<SpinningRecord />` (right). Stateless. |
| `service-switch.tsx` | 2-tab segmented control. Dispatches `SET_SERVICE`. |
| `formula-card.tsx` | Single formula tile. Props: formula, active, onClick. |
| `formula-grid.tsx` | 3-tile grid. Reads active service from state, dispatches `SET_FORMULA`. |
| `calendar-card.tsx` | Month grid + arrows + legend. Calls `dayStatus()` per cell. Dispatches `SET_DATE`, `NAV_MONTH`. |
| `slot-picker.tsx` | Slot grid + duration pills. Empty state when no date. Dispatches `SET_SLOT`, `SET_DURATION`. |
| `summary-card.tsx` | Recap rows + contact form + totals + CTAs. Sticky. Calls `submitReservation` on submit, receives `onConfirm(ref)` callback to open modal. |
| `confirmation-modal.tsx` | Overlay + card + check + ref badge + close. Props: open, ref, onClose. |
| `reservation.module.css` | All page-scoped styles. ~500–600 lines. Holds the OKLCH token overrides under `.reservationPage`. |

### Data flow

```
ReservationShell  (useReducer)
├── ReservationHero       (read-only)
├── ServiceSwitch         (dispatch SET_SERVICE)
├── booking-grid
│   ├── FormulaGrid       (dispatch SET_FORMULA)
│   ├── CalendarCard      (dispatch SET_DATE / NAV_MONTH)
│   ├── SlotPicker        (dispatch SET_SLOT / SET_DURATION)
│   └── SummaryCard       (dispatch UPDATE_CONTACT, calls submitReservation)
└── ConfirmationModal     (controlled by shell-local modal state)
```

State lives only in `ReservationShell`. Sub-components receive read slices + dispatch callbacks via props. No context — too small for the overhead.

---

## 12. Accessibility

- Service switch: `role="tablist"`, each tab `role="tab"`, `aria-selected`, `aria-controls`.
- Calendar arrow buttons: `aria-label="Mois précédent"` / `"Mois suivant"`.
- Day cells: `<button>` with `aria-label="<French date> — <status>"` and `aria-pressed` when selected. Past / full cells are `disabled` with `aria-disabled="true"`.
- Slot buttons: `aria-label="<time> — <period>"`.
- Form: standard `<label for="...">` + visible labels. Required fields have `required`. Email field has `type="email"`. Phone has `type="tel"`.
- Submit button: `aria-disabled="true"` when `ready` is false (also `disabled`).
- Modal: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing at the h3. Escape closes. Focus traps inside the card; returns to the confirm button on close.
- Focus-visible styles: 2px gold outline (`--gold-soft`), 2px offset — consistent with the rest of the site.

---

## 13. Responsive behavior

| Breakpoint | Effect |
|---|---|
| ≥1320px | Page caps at 1320px wide, centered. |
| 1080px–1319px | Booking grid stays 2-col (1fr / 420px). |
| ≤1080px | Booking grid collapses to single column. Summary loses `position: sticky` (just sits below the slot picker). Formula grid drops from 3 to 1 column. |
| 880px–1080px | Hero stays 2-col. Record shrinks to ~320×320. |
| ≤880px | Hero collapses to single column. Record drops to ~280×280, centered, below the title block. |
| ≤640px | Page padding shrinks (`32px 18px`). Calendar day-meta hides. Day numbers drop to 16px. Form goes single column. Tabs padding tightens. |

---

## 14. Verification (manual, after implementation)

- `npm run typecheck` passes.
- Dev server: `/reservation` renders 200. Navigate from the nav "Réserver" link.
- Switch services: formula resets, date + slot persist.
- Pick formula, pick date, pick slot → CTA becomes enabled.
- Try each pricing branch (rec hourly, mix titre, prod jour, club set, priv soirée, fest showcase) → totals look right with tax.
- Submit → success modal opens with `CBA · STD-XXXXX` or `CBA · DJ-XXXXX` reference.
- Close modal → page state intact.
- Mobile (devtools ≤640px): all collapses behave per §13.
- `/studio` and `/dj-services` 404 (deleted). Nav shows single "Réserver" entry. Homepage Studio section's "Réserver" button now points at `/reservation`.

---

## 15. Open questions

None. The handoff is comprehensive and the user has answered all scoping questions.
