# Radio Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build CBA Radio end-to-end — a data layer for admin-managed MP3 episodes, a homepage teaser section matching the existing CBA aesthetic, and a full `/radio` page with a deliberate vintage/analog visual identity that feels like stepping into a different room.

**Architecture:** Mock data lives in `lib/radio/catalog.ts` (admin inputs title, host, date, genre, description, duration, audioSrc — bucket URL goes in `audioSrc`, swappable when the bucket is set up). The homepage `RadioSection` is a server component using CSS modules, matching the dark gold/green CBA palette. The full `/radio` page is a `"use client"` component because it owns local player state (`useState`) — no global context needed. The player is a basic inline bar (play/pause, scrub, time, volume). The archive is a date-sorted flat list designed to scale to any number of records gracefully.

**Tech Stack:** Next.js 14 App Router, React, TypeScript, CSS Modules, HTML5 `<audio>` element, Lucide icons

**Visual contract:**
- Homepage section → CBA palette: `#0a0a0a` bg, `#c9a961` gold, `#1e6539` green, Cinzel italic titles
- `/radio` page → Vintage palette: `#0e0800` bg, `#d4883c` amber, `#f5e6c8` cream, scan-line overlay, warm analog feel

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `lib/radio/catalog.ts` | Types + mock episodes (admin-input fields: title, host, date, genre, description, duration, audioSrc) |
| Create | `lib/radio/index.ts` | Re-exports |
| Modify | `components/home/radio-section.tsx` | Pulls data from lib, replaces inline `<style>` tag with CSS module |
| Modify | `components/home/radio-section.module.css` | Full CBA-palette styles (gold/green/dark) |
| Create | `components/radio/radio-station.tsx` | Full page — owns player state, composes archive + player bar |
| Create | `components/radio/radio-station.module.css` | Vintage amber/sepia styles, scan lines |
| Create | `components/radio/radio-archive.tsx` | Scrollable date-sorted episode grid |
| Create | `components/radio/radio-player-bar.tsx` | Fixed bottom player (play/pause, scrub, time, volume) |
| Create | `app/(marketing)/radio/page.tsx` | Route entry point |

---

### Task 1: Radio data layer

**Files:**
- Create: `lib/radio/catalog.ts`
- Create: `lib/radio/index.ts`

- [ ] **Step 1: Create `lib/radio/catalog.ts`**

```ts
// lib/radio/catalog.ts

export type RadioEpisode = {
  id: string;
  title: string;
  host: string;
  genre: string;
  description: string;
  date: string;        // ISO "2026-04-12"
  duration: string;    // "1:24:07"
  durationSeconds: number;
  audioSrc: string;    // TODO: replace with real bucket URL per episode
  featured: boolean;
};

// 24 equalizer bars — stable (no hydration mismatch)
export const BAR_CONFIG: { h: number; d: number }[] = [
  { h: 35, d: 1.1 }, { h: 68, d: 0.8 }, { h: 52, d: 1.4 }, { h: 82, d: 0.7 },
  { h: 44, d: 1.2 }, { h: 91, d: 0.9 }, { h: 60, d: 1.6 }, { h: 38, d: 1.0 },
  { h: 75, d: 0.6 }, { h: 55, d: 1.3 }, { h: 88, d: 0.8 }, { h: 42, d: 1.5 },
  { h: 66, d: 1.1 }, { h: 93, d: 0.7 }, { h: 50, d: 1.4 }, { h: 77, d: 0.9 },
  { h: 34, d: 1.2 }, { h: 84, d: 0.6 }, { h: 58, d: 1.7 }, { h: 70, d: 1.0 },
  { h: 47, d: 0.8 }, { h: 79, d: 1.3 }, { h: 62, d: 0.9 }, { h: 41, d: 1.1 },
];

// Sorted newest-first. Add new episodes at the top.
export const radioEpisodes: RadioEpisode[] = [
  {
    id: "uf-vol-12",
    title: "Underground Frequency Vol. 12",
    host: "DJ Korvax",
    genre: "Afrobeat · Electronic",
    description: "Deux heures dans les fréquences basses du Plateau. Sélection brute, transitions lentes.",
    date: "2026-05-10",
    duration: "2:04:33",
    durationSeconds: 7473,
    audioSrc: "/audio/uf-vol-12.mp3", // TODO: replace with bucket URL
    featured: true,
  },
  {
    id: "deep-sessions-08",
    title: "Deep Sessions #08",
    host: "Solène",
    genre: "Deep House · Ambient",
    description: "Nuit longue, atmosphères denses. Pour ceux qui restent debout après 2h.",
    date: "2026-05-03",
    duration: "1:32:18",
    durationSeconds: 5538,
    audioSrc: "/audio/deep-sessions-08.mp3",
    featured: false,
  },
  {
    id: "nuit-blanche-04",
    title: "Nuit Blanche #04",
    host: "MC Taro",
    genre: "Hip-Hop · Spoken Word",
    description: "Freestyles, confessions et rythmes. Une heure de mots depuis le studio.",
    date: "2026-04-26",
    duration: "1:08:44",
    durationSeconds: 4124,
    audioSrc: "/audio/nuit-blanche-04.mp3",
    featured: false,
  },
  {
    id: "aube-libre-02",
    title: "Aube Libre #02",
    host: "Fira",
    genre: "Soul · Jazz · Fusion",
    description: "La douceur avant l'aube. Jazz, électronique et soul tissés ensemble.",
    date: "2026-04-20",
    duration: "1:18:55",
    durationSeconds: 4735,
    audioSrc: "/audio/aube-libre-02.mp3",
    featured: false,
  },
  {
    id: "uf-vol-11",
    title: "Underground Frequency Vol. 11",
    host: "DJ Korvax",
    genre: "Afrobeat · Electronic",
    description: "Le volume 11 — plus sombre, plus profond. Enregistré en direct au Bar Le Ritz.",
    date: "2026-04-12",
    duration: "1:58:20",
    durationSeconds: 7100,
    audioSrc: "/audio/uf-vol-11.mp3",
    featured: false,
  },
  {
    id: "deep-sessions-07",
    title: "Deep Sessions #07",
    host: "Solène",
    genre: "Deep House · Ambient",
    description: "La septième session. Morceaux rares, transitions fluides.",
    date: "2026-04-05",
    duration: "1:44:02",
    durationSeconds: 6242,
    audioSrc: "/audio/deep-sessions-07.mp3",
    featured: false,
  },
];

export function getFeaturedEpisode(): RadioEpisode {
  return radioEpisodes.find((e) => e.featured) ?? radioEpisodes[0];
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" });
}
```

- [ ] **Step 2: Create `lib/radio/index.ts`**

```ts
export * from "@/lib/radio/catalog";
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd /Users/bird/CBA-website && npx tsc --noEmit 2>&1 | grep -v ".next/"
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
cd /Users/bird/CBA-website
git add lib/radio/
git commit -m "feat(radio): add data layer — RadioEpisode type, mock archive, getFeaturedEpisode"
```

---

### Task 2: Refactor homepage RadioSection

The existing `components/home/radio-section.tsx` has hardcoded data and uses an inline `<style>` tag with global class names. This task migrates it to the data layer and a CSS module — matching every other section in the codebase. The visual palette stays CBA (dark, gold, green).

**Files:**
- Modify: `components/home/radio-section.tsx`
- Modify: `components/home/radio-section.module.css`

- [ ] **Step 1: Replace `components/home/radio-section.module.css`**

Overwrite the file completely:

```css
/* components/home/radio-section.module.css */

.section {
  padding: clamp(4rem, 7vw, 6.5rem) 1.1rem;
  background:
    radial-gradient(ellipse 60% 55% at 8% 80%, rgba(10,75,42,0.28) 0%, transparent 62%),
    radial-gradient(ellipse 40% 45% at 92% 20%, rgba(201,169,97,0.07) 0%, transparent 55%),
    #0a0a0a;
}

.inner {
  width: min(100%, 1220px);
  margin-inline: auto;
}

/* ── Header ── */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1.2rem;
  margin-bottom: clamp(2rem, 3.5vw, 3rem);
  flex-wrap: wrap;
}

.eyebrow {
  margin: 0 0 0.72rem;
  font-family: "JetBrains Mono", monospace;
  font-size: 0.64rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #c9a961;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.liveDot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #c9a961;
  box-shadow: 0 0 8px rgba(201,169,97,0.8);
  animation: pulse 2.4s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.35; transform: scale(0.65); }
}

.title {
  margin: 0;
  font-family: var(--font-title, "Cinzel", serif);
  font-style: italic;
  font-size: clamp(1.9rem, 4vw, 3.3rem);
  font-weight: 500;
  line-height: 1.03;
  color: #f5ecd9;
}

.headerLink {
  min-height: 2.7rem;
  border-radius: 999px;
  border: 1px solid rgba(201,169,97,0.24);
  background: rgba(12,13,12,0.54);
  padding: 0.66rem 0.98rem;
  display: inline-flex;
  align-items: center;
  gap: 0.44rem;
  font-size: 0.7rem;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: rgba(236,202,146,0.9);
  transition: transform 220ms ease;
  white-space: nowrap;
}

.headerLink:hover { transform: translateY(-2px); }

/* ── Grid ── */
.grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 1.1rem;
  align-items: stretch;
}

/* ── Featured episode card ── */
.featured {
  border: 1px solid rgba(201,169,97,0.18);
  border-radius: 1.4rem;
  background: linear-gradient(156deg, rgba(10,75,42,0.22), rgba(8,8,8,0.95) 55%);
  padding: clamp(1.5rem, 3vw, 2.5rem);
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
  box-shadow: 0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
  position: relative;
  overflow: hidden;
}

.featured::before {
  content: "";
  position: absolute;
  top: -40%; left: -20%;
  width: 70%; height: 70%;
  background: radial-gradient(circle, rgba(10,75,42,0.18) 0%, transparent 70%);
  pointer-events: none;
}

.featuredMeta {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.genrePill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 999px;
  border: 1px solid rgba(201,169,97,0.3);
  background: rgba(201,169,97,0.07);
  padding: 0.32rem 0.72rem;
  font-family: "JetBrains Mono", monospace;
  font-size: 0.55rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(201,169,97,0.85);
}

.dur {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.58rem;
  letter-spacing: 0.12em;
  color: rgba(201,169,97,0.55);
}

.episodeTitle {
  margin: 0;
  font-family: var(--font-title, "Cinzel", serif);
  font-style: italic;
  font-size: clamp(1.5rem, 3vw, 2.4rem);
  font-weight: 500;
  line-height: 1.1;
  color: #f5ecd9;
}

.episodeHost {
  margin: 0;
  font-size: 0.9rem;
  color: rgba(245,236,217,0.62);
}

.episodeDesc {
  margin: 0;
  font-size: 0.84rem;
  line-height: 1.65;
  color: rgba(245,236,217,0.55);
  max-width: 48ch;
}

/* Equalizer */
.equalizer {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 44px;
}

.bar {
  flex: 1;
  border-radius: 2px 2px 0 0;
  background: linear-gradient(to top, #1e6539, #c9a961);
  animation: eq var(--bar-duration, 1s) ease-in-out infinite alternate;
  transform-origin: bottom;
}

@keyframes eq {
  from { transform: scaleY(0.12); opacity: 0.5; }
  to   { transform: scaleY(1);    opacity: 1;   }
}

.listenBtn {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #1e6539, #2d8a52);
  padding: 0.78rem 1.4rem;
  font-family: "JetBrains Mono", monospace;
  font-size: 0.66rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #f5ecd9;
  text-decoration: none;
  transition: transform 220ms ease, box-shadow 220ms ease;
  box-shadow: 0 4px 24px rgba(30,101,57,0.4);
}

.listenBtn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(30,101,57,0.55);
}

/* ── Right: recent episodes list ── */
.recentPanel {
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 1.4rem;
  background: linear-gradient(160deg, rgba(201,169,97,0.06), rgba(10,10,10,0.9) 60%);
  padding: 1.4rem 1.5rem;
  display: flex;
  flex-direction: column;
}

.panelLabel {
  margin: 0 0 1rem;
  font-family: "JetBrains Mono", monospace;
  font-size: 0.55rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(201,169,97,0.5);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  padding-bottom: 0.7rem;
}

.recentRow {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.7rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.recentRow:last-child { border-bottom: none; }

.recentNum {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.5rem;
  color: rgba(201,169,97,0.3);
  min-width: 1.2rem;
  text-align: right;
}

.recentInfo { flex: 1; min-width: 0; }

.recentInfo strong {
  display: block;
  font-size: 0.84rem;
  font-weight: 500;
  color: #f0e6d2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recentInfo span {
  font-size: 0.7rem;
  color: rgba(245,236,217,0.45);
}

.recentDur {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.52rem;
  color: rgba(201,169,97,0.45);
  flex-shrink: 0;
}

.archiveLink {
  margin-top: 1.2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(201,169,97,0.7);
  text-decoration: none;
  transition: color 180ms ease;
  align-self: flex-start;
}

.archiveLink:hover { color: #c9a961; }

/* ── Responsive ── */
@media (max-width: 900px) {
  .grid { grid-template-columns: 1fr; }
}

@media (max-width: 580px) {
  .featuredMeta { flex-wrap: wrap; }
}
```

- [ ] **Step 2: Rewrite `components/home/radio-section.tsx`**

```tsx
// components/home/radio-section.tsx
import Link from "next/link";
import { Headphones, ArrowRight } from "lucide-react";
import styles from "./radio-section.module.css";
import { getFeaturedEpisode, radioEpisodes, BAR_CONFIG, formatDate } from "@/lib/radio/catalog";

export function RadioSection() {
  const featured = getFeaturedEpisode();
  const recent = radioEpisodes.filter((e) => e.id !== featured.id).slice(0, 4);

  return (
    <section
      id="listen"
      aria-labelledby="radio-home-heading"
      className={styles.section}
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>
              <span className={styles.liveDot} aria-hidden />
              Radio CBA · Archives
            </p>
            <h2 id="radio-home-heading" className={styles.title}>
              La Fréquence CBA
            </h2>
          </div>
          <Link href="/radio" className={styles.headerLink}>
            <Headphones size={13} />
            Toutes les émissions
          </Link>
        </header>

        <div className={styles.grid}>
          {/* Featured episode */}
          <div className={styles.featured}>
            <div className={styles.featuredMeta}>
              <span className={styles.genrePill}>{featured.genre}</span>
              <span className={styles.dur}>{featured.duration}</span>
            </div>

            <div>
              <h3 className={styles.episodeTitle}>{featured.title}</h3>
              <p className={styles.episodeHost}>{featured.host} · {formatDate(featured.date)}</p>
            </div>

            <p className={styles.episodeDesc}>{featured.description}</p>

            <div className={styles.equalizer} aria-hidden>
              {BAR_CONFIG.map((bar, i) => (
                <div
                  key={i}
                  className={styles.bar}
                  style={{
                    "--bar-duration": `${bar.d}s`,
                    height: `${bar.h}%`,
                    animationDelay: `${(i * 0.07).toFixed(2)}s`,
                  } as React.CSSProperties}
                />
              ))}
            </div>

            <Link href="/radio" className={styles.listenBtn}>
              <Headphones size={14} />
              Écouter l&apos;épisode
            </Link>
          </div>

          {/* Recent episodes list */}
          <div className={styles.recentPanel}>
            <p className={styles.panelLabel}>Épisodes récents</p>

            {recent.map((ep, i) => (
              <div key={ep.id} className={styles.recentRow}>
                <span className={styles.recentNum}>{String(i + 1).padStart(2, "0")}</span>
                <div className={styles.recentInfo}>
                  <strong>{ep.title}</strong>
                  <span>{ep.host} · {formatDate(ep.date)}</span>
                </div>
                <span className={styles.recentDur}>{ep.duration}</span>
              </div>
            ))}

            <Link href="/radio" className={styles.archiveLink}>
              Voir toutes les émissions <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd /Users/bird/CBA-website && npx tsc --noEmit 2>&1 | grep -v ".next/"
```

Expected: no output.

- [ ] **Step 4: Visual check**

Open `http://localhost:3000`, scroll to the radio section. Verify:
- ✅ Featured episode card shows title, host, date, genre, description, animated equalizer
- ✅ Right panel shows 4 most recent episodes (not the featured one)
- ✅ "Toutes les émissions" and "Écouter l'épisode" both link to `/radio`
- ✅ Palette matches the other sections (gold, green, dark)

- [ ] **Step 5: Commit**

```bash
cd /Users/bird/CBA-website
git add components/home/radio-section.tsx components/home/radio-section.module.css
git commit -m "refactor(radio): homepage section — CSS module, data layer, featured episode + recent list"
```

---

### Task 3: Radio player bar component

A self-contained player bar used inside the `/radio` page. Receives an episode and play state from the parent; renders play/pause, scrub bar, current/total time, and volume. Uses the HTML5 `<audio>` element via a forwarded ref.

**Files:**
- Create: `components/radio/radio-player-bar.tsx`
- Create: `components/radio/radio-player-bar.module.css`

- [ ] **Step 1: Create `components/radio/radio-player-bar.module.css`**

```css
/* components/radio/radio-player-bar.module.css */

/* Vintage amber palette */
.bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background:
    linear-gradient(to top, #120900, #1c1000);
  border-top: 1px solid rgba(212,136,60,0.25);
  padding: 0.8rem clamp(1rem, 4vw, 2.4rem);
  display: flex;
  align-items: center;
  gap: clamp(0.8rem, 2vw, 1.8rem);
  box-shadow: 0 -8px 40px rgba(0,0,0,0.6);
}

.episodeInfo {
  flex: 0 0 auto;
  min-width: 0;
  max-width: 26ch;
}

.episodeTitle {
  font-family: var(--font-title, "Cinzel", serif);
  font-style: italic;
  font-size: 0.82rem;
  color: #f5e6c8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.episodeHost {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.52rem;
  letter-spacing: 0.1em;
  color: rgba(212,136,60,0.65);
  margin: 0.15rem 0 0;
}

.controls {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-shrink: 0;
}

.playBtn {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  border: 1px solid rgba(212,136,60,0.4);
  background: rgba(212,136,60,0.12);
  color: #f0b060;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 180ms ease, transform 180ms ease;
  flex-shrink: 0;
}

.playBtn:hover {
  background: rgba(212,136,60,0.22);
  transform: scale(1.06);
}

.scrubArea {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
}

.time {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.58rem;
  letter-spacing: 0.08em;
  color: rgba(212,136,60,0.65);
  flex-shrink: 0;
  min-width: 3rem;
}

.time.right { text-align: right; }

.scrubTrack {
  flex: 1;
  height: 3px;
  background: rgba(212,136,60,0.18);
  border-radius: 999px;
  position: relative;
  cursor: pointer;
}

.scrubFill {
  position: absolute;
  top: 0; left: 0; bottom: 0;
  background: linear-gradient(to right, #8b4513, #d4883c);
  border-radius: 999px;
  pointer-events: none;
}

.scrubThumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #f0b060;
  box-shadow: 0 0 8px rgba(212,136,60,0.6);
  pointer-events: none;
}

/* Volume */
.volumeArea {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.volumeIcon {
  color: rgba(212,136,60,0.6);
  cursor: pointer;
  flex-shrink: 0;
}

.volumeSlider {
  -webkit-appearance: none;
  appearance: none;
  width: 72px;
  height: 3px;
  background: rgba(212,136,60,0.18);
  border-radius: 999px;
  outline: none;
  cursor: pointer;
}

.volumeSlider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #d4883c;
  cursor: pointer;
}

.closeBtn {
  background: none;
  border: none;
  color: rgba(212,136,60,0.4);
  cursor: pointer;
  padding: 0.3rem;
  flex-shrink: 0;
  transition: color 180ms ease;
}

.closeBtn:hover { color: rgba(212,136,60,0.8); }

/* Hide volume on narrow screens */
@media (max-width: 600px) {
  .volumeArea { display: none; }
  .episodeInfo { max-width: 14ch; }
}
```

- [ ] **Step 2: Create `components/radio/radio-player-bar.tsx`**

```tsx
// components/radio/radio-player-bar.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, X } from "lucide-react";
import styles from "./radio-player-bar.module.css";
import type { RadioEpisode } from "@/lib/radio/catalog";

type Props = {
  episode: RadioEpisode;
  onClose: () => void;
};

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function RadioPlayerBar({ episode, onClose }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(episode.durationSeconds);
  const [volume, setVolume] = useState(0.8);

  useEffect(() => {
    const audio = new Audio(episode.audioSrc);
    audio.volume = volume;
    audioRef.current = audio;

    audio.addEventListener("timeupdate", () => setCurrent(audio.currentTime));
    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("ended", () => setIsPlaying(false));

    audio.play().then(() => setIsPlaying(true)).catch(() => {});

    return () => {
      audio.pause();
      audio.src = "";
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episode.id]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else { audio.play(); setIsPlaying(true); }
  }

  function handleScrubClick(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
    setCurrent(ratio * duration);
  }

  function handleVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }

  const progress = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div className={styles.bar} role="region" aria-label="Lecteur radio">
      {/* Episode info */}
      <div className={styles.episodeInfo}>
        <p className={styles.episodeTitle}>{episode.title}</p>
        <p className={styles.episodeHost}>{episode.host}</p>
      </div>

      {/* Play / Pause */}
      <div className={styles.controls}>
        <button
          className={styles.playBtn}
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Lecture"}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
      </div>

      {/* Scrub bar */}
      <div className={styles.scrubArea}>
        <span className={styles.time}>{formatTime(current)}</span>
        <div
          className={styles.scrubTrack}
          onClick={handleScrubClick}
          role="slider"
          aria-label="Progression"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className={styles.scrubFill} style={{ width: `${progress}%` }} />
          <div className={styles.scrubThumb} style={{ left: `${progress}%` }} />
        </div>
        <span className={`${styles.time} ${styles.right}`}>{formatTime(duration)}</span>
      </div>

      {/* Volume */}
      <div className={styles.volumeArea}>
        <Volume2 size={14} className={styles.volumeIcon} />
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={handleVolume}
          className={styles.volumeSlider}
          aria-label="Volume"
        />
      </div>

      {/* Close */}
      <button className={styles.closeBtn} onClick={onClose} aria-label="Fermer le lecteur">
        <X size={14} />
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd /Users/bird/CBA-website && npx tsc --noEmit 2>&1 | grep -v ".next/"
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
cd /Users/bird/CBA-website
git add components/radio/
git commit -m "feat(radio): RadioPlayerBar — play/pause, scrub, time, volume, vintage amber styles"
```

---

### Task 4: Full `/radio` page

The page owns player state, renders the vintage-themed archive, and mounts the player bar when an episode is selected.

**Visual identity — "another room":**
- Background: `#0e0800` (near-black warm brown)
- Primary: `#d4883c` (amber)
- Text: `#f5e6c8` (cream)
- Subtle scan-line overlay via `repeating-linear-gradient`
- Cinzel italic for headings (same font, different palette — the contrast comes from color, not font)
- JetBrains Mono for all metadata

**Files:**
- Create: `components/radio/radio-archive.tsx`
- Create: `components/radio/radio-archive.module.css`
- Create: `app/(marketing)/radio/page.tsx`

- [ ] **Step 1: Create `components/radio/radio-archive.module.css`**

```css
/* components/radio/radio-archive.module.css */

/* ── Page shell ─────────────────────────────────────── */
.page {
  min-height: 100vh;
  background: #0e0800;
  padding-bottom: 6rem; /* space for fixed player bar */
  position: relative;
}

/* Scan-line overlay — gives vintage CRT texture */
.page::before {
  content: "";
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 3px,
    rgba(0,0,0,0.07) 3px,
    rgba(0,0,0,0.07) 4px
  );
  pointer-events: none;
  z-index: 100;
}

/* ── Hero ───────────────────────────────────────────── */
.hero {
  padding: clamp(4.5rem, 8vw, 7rem) clamp(1rem, 4vw, 2.4rem) clamp(3rem, 5vw, 5rem);
  background:
    radial-gradient(ellipse 65% 70% at 15% 55%, rgba(139,69,19,0.22) 0%, transparent 60%),
    radial-gradient(ellipse 45% 50% at 88% 25%, rgba(212,136,60,0.08) 0%, transparent 55%),
    #0e0800;
  border-bottom: 1px solid rgba(212,136,60,0.12);
}

.heroInner {
  width: min(100%, 1200px);
  margin-inline: auto;
}

.heroEyebrow {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.6rem;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: rgba(212,136,60,0.6);
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.heroDot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d4883c;
  box-shadow: 0 0 8px rgba(212,136,60,0.7);
  animation: amberpulse 2.4s ease-in-out infinite;
}

@keyframes amberpulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}

.heroTitle {
  margin: 0 0 0.5rem;
  font-family: var(--font-title, "Cinzel", serif);
  font-style: italic;
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 500;
  line-height: 0.95;
  color: #f5e6c8;
  letter-spacing: 0.01em;
}

.heroSub {
  margin: 0;
  font-size: clamp(0.9rem, 1.8vw, 1.1rem);
  color: rgba(245,230,200,0.5);
  max-width: 50ch;
  line-height: 1.65;
}

/* ── Archive body ───────────────────────────────────── */
.body {
  padding: clamp(2.5rem, 4vw, 4.5rem) clamp(1rem, 4vw, 2.4rem);
  width: min(100%, 1200px);
  margin-inline: auto;
}

.archiveHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.8rem;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.archiveLabel {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.58rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(212,136,60,0.5);
  margin: 0;
}

.count {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.56rem;
  letter-spacing: 0.14em;
  color: rgba(212,136,60,0.35);
}

/* ── Episode cards ──────────────────────────────────── */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr));
  gap: 1px;
  border: 1px solid rgba(212,136,60,0.1);
  border-radius: 1rem;
  overflow: hidden;
}

.card {
  background: #120900;
  border: none;
  padding: 1.4rem 1.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  cursor: pointer;
  text-align: left;
  position: relative;
  transition: background 200ms ease;
  border-right: 1px solid rgba(212,136,60,0.08);
  border-bottom: 1px solid rgba(212,136,60,0.08);
}

.card:hover {
  background: #1a1000;
}

.card.active {
  background: #1e1200;
  border-left: 2px solid #d4883c;
}

.cardMeta {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.cardGenre {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.5rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(212,136,60,0.65);
  border: 1px solid rgba(212,136,60,0.2);
  border-radius: 999px;
  padding: 0.14rem 0.5rem;
}

.cardDate {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.5rem;
  letter-spacing: 0.1em;
  color: rgba(245,230,200,0.3);
}

.cardTitle {
  margin: 0;
  font-family: var(--font-title, "Cinzel", serif);
  font-style: italic;
  font-size: clamp(1rem, 1.8vw, 1.22rem);
  font-weight: 500;
  line-height: 1.2;
  color: #f5e6c8;
}

.cardHost {
  margin: 0;
  font-size: 0.78rem;
  color: rgba(245,230,200,0.5);
}

.cardDesc {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.6;
  color: rgba(245,230,200,0.4);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cardFooter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 0.6rem;
  border-top: 1px solid rgba(212,136,60,0.08);
}

.cardDur {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.54rem;
  letter-spacing: 0.1em;
  color: rgba(212,136,60,0.5);
}

.playIndicator {
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 50%;
  border: 1px solid rgba(212,136,60,0.35);
  background: rgba(212,136,60,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d4883c;
  transition: background 180ms ease;
}

.card:hover .playIndicator,
.card.active .playIndicator {
  background: rgba(212,136,60,0.18);
}

/* ── Responsive ── */
@media (max-width: 600px) {
  .grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 2: Create `components/radio/radio-archive.tsx`**

```tsx
// components/radio/radio-archive.tsx
"use client";

import { Play, Pause } from "lucide-react";
import styles from "./radio-archive.module.css";
import { radioEpisodes, formatDate, type RadioEpisode } from "@/lib/radio/catalog";

type Props = {
  activeId: string | null;
  isPlaying: boolean;
  onSelect: (episode: RadioEpisode) => void;
};

export function RadioArchive({ activeId, isPlaying, onSelect }: Props) {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>
            <span className={styles.heroDot} aria-hidden />
            CBA Radio · Archives
          </p>
          <h1 className={styles.heroTitle}>La Fréquence</h1>
          <p className={styles.heroSub}>
            L&apos;archive sonore du collectif CBA — émissions, sets et sessions enregistrés depuis le Plateau-Mont-Royal.
          </p>
        </div>
      </header>

      {/* Archive */}
      <div className={styles.body}>
        <div className={styles.archiveHeader}>
          <p className={styles.archiveLabel}>Toutes les émissions</p>
          <span className={styles.count}>{radioEpisodes.length} épisodes</span>
        </div>

        <div className={styles.grid}>
          {radioEpisodes.map((ep) => {
            const isActive = ep.id === activeId;
            return (
              <button
                key={ep.id}
                className={`${styles.card} ${isActive ? styles.active : ""}`}
                onClick={() => onSelect(ep)}
                aria-pressed={isActive}
                aria-label={`${isActive && isPlaying ? "Pause" : "Écouter"} — ${ep.title}`}
              >
                <div className={styles.cardMeta}>
                  <span className={styles.cardGenre}>{ep.genre}</span>
                  <span className={styles.cardDate}>{formatDate(ep.date)}</span>
                </div>

                <h2 className={styles.cardTitle}>{ep.title}</h2>
                <p className={styles.cardHost}>{ep.host}</p>
                <p className={styles.cardDesc}>{ep.description}</p>

                <div className={styles.cardFooter}>
                  <span className={styles.cardDur}>{ep.duration}</span>
                  <span className={styles.playIndicator} aria-hidden>
                    {isActive && isPlaying ? <Pause size={12} /> : <Play size={12} />}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `app/(marketing)/radio/page.tsx`**

```tsx
// app/(marketing)/radio/page.tsx
"use client";

import { useState } from "react";
import { RadioArchive } from "@/components/radio/radio-archive";
import { RadioPlayerBar } from "@/components/radio/radio-player-bar";
import type { RadioEpisode } from "@/lib/radio/catalog";

export default function RadioPage() {
  const [activeEpisode, setActiveEpisode] = useState<RadioEpisode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  function handleSelect(episode: RadioEpisode) {
    if (activeEpisode?.id === episode.id) {
      // clicking active episode toggles play — RadioPlayerBar manages internal state
      // we just let it run; this toggle is a UX hint for the archive grid icon
      setIsPlaying((p) => !p);
    } else {
      setActiveEpisode(episode);
      setIsPlaying(true);
    }
  }

  return (
    <>
      <RadioArchive
        activeId={activeEpisode?.id ?? null}
        isPlaying={isPlaying}
        onSelect={handleSelect}
      />
      {activeEpisode && (
        <RadioPlayerBar
          episode={activeEpisode}
          onClose={() => { setActiveEpisode(null); setIsPlaying(false); }}
        />
      )}
    </>
  );
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
cd /Users/bird/CBA-website && npx tsc --noEmit 2>&1 | grep -v ".next/"
```

Expected: no output.

- [ ] **Step 5: Visual check**

Open `http://localhost:3000/radio`. Verify:
- ✅ Page has warm dark brown background — clearly different from the rest of the site
- ✅ Scan-line texture visible (subtle)
- ✅ Hero title "La Fréquence" in large Cinzel italic, cream color
- ✅ Archive grid shows all 6 episodes as cards with genre pill, date, host, description
- ✅ Clicking an episode mounts the amber player bar at the bottom
- ✅ Clicking a second episode swaps to it
- ✅ Player bar: play/pause toggles correctly, scrub bar moves, time displays, volume slider works
- ✅ Active card gets amber left border
- ✅ Close button on player bar dismisses it
- ✅ Responsive at 375px: cards stack, volume hidden, player info truncates

- [ ] **Step 6: Commit**

```bash
cd /Users/bird/CBA-website
git add components/radio/ "app/(marketing)/radio/"
git commit -m "feat(radio): full /radio page — vintage archive grid, amber player bar, episode playback"
```

---

## Self-Review

**Spec coverage check:**
- ✅ MP3 playback (no streaming) — `<audio>` in `RadioPlayerBar`, `audioSrc` field in data
- ✅ Admin inputs metadata — `RadioEpisode` type has all admin-input fields; bucket URL goes in `audioSrc`
- ✅ Basic player: play/pause, scrub, time, volume — Task 3
- ✅ Homepage section matches existing CBA aesthetic — Task 2 (gold/green palette)
- ✅ Full page has vintage/analog contrast aesthetic — Task 4 (amber palette, scan lines, warm dark bg)
- ✅ Archive scales to any number of records — `auto-fill` CSS grid, flat date-sorted array, episode count shown
- ✅ `id="listen"` on homepage section so "LISTEN LIVE" nav link works — Task 2
- ✅ Link between homepage section and full page — "Toutes les émissions" → `/radio`

**Placeholder scan:** `audioSrc` values are `/audio/*.mp3` placeholders with TODO comment in catalog — intentional, noted in architecture section.

**Type consistency:** `RadioEpisode` defined once in Task 1, used in Tasks 2, 3, and 4 consistently. `formatDate`, `getFeaturedEpisode`, `BAR_CONFIG`, `radioEpisodes` all defined in Task 1 and imported by name in later tasks.
