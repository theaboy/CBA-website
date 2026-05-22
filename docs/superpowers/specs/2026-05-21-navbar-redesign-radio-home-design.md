# Navbar redesign + Radio section on homepage

**Date:** 2026-05-21
**Scope:** Site-wide navbar (links, behavior, visual style, mobile) + wire `RadioSection` into the homepage.

---

## Goals

1. Lift the navbar out of the marketing route group so it renders on every page (homepage, marketing pages, radio page).
2. Slim the link list, rename labels to be unambiguous, move About/Contact to the footer only.
3. On the homepage, hide the navbar while the full-screen hero is in view; slide it in once the user scrolls past the hero.
4. Apply a dark-glass aesthetic (semi-transparent dark + backdrop blur) once visible.
5. Add a full-screen overlay mobile menu, triggered by a hamburger.
6. Render Williams's existing `RadioSection` at the bottom of the homepage, with the placeholder "Radio page V2" button removed.

## Non-goals

- No changes to the `RadioSection` animation, LED canvas, copy, or layout beyond removing the V2 button.
- No changes to existing homepage sections (`ScrollHero`, `EditorialCatalog`, `StudioSectionMockup`, `EventsSection`).
- No restyling of the footer beyond adding an "À propos" column.
- No changes to admin routes or the `Admin` chip behavior.

## 1. Navigation links

### Primary nav (6 links)

| Label | Route |
|---|---|
| Accueil | `/` |
| Nos Beats | `/beats` |
| Réserver un DJ | `/dj-services` |
| Nos Événements | `/events` |
| Réserver le Studio | `/studio` |
| Écouter la Radio | `/radio` |

Order: Accueil first, then the two audio routes (Beats, DJ), then events, then studio, then radio. Renaming standardizes on action-explicit French ("Réserver", "Écouter") so the destination intent is unambiguous.

### Secondary nav (2 links — footer + mobile menu only)

| Label | Route |
|---|---|
| Notre ADN | `/about` |
| Nous écrire | `/contact` |

### Right-side header actions

- `Réserver le Studio` chip is **removed** (now in primary nav).
- `Admin` chip stays unchanged.

### Data model — `lib/site.ts`

Rewrite `siteConfig.nav` with the 6 primary entries above. Add a new `siteConfig.secondaryNav: NavLink[]` with About + Contact. Existing `NavLink` type is reused; `icon` and `shortLabel` fields remain.

## 2. Layout architecture

### Lift header/footer to root layout

Today:

- `SiteHeader` + `SiteFooter` are rendered by `MarketingShell`.
- `MarketingShell` is used by `app/(marketing)/layout.tsx` only.
- `app/(hero)/layout.tsx` and `app/(radio)/layout.tsx` render `{children}` directly with no header/footer.

After:

- `app/layout.tsx` renders `<SiteNav />` (new), `<main>{children}</main>`, `<SiteFooter />`.
- `app/(hero)/layout.tsx` and `app/(radio)/layout.tsx` remain thin pass-throughs (kept for route grouping but the header/footer come from root).
- `MarketingShell` is reduced to marketing-only chrome: grain overlay, ambient glows, scroll-reveal `IntersectionObserver`. No longer renders header or footer.
- `app/(marketing)/layout.tsx` continues to wrap children in `MarketingShell`.

### Component changes

- **New:** `components/navigation/site-nav.tsx` (client) — replaces `SiteHeader`.
- **New:** `components/navigation/mobile-menu.tsx` (client) — owned by `SiteNav`.
- **Removed:** `components/layout/site-header.tsx` (replaced by `site-nav.tsx`).
- **Modified:** `components/layout/marketing-shell.tsx` — drop `<SiteHeader />` and `<SiteFooter />`.
- **Modified:** `components/layout/site-footer.tsx` — add "À propos" column.
- **Modified:** `app/layout.tsx` — mount `SiteNav` + `SiteFooter` once.
- **Modified:** `lib/site.ts` — new nav data.

## 3. Hide-on-hero behavior

### Trigger mechanism

`ScrollHero` adds an invisible sentinel element at its bottom edge:

```tsx
<div id="hero-sentinel" aria-hidden style={{ height: 1, width: "100%" }} />
```

`SiteNav` mounts an `IntersectionObserver` watching `#hero-sentinel`:

- If the sentinel does not exist on the current page (any non-homepage route) → nav is always visible.
- If the sentinel exists and is at-or-above the viewport's top edge (i.e., still scrolled into view at the bottom of the hero) → nav is hidden.
- Once the sentinel scrolls out of view above the viewport → nav is visible.

Concretely: observe the sentinel with `rootMargin: "0px"` and `threshold: 0`. While `isIntersecting` is true, hide the nav. When it flips to false (sentinel scrolled past the top), show the nav.

### Visual transition

Two CSS classes on the nav element:

- `.is-hidden` → `transform: translateY(-100%); opacity: 0; pointer-events: none;`
- `.is-visible` → `transform: translateY(0); opacity: 1;`
- `transition: transform 300ms ease, opacity 300ms ease;`

The nav is `position: sticky; top: 0; z-index: 50`.

## 4. Visual style — dark glass

Once visible, the nav uses:

- `background: rgba(10, 10, 12, 0.55)`
- `backdrop-filter: blur(18px) saturate(140%)` (with `-webkit-` prefix)
- Hairline bottom border: `1px solid rgba(255, 255, 255, 0.06)`
- Padding: matches existing `site-header` (no layout change).
- Typography and color of links: unchanged from current `NavLinkItem`.

Fallback for browsers without `backdrop-filter`: `background: rgba(10, 10, 12, 0.88)` via `@supports not (backdrop-filter: blur(1px))`.

## 5. Mobile menu

### Trigger

Below 880px viewport width:

- Primary nav links are hidden.
- Admin chip is hidden from the bar (it moves into the overlay).
- A hamburger button is the only right-side element in the bar.

### Overlay panel

- `position: fixed; inset: 0; z-index: 60`.
- Background: `rgba(10, 10, 12, 0.92)` + `backdrop-filter: blur(24px)`.
- Slides down from the top: `transform: translateY(-100%)` → `translateY(0)`, 280ms ease.
- Top bar inside the overlay mirrors the nav: brand mark left, X (close) button right.

### Contents (stacked vertically)

1. The 6 primary links, large type (~28px), one per row, generous vertical rhythm.
2. Hairline divider.
3. The 2 secondary links (About, Contact), smaller (~16px), muted color.
4. Admin chip (since it was hidden from the bar on mobile).
5. Social row at bottom (Instagram / YouTube / SoundCloud from `siteConfig.social`).

### Behavior

- Opening sets `document.body.style.overflow = "hidden"`; closing restores it.
- Closes on: tapping any link, tapping the X, pressing Escape.
- First link receives focus on open; focus returns to hamburger on close.
- Hide-on-hero applies to the bar; since the hamburger lives in the bar, the menu is unreachable while the hero is in view. Intentional.

## 6. Footer changes

`components/layout/site-footer.tsx`:

- The "Navigation" column auto-updates (it iterates `siteConfig.nav`, which now has the 6 trimmed entries).
- **Add** a third column "À propos" that iterates `siteConfig.secondaryNav` and renders About + Contact.
- The existing "Services" column (Beats / Studio / DJ / Events / Contact) is unchanged.

## 7. Radio section on homepage

### Wire it in

`app/(hero)/page.tsx`:

```tsx
<ScrollHero />
<EditorialCatalog />
<StudioSectionMockup />
<EventsSection />
<RadioSection />
```

### Trim the placeholder

`components/home/radio-section.tsx` — remove the `<button type="button" className={styles.headerLinkAlt}>Radio page V2</button>` element.

`components/home/radio-section.module.css` — remove the `.headerLinkAlt` and `.headerLinkAlt:hover` rules (no other references after the button is dropped).

The "Toutes les émissions" link to `/radio` remains as the only header CTA.

## 8. Verification

After implementation:

- `npm run typecheck` passes.
- `npm run dev` boots without errors.
- **Homepage (`/`):** nav is hidden initially; scrolling past the hero reveals the dark-glass bar. `RadioSection` renders at the bottom; its LED animation triggers on scroll into view; "Toutes les émissions" routes to `/radio`.
- **Marketing pages (`/beats`, `/events`, `/studio`, `/dj-services`):** nav is visible at all times. Footer shows new "À propos" column.
- **Radio page (`/radio`):** nav is visible at all times. Footer column intact.
- **Mobile (≤880px):** hamburger appears in the bar (where the bar is visible). Tap opens full-screen overlay with the 6 + 2 + Admin + social. Escape and X close it. Body scroll locked while open.
- About + Contact reachable from the footer on every page.

## Open questions

None.
