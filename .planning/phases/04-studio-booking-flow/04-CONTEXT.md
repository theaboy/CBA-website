# Phase 4: Studio Booking Flow - Context

**Gathered:** 2026-02-28
**Status:** Ready for planning
**Source:** Synthesized from roadmap, requirements, current Studio placeholder page, and the established Phase 3 inquiry architecture

<domain>
## Phase Boundary

Phase 4 delivers the second primary conversion path for the CBA site: studio bookings. This phase should turn the current placeholder Studio page into a premium booking surface with clear packages, availability browsing, and an inquiry-first booking request flow. It must feel production-ready for manual operations now while leaving clean seams for later admin-managed availability and request review.

This phase must satisfy:
- `STUD-01`: dedicated Studio page with pricing, packages, and booking information
- `STUD-02`: visible available dates and time slots for studio sessions
- `STUD-03`: booking request flow with date, time, duration, package, contact details, and notes

</domain>

<decisions>
## Implementation Decisions

### Locked Decisions

- Studio bookings remain inquiry/request-based in v1; deposit payments are deferred until the later Stripe phase.
- The Studio page must feel premium and high-trust, not like a generic scheduling widget dropped into the site.
- Availability can be placeholder or local-data-driven in this phase, but it must look operational and be easy to replace with admin-managed data later.
- Studio booking submissions need a real server-side handling boundary now, matching the credibility level already established for beat inquiries.
- The page should clearly explain packages, pricing anchors, session structure, and what happens after a booking request is submitted.

### Claude's Discretion

- Exact availability UI shape as long as visitors can understand dates, slots, and booking context quickly
- Exact package structure, price anchors, and session durations for placeholder content
- Exact responsive composition for marketing content versus booking utility
- Exact server module boundaries as long as future admin management can plug in cleanly

</decisions>

<specifics>
## Specific Ideas

- The current `app/(marketing)/studio/page.tsx` is still a Phase 1 placeholder and can be fully replaced.
- Phase 3 established a good pattern to reuse:
  - local domain data feeding a public conversion route
  - client selection state that preloads a request form
  - server action + normalized validation module + dispatch seam
- The Studio surface should probably separate into:
  - package/offer presentation
  - availability browser
  - booking request panel
  - confirmation and manual follow-up messaging
- Helpful request fields for manual ops:
  - selected package
  - selected date
  - selected time slot
  - duration
  - artist/client name
  - email
  - notes / demo context

</specifics>

<deferred>
## Deferred Ideas

- Stripe deposits and payment collection
- Admin-managed live availability editing UI
- Calendar sync or real third-party booking integration
- File uploads for demo tracks
- Full customer account persistence around bookings

</deferred>

---

*Phase: 04-studio-booking-flow*
*Context gathered: 2026-02-28 via roadmap, requirements, and current implementation state*
