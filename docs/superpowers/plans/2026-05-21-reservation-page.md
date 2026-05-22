# Unified Reservation Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single booking page at `/reservation` covering both Session Studio and Réservation DJ services, themed with `/desktop-fm`'s green-gold universe and a spinning 3D record in the hero. Delete the old `/studio` and `/dj-services` routes and collapse the two nav entries into one.

**Architecture:** Frontend-only. New `lib/reservation/` data layer (catalog, state reducer, pricing, mock availability, typed `submitReservation()` stub). New `components/reservation/` UI module with 9 components driven by a `useReducer` in the top-level shell. New `components/experiences/spinning-record.tsx` 3D ornament using already-installed `@react-three/fiber` + `@react-three/drei`. All page-scoped tokens (OKLCH greens + warm gold) live under a `.reservationPage` wrapper so they don't leak.

**Tech Stack:** Next.js 16 (App Router, webpack), React 19, TypeScript, CSS Modules, `@react-three/fiber@^9.6.1`, `@react-three/drei@^10.7.7`, `three@^0.183.2`.

**Verification model:** This repo has no test framework. Each task ends with `npm run typecheck` and (for UI tasks) a dev-server smoke check. No tests added.

**Spec:** `docs/superpowers/specs/2026-05-21-reservation-page-design.md`.

---

## File Structure

**Create:**
- `types/three-fiber.d.ts` — JSX type augmentation so react-three-fiber intrinsics typecheck.
- `lib/reservation/catalog.ts` — `ServiceId`, `FormulaId`, `Formula`, `Duration`, `SERVICES`.
- `lib/reservation/state.ts` — `ReservationState`, `Action`, `initialState`, `reducer`.
- `lib/reservation/pricing.ts` — `TAX_RATE`, `computePricing`, `formatCAD`.
- `lib/reservation/availability.ts` — `hash`, `dayStatus`, `slotsFor`, `dayKey`.
- `lib/reservation/submit.ts` — `ReservationPayload`, `ReservationResult`, `submitReservation`.
- `lib/reservation/index.ts` — barrel re-exports.
- `components/experiences/spinning-record.tsx` — 3D record canvas.
- `components/reservation/reservation-shell.tsx` — top-level client component with reducer.
- `components/reservation/reservation-hero.tsx`
- `components/reservation/service-switch.tsx`
- `components/reservation/formula-card.tsx`
- `components/reservation/formula-grid.tsx`
- `components/reservation/calendar-card.tsx`
- `components/reservation/slot-picker.tsx`
- `components/reservation/summary-card.tsx`
- `components/reservation/confirmation-modal.tsx`
- `components/reservation/reservation.module.css`
- `app/(marketing)/reservation/page.tsx`

**Modify:**
- `app/layout.tsx` — extend Google Fonts URL with DM Serif Display, Cormorant Garamond, DM Sans.
- `lib/site.ts` — replace two nav entries with single `/reservation` entry.
- `components/home/studio-section-mockup.tsx` — point Réserver button at `/reservation`.
- `components/layout/marketing-shell.tsx` — gate grain/ambient overlays so they hide on `/reservation`.

**Delete:**
- `app/(marketing)/studio/` (whole folder)
- `app/(marketing)/dj-services/` (whole folder)
- `lib/studio/` (whole folder)
- `lib/inquiries/studio-booking.ts`
- `components/studio/` (whole folder)
- `.studio-*` rules in `app/globals.css`

---

## Task 1: Prep — JSX type augmentation + load 3 Google Fonts

**Files:**
- Create: `types/three-fiber.d.ts`
- Modify: `tsconfig.json` (include the new types directory if not already covered)
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create `types/three-fiber.d.ts`**

Williams's `components/experiences/desktop-fm-scene.tsx` already trips typecheck because react-three-fiber JSX intrinsics aren't augmented for React 19. The new `SpinningRecord` would have the same problem. Fix both with one declarations file:

```ts
import type { ThreeElements } from "@react-three/fiber";

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }

  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {}
    }
  }
}

export {};
```

- [ ] **Step 2: Verify tsconfig picks up `types/`**

Check `tsconfig.json` — it should already have `"include": ["**/*.ts", "**/*.tsx"]` or similar that picks up the new file. If `include` is restrictive, add `"types/**/*.d.ts"` to it. Run:

```bash
cd "/mnt/c/Users/Setup Game/Desktop/cba website" && npm run typecheck 2>&1 | grep -c "desktop-fm-scene.tsx"
```

Expected: `0` (the desktop-fm scene now typechecks cleanly because of the augmentation).

- [ ] **Step 3: Extend Google Fonts in `app/layout.tsx`**

Find the existing `<link>` to Google Fonts in `app/layout.tsx` (line 31). It currently loads `Space+Grotesk` and `JetBrains+Mono`. Replace with:

```tsx
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=DM+Sans:wght@400;500;600&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
```

This adds DM Serif Display, Cormorant Garamond (with italics), and DM Sans alongside the existing families. The preconnect block above remains unchanged.

- [ ] **Step 4: Typecheck**

```bash
npm run typecheck
```

Expected: passes cleanly.

- [ ] **Step 5: Commit**

```bash
git add types/three-fiber.d.ts tsconfig.json app/layout.tsx
git commit -m "chore: augment R3F JSX intrinsics for TS, load reservation fonts"
```

---

## Task 2: Reservation data layer

**Files:**
- Create: `lib/reservation/catalog.ts`
- Create: `lib/reservation/state.ts`
- Create: `lib/reservation/pricing.ts`
- Create: `lib/reservation/availability.ts`
- Create: `lib/reservation/submit.ts`
- Create: `lib/reservation/index.ts`

- [ ] **Step 1: Write `lib/reservation/catalog.ts`**

```ts
export type ServiceId = "studio" | "dj";
export type FormulaId = "rec" | "mix" | "prod" | "club" | "priv" | "fest";

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
  studio: {
    label: "Session Studio",
    location: "CBA Studio · Plateau-Mont-Royal",
    formulas: [
      {
        id: "rec",
        tag: "Enregistrement",
        name: "Sessions d'enregistrement",
        description: "Cabine vocale, régie calibrée, ingénieur sur place.",
        price: 120,
        unit: "$ / h",
        durations: [{ label: "2 h", h: 2 }, { label: "4 h", h: 4 }, { label: "Journée 8 h", h: 8 }],
      },
      {
        id: "mix",
        tag: "Mixage",
        name: "Mixage & Mastering",
        description: "Direction sonore complète, densité & traduction multi-plateformes.",
        price: 250,
        unit: "$ / titre",
        durations: [{ label: "1 titre", h: 4 }, { label: "EP · 4 titres", h: 16 }],
      },
      {
        id: "prod",
        tag: "Production",
        name: "Production sur mesure",
        description: "Sessions avec producteurs CBA, du beat à la structure finale.",
        price: 500,
        unit: "$ / jour",
        durations: [{ label: "1 jour", h: 8 }, { label: "2 jours", h: 16 }, { label: "Semaine", h: 40 }],
      },
    ],
  },
  dj: {
    label: "Réservation DJ",
    location: "Sur place · Montréal & environs",
    formulas: [
      {
        id: "club",
        tag: "Club / Bar",
        name: "Set Club · 2 h",
        description: "Open / b2b / set signature CBA. Matériel Pioneer fourni si besoin.",
        price: 450,
        unit: "$ / set",
        durations: [{ label: "2 h", h: 2 }, { label: "3 h", h: 3 }, { label: "4 h", h: 4 }],
      },
      {
        id: "priv",
        tag: "Privé",
        name: "Événement privé",
        description: "Mariage, anniversaire, corporate. Set sur mesure, MC inclus.",
        price: 850,
        unit: "$ / soirée",
        durations: [{ label: "4 h", h: 4 }, { label: "6 h", h: 6 }, { label: "Soirée complète", h: 8 }],
      },
      {
        id: "fest",
        tag: "Festival",
        name: "Festival / Showcase",
        description: "Set scénique, fiche technique fournie, coordination régie.",
        price: 1200,
        unit: "$ / showcase",
        durations: [{ label: "60 min", h: 1 }, { label: "90 min", h: 1.5 }, { label: "120 min", h: 2 }],
      },
    ],
  },
};

export function getFormula(service: ServiceId, formulaId: FormulaId | null): Formula | null {
  if (!formulaId) return null;
  return SERVICES[service].formulas.find((f) => f.id === formulaId) ?? null;
}
```

- [ ] **Step 2: Write `lib/reservation/state.ts`**

```ts
import type { ServiceId, FormulaId } from "./catalog";

export type ReservationContact = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  notes: string;
};

export type ReservationState = {
  service: ServiceId;
  formulaId: FormulaId | null;
  durationIdx: number;
  viewYear: number;
  viewMonth: number;        // 0-11
  selectedDate: Date | null;
  selectedSlot: string | null;
  contact: ReservationContact;
};

export type Action =
  | { type: "SET_SERVICE"; id: ServiceId }
  | { type: "SET_FORMULA"; id: FormulaId }
  | { type: "SET_DURATION"; idx: number }
  | { type: "NAV_MONTH"; delta: -1 | 1 }
  | { type: "SET_DATE"; date: Date }
  | { type: "SET_SLOT"; time: string }
  | { type: "UPDATE_CONTACT"; field: keyof ReservationContact; value: string }
  | { type: "RESET_ALL" };

const now = new Date();

export const initialState: ReservationState = {
  service: "studio",
  formulaId: null,
  durationIdx: 0,
  viewYear: now.getFullYear(),
  viewMonth: now.getMonth(),
  selectedDate: null,
  selectedSlot: null,
  contact: { firstName: "", lastName: "", phone: "", email: "", notes: "" },
};

export function reducer(state: ReservationState, action: Action): ReservationState {
  switch (action.type) {
    case "SET_SERVICE":
      if (state.service === action.id) return state;
      return { ...state, service: action.id, formulaId: null, durationIdx: 0 };
    case "SET_FORMULA":
      return { ...state, formulaId: action.id, durationIdx: 0 };
    case "SET_DURATION":
      return { ...state, durationIdx: action.idx };
    case "NAV_MONTH": {
      let month = state.viewMonth + action.delta;
      let year = state.viewYear;
      if (month < 0) { month = 11; year -= 1; }
      else if (month > 11) { month = 0; year += 1; }
      return { ...state, viewYear: year, viewMonth: month };
    }
    case "SET_DATE":
      return { ...state, selectedDate: action.date, selectedSlot: null };
    case "SET_SLOT":
      return { ...state, selectedSlot: action.time };
    case "UPDATE_CONTACT":
      return { ...state, contact: { ...state.contact, [action.field]: action.value } };
    case "RESET_ALL":
      return { ...initialState, viewYear: state.viewYear, viewMonth: state.viewMonth };
  }
}
```

- [ ] **Step 3: Write `lib/reservation/pricing.ts`**

```ts
import { getFormula } from "./catalog";
import type { ReservationState } from "./state";

export const TAX_RATE = 0.14975;

export type Pricing = { base: number; tax: number; grand: number };

export function computePricing(state: ReservationState): Pricing | null {
  const formula = getFormula(state.service, state.formulaId);
  if (!formula) return null;

  const dur = formula.durations[state.durationIdx];
  if (!dur) return null;

  let base = 0;
  if (formula.unit.includes("/ h"))         base = formula.price * dur.h;
  else if (formula.unit.includes("/ titre"))    base = formula.price * (state.durationIdx === 1 ? 4 : 1);
  else if (formula.unit.includes("/ jour"))     base = formula.price * (state.durationIdx === 0 ? 1 : state.durationIdx === 1 ? 2 : 5);
  else if (formula.unit.includes("/ set"))      base = formula.price + (dur.h - 2) * 200;
  else if (formula.unit.includes("/ soirée"))   base = formula.price + Math.max(0, dur.h - 4) * 150;
  else if (formula.unit.includes("/ showcase")) base = formula.price * dur.h;

  const tax = base * TAX_RATE;
  return { base, tax, grand: base + tax };
}

export function formatCAD(n: number): string {
  if (!n) return "—";
  return n.toLocaleString("fr-CA", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " $";
}

export const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export function formatDate(d: Date): string {
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()].toLowerCase()} ${d.getFullYear()}`;
}
```

- [ ] **Step 4: Write `lib/reservation/availability.ts`**

```ts
export type DayStatus = "past" | "avail" | "full";

export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

export function dayStatus(d: Date, today: Date): DayStatus {
  // Normalize comparison to date-only (ignore time).
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const b = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (a < b) return "past";
  const dow = d.getDay();
  const h = hash(dayKey(d));
  if (dow === 0 && (h % 5) !== 0) return "full";   // Sundays mostly off
  if ((h % 11) === 0) return "full";
  return "avail";
}

export type SlotEntry = { time: string; taken: boolean };

export function slotsFor(date: Date): SlotEntry[] {
  const base = ["10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00"];
  const h = hash(dayKey(date));
  return base.map((t, i) => ({ time: t, taken: ((h >> i) & 7) === 0 }));
}

export function slotPeriod(time: string): string {
  const hour = parseInt(time.slice(0, 2), 10);
  if (hour < 12) return "Matin";
  if (hour < 17) return "PM";
  if (hour < 21) return "Soir";
  return "Nuit";
}
```

- [ ] **Step 5: Write `lib/reservation/submit.ts`**

```ts
import type { ServiceId, FormulaId } from "./catalog";
import type { ReservationContact } from "./state";

export type ReservationPayload = {
  service: ServiceId;
  formulaId: FormulaId;
  durationIdx: number;
  date: string;     // "YYYY-MM-DD"
  time: string;     // "HH:MM"
  contact: ReservationContact;
};

export type ReservationResult = { ref: string };

/**
 * Frontend stub. Backend wiring (Supabase) will replace this body —
 * the public signature stays the same.
 */
export async function submitReservation(payload: ReservationPayload): Promise<ReservationResult> {
  await new Promise((r) => setTimeout(r, 600));  // simulate network
  const prefix = payload.service === "studio" ? "STD" : "DJ";
  const ref = `CBA · ${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  return { ref };
}
```

- [ ] **Step 6: Write `lib/reservation/index.ts`**

```ts
export * from "./catalog";
export * from "./state";
export * from "./pricing";
export * from "./availability";
export * from "./submit";
```

- [ ] **Step 7: Typecheck**

```bash
cd "/mnt/c/Users/Setup Game/Desktop/cba website" && npm run typecheck
```

Expected: passes.

- [ ] **Step 8: Commit**

```bash
git add lib/reservation/
git commit -m "feat(reservation): data layer — catalog, state, pricing, availability, submit stub"
```

---

## Task 3: SpinningRecord component

**Files:**
- Create: `components/experiences/spinning-record.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

function Disc() {
  const group = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.4;
  });

  return (
    <group ref={group} rotation={[Math.PI * 0.18, 0, 0]}>
      {/* Vinyl body */}
      <mesh>
        <cylinderGeometry args={[1.14, 1.14, 0.014, 96]} />
        <meshPhysicalMaterial
          color="#0a0a0a"
          metalness={0.1}
          roughness={0.45}
          clearcoat={1}
          clearcoatRoughness={0.12}
        />
      </mesh>

      {/* Subtle outer groove ring */}
      <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.0, 1.13, 96]} />
        <meshBasicMaterial color="#1a1a1a" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.58, 96]} />
        <meshBasicMaterial color="#1a1a1a" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* Center label (gold) */}
      <mesh position={[0, 0.0085, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.0008, 64]} />
        <meshPhysicalMaterial
          color="#d9a85a"
          metalness={0.3}
          roughness={0.5}
        />
      </mesh>

      {/* Center hole */}
      <mesh position={[0, 0.012, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.02, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
    </group>
  );
}

export function SpinningRecord() {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "1 / 1",
        maxWidth: 400,
        margin: "0 auto",
      }}
    >
      {/* Gold halo */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: "-15%",
          background:
            "radial-gradient(circle, oklch(74% 0.15 65 / 0.22), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Canvas
        camera={{ position: [0, 1.5, 2.5], fov: 35 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 5, 2]} intensity={1.2} />
        <Environment preset="studio" />
        <Disc />
      </Canvas>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

Expected: passes (thanks to Task 1's type augmentation).

- [ ] **Step 3: Commit**

```bash
git add components/experiences/spinning-record.tsx
git commit -m "feat(reservation): spinning 3D record component for the hero"
```

---

## Task 4: Reservation route + shell skeleton + page CSS scaffolding

**Files:**
- Create: `app/(marketing)/reservation/page.tsx`
- Create: `components/reservation/reservation-shell.tsx`
- Create: `components/reservation/reservation.module.css`

- [ ] **Step 1: Write `components/reservation/reservation.module.css`**

This file scaffolds the page tokens and atmosphere. Subsequent tasks append class rules to it. For now:

```css
/* ─── Page tokens (scoped) ─────────────────────────────────────── */
.page {
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

  --font-display: "DM Serif Display", "Cormorant Garamond", serif;
  --font-serif:   "Cormorant Garamond", Georgia, serif;
  --font-sans:    "DM Sans", system-ui, sans-serif;
  --font-mono:    "JetBrains Mono", ui-monospace, monospace;

  position: relative;
  min-height: 100vh;
  color: var(--cream);
  font-family: var(--font-sans);
  background:
    radial-gradient(ellipse 70% 50% at 80% 12%, oklch(38% 0.12 65 / 0.55), transparent 60%),
    radial-gradient(ellipse 100% 60% at 20% 0%, oklch(22% 0.06 145 / 0.6), transparent 55%),
    radial-gradient(ellipse 80% 50% at 50% 100%, oklch(10% 0.025 150) 0%, transparent 60%),
    linear-gradient(180deg, var(--bg-mid) 0%, var(--bg-deep) 60%, oklch(10% 0.025 150) 100%);
}

.page::after {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.10;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>");
  z-index: 1;
}

/* ─── Layout ───────────────────────────────────────────────────── */
.inner {
  position: relative;
  z-index: 2;
  max-width: 1320px;
  margin-inline: auto;
  padding: clamp(48px, 6vw, 96px) clamp(24px, 5vw, 80px) 160px;
}
```

- [ ] **Step 2: Write `components/reservation/reservation-shell.tsx`**

```tsx
"use client";

import { useReducer } from "react";
import { initialState, reducer } from "@/lib/reservation";
import styles from "./reservation.module.css";

export function ReservationShell() {
  const [state, _dispatch] = useReducer(reducer, initialState);

  return (
    <div className={styles.page} data-service={state.service}>
      <div className={styles.inner}>
        {/* Hero, ServiceSwitch, booking grid, modal — added in subsequent tasks */}
        <p style={{ fontFamily: "var(--font-display)", fontSize: 64, color: "var(--gold-glow)" }}>
          /reservation — shell scaffold
        </p>
      </div>
    </div>
  );
}
```

The `_dispatch` underscore prefix is intentional; later tasks remove it as they wire actions in.

- [ ] **Step 3: Write `app/(marketing)/reservation/page.tsx`**

```tsx
import { ReservationShell } from "@/components/reservation/reservation-shell";

export const metadata = {
  title: "Réserver une session",
  description: "Réserver une session studio ou un DJ avec CBA.",
};

export default function ReservationPage() {
  return <ReservationShell />;
}
```

- [ ] **Step 4: Typecheck**

```bash
npm run typecheck
```

Expected: passes. Note: the unused `state` and `_dispatch` will become used in later tasks; TypeScript ignores unused destructured variables when prefixed with `_`.

- [ ] **Step 5: Smoke**

If dev server isn't running, start it (or expect the controller has it running on :3000). Then:

```bash
curl -s -o /dev/null -w "RESERVATION %{http_code}\n" http://localhost:3000/reservation
```

Expected: `200`. Open the route in the browser — you'll see the deep green/gold gradient page with the placeholder text in italic gold serif at the top.

- [ ] **Step 6: Commit**

```bash
git add app/\(marketing\)/reservation/ components/reservation/
git commit -m "feat(reservation): scaffold route, shell, page CSS module with tokens"
```

---

## Task 5: ReservationHero + ServiceSwitch

**Files:**
- Create: `components/reservation/reservation-hero.tsx`
- Create: `components/reservation/service-switch.tsx`
- Modify: `components/reservation/reservation-shell.tsx`
- Modify: `components/reservation/reservation.module.css`

- [ ] **Step 1: Append hero + switch styles to `reservation.module.css`**

Append at the end of the file:

```css
/* ─── Hero ─────────────────────────────────────────────────────── */
.hero {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: clamp(24px, 4vw, 64px);
  align-items: center;
  margin-bottom: clamp(40px, 6vw, 80px);
}

.heroText { min-width: 0; }

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  margin: 0 0 1.2rem;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--gold);
}

.pulseDot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--gold-glow);
  box-shadow: 0 0 8px var(--gold-glow);
  animation: pulse 2.2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50%      { opacity: 1;   transform: scale(1.25); }
}

.heroTitle {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(48px, 8vw, 128px);
  font-weight: normal;
  line-height: 0.92;
  letter-spacing: -0.02em;
  color: var(--cream);
}

.heroLede {
  margin: 1.4rem 0 0;
  max-width: 56ch;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: clamp(18px, 1.5vw, 22px);
  line-height: 1.5;
  color: var(--cream-mute);
}

.heroVisual {
  width: clamp(280px, 32vw, 400px);
}

@media (max-width: 880px) {
  .hero { grid-template-columns: 1fr; }
  .heroVisual { width: 280px; margin-inline: auto; }
}

/* ─── Service switch ───────────────────────────────────────────── */
.switch {
  display: inline-flex;
  width: fit-content;
  padding: 6px;
  border-radius: 6px;
  background: oklch(15% 0.04 148 / 0.6);
  border: 1px solid var(--border);
  margin-bottom: clamp(32px, 4vw, 56px);
}

.switchTab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  border-radius: 4px;
  border: 0;
  background: transparent;
  color: var(--cream-dim);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 240ms cubic-bezier(0.2, 0.7, 0.2, 1);
}

.switchTab .tabDot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--cream-dim);
  transition: all 240ms;
}

.switchTab.active {
  background: linear-gradient(180deg, oklch(22% 0.06 130 / 0.7), oklch(15% 0.04 148 / 0.7));
  color: var(--gold-glow);
  box-shadow:
    inset 0 0 0 1px oklch(55% 0.13 65 / 0.7),
    0 0 24px oklch(60% 0.15 65 / 0.22);
}

.switchTab.active .tabDot {
  background: var(--gold-glow);
  box-shadow: 0 0 8px var(--gold-glow);
}
```

- [ ] **Step 2: Write `components/reservation/reservation-hero.tsx`**

```tsx
import { SpinningRecord } from "@/components/experiences/spinning-record";
import styles from "./reservation.module.css";

export function ReservationHero() {
  return (
    <header className={styles.hero}>
      <div className={styles.heroText}>
        <p className={styles.eyebrow}>
          <span className={styles.pulseDot} aria-hidden />
          Réservation · CBA
        </p>
        <h1 className={styles.heroTitle}>Réserver une session</h1>
        <p className={styles.heroLede}>
          Studio ou DJ — une seule fenêtre pour bloquer la date, choisir la formule, et envoyer
          la demande. Confirmation manuelle par courriel sous 24 heures.
        </p>
      </div>
      <div className={styles.heroVisual}>
        <SpinningRecord />
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Write `components/reservation/service-switch.tsx`**

```tsx
import type { ServiceId } from "@/lib/reservation";
import styles from "./reservation.module.css";

type Props = {
  service: ServiceId;
  onChange: (id: ServiceId) => void;
};

const TABS: { id: ServiceId; label: string }[] = [
  { id: "studio", label: "Session Studio" },
  { id: "dj",     label: "Réservation DJ" },
];

export function ServiceSwitch({ service, onChange }: Props) {
  return (
    <div className={styles.switch} role="tablist" aria-label="Type de service">
      {TABS.map((t) => {
        const active = t.id === service;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={`${styles.switchTab} ${active ? styles.active : ""}`}
            onClick={() => onChange(t.id)}
          >
            <span className={styles.tabDot} aria-hidden />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Wire them into `reservation-shell.tsx`**

Replace the file's body with:

```tsx
"use client";

import { useReducer } from "react";
import { initialState, reducer } from "@/lib/reservation";
import { ReservationHero } from "./reservation-hero";
import { ServiceSwitch } from "./service-switch";
import styles from "./reservation.module.css";

export function ReservationShell() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div className={styles.page} data-service={state.service}>
      <div className={styles.inner}>
        <ReservationHero />
        <ServiceSwitch
          service={state.service}
          onChange={(id) => dispatch({ type: "SET_SERVICE", id })}
        />
        {/* Booking grid + modal come in subsequent tasks */}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Typecheck + smoke**

```bash
npm run typecheck
```

Expected: passes.

```bash
curl -s http://localhost:3000/reservation | grep -c 'Réserver une session'
```

Expected: `1`. In the browser, you should see the title, lede, spinning record on the right, and the two-tab service switch below. Click between Studio / DJ — the active tab changes styling.

- [ ] **Step 6: Commit**

```bash
git add components/reservation/
git commit -m "feat(reservation): hero (with spinning record) + service switch"
```

---

## Task 6: FormulaGrid + FormulaCard

**Files:**
- Create: `components/reservation/formula-card.tsx`
- Create: `components/reservation/formula-grid.tsx`
- Modify: `components/reservation/reservation-shell.tsx`
- Modify: `components/reservation/reservation.module.css`

- [ ] **Step 1: Append formula styles to `reservation.module.css`**

Append:

```css
/* ─── Booking grid ─────────────────────────────────────────────── */
.bookingGrid {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 28px;
  align-items: start;
}

.leftCol { display: flex; flex-direction: column; gap: 28px; }

@media (max-width: 1080px) {
  .bookingGrid { grid-template-columns: 1fr; }
}

/* ─── Card primitive ───────────────────────────────────────────── */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: clamp(22px, 2.5vw, 32px);
}

.cardHead {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.cardEyebrow {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--gold);
}

.cardStep {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--cream-dim);
}

/* ─── Formula grid ─────────────────────────────────────────────── */
.formulaGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

@media (max-width: 1080px) {
  .formulaGrid { grid-template-columns: 1fr; }
}

.formulaCard {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 22px;
  border-radius: 4px;
  border: 1px solid oklch(30% 0.05 130 / 0.6);
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: all 240ms cubic-bezier(0.2, 0.7, 0.2, 1);
  font: inherit;
  color: inherit;
}

.formulaCard:hover {
  transform: translateY(-1px);
  border-color: var(--border-hi);
  background: radial-gradient(ellipse 80% 200% at 0% 50%, oklch(60% 0.15 65 / 0.08), transparent 60%);
}

.formulaCard.active {
  border-color: var(--gold-soft);
  background: linear-gradient(180deg, oklch(30% 0.12 60 / 0.18), oklch(18% 0.07 80 / 0.18));
  box-shadow: 0 0 24px oklch(72% 0.17 65 / 0.18);
}

.fTag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--gold-soft);
}

.fMark {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid var(--gold-soft);
  position: relative;
}

.formulaCard.active .fMark::after {
  content: "";
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: var(--gold-glow);
  box-shadow: 0 0 6px var(--gold-glow);
}

.fName {
  margin: 0;
  font-family: var(--font-display);
  font-size: 22px;
  color: var(--cream);
}

.fDesc {
  margin: 0;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 14px;
  line-height: 1.5;
  color: var(--cream-mute);
}

.fPrice {
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px dashed var(--border-dim);
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.fPriceAmount {
  font-family: var(--font-display);
  font-size: 26px;
  color: var(--gold-glow);
}

.fPriceUnit {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--cream-dim);
}
```

- [ ] **Step 2: Write `components/reservation/formula-card.tsx`**

```tsx
import type { Formula } from "@/lib/reservation";
import styles from "./reservation.module.css";

type Props = {
  formula: Formula;
  active: boolean;
  onClick: () => void;
};

export function FormulaCard({ formula, active, onClick }: Props) {
  return (
    <button
      type="button"
      className={`${styles.formulaCard} ${active ? styles.active : ""}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <span className={styles.fTag}>
        <span className={styles.fMark} aria-hidden />
        {formula.tag}
      </span>
      <h3 className={styles.fName}>{formula.name}</h3>
      <p className={styles.fDesc}>{formula.description}</p>
      <div className={styles.fPrice}>
        <span className={styles.fPriceAmount}>${formula.price}</span>
        <span className={styles.fPriceUnit}>{formula.unit}</span>
      </div>
    </button>
  );
}
```

- [ ] **Step 3: Write `components/reservation/formula-grid.tsx`**

```tsx
import { SERVICES, type FormulaId, type ServiceId } from "@/lib/reservation";
import { FormulaCard } from "./formula-card";
import styles from "./reservation.module.css";

type Props = {
  service: ServiceId;
  formulaId: FormulaId | null;
  onSelect: (id: FormulaId) => void;
};

export function FormulaGrid({ service, formulaId, onSelect }: Props) {
  const formulas = SERVICES[service].formulas;
  return (
    <section className={styles.card} aria-labelledby="formula-heading">
      <div className={styles.cardHead}>
        <span className={styles.cardEyebrow} id="formula-heading">01 · Formule</span>
        <span className={styles.cardStep}>Service</span>
      </div>
      <div className={styles.formulaGrid}>
        {formulas.map((f) => (
          <FormulaCard
            key={f.id}
            formula={f}
            active={f.id === formulaId}
            onClick={() => onSelect(f.id)}
          />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Wire `FormulaGrid` into the shell**

In `components/reservation/reservation-shell.tsx`, add the import and wrap the booking grid:

```tsx
import { FormulaGrid } from "./formula-grid";
```

Below the `<ServiceSwitch ... />`, add:

```tsx
        <div className={styles.bookingGrid}>
          <div className={styles.leftCol}>
            <FormulaGrid
              service={state.service}
              formulaId={state.formulaId}
              onSelect={(id) => dispatch({ type: "SET_FORMULA", id })}
            />
            {/* Calendar + slots in next tasks */}
          </div>
          {/* Summary in later task */}
        </div>
```

- [ ] **Step 5: Typecheck + smoke**

```bash
npm run typecheck
```

In the browser: switching service swaps the 3 formula cards. Clicking a formula card toggles the active state (gold border + radio dot fills).

- [ ] **Step 6: Commit**

```bash
git add components/reservation/
git commit -m "feat(reservation): formula grid + cards with active radio state"
```

---

## Task 7: CalendarCard

**Files:**
- Create: `components/reservation/calendar-card.tsx`
- Modify: `components/reservation/reservation-shell.tsx`
- Modify: `components/reservation/reservation.module.css`

- [ ] **Step 1: Append calendar styles to `reservation.module.css`**

Append:

```css
/* ─── Calendar ─────────────────────────────────────────────────── */
.calHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.calMonth {
  font-family: var(--font-display);
  font-size: 28px;
  color: var(--cream);
}

.calMonth em {
  font-style: italic;
  color: var(--gold-deep);
  margin-left: 8px;
}

.calNav {
  display: inline-flex;
  gap: 8px;
}

.calNav button {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--cream-mute);
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: all 240ms;
}

.calNav button:hover {
  border-color: var(--gold-soft);
  color: var(--gold-glow);
}

.calWeekRow {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  margin-bottom: 8px;
}

.calWeekRow span {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--cream-dim);
  text-align: center;
}

.calGrid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.calCell {
  aspect-ratio: 1 / 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 1px solid var(--border-dim);
  border-radius: 4px;
  background: transparent;
  color: var(--cream);
  font: inherit;
  cursor: pointer;
  transition: all 220ms cubic-bezier(0.2, 0.7, 0.2, 1);
}

.calCell .calDay {
  font-family: var(--font-display);
  font-size: 22px;
}

.calCell .calMeta {
  font-family: var(--font-mono);
  font-size: 8.5px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--cream-dim);
}

.calCell.empty { border-color: transparent; cursor: default; }

.calCell.past { opacity: 0.32; cursor: not-allowed; }

.calCell.avail:hover {
  transform: translateY(-1px);
  border-color: var(--gold-soft);
}

.calCell.full {
  border-style: dashed;
  border-color: var(--border-dim);
  cursor: not-allowed;
  color: oklch(55% 0.08 30);
}

.calCell.full .calDay { text-decoration: line-through; }

.calCell.today {
  border-color: oklch(45% 0.08 110);
  position: relative;
}

.calCell.today::after {
  content: "";
  position: absolute;
  bottom: 6px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--gold-glow);
}

.calCell.selected {
  background: linear-gradient(180deg, oklch(30% 0.12 60 / 0.65), oklch(18% 0.07 80 / 0.65));
  border-color: oklch(76% 0.15 65 / 0.45);
  box-shadow:
    0 0 32px oklch(72% 0.17 65 / 0.34),
    inset 0 0 0 1px oklch(76% 0.15 65 / 0.45);
}

@media (max-width: 640px) {
  .calCell .calMeta { display: none; }
  .calCell .calDay { font-size: 16px; }
}

/* ─── Calendar legend ──────────────────────────────────────────── */
.calLegend {
  display: flex;
  gap: 18px;
  margin-top: 14px;
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--cream-dim);
}

.calLegend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.calLegend i {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
}
```

- [ ] **Step 2: Write `components/reservation/calendar-card.tsx`**

```tsx
import { useMemo } from "react";
import { dayStatus, MONTHS_FR } from "@/lib/reservation";
import styles from "./reservation.module.css";

type Props = {
  viewYear: number;
  viewMonth: number;
  selectedDate: Date | null;
  onNavMonth: (delta: -1 | 1) => void;
  onSelectDate: (date: Date) => void;
};

const WEEKDAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export function CalendarCard({ viewYear, viewMonth, selectedDate, onNavMonth, onSelectDate }: Props) {
  const today = useMemo(() => new Date(), []);

  const cells = useMemo(() => {
    // Build a 6-row grid (42 cells). Monday is column 0.
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const jsDow = firstOfMonth.getDay();     // 0 = Sun
    const mondayDow = (jsDow + 6) % 7;       // shift so Mon = 0
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const out: Array<{ kind: "empty" } | { kind: "day"; date: Date }> = [];
    for (let i = 0; i < mondayDow; i++) out.push({ kind: "empty" });
    for (let d = 1; d <= daysInMonth; d++) out.push({ kind: "day", date: new Date(viewYear, viewMonth, d) });
    while (out.length < 42) out.push({ kind: "empty" });
    return out;
  }, [viewYear, viewMonth]);

  const selectedKey = selectedDate
    ? `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`
    : null;
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  return (
    <section className={styles.card} aria-labelledby="calendar-heading">
      <div className={styles.cardHead}>
        <span className={styles.cardEyebrow} id="calendar-heading">02 · Date</span>
        <span className={styles.cardStep}>Disponibilité</span>
      </div>

      <div className={styles.calHeader}>
        <div className={styles.calMonth}>
          {MONTHS_FR[viewMonth]}<em>{viewYear}</em>
        </div>
        <div className={styles.calNav}>
          <button type="button" aria-label="Mois précédent" onClick={() => onNavMonth(-1)}>‹</button>
          <button type="button" aria-label="Mois suivant"   onClick={() => onNavMonth(1)}>›</button>
        </div>
      </div>

      <div className={styles.calWeekRow} aria-hidden>
        {WEEKDAYS_FR.map((w) => <span key={w}>{w}</span>)}
      </div>

      <div className={styles.calGrid}>
        {cells.map((cell, i) => {
          if (cell.kind === "empty") {
            return <div key={i} className={`${styles.calCell} ${styles.empty}`} aria-hidden />;
          }
          const status = dayStatus(cell.date, today);
          const key = `${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}`;
          const isToday = key === todayKey;
          const isSelected = key === selectedKey;
          const interactive = status === "avail";
          const classes = [
            styles.calCell,
            styles[status],
            isToday ? styles.today : "",
            isSelected ? styles.selected : "",
          ].filter(Boolean).join(" ");
          const meta = status === "full" ? "complet" : status === "avail" ? "dispo" : "";

          return (
            <button
              key={i}
              type="button"
              className={classes}
              disabled={!interactive}
              aria-disabled={!interactive}
              aria-pressed={isSelected}
              aria-label={`${cell.date.getDate()} ${MONTHS_FR[cell.date.getMonth()]} — ${meta || "indisponible"}`}
              onClick={() => interactive && onSelectDate(cell.date)}
            >
              <span className={styles.calDay}>{cell.date.getDate()}</span>
              {meta && <span className={styles.calMeta}>{meta}</span>}
            </button>
          );
        })}
      </div>

      <div className={styles.calLegend} aria-hidden>
        <span><i style={{ background: "oklch(45% 0.08 110)" }} /> Disponible</span>
        <span><i style={{ background: "var(--gold-glow)" }} /> Sélection</span>
        <span><i style={{ background: "oklch(55% 0.08 30)" }} /> Complet</span>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Wire `CalendarCard` into the shell**

Add import in `reservation-shell.tsx`:

```tsx
import { CalendarCard } from "./calendar-card";
```

Inside `.leftCol`, after `<FormulaGrid ... />`:

```tsx
            <CalendarCard
              viewYear={state.viewYear}
              viewMonth={state.viewMonth}
              selectedDate={state.selectedDate}
              onNavMonth={(delta) => dispatch({ type: "NAV_MONTH", delta })}
              onSelectDate={(date) => dispatch({ type: "SET_DATE", date })}
            />
```

- [ ] **Step 4: Typecheck + smoke**

```bash
npm run typecheck
```

Browser check: arrows step the month back and forward. Click an available cell — it gets the gold gradient + glow. Past dates are dimmed; "full" cells (Sundays + occasional weekdays) are dashed with strike-through and not clickable.

- [ ] **Step 5: Commit**

```bash
git add components/reservation/
git commit -m "feat(reservation): calendar card with Monday-first month grid + mock availability"
```

---

## Task 8: SlotPicker

**Files:**
- Create: `components/reservation/slot-picker.tsx`
- Modify: `components/reservation/reservation-shell.tsx`
- Modify: `components/reservation/reservation.module.css`

- [ ] **Step 1: Append slot styles to `reservation.module.css`**

Append:

```css
/* ─── Slot picker ──────────────────────────────────────────────── */
.slotEmpty {
  padding: 32px;
  border: 1px dashed var(--border-dim);
  border-radius: 4px;
  text-align: center;
  font-family: var(--font-serif);
  font-style: italic;
  color: var(--cream-dim);
}

.slotMeta {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.slotMeta strong { color: var(--gold); font-weight: normal; }
.slotMeta span  { color: var(--cream-dim); }

.slotGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}

.slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 14px 10px;
  border: 1px solid var(--border-dim);
  border-radius: 4px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  transition: all 240ms cubic-bezier(0.2, 0.7, 0.2, 1);
}

.slot:hover {
  transform: translateY(-1px);
  border-color: var(--gold-soft);
}

.slot.taken { opacity: 0.35; cursor: not-allowed; }
.slot.taken .slotTime { text-decoration: line-through; }

.slot.selected {
  background: linear-gradient(180deg, oklch(30% 0.12 60 / 0.65), oklch(18% 0.07 80 / 0.65));
  border-color: oklch(76% 0.15 65 / 0.45);
  box-shadow: 0 0 24px oklch(72% 0.17 65 / 0.28);
}

.slotTime {
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.12em;
  color: var(--cream);
}

.slotPeriod {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--cream-dim);
}

/* ─── Duration row ─────────────────────────────────────────────── */
.durationRow {
  margin-top: 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.durationLabel {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--cream-dim);
}

.durationPills {
  display: inline-flex;
  gap: 8px;
  flex-wrap: wrap;
}

.durationPill {
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid var(--border-dim);
  background: transparent;
  color: var(--cream-mute);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 240ms;
}

.durationPill:hover { border-color: var(--gold-soft); color: var(--cream); }

.durationPill.active {
  background: linear-gradient(180deg, oklch(30% 0.12 60 / 0.5), oklch(18% 0.07 80 / 0.5));
  border-color: var(--gold-soft);
  color: var(--gold-glow);
}
```

- [ ] **Step 2: Write `components/reservation/slot-picker.tsx`**

```tsx
import { useMemo } from "react";
import {
  slotsFor,
  slotPeriod,
  formatDate,
  getFormula,
  type ServiceId,
  type FormulaId,
} from "@/lib/reservation";
import styles from "./reservation.module.css";

type Props = {
  service: ServiceId;
  formulaId: FormulaId | null;
  durationIdx: number;
  selectedDate: Date | null;
  selectedSlot: string | null;
  onSelectSlot: (time: string) => void;
  onSelectDuration: (idx: number) => void;
};

export function SlotPicker({
  service, formulaId, durationIdx, selectedDate, selectedSlot,
  onSelectSlot, onSelectDuration,
}: Props) {
  const slots = useMemo(() => (selectedDate ? slotsFor(selectedDate) : []), [selectedDate]);
  const formula = getFormula(service, formulaId);

  if (!selectedDate) {
    return (
      <section className={styles.card} aria-labelledby="slot-heading">
        <div className={styles.cardHead}>
          <span className={styles.cardEyebrow} id="slot-heading">03 · Horaire</span>
          <span className={styles.cardStep}>Créneau</span>
        </div>
        <div className={styles.slotEmpty}>
          Choisis d'abord une date pour voir les créneaux disponibles.
        </div>
      </section>
    );
  }

  const freeCount = slots.filter((s) => !s.taken).length;

  return (
    <section className={styles.card} aria-labelledby="slot-heading">
      <div className={styles.cardHead}>
        <span className={styles.cardEyebrow} id="slot-heading">03 · Horaire</span>
        <span className={styles.cardStep}>Créneau</span>
      </div>

      <div className={styles.slotMeta}>
        <strong>{formatDate(selectedDate)}</strong>
        <span>· {freeCount} créneaux libres</span>
      </div>

      <div className={styles.slotGrid}>
        {slots.map((s) => {
          const active = s.time === selectedSlot;
          const classes = [
            styles.slot,
            s.taken ? styles.taken : "",
            active ? styles.selected : "",
          ].filter(Boolean).join(" ");

          return (
            <button
              key={s.time}
              type="button"
              className={classes}
              disabled={s.taken}
              aria-disabled={s.taken}
              aria-pressed={active}
              aria-label={`${s.time} — ${slotPeriod(s.time)}`}
              onClick={() => !s.taken && onSelectSlot(s.time)}
            >
              <span className={styles.slotTime}>{s.time}</span>
              <span className={styles.slotPeriod}>{slotPeriod(s.time)}</span>
            </button>
          );
        })}
      </div>

      {formula && (
        <div className={styles.durationRow}>
          <span className={styles.durationLabel}>Durée</span>
          <div className={styles.durationPills}>
            {formula.durations.map((d, i) => {
              const active = i === durationIdx;
              return (
                <button
                  key={d.label}
                  type="button"
                  className={`${styles.durationPill} ${active ? styles.active : ""}`}
                  aria-pressed={active}
                  onClick={() => onSelectDuration(i)}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 3: Wire into shell**

Import:

```tsx
import { SlotPicker } from "./slot-picker";
```

Inside `.leftCol`, after `<CalendarCard ... />`:

```tsx
            <SlotPicker
              service={state.service}
              formulaId={state.formulaId}
              durationIdx={state.durationIdx}
              selectedDate={state.selectedDate}
              selectedSlot={state.selectedSlot}
              onSelectSlot={(time) => dispatch({ type: "SET_SLOT", time })}
              onSelectDuration={(idx) => dispatch({ type: "SET_DURATION", idx })}
            />
```

- [ ] **Step 4: Typecheck + smoke**

```bash
npm run typecheck
```

Browser: before picking a date, slot card shows the italic empty state. After picking a date, 13 slots render with ~1/8 taken (line-through). Click a slot to highlight it. Duration pills appear when a formula is selected.

- [ ] **Step 5: Commit**

```bash
git add components/reservation/
git commit -m "feat(reservation): slot picker with empty state + duration pills"
```

---

## Task 9: SummaryCard

**Files:**
- Create: `components/reservation/summary-card.tsx`
- Modify: `components/reservation/reservation-shell.tsx`
- Modify: `components/reservation/reservation.module.css`

- [ ] **Step 1: Append summary styles to `reservation.module.css`**

Append:

```css
/* ─── Summary card (right column, sticky) ──────────────────────── */
.summary {
  position: sticky;
  top: 32px;
}

@media (max-width: 1080px) {
  .summary { position: static; }
}

.summaryEyebrow {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 14px;
}

.summaryTitle {
  font-family: var(--font-display);
  font-size: 36px;
  margin: 0;
  color: var(--cream);
}

.summarySub {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 16px;
  color: var(--cream-mute);
  margin: 6px 0 22px;
}

.summaryRows { display: grid; gap: 12px; margin-bottom: 24px; }

.summaryRow {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.summaryRow span { color: var(--cream-dim); }
.summaryRow strong { font-weight: normal; color: var(--cream); }
.summaryRow .empty {
  font-family: var(--font-serif);
  font-style: italic;
  text-transform: none;
  letter-spacing: 0;
  color: var(--cream-dim);
}

/* ─── Contact form ─────────────────────────────────────────────── */
.formGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 22px;
}

.formGridFull { grid-column: 1 / -1; }

@media (max-width: 640px) {
  .formGrid { grid-template-columns: 1fr; }
}

.formField {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.formField label {
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--cream-dim);
}

.formField input,
.formField textarea {
  background: oklch(13% 0.035 150 / 0.7);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 12px 14px;
  color: var(--cream);
  font-family: var(--font-sans);
  font-size: 14px;
  transition: border-color 200ms, box-shadow 200ms;
}

.formField textarea {
  resize: vertical;
  min-height: 100px;
  font-family: var(--font-serif);
  font-style: italic;
}

.formField input:focus,
.formField textarea:focus {
  outline: none;
  border-color: var(--gold-soft);
  box-shadow: 0 0 0 3px oklch(60% 0.15 65 / 0.12);
}

/* ─── Totals + CTA ─────────────────────────────────────────────── */
.totalsBox {
  background: oklch(11% 0.03 148 / 0.7);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 22px;
  margin-bottom: 18px;
}

.totalsRow {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--cream-mute);
}

.totalsGrand {
  border-top: 1px dashed var(--border-dim);
  margin-top: 14px;
  padding-top: 14px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.totalsGrand span:first-child {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--gold);
}

.totalsGrand .totalsAmount {
  font-family: var(--font-display);
  font-size: 38px;
  color: var(--gold-glow);
}

.totalsGrand .totalsCcy {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  margin-left: 6px;
  vertical-align: super;
  color: var(--cream-dim);
}

.ctaPrimary {
  width: 100%;
  padding: 18px 22px;
  border: 0;
  border-radius: 4px;
  background: linear-gradient(180deg, oklch(80% 0.17 68), oklch(64% 0.16 55));
  color: #1a0e02;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 0 28px oklch(72% 0.17 65 / 0.32);
  transition: all 240ms;
}

.ctaPrimary:hover { box-shadow: 0 0 36px oklch(72% 0.17 65 / 0.52); }

.ctaPrimary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

.ctaSecondary {
  width: 100%;
  padding: 14px 22px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: transparent;
  color: var(--cream-mute);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  cursor: pointer;
  margin-top: 12px;
  transition: all 240ms;
}

.ctaSecondary:hover { border-color: var(--gold-soft); color: var(--cream); }

.fineprint {
  margin-top: 18px;
  text-align: center;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 13px;
  color: var(--cream-dim);
}
```

- [ ] **Step 2: Write `components/reservation/summary-card.tsx`**

```tsx
import {
  SERVICES,
  computePricing,
  formatCAD,
  formatDate,
  getFormula,
  type ReservationState,
  type ReservationContact,
} from "@/lib/reservation";
import styles from "./reservation.module.css";

type Props = {
  state: ReservationState;
  pending: boolean;
  onUpdateContact: (field: keyof ReservationContact, value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
};

export function SummaryCard({ state, pending, onUpdateContact, onSubmit, onReset }: Props) {
  const formula = getFormula(state.service, state.formulaId);
  const duration = formula?.durations[state.durationIdx] ?? null;
  const pricing = computePricing(state);
  const service = SERVICES[state.service];
  const ready = !!state.formulaId && !!state.selectedDate && !!state.selectedSlot;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || pending) return;
    onSubmit();
  }

  return (
    <aside className={`${styles.card} ${styles.summary}`} aria-labelledby="summary-heading">
      <p className={styles.summaryEyebrow} id="summary-heading">Récapitulatif</p>
      <h2 className={styles.summaryTitle}>{service.label}</h2>
      <p className={styles.summarySub}>{formula ? formula.name : "Formule à choisir"}</p>

      <div className={styles.summaryRows}>
        <div className={styles.summaryRow}>
          <span>Date</span>
          {state.selectedDate
            ? <strong>{formatDate(state.selectedDate)}</strong>
            : <span className={styles.empty}>À sélectionner</span>}
        </div>
        <div className={styles.summaryRow}>
          <span>Heure</span>
          {state.selectedSlot
            ? <strong>{state.selectedSlot}</strong>
            : <span className={styles.empty}>À sélectionner</span>}
        </div>
        <div className={styles.summaryRow}>
          <span>Durée</span>
          {duration
            ? <strong>{duration.label}</strong>
            : <span className={styles.empty}>À sélectionner</span>}
        </div>
        <div className={styles.summaryRow}>
          <span>Lieu</span>
          <strong>{service.location}</strong>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label htmlFor="firstName">Prénom</label>
            <input id="firstName" type="text" required value={state.contact.firstName}
              onChange={(e) => onUpdateContact("firstName", e.target.value)} />
          </div>
          <div className={styles.formField}>
            <label htmlFor="lastName">Nom</label>
            <input id="lastName" type="text" required value={state.contact.lastName}
              onChange={(e) => onUpdateContact("lastName", e.target.value)} />
          </div>
          <div className={`${styles.formField} ${styles.formGridFull}`}>
            <label htmlFor="phone">Téléphone</label>
            <input id="phone" type="tel" required value={state.contact.phone}
              onChange={(e) => onUpdateContact("phone", e.target.value)} />
          </div>
          <div className={`${styles.formField} ${styles.formGridFull}`}>
            <label htmlFor="email">Courriel</label>
            <input id="email" type="email" required value={state.contact.email}
              onChange={(e) => onUpdateContact("email", e.target.value)} />
          </div>
          <div className={`${styles.formField} ${styles.formGridFull}`}>
            <label htmlFor="notes">Notes pour l'équipe</label>
            <textarea id="notes" rows={4} placeholder="Références, contexte, objectifs…"
              value={state.contact.notes}
              onChange={(e) => onUpdateContact("notes", e.target.value)} />
          </div>
        </div>

        <div className={styles.totalsBox}>
          <div className={styles.totalsRow}>
            <span>{formula ? formula.name : "Base"}</span>
            <span>{formatCAD(pricing?.base ?? 0)}</span>
          </div>
          <div className={styles.totalsRow}>
            <span>Taxes (estim.)</span>
            <span>{formatCAD(pricing?.tax ?? 0)}</span>
          </div>
          <div className={styles.totalsGrand}>
            <span>Total</span>
            <span>
              <span className={styles.totalsAmount}>{formatCAD(pricing?.grand ?? 0)}</span>
              <span className={styles.totalsCcy}>CAD</span>
            </span>
          </div>
        </div>

        <button type="submit" className={styles.ctaPrimary} disabled={!ready || pending}>
          {pending ? "Envoi…" : "Confirmer la réservation"}
        </button>
        <button type="button" className={styles.ctaSecondary} onClick={onReset}>
          Réinitialiser
        </button>

        <p className={styles.fineprint}>
          Aucun paiement n'est prélevé maintenant. Un membre de l'équipe CBA confirme par
          courriel sous 24 h.
        </p>
      </form>
    </aside>
  );
}
```

- [ ] **Step 3: Wire into shell**

In `reservation-shell.tsx`, add imports + a pending state. Final file:

```tsx
"use client";

import { useReducer, useState } from "react";
import { initialState, reducer } from "@/lib/reservation";
import { ReservationHero } from "./reservation-hero";
import { ServiceSwitch } from "./service-switch";
import { FormulaGrid } from "./formula-grid";
import { CalendarCard } from "./calendar-card";
import { SlotPicker } from "./slot-picker";
import { SummaryCard } from "./summary-card";
import styles from "./reservation.module.css";

export function ReservationShell() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [pending, _setPending] = useState(false);  // wired in next task

  // Stubs — submit handler implemented in Task 10.
  function handleSubmit() { /* Task 10 */ }
  function handleReset()  { dispatch({ type: "RESET_ALL" }); }

  return (
    <div className={styles.page} data-service={state.service}>
      <div className={styles.inner}>
        <ReservationHero />
        <ServiceSwitch
          service={state.service}
          onChange={(id) => dispatch({ type: "SET_SERVICE", id })}
        />

        <div className={styles.bookingGrid}>
          <div className={styles.leftCol}>
            <FormulaGrid
              service={state.service}
              formulaId={state.formulaId}
              onSelect={(id) => dispatch({ type: "SET_FORMULA", id })}
            />
            <CalendarCard
              viewYear={state.viewYear}
              viewMonth={state.viewMonth}
              selectedDate={state.selectedDate}
              onNavMonth={(delta) => dispatch({ type: "NAV_MONTH", delta })}
              onSelectDate={(date) => dispatch({ type: "SET_DATE", date })}
            />
            <SlotPicker
              service={state.service}
              formulaId={state.formulaId}
              durationIdx={state.durationIdx}
              selectedDate={state.selectedDate}
              selectedSlot={state.selectedSlot}
              onSelectSlot={(time) => dispatch({ type: "SET_SLOT", time })}
              onSelectDuration={(idx) => dispatch({ type: "SET_DURATION", idx })}
            />
          </div>

          <SummaryCard
            state={state}
            pending={pending}
            onUpdateContact={(field, value) => dispatch({ type: "UPDATE_CONTACT", field, value })}
            onSubmit={handleSubmit}
            onReset={handleReset}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Typecheck + smoke**

```bash
npm run typecheck
```

Browser: right column shows the sticky summary. Pick a formula, date, slot — recap rows fill in, totals update with TPS/TVQ, Confirm button enables (but does nothing yet). Réinitialiser clears everything.

- [ ] **Step 5: Commit**

```bash
git add components/reservation/
git commit -m "feat(reservation): summary card with recap, contact form, totals + CTAs"
```

---

## Task 10: ConfirmationModal + wire submit

**Files:**
- Create: `components/reservation/confirmation-modal.tsx`
- Modify: `components/reservation/reservation-shell.tsx`
- Modify: `components/reservation/reservation.module.css`

- [ ] **Step 1: Append modal styles to `reservation.module.css`**

Append:

```css
/* ─── Confirmation modal ───────────────────────────────────────── */
.modalOverlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 24px;
  background: oklch(8% 0.02 150 / 0.85);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 240ms;
}

.modalOverlay.open { opacity: 1; pointer-events: auto; }

.modalCard {
  max-width: 520px;
  width: 100%;
  padding: 48px 40px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 0 80px oklch(72% 0.17 65 / 0.40);
  color: var(--cream);
  transform: translateY(12px);
  transition: transform 240ms;
}

.modalOverlay.open .modalCard { transform: translateY(0); }

.modalCheck {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 2px solid var(--gold-glow);
  margin: 0 auto 22px;
  display: grid;
  place-items: center;
  color: var(--gold-glow);
  box-shadow: 0 0 24px oklch(72% 0.17 65 / 0.35);
}

.modalTitle {
  margin: 0 0 12px;
  font-family: var(--font-display);
  font-size: 42px;
}

.modalCopy {
  margin: 0 0 22px;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 16px;
  color: var(--cream-mute);
}

.modalRef {
  display: inline-block;
  padding: 10px 18px;
  border: 1px dashed var(--gold-soft);
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--gold);
}

.modalCloseRow {
  margin-top: 28px;
}
```

- [ ] **Step 2: Write `components/reservation/confirmation-modal.tsx`**

```tsx
import { useEffect } from "react";
import styles from "./reservation.module.css";

type Props = {
  open: boolean;
  reservationRef: string | null;
  onClose: () => void;
};

export function ConfirmationModal({ open, reservationRef, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div
      className={`${styles.modalOverlay} ${open ? styles.open : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-hidden={!open}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.modalCard}>
        <div className={styles.modalCheck} aria-hidden>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className={styles.modalTitle} id="modal-title">Demande envoyée.</h3>
        <p className={styles.modalCopy}>
          Merci. L'équipe CBA confirme ta réservation par courriel sous 24 heures.
          Garde ta référence à portée de main.
        </p>
        {reservationRef && (
          <div className={styles.modalRef}>{reservationRef}</div>
        )}
        <div className={styles.modalCloseRow}>
          <button type="button" className={styles.ctaSecondary} onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Wire submit + modal into `reservation-shell.tsx`**

Replace the final file:

```tsx
"use client";

import { useReducer, useState } from "react";
import {
  initialState,
  reducer,
  submitReservation,
  type ReservationPayload,
} from "@/lib/reservation";
import { ReservationHero } from "./reservation-hero";
import { ServiceSwitch } from "./service-switch";
import { FormulaGrid } from "./formula-grid";
import { CalendarCard } from "./calendar-card";
import { SlotPicker } from "./slot-picker";
import { SummaryCard } from "./summary-card";
import { ConfirmationModal } from "./confirmation-modal";
import styles from "./reservation.module.css";

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function ReservationShell() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [pending, setPending] = useState(false);
  const [reservationRef, setReservationRef] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  async function handleSubmit() {
    if (!state.formulaId || !state.selectedDate || !state.selectedSlot) return;
    const payload: ReservationPayload = {
      service: state.service,
      formulaId: state.formulaId,
      durationIdx: state.durationIdx,
      date: isoDate(state.selectedDate),
      time: state.selectedSlot,
      contact: state.contact,
    };
    setPending(true);
    try {
      const { ref } = await submitReservation(payload);
      setReservationRef(ref);
      setModalOpen(true);
    } finally {
      setPending(false);
    }
  }

  function handleReset() { dispatch({ type: "RESET_ALL" }); }

  return (
    <div className={styles.page} data-service={state.service}>
      <div className={styles.inner}>
        <ReservationHero />
        <ServiceSwitch
          service={state.service}
          onChange={(id) => dispatch({ type: "SET_SERVICE", id })}
        />

        <div className={styles.bookingGrid}>
          <div className={styles.leftCol}>
            <FormulaGrid
              service={state.service}
              formulaId={state.formulaId}
              onSelect={(id) => dispatch({ type: "SET_FORMULA", id })}
            />
            <CalendarCard
              viewYear={state.viewYear}
              viewMonth={state.viewMonth}
              selectedDate={state.selectedDate}
              onNavMonth={(delta) => dispatch({ type: "NAV_MONTH", delta })}
              onSelectDate={(date) => dispatch({ type: "SET_DATE", date })}
            />
            <SlotPicker
              service={state.service}
              formulaId={state.formulaId}
              durationIdx={state.durationIdx}
              selectedDate={state.selectedDate}
              selectedSlot={state.selectedSlot}
              onSelectSlot={(time) => dispatch({ type: "SET_SLOT", time })}
              onSelectDuration={(idx) => dispatch({ type: "SET_DURATION", idx })}
            />
          </div>

          <SummaryCard
            state={state}
            pending={pending}
            onUpdateContact={(field, value) => dispatch({ type: "UPDATE_CONTACT", field, value })}
            onSubmit={handleSubmit}
            onReset={handleReset}
          />
        </div>
      </div>

      <ConfirmationModal
        open={modalOpen}
        reservationRef={reservationRef}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
```

- [ ] **Step 4: Typecheck + smoke**

```bash
npm run typecheck
```

Browser end-to-end:

1. Pick a formula, a date, a slot.
2. Fill the form fields (first name, last name, phone, email).
3. Click "Confirmer la réservation" — button shows "Envoi…" for ~600ms, then the modal slides in with `CBA · STD-XXXXX` (or `DJ-XXXXX`).
4. Escape closes the modal. Click outside also closes.
5. Try submitting for both services — confirm the prefix changes (`STD` vs `DJ`).

- [ ] **Step 5: Commit**

```bash
git add components/reservation/
git commit -m "feat(reservation): confirmation modal + wire submit via submitReservation stub"
```

---

## Task 11: Migration cutover

**Files:**
- Modify: `lib/site.ts`
- Modify: `components/layout/marketing-shell.tsx`
- Modify: `components/home/studio-section-mockup.tsx`

- [ ] **Step 1: Collapse nav in `lib/site.ts`**

Replace the existing 6-entry `siteConfig.nav` with this 5-entry version:

```ts
nav: [
  { href: "/",            label: "Accueil",             icon: "⌂", shortLabel: "Accueil" },
  { href: "/beats",       label: "Nos Beats",           icon: "◈", shortLabel: "Beats"   },
  { href: "/reservation", label: "Réserver",            icon: "⬡", shortLabel: "Réserver"},
  { href: "/events",      label: "Nos Événements",      icon: "◷", shortLabel: "Agenda"  },
  { href: "/radio",       label: "Écouter la Radio",    icon: "◉", shortLabel: "Radio"   },
] satisfies NavLink[],
```

Also remove the `/studio` and `/dj-services` entries from the `pageSummaries` object below (the keys exist; delete them entirely).

- [ ] **Step 2: Hide MarketingShell chrome on `/reservation`**

Modify `components/layout/marketing-shell.tsx`. Replace the existing return block with:

```tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function MarketingShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isReservation = pathname === "/reservation";

  // Scroll reveal via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    const reveals = document.querySelectorAll(".reveal");
    reveals.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="marketing-shell">
      {!isReservation && <div className="grain-overlay" aria-hidden="true" />}
      {!isReservation && <div className="ambient ambient-one" aria-hidden="true" />}
      {!isReservation && <div className="ambient ambient-two" aria-hidden="true" />}
      <main>{children}</main>
    </div>
  );
}
```

The unused `useState` import isn't needed — delete it if your editor adds it. Confirm import line ends up as `import { ReactNode, useEffect } from "react";`.

- [ ] **Step 3: Update homepage Studio button**

In `components/home/studio-section-mockup.tsx`, find the "Réserver" button (search for `Réserver` or for `/studio` href). Update the link to point at `/reservation` instead of `/studio`. Example: if it's a `<Link href="/studio">Réserver</Link>`, change to `<Link href="/reservation">Réserver</Link>`. If it's a `<button>`, wrap it in a `<Link>` or set a router push.

- [ ] **Step 4: Typecheck + smoke**

```bash
npm run typecheck
```

Browser:
- Nav now shows 5 entries: Accueil · Nos Beats · **Réserver** · Nos Événements · Écouter la Radio.
- Click "Réserver" → routes to `/reservation`.
- Homepage Studio section "Réserver" button → routes to `/reservation`.
- On `/reservation`, the marketing shell's orange ambient glows are no longer visible (no clash with green page).
- Other marketing pages (`/beats`, `/events`) still have the grain + glows.

- [ ] **Step 5: Commit**

```bash
git add lib/site.ts components/layout/marketing-shell.tsx components/home/studio-section-mockup.tsx
git commit -m "feat(nav): collapse studio+dj nav into single Réserver, hide chrome on /reservation"
```

---

## Task 12: Cleanup — delete obsolete files

**Files:**
- Delete: `app/(marketing)/studio/` (folder)
- Delete: `app/(marketing)/dj-services/` (folder)
- Delete: `lib/studio/` (folder)
- Delete: `lib/inquiries/studio-booking.ts`
- Delete: `components/studio/` (folder)
- Modify: `app/globals.css` (remove `.studio-*` rules)

- [ ] **Step 1: Confirm nothing imports the doomed files**

```bash
cd "/mnt/c/Users/Setup Game/Desktop/cba website" && grep -rn "lib/studio\|lib/inquiries/studio-booking\|components/studio\|(marketing)/studio\|(marketing)/dj-services" --include="*.tsx" --include="*.ts" .
```

Expected: only matches inside the files about to be deleted (and possibly inside `lib/inquiries/` itself). If anything in `app/`, `components/` (outside `components/studio/`), or `lib/` (outside `lib/studio/` and `lib/inquiries/studio-booking.ts`) still imports them — fix that first.

- [ ] **Step 2: Delete the folders/files**

```bash
git rm -r "app/(marketing)/studio" "app/(marketing)/dj-services" "lib/studio" "components/studio"
git rm "lib/inquiries/studio-booking.ts"
```

If `lib/inquiries/` becomes empty after the removal, also `rmdir`:

```bash
[ -z "$(ls -A lib/inquiries 2>/dev/null)" ] && rmdir lib/inquiries
```

- [ ] **Step 3: Clean up orphan global CSS**

Open `app/globals.css`. Search for class names starting with `.studio-` (e.g., `.studio-shell`, `.studio-hero`, `.studio-package-card`, `.studio-day-card`, `.studio-form-card`, `.studio-success-card`, `.studio-slot-grid`, `.studio-availability-shell`, `.studio-stage-grid`, etc.). Delete every rule that starts with `.studio-` and any selectors that target only those classes.

Equivalent command-line check after editing:

```bash
grep -c "studio-" app/globals.css
```

Expected: `0`.

- [ ] **Step 4: Typecheck + lint**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 5: Smoke**

```bash
curl -s -o /dev/null -w "STUDIO %{http_code}\n"      http://localhost:3000/studio
curl -s -o /dev/null -w "DJ %{http_code}\n"          http://localhost:3000/dj-services
curl -s -o /dev/null -w "RESERVATION %{http_code}\n" http://localhost:3000/reservation
```

Expected: `STUDIO 404`, `DJ 404`, `RESERVATION 200`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: remove legacy /studio + /dj-services routes and supporting files"
```

---

## Task 13: Final verification

- [ ] **Step 1: Typecheck**

```bash
cd "/mnt/c/Users/Setup Game/Desktop/cba website" && npm run typecheck
```

Expected: passes with zero errors (including the previously failing `desktop-fm-scene.tsx`).

- [ ] **Step 2: End-to-end visual sweep**

Open the dev server in a browser and walk through:

**`/reservation` desktop**
- Hero renders: eyebrow + h1 "Réserver une session" + lede + spinning 3D record on the right.
- Service switch toggles between Studio / DJ. Switching keeps date + slot, resets formula + duration.
- Booking grid: 2 columns. Right column is sticky as you scroll.
- All 3 formulas render for active service. Click to select — gold border + radio dot fill.
- Calendar: month + year in display font, year italic gold. Arrows step months. Sundays mostly dashed/strike-through. Past dates dimmed. Click a clean day — gold gradient + glow.
- Slot picker: empty state before date pick. After: 13 slots, ~1/8 taken with strike-through. Click selects (gold gradient). Duration pills appear when a formula is selected.
- Summary: recap fills in. Totals show base, taxes (TPS+TVQ 14.975%), and grand total in big gold serif. Confirm button enables only when formula + date + slot are all set.
- Fill form. Click Confirm — "Envoi…" for ~600ms, modal slides in with `CBA · STD-XXXXX` or `CBA · DJ-XXXXX`.
- Escape / click backdrop / Fermer → modal closes. Page state preserved.
- Réinitialiser → everything clears.

**Pricing branches**
- `rec` 4h: base = 120 × 4 = 480 $; tax ≈ 72 $; grand ≈ 552 $.
- `mix` "EP · 4 titres": base = 250 × 4 = 1 000 $.
- `prod` "Semaine": base = 500 × 5 = 2 500 $.
- `club` 3h: base = 450 + (3-2) × 200 = 650 $.
- `priv` 6h: base = 850 + (6-4) × 150 = 1 150 $.
- `fest` 90min: base = 1200 × 1.5 = 1 800 $.

**Responsive**
- ≤1080px: booking grid stacks to one column, summary loses sticky.
- ≤880px: hero stacks (record drops below title, ~280×280 centered).
- ≤640px: padding shrinks, calendar day-meta hides, form goes single column.

**Other pages**
- `/`: nav shows 5 entries; "Réserver" is the new entry. Homepage Studio section "Réserver" button routes to `/reservation`.
- `/beats`, `/events`, `/radio`: still have marketing chrome (grain + orange ambient). Footer's "À propos" column still works.
- `/studio` and `/dj-services`: return 404.
- `/desktop-fm`: still renders (the type augmentation didn't break it; williams's scene typechecks now).

If anything is off, fix in a follow-up commit before declaring done.
