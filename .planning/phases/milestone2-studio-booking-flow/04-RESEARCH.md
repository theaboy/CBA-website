# Phase 4: Studio Booking Flow - Research

**Researched:** 2026-02-28
**Status:** Complete
**Phase:** 4
**Requirements:** STUD-01, STUD-02, STUD-03

## Objective

Answer: "What do we need to know to plan Phase 4 well?"

Phase 4 needs to turn the Studio page into a booking-ready conversion surface without overcommitting to payments, live calendar infrastructure, or admin tooling that belongs later. The planning emphasis should be on data shape, availability representation, package clarity, and reuse of the server-handled inquiry patterns proven in Phase 3.

## Findings

### 1. Studio booking should behave like a structured service request, not a thin contact form

The user is not buying an off-the-shelf product. They are selecting a service context. The page needs enough structure to communicate:
- what kinds of sessions exist
- how pricing works
- which slots are available
- what information CBA needs to confirm the session

That means the booking flow should start from package and slot selection before the form, not the other way around.

### 2. Availability should be modeled as local structured data first

For v1 planning, a local availability model is enough if it cleanly represents:
- date
- time slot
- duration or slot length
- availability status
- package compatibility if needed

This allows the public booking flow to feel real now while making it straightforward to swap to admin-managed or database-backed availability later.

### 3. The Studio page needs a stronger editorial/utility balance than the beats pages

The beats flow is product-forward. Studio booking needs more trust-building information because visitors need to understand the service before they submit a request. The page should combine:
- premium marketing content
- clear packages/pricing
- operational availability UI
- structured booking request form

If the utility UI dominates too early, the page will lose the premium brand tone. If the editorial layer dominates too much, the page will feel vague and non-operational.

### 4. Selection state should be explicit and reusable across package, slot, and request form

The booking form should not ask the user to re-enter decisions they already made. A good Phase 4 plan will keep package/date/slot state visible and feed it directly into the request form, similar to how Phase 3 carries selected license state into the beat inquiry form.

### 5. Server-side booking handling should reuse the inquiry-module pattern

Phase 3 already established a solid public conversion pattern:
- validate fields in a shared module
- normalize the payload
- submit through a server action
- expose a notification-ready handoff seam

Phase 4 should follow the same architecture so bookings and beat inquiries do not drift into two incompatible systems.

### 6. Confirmation copy matters because there is no instant booking guarantee

The success state must explain:
- which package and slot were requested
- that the request is pending confirmation
- how CBA will follow up
- whether the requested time is held or simply requested

This is the reassurance layer that replaces live scheduling guarantees or immediate payment.

## Planning Implications

- Plan 01 should define studio packages, slot data, and booking request schemas.
- Plan 02 should rebuild the Studio page into a premium package/offer presentation.
- Plan 03 should implement availability selection and booking request form wiring.
- Plan 04 should own validation, confirmations, responsive polish, and final booking UX hardening.

## Risks

- If availability data is not modeled first, the UI will likely hardcode slots in components and create rework.
- If the form is built before selection state, the booking experience will feel repetitive and lower trust.
- If Phase 4 invents a different submission pattern than Phase 3, later admin ops work will have to reconcile inconsistent public request systems.

## Recommended Plan Strategy

- Start with the local studio domain model and booking schema.
- Build the premium Studio page composition around packages and trust cues next.
- Introduce slot/package selection before the booking form.
- Close with server-handled submission, confirmation logic, and responsive refinement.

---

*Research completed: 2026-02-28*
