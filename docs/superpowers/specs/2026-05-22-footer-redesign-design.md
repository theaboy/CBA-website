# Footer Redesign — Design Spec

**Date:** 2026-05-22
**Status:** Approved
**Touches:** `components/layout/site-footer.tsx`, `app/globals.css`, `package.json`, optionally `lib/site.ts`

## Goal

Replace the current footer (photo strip + 3-column grid + inline `<style>` tag) with a calm, editorial footer that matches the rest of the CBA visual system. Drop all imagery and stale `/studio` + `/dj-services` references. Reorganise links around the post-merge IA where booking lives at `/reservation`.

This is frontend-only work. No backend, no real submit handlers.

## Why now

The current footer (`components/layout/site-footer.tsx`):

- Carries four hover-zooming photos that visually compete with the page content above and clash with the more typographic feel introduced in the `/reservation` work
- Embeds a `<style>` tag in the JSX for the photo-strip hover, which is the only place in the codebase doing that
- Still lists `Services Studio` → `/studio` and `Services DJ` → `/dj-services`, both removed in commit `32a5573` — these are broken links today
- Renders socials as low-affordance text links ("Instagram / YouTube / SoundCloud") that read as more nav rather than as social handles

## Out of scope

- Newsletter signup (HOME-03) — deferred
- Language switcher — no i18n in place
- Building the legal pages (`/legal/*`) — links land on 404 until Phase 9
- Migrating to Tailwind utility classes or shadcn primitives — site is custom-CSS-with-tokens, footer stays consistent with that
- Any backend wiring for the contact email

## Structure

One `<footer>` element. Two stacked regions inside it:

### 1. Main area

Two columns on desktop:

- **Brand block (left, ~40%)** — editorial CBA wordmark, tagline, contact info, social icons
- **Link grid (right, ~60%)** — three equal columns: Explorer / À propos / Légal

On tablet (640–1023px) the brand block stacks above the link grid; the three link columns stay side-by-side. On mobile (< 640px) everything stacks to a single column with the column headings acting as section labels.

### 2. Bottom bar

Hairline gold-tinted divider, then:

- Copyright text (left): `© {year} CBA Production. Tous droits réservés.`
- Right-side micro-tag: `Conçu à Montréal`

### Brand block contents

| Element | Treatment |
|---|---|
| CBA wordmark | Large display type using `var(--cinzel)`, ~3.5rem at desktop, gold accent (`var(--gold)`). Linked to `/`. Type only, no logo image. |
| Tagline | "Beats, sessions et scènes — le son souterrain de Montréal, fait pour la culture." Italic, `var(--garamond)`, `var(--ink-1)`. Same line as current footer — keep it. |
| Contact | Two stacked lines: `hello@cba.ca` (mailto link) and `Montréal, Québec · Canada`. Small caps treatment with `var(--ink-2)`. |
| Social icons | Row of three icons (Instagram, YouTube, SoundCloud) from `react-icons/fa` (`FaInstagram`, `FaYoutube`, `FaSoundcloud`). Default `var(--ink-2)`, hover `var(--gold)`. Each is a real `<a>` with `aria-label`. |

### Link columns

Pulled where possible from `siteConfig` to stay in sync with the navbar:

| EXPLORER | À PROPOS | LÉGAL |
|---|---|---|
| Nos Beats — `/beats` | Notre ADN — `/about` | Mentions légales — `/legal/mentions` |
| Réserver — `/reservation` | Nous écrire — `/contact` | Confidentialité — `/legal/privacy` |
| Nos Événements — `/events` | | CGU — `/legal/cgu` |
| Écouter la Radio — `/radio` | | |

`EXPLORER` and `À PROPOS` reuse `siteConfig.nav` and `siteConfig.secondaryNav` directly. `LÉGAL` is defined inline in the footer file for now since there's no `siteConfig.legal` yet — a small inline array is fine; we can promote it later if other surfaces need it.

Column headings render in `var(--cinzel)`, uppercase, letter-spaced, in `var(--gold)`, matching the existing `.footer-col h4` treatment.

## Visual treatment

Stays inside the CBA token system; no Tailwind utility migration. All new classes live in `app/globals.css`, replacing the existing `.site-footer-upgraded` and `.footer-*` rules (lines ~2875–2993 plus the responsive overrides at lines ~3038–3045).

Key visual notes:

- Same surface treatment as today: bordered panel (`var(--line)` border, `var(--radius-xl)` corners, `var(--panel)` background with backdrop blur). Keeps the footer feeling like an inset card rather than a flush slab.
- Generous vertical padding: ~4rem top, ~2rem bottom on desktop.
- Hairline divider between main area and bottom bar uses `var(--line)`.
- Link hover: text color shifts from `var(--ink-1)` → `var(--gold)` over 0.2s. No underlines.
- Social icons are 1.1rem, sit in a flex row with 1rem gap.
- No animations on load. No photo strip. No inline `<style>` tag.

## Component shape

```tsx
// components/layout/site-footer.tsx
import Link from "next/link";
import { FaInstagram, FaYoutube, FaSoundcloud } from "react-icons/fa";
import { siteConfig } from "@/lib/site";

const legalLinks = [
  { href: "/legal/mentions", label: "Mentions légales" },
  { href: "/legal/privacy",  label: "Confidentialité" },
  { href: "/legal/cgu",      label: "CGU" },
];

const socialIcons: Record<string, React.ComponentType> = {
  Instagram: FaInstagram,
  YouTube:   FaYoutube,
  SoundCloud: FaSoundcloud,
};

export function SiteFooter() {
  return (
    <footer className="site-footer-upgraded">
      <div className="footer-main">
        <div className="footer-brand-col">
          <Link href="/" className="footer-wordmark">CBA</Link>
          <p className="footer-tagline">…tagline…</p>
          <div className="footer-contact">
            <a href="mailto:hello@cba.ca">hello@cba.ca</a>
            <span>Montréal, Québec · Canada</span>
          </div>
          <ul className="footer-socials">{/* icons */}</ul>
        </div>

        <div className="footer-nav-cols">
          <FooterColumn title="Explorer"  links={siteConfig.nav} />
          <FooterColumn title="À propos"  links={siteConfig.secondaryNav} />
          <FooterColumn title="Légal"     links={legalLinks} />
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} CBA Production. Tous droits réservés.</span>
        <span className="footer-tag">Conçu à Montréal</span>
      </div>
    </footer>
  );
}
```

`FooterColumn` is a tiny presentational subcomponent declared in the same file (no separate module — too small).

## File changes

| File | Change |
|---|---|
| `components/layout/site-footer.tsx` | Rewritten. Removes the photo strip + inline `<style>` block. Adds the new structure above. |
| `app/globals.css` | Replace the `/* ── UPGRADED FOOTER ─ */` block (lines ~2875–2993) and its mobile overrides (~3038–3045). New rules follow the same `.site-footer-upgraded` / `.footer-*` naming so we don't have to grep for old references elsewhere. |
| `package.json` | Add `react-icons` (^5). It's already implied in the integration task but isn't installed yet. |
| `lib/site.ts` | Optional: add a `contact: { email: "hello@cba.ca" }` field so the footer reads from one place. Low-cost, low-risk. |

## Responsive behavior

- **≥ 1024px:** brand block (left) + 3-col link grid (right), side by side.
- **640–1023px:** brand block on top full-width; the 3 link columns sit below in a 3-col grid.
- **< 640px:** single column. Brand block first, then each link column stacks under it. Headings stay visible (no accordion).

## Accessibility

- Each social icon is an `<a>` with a descriptive `aria-label` ("Suivre CBA sur Instagram", etc.). Decorative SVG inside is hidden from AT (`aria-hidden`).
- Email is a real `mailto:` anchor.
- Column headings are real `<h4>` elements so the structure reads correctly to screen readers.
- Color contrast: `var(--ink-1)` on the panel background passes WCAG AA at the body sizes we use; `var(--ink-2)` is reserved for tertiary metadata only.

## Risks / things to watch

- **`react-icons` install** — adds ~one dep, but `react-icons` tree-shakes per-import, so bundle impact is small (only the 3 FA icons we use ship).
- **Légal links 404 today** — acceptable since Phase 9 builds those pages. We could optionally point them to `#` until then; recommendation is to ship the real URLs so the IA is locked in.
- **`.site-footer-upgraded` class is referenced in `globals.css` body intro/fullscreen rules** (lines ~1691, ~1699). The rewrite keeps the same class name so those keep working.

## Success criteria

1. Footer renders with no images and no inline `<style>` tag.
2. All links resolve to existing routes except the three placeholder `/legal/*` URLs (acceptable per scope).
3. Layout collapses cleanly at 1024px and 640px breakpoints.
4. Hover affordances work consistently with the rest of the site (gold tint, 0.2s ease).
5. No regressions on the home page or `/reservation` page.
6. `npm run typecheck` passes.
