# Hero → Beats Gradient Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a cinematic gradient fade at the bottom of the hero sticky viewport so the video dissolves seamlessly into the beats section — no hard line at any scroll position.

**Architecture:** The `ScrollHero` sticky viewport already has a vignette overlay. We add a second overlay div pinned to the bottom of that sticky container that fades from `transparent` → `#0a0a0a` (the exact background colour of `EditorialCatalog`). This lives entirely inside `scroll-hero.tsx` — no other file needs to change. No JS, no scroll listeners — pure CSS gradient.

**Tech Stack:** React, Next.js, inline styles (matching existing pattern in the file)

---

## File Map

| Action | File | What changes |
|--------|------|--------------|
| Modify | `components/home/scroll-hero.tsx` | Add gradient fade `<div>` inside sticky viewport |

---

### Task 1: Add the gradient fade overlay

**Files:**
- Modify: `components/home/scroll-hero.tsx`

#### Context — where to insert

Inside `ScrollHero`, the sticky `<div>` currently contains:

1. `<video>` — the background video
2. A vignette `<div>` (zIndex 1) — lifts nav text off video
3. Logo `<div>` (zIndex 2)
4. `<nav>` (zIndex 3)

We insert a **new gradient `<div>` at zIndex 2**, positioned at the very bottom of the sticky container. It must sit above the video but below the logo/nav so it never obscures interactive elements.

---

- [ ] **Step 1: Open the file**

  File: `components/home/scroll-hero.tsx`

  Locate the closing `</div>` of the sticky container — it's the `<div>` with:
  ```tsx
  style={{
    position: "sticky",
    top: 0,
    height: "100vh",
    overflow: "hidden",
    background: "#080808",
  }}
  ```
  You will insert the new overlay **just before** that closing `</div>`, after the `<nav>` block.

- [ ] **Step 2: Add the gradient fade div**

  Insert this block immediately before the `</div>` that closes the sticky container:

  ```tsx
  {/* ── Hero → Beats gradient fade ── */}
  <div
    aria-hidden
    style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "38%",
      background: "linear-gradient(to bottom, transparent 0%, #0a0a0a 100%)",
      zIndex: 2,
      pointerEvents: "none",
    }}
  />
  ```

  > Why `38%`? Tall enough for a slow, cinematic dissolve without eating into the logo area. Tweak between `28%`–`45%` to taste after visual review.

- [ ] **Step 3: Verify the file compiles**

  ```bash
  cd /Users/bird/CBA-website
  npx tsc --noEmit
  ```

  Expected: no errors printed.

- [ ] **Step 4: Visual check in browser**

  Open `http://localhost:3000` (dev server already running).

  Scroll slowly through the hero:
  - ✅ Bottom ~38% of the video fades smoothly to black
  - ✅ No visible hard line where hero ends and beats section begins
  - ✅ Logo and nav are not obscured (they sit in the upper portion)
  - ✅ Transition looks the same on narrow viewport (resize browser to ~375px wide)

  If the fade feels too short/abrupt → increase `height` toward `45%`.
  If it swallows too much video → decrease toward `28%`.

- [ ] **Step 5: Commit**

  ```bash
  cd /Users/bird/CBA-website
  git add components/home/scroll-hero.tsx
  git commit -m "feat(hero): cinematic gradient fade into beats section

  Adds a bottom-anchored overlay that dissolves the hero video into
  #0a0a0a, matching the EditorialCatalog background. No JS — pure CSS.

  Closes #2"
  ```
