# Navbar redesign + Radio section on homepage — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lift the navbar to the root layout so it appears on every page, slim/rename its links, hide it on the homepage hero and slide it in on scroll, give it a dark-glass aesthetic with a full-screen mobile overlay, and mount `RadioSection` at the bottom of the homepage.

**Architecture:** A new client component `SiteNav` replaces `SiteHeader` and is mounted from `app/layout.tsx` along with `SiteFooter`. `SiteNav` uses an `IntersectionObserver` on a `#hero-sentinel` element (placed at the bottom of `ScrollHero`) to toggle a `.is-hidden` class — when no sentinel exists on a page, the bar stays visible. A separate `MobileMenu` client component renders the full-screen overlay below 880px. `MarketingShell` is trimmed to its marketing-only chrome (grain, ambient glows, reveal observer).

**Tech Stack:** Next.js 16 (App Router, webpack), React 19, TypeScript, CSS Modules.

**Verification model:** This repo has no test framework. Each task ends with `npm run typecheck` and (for UI-touching tasks) a dev-server visual check. No tests added.

---

## File Structure

**Modify:**
- `lib/site.ts` — rewrite `nav`, add `secondaryNav`.
- `app/layout.tsx` — mount `<SiteNav />` + `<SiteFooter />`.
- `components/layout/marketing-shell.tsx` — drop `<SiteHeader />` and `<SiteFooter />`.
- `components/layout/site-footer.tsx` — add "À propos" column.
- `components/home/scroll-hero.tsx` — append `#hero-sentinel` element.
- `components/home/radio-section.tsx` — remove `Radio page V2` button.
- `components/home/radio-section.module.css` — remove `.headerLinkAlt` + `.headerLinkAlt:hover` rules.
- `app/(hero)/page.tsx` — append `<RadioSection />`.

**Create:**
- `components/navigation/site-nav.tsx` — new site-wide nav (client).
- `components/navigation/site-nav.module.css` — dark-glass styling + hide states.
- `components/navigation/mobile-menu.tsx` — full-screen overlay (client).
- `components/navigation/mobile-menu.module.css` — overlay styling.

**Delete (at end):**
- `components/layout/site-header.tsx` — superseded by `site-nav.tsx`.

---

## Task 1: Update site config — new nav and secondaryNav

**Files:**
- Modify: `lib/site.ts`

- [ ] **Step 1: Rewrite `siteConfig.nav` and add `siteConfig.secondaryNav`**

Replace the existing `nav: [...]` array and add `secondaryNav` right after it. Final shape:

```ts
  nav: [
    { href: "/",            label: "Accueil",             icon: "⌂", shortLabel: "Accueil" },
    { href: "/beats",       label: "Nos Beats",           icon: "◈", shortLabel: "Beats"   },
    { href: "/dj-services", label: "Réserver un DJ",      icon: "↝", shortLabel: "DJ"      },
    { href: "/events",      label: "Nos Événements",      icon: "◷", shortLabel: "Agenda"  },
    { href: "/studio",      label: "Réserver le Studio",  icon: "⬡", shortLabel: "Studio"  },
    { href: "/radio",       label: "Écouter la Radio",    icon: "◉", shortLabel: "Radio"   },
  ] satisfies NavLink[],
  secondaryNav: [
    { href: "/about",   label: "Notre ADN",   icon: "◉", shortLabel: "ADN"     },
    { href: "/contact", label: "Nous écrire", icon: "✦", shortLabel: "Contact" },
  ] satisfies NavLink[],
```

The `social` and `adminNav` blocks below stay unchanged.

- [ ] **Step 2: Typecheck**

```bash
cd "/mnt/c/Users/Setup Game/Desktop/cba website" && npm run typecheck
```

Expected: passes. `siteConfig.nav` now has 6 entries; existing iterators in `site-header.tsx` and `site-footer.tsx` continue to work (still iterate `siteConfig.nav`).

- [ ] **Step 3: Commit**

```bash
git add lib/site.ts
git commit -m "refactor(site): slim primary nav to 6 links, add secondaryNav for About/Contact"
```

---

## Task 2: Add hero sentinel to ScrollHero

**Files:**
- Modify: `components/home/scroll-hero.tsx`

- [ ] **Step 1: Append the sentinel just before the closing `</section>` tag**

`ScrollHero` ends at `components/home/scroll-hero.tsx:260` with `</section>`. Immediately before that closing tag (after the bottom-gradient fade `div` ending around line 258), add:

```tsx
        {/* Sentinel used by SiteNav to know when the hero has scrolled past the viewport */}
        <div id="hero-sentinel" aria-hidden style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, pointerEvents: "none" }} />
```

It sits inside the same parent wrapper as the bottom-gradient fade (the wrapper that ends just before `</section>`).

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 3: Verify the sentinel exists at runtime**

Start the dev server if it isn't already running:

```bash
npm run dev
```

Wait until `Ready in` appears in the output, then:

```bash
curl -s http://localhost:3000/ | grep -c 'id="hero-sentinel"'
```

Expected: `1`.

- [ ] **Step 4: Commit**

```bash
git add components/home/scroll-hero.tsx
git commit -m "feat(hero): add #hero-sentinel anchor for site-nav scroll-trigger"
```

---

## Task 3: Create SiteNav component (visible-always for now)

This task builds the new nav component, but wires it up assuming it should always be visible. Hide-on-hero behavior is added in Task 5 so we can verify the bar renders correctly first.

**Files:**
- Create: `components/navigation/site-nav.tsx`
- Create: `components/navigation/site-nav.module.css`

- [ ] **Step 1: Write `components/navigation/site-nav.module.css`**

```css
.bar {
  position: sticky;
  top: 0;
  z-index: 50;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 0.85rem 1.5rem;
  background: rgba(10, 10, 12, 0.55);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  backdrop-filter: blur(18px) saturate(140%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  transform: translateY(0);
  opacity: 1;
  transition: transform 300ms ease, opacity 300ms ease;
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .bar { background: rgba(10, 10, 12, 0.88); }
}

.bar.isHidden {
  transform: translateY(-100%);
  opacity: 0;
  pointer-events: none;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: inherit;
}

.brandBadge {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  overflow: hidden;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.10);
}

.brandCopy {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.brandCopy strong {
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.85rem;
}

.brandCopy span {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.7rem;
}

.links {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.adminChip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.95rem;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--accent, #c9a961) 0%, var(--accent-soft, #8a6d2f) 100%);
  color: #130d08;
  font-weight: 700;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-decoration: none;
  text-transform: uppercase;
  transition: transform 180ms ease;
}

.adminChip:hover { transform: translateY(-1px); }

.burger {
  display: none;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
  align-items: center;
  justify-content: center;
  color: inherit;
}

.burger:hover { background: rgba(255, 255, 255, 0.08); }

.burgerLines {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 18px;
}

.burgerLines span {
  display: block;
  height: 2px;
  background: currentColor;
  border-radius: 2px;
}

@media (max-width: 880px) {
  .links { display: none; }
  .adminChip { display: none; }
  .burger { display: inline-flex; }
}
```

- [ ] **Step 2: Write `components/navigation/site-nav.tsx`**

```tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { siteConfig } from "@/lib/site";
import { NavLinkItem } from "@/components/navigation/nav-link";
import { MobileMenu } from "@/components/navigation/mobile-menu";
import styles from "./site-nav.module.css";

export function SiteNav() {
  const [isHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className={`${styles.bar} ${isHidden ? styles.isHidden : ""}`}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandBadge}>
            <Image src="/cba/cba-logo.png" alt="CBA" width={36} height={36} style={{ borderRadius: "50%", objectFit: "cover" }} />
          </span>
          <span className={styles.brandCopy}>
            <strong>{siteConfig.title}</strong>
            <span>{siteConfig.location}</span>
          </span>
        </Link>

        <nav className={styles.links} aria-label="Primary">
          {siteConfig.nav.map((link) => (
            <NavLinkItem key={link.href} {...link} />
          ))}
        </nav>

        <div className={styles.actions}>
          <Link href="/admin" className={styles.adminChip}>Admin</Link>
          <button
            type="button"
            className={styles.burger}
            aria-label="Ouvrir le menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <span className={styles.burgerLines}><span /><span /><span /></span>
          </button>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
```

This imports `MobileMenu` which doesn't exist yet — that file is created in Task 4. The component will fail to compile until then; this is acceptable because Task 5 (which mounts `SiteNav` in the root layout) is gated behind Task 4.

- [ ] **Step 3: Commit**

```bash
git add components/navigation/site-nav.tsx components/navigation/site-nav.module.css
git commit -m "feat(nav): SiteNav component with dark-glass styling"
```

Typecheck is deferred to Task 4 (when `MobileMenu` exists).

---

## Task 4: Create MobileMenu component

**Files:**
- Create: `components/navigation/mobile-menu.tsx`
- Create: `components/navigation/mobile-menu.module.css`

- [ ] **Step 1: Write `components/navigation/mobile-menu.module.css`**

```css
.overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgba(10, 10, 12, 0.92);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
  transform: translateY(-100%);
  opacity: 0;
  transition: transform 280ms ease, opacity 280ms ease;
  display: flex;
  flex-direction: column;
  padding: 1rem 1.5rem 2rem;
  overflow-y: auto;
}

.overlay.open {
  transform: translateY(0);
  opacity: 1;
}

.topBar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.brandLabel {
  font-family: var(--display-font, "Cinzel", serif);
  letter-spacing: 0.12em;
  font-size: 1.1rem;
  color: #fff;
}

.close {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
  font-size: 1.3rem;
  cursor: pointer;
  display: grid;
  place-items: center;
}

.primary {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.primary a {
  display: block;
  padding: 0.9rem 0.4rem;
  font-family: "JetBrains Mono", monospace;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 1.6rem;
  color: #fff;
  text-decoration: none;
}

.primary a:hover { color: var(--accent, #c9a961); }

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.10);
  margin: 1.5rem 0;
}

.secondary {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.secondary a {
  display: block;
  padding: 0.5rem 0.4rem;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
}

.secondary a:hover { color: #fff; }

.adminRow {
  margin-top: 1.25rem;
}

.adminChip {
  display: inline-flex;
  padding: 0.7rem 1.2rem;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--accent, #c9a961) 0%, var(--accent-soft, #8a6d2f) 100%);
  color: #130d08;
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-decoration: none;
  text-transform: uppercase;
}

.social {
  margin-top: auto;
  padding-top: 2rem;
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.social a {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
  text-decoration: none;
}

.social a:hover { color: #fff; }
```

- [ ] **Step 2: Write `components/navigation/mobile-menu.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { siteConfig } from "@/lib/site";
import styles from "./mobile-menu.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function MobileMenu({ open, onClose }: Props) {
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    firstLinkRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div className={`${styles.overlay} ${open ? styles.open : ""}`} aria-hidden={!open}>
      <div className={styles.topBar}>
        <span className={styles.brandLabel}>{siteConfig.title}</span>
        <button type="button" className={styles.close} aria-label="Fermer le menu" onClick={onClose}>
          ✕
        </button>
      </div>

      <ul className={styles.primary}>
        {siteConfig.nav.map((link, i) => (
          <li key={link.href}>
            <Link
              href={link.href}
              ref={i === 0 ? firstLinkRef : undefined}
              onClick={onClose}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className={styles.divider} />

      <ul className={styles.secondary}>
        {siteConfig.secondaryNav.map((link) => (
          <li key={link.href}>
            <Link href={link.href} onClick={onClose}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className={styles.adminRow}>
        <Link href="/admin" className={styles.adminChip} onClick={onClose}>Admin</Link>
      </div>

      <div className={styles.social}>
        {siteConfig.social.map((s) => (
          <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
            {s.label}
          </a>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

```bash
npm run typecheck
```

Expected: passes. Both `SiteNav` and `MobileMenu` now compile; `siteConfig.secondaryNav` is referenced from Task 1.

- [ ] **Step 4: Commit**

```bash
git add components/navigation/mobile-menu.tsx components/navigation/mobile-menu.module.css
git commit -m "feat(nav): MobileMenu full-screen overlay with escape + scroll-lock"
```

---

## Task 5: Mount SiteNav in root layout, strip header/footer from MarketingShell

This is the cut-over. After this task, every page renders the new nav once and only once.

**Files:**
- Modify: `app/layout.tsx`
- Modify: `components/layout/marketing-shell.tsx`

- [ ] **Step 1: Mount `SiteNav` and `SiteFooter` in `app/layout.tsx`**

Add imports at the top:

```tsx
import { SiteNav } from "@/components/navigation/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
```

Inside `<AudioProvider>`, wrap `{children}` so the layout becomes:

```tsx
        <AudioProvider>
          <SiteNav />
          {children}
          <SiteFooter />
          <MiniPlayer />
        </AudioProvider>
```

Leave the rest of `app/layout.tsx` (font, head links, CustomCursor) unchanged.

- [ ] **Step 2: Strip header/footer from `MarketingShell`**

Replace the entire body of `components/layout/marketing-shell.tsx` with:

```tsx
"use client";

import { ReactNode, useEffect } from "react";

export function MarketingShell({ children }: { children: ReactNode }) {
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
      <div className="grain-overlay" aria-hidden="true" />
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <main>{children}</main>
    </div>
  );
}
```

The `SiteHeader` and `SiteFooter` imports are removed; the `<main>` wrapper stays (marketing pages still need the marketing chrome around their content).

- [ ] **Step 3: Typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 4: Smoke-test all three layouts**

Restart the dev server if it's running, then:

```bash
curl -s -o /dev/null -w "HOME %{http_code}\n"     http://localhost:3000/
curl -s -o /dev/null -w "BEATS %{http_code}\n"    http://localhost:3000/beats
curl -s -o /dev/null -w "RADIO %{http_code}\n"    http://localhost:3000/radio
curl -s http://localhost:3000/beats | grep -c 'class="[^"]*bar' || true
```

Expected: three 200 responses. (The grep returns either 0 or >0 depending on CSS module hashing; it's not a hard assertion — open `/beats` in the browser instead and verify exactly one dark-glass bar appears at the top.)

Also visually confirm in the browser:

- `/` — nav is visible at the top of the page (hide-on-hero comes in Task 6).
- `/beats` — exactly one navbar (no double header). Footer still renders.
- `/radio` — navbar and footer visible.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx components/layout/marketing-shell.tsx
git commit -m "feat(layout): lift SiteNav/SiteFooter to root layout, trim MarketingShell"
```

---

## Task 6: Add hide-on-hero observer to SiteNav

**Files:**
- Modify: `components/navigation/site-nav.tsx`

- [ ] **Step 1: Replace the `useState(false)` line with the observer logic**

In `components/navigation/site-nav.tsx`, change the imports to add `useEffect`:

```tsx
import { useEffect, useState } from "react";
```

Replace `const [isHidden] = useState(false);` with:

```tsx
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById("hero-sentinel");
    if (!sentinel) {
      setIsHidden(false);
      return;
    }

    setIsHidden(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHidden(entry.isIntersecting);
      },
      { rootMargin: "0px", threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);
```

Behavior: on mount, if no sentinel exists → stay visible. If it exists → start hidden, then flip to visible once the sentinel scrolls out of the viewport above.

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 3: Verify behavior in the browser**

Restart dev server if needed.

- Load `/` — navbar should be hidden initially. Scroll down past the hero — navbar slides in. Scroll back up to the hero — navbar slides out.
- Load `/beats` — navbar visible immediately and stays visible.
- Load `/radio` — navbar visible immediately and stays visible.

- [ ] **Step 4: Commit**

```bash
git add components/navigation/site-nav.tsx
git commit -m "feat(nav): hide on homepage hero, slide in past #hero-sentinel"
```

---

## Task 7: Add "À propos" column to SiteFooter

**Files:**
- Modify: `components/layout/site-footer.tsx`

- [ ] **Step 1: Add the new column inside `.footer-nav-cols`**

In `components/layout/site-footer.tsx`, locate the `<div className="footer-nav-cols">` block. After the existing "Services" column (the one ending with `</div>` after the `Nous Contacter` link), add a third column:

```tsx
          <div className="footer-col">
            <h4>À propos</h4>
            <ul>
              {siteConfig.secondaryNav.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
```

The existing "Navigation" and "Services" columns are unchanged.

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 3: Verify in the browser**

Load `/beats` and scroll to the footer. Confirm the footer now has three columns: Navigation, Services, À propos. The new column should list `Notre ADN` and `Nous écrire`.

- [ ] **Step 4: Commit**

```bash
git add components/layout/site-footer.tsx
git commit -m "feat(footer): add À propos column for About + Contact"
```

---

## Task 8: Mount RadioSection on homepage, drop V2 button

**Files:**
- Modify: `components/home/radio-section.tsx`
- Modify: `components/home/radio-section.module.css`
- Modify: `app/(hero)/page.tsx`

- [ ] **Step 1: Remove the V2 button from RadioSection**

In `components/home/radio-section.tsx`, find the `<div className={styles.headerLinks}>` block (around line 309-317). Delete the entire `<button type="button" className={styles.headerLinkAlt}>Radio page V2</button>` element so the block becomes:

```tsx
          <div className={styles.headerLinks}>
            <Link href="/radio" className={styles.headerLink}>
              <Headphones size={13} />
              Toutes les émissions
            </Link>
          </div>
```

- [ ] **Step 2: Remove the orphan CSS rules**

In `components/home/radio-section.module.css`, delete lines 94-118 (the `.headerLinkAlt { ... }` and `.headerLinkAlt:hover { ... }` blocks).

- [ ] **Step 3: Mount RadioSection at the end of the homepage**

In `app/(hero)/page.tsx`, add the import and append the component:

```tsx
"use client";

import { ScrollHero } from "@/components/home/scroll-hero";
import { EditorialCatalog } from "@/components/home/editorial-catalog";
import { StudioSectionMockup } from "@/components/home/studio-section-mockup";
import { EventsSection } from "@/components/home/events-section";
import { RadioSection } from "@/components/home/radio-section";

export default function HomePage() {
  return (
    <>
      <ScrollHero />
      <EditorialCatalog />
      <StudioSectionMockup />
      <EventsSection />
      <RadioSection />
    </>
  );
}
```

- [ ] **Step 4: Typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 5: Verify in the browser**

Load `/`, scroll all the way down (past the hero, beats, studio, events). The radio section should render at the bottom with the animated LED panel spelling "RADIO". Only one CTA — "Toutes les émissions" — appears in the header (no V2 button). Click it → routes to `/radio`.

- [ ] **Step 6: Commit**

```bash
git add components/home/radio-section.tsx components/home/radio-section.module.css app/\(hero\)/page.tsx
git commit -m "feat(home): mount RadioSection at end, drop placeholder V2 button"
```

---

## Task 9: Delete legacy site-header.tsx

`SiteHeader` is no longer imported anywhere after Task 5. Removing it removes a stale parallel implementation.

**Files:**
- Delete: `components/layout/site-header.tsx`

- [ ] **Step 1: Confirm nothing imports it**

```bash
grep -rn "site-header\|SiteHeader" --include="*.tsx" --include="*.ts" .
```

Expected: only references in `components/layout/site-header.tsx` itself (and possibly global CSS class names in `globals.css`, which are unrelated string matches and stay).

If any TSX/TS file imports `SiteHeader`, stop and address that import first.

- [ ] **Step 2: Delete the file**

```bash
git rm components/layout/site-header.tsx
```

- [ ] **Step 3: Typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git commit -m "refactor(layout): remove legacy SiteHeader (replaced by SiteNav)"
```

---

## Task 10: Final verification

- [ ] **Step 1: Typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 2: Lint**

```bash
npm run lint
```

Expected: passes (or only pre-existing warnings — note any new ones).

- [ ] **Step 3: End-to-end visual sweep**

Open the dev server in a browser and verify all of the following:

**Homepage (`/`)**
- Navbar is hidden initially (only the hero video is visible).
- Scrolling past the hero reveals the dark-glass navbar sliding down from the top.
- Scrolling back up hides it again.
- New section "Nos Ondes" with animated LED panel appears at the bottom of the page.
- "Toutes les émissions" link in that section routes to `/radio`.
- No "Radio page V2" button anywhere.

**Marketing pages (`/beats`, `/events`, `/studio`, `/dj-services`)**
- Exactly one navbar at the top. Dark-glass styling visible.
- Navbar visible immediately (no hide-on-load).
- Six nav links present: Accueil, Nos Beats, Réserver un DJ, Nos Événements, Réserver le Studio, Écouter la Radio.
- Footer shows three columns: Navigation, Services, **À propos** (with Notre ADN + Nous écrire).

**Radio page (`/radio`)**
- Navbar visible at top.
- Existing radio archive content renders unchanged.
- Footer renders with the three columns.

**Mobile (≤880px, use browser devtools responsive mode at 600px)**
- Six primary links collapse; only the hamburger button is visible on the right.
- Tapping the burger opens a full-screen dark overlay menu with the 6 links (large), divider, About + Contact, Admin chip, and social row at the bottom.
- Pressing Escape closes the menu. Tapping the X closes the menu. Tapping any link closes the menu.
- While the menu is open, the page behind doesn't scroll.

If anything is off, fix it in a follow-up commit before considering the work done.
