# Phase 1: Foundation and Brand System - Research

**Researched:** 2026-02-28
**Status:** Complete
**Phase:** 1
**Requirements:** FND-01, FND-02, FND-03

## Objective

Answer: "What do we need to know to plan Phase 1 well?"

Phase 1 needs a reliable baseline for a premium Next.js marketing/application shell that can support both a branded public website and a protected admin area. Since the repository currently contains brand assets but no frontend codebase, the planning emphasis should be on setup choices that reduce future migration cost.

## Findings

### 1. App foundation should be created once, not iterated through throwaway scaffolds

Because later phases will add marketplace browsing, bookings, account UI, and admin tooling, the initial app bootstrap should already include:
- App Router route groups for public and admin surfaces
- Shared theme tokens and global CSS variables
- Reusable layout primitives
- A place for shared site configuration and navigation data

This avoids a common failure mode where an attractive landing page is built first and later retrofitted into an application shell.

### 2. Design system work should be grounded in existing assets, but not blocked by PDF extraction

The repo already contains page mockups and a style guide PDF. Even if the PDF is not machine-readable in the current environment, planning should still allocate explicit work to:
- inspect available mockup assets manually
- define color, spacing, radius, shadow, and type token structure in code
- choose a credible fallback type pair if the customer font details are not yet extracted

The important planning decision is to encode design choices in tokens and shared components instead of one-off page CSS.

### 3. Public route scaffolding and homepage shell should land before feature-specific pages

Phase 1 is not trying to finish all public content. It should establish:
- route files for all primary pages
- a consistent navigation/footer shell
- a homepage baseline with hero and supporting content zones
- responsive containers and section patterns reusable across future pages

This provides visible progress while still keeping the architecture aligned with later phases.

### 4. Admin shell should be structurally real but operationally thin

The admin route area should be protected and visually separated in this phase, but it does not need CRUD features yet. A strong Phase 1 outcome is:
- protected `/admin` route group and layout
- dashboard shell with placeholder overview modules
- shared admin navigation
- hooks for future auth/data integration

### 5. Verification for this phase should focus on shell quality and architectural readiness

The most meaningful checks for this phase are:
- app boots and builds
- all public routes render through the shared shell
- mobile and desktop layouts hold together
- admin route shell exists and is isolated from public styling concerns

## Planning Implications

- Plan 01 should own app bootstrap, dependencies, route groups, and global theming tokens.
- Plan 02 should own public shell architecture, navigation, and primary route scaffolding.
- Plan 03 should own homepage composition and responsive section primitives that express the brand direction.
- Plan 04 should own the protected admin shell and future-facing internal layout structure.

## Risks

- If visual tokens are not established early, later public pages will drift stylistically.
- If admin is delayed to a later redesign, route and layout churn will increase.
- If the homepage becomes too bespoke too early, later feature pages may not share its quality or structure.

## Recommended Plan Strategy

- Start with one foundational bootstrap plan.
- Run public and admin shell work in separate later waves only where file overlap is low.
- Keep Phase 1 focused on reusable structure, not content completeness.

---

*Research completed: 2026-02-28*
