# CBA One-Page Scroll — Task Brief

## Project
`/Users/bird/CBA-website` — Next.js 14, App Router, Tailwind CSS, Framer Motion.

## Goal
Convert the hero CTAs to same-page smooth scroll. The homepage already has all sections
stacked on one page — they just link to separate routes instead of scrolling.

---

## Files to read first
- `app/(marketing)/page.tsx` — homepage composition
- `components/home/scroll-hero.tsx` — hero with the CTA buttons
- `components/home/editorial-catalog.tsx` — beats section
- `components/home/studio-section-mockup.tsx` — studio booking section
- `components/home/events-section.tsx` — events / listen live section
- `app/globals.css` — global styles

---

## Changes to make

### 1. `components/home/scroll-hero.tsx`
- Find CTA buttons (currently `<Link href="/beats">` and `<Link href="/studio">`)
- Convert them to `onClick` scroll handlers:
  ```tsx
  onClick={() => document.getElementById('beats')?.scrollIntoView({ behavior: 'smooth' })}
  ```
- Keep the exact same visual style — no traditional button look.
  Uppercase text, icons, thin dividers, short descriptions. Do not restyle them.
- The three targets are: `beats`, `studio`, `listen`

### 2. `components/home/editorial-catalog.tsx`
- Add `id="beats"` to the outermost element

### 3. `components/home/studio-section-mockup.tsx`
- Add `id="studio"` to the outermost element

### 4. `components/home/events-section.tsx`
- Add `id="listen"` to the outermost element

### 5. `app/globals.css`
- Add `html { scroll-behavior: smooth; }` if not already present

---

## Placeholder UI (add inside the existing sections)
Each section should feel full-screen or near full-screen. Match the CBA dark aesthetic
(black/deep-green background, gold or white accents, minimal typography).

### Beats section (`editorial-catalog.tsx` or a new `BeatsSection` component)
Mock beat cards — each card shows:
- Beat title
- BPM
- Genre tag
- Price
- Play button (circle icon)
Leave a comment: `{/* TODO: replace with real beat data from lib/beats/catalog.ts */}`

### Booking section (`studio-section-mockup.tsx` or a new `BookingSection` component)
Mock studio session cards — show:
- Session name / room name
- Date + time slot
- Duration
- A "Book" or "Request" button
Leave a comment: `{/* TODO: wire to studio booking form in components/studio/studio-booking-form.tsx */}`

### Listen Live section (`events-section.tsx` or a new `ListenLiveSection` component)
Mock radio player — show:
- Live status badge ("LIVE" in red or gold)
- Station/show name
- Waveform (SVG bars or animated divs)
- Play/pause button
Leave a comment: `{/* TODO: replace with real stream URL */}`

---

## Constraints
- Do NOT break existing routing to `/beats`, `/studio`, `/events` pages.
- Only the homepage hero CTAs change to scroll behavior.
- Keep all existing components intact — only add IDs and swap the CTA link behavior.
- No new routing. No new pages.
