---
phase: 5
slug: payments-email-ticketing
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-22
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.7 (already installed) |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test -- --reporter=verbose` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run relevant test file `npm test -- tests/<file>.test.ts`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-W0 | 01 | 0 | BE-05 | stub | `npm test -- tests/stripe-webhook.test.ts` | ❌ Wave 0 | ⬜ pending |
| 05-01-W0 | 01 | 0 | BE-05 | stub | `npm test -- tests/create-payment-intent.test.ts` | ❌ Wave 0 | ⬜ pending |
| 05-01-W0 | 01 | 0 | BE-06, BE-07 | stub | `npm test -- tests/ticket-purchase.test.ts` | ❌ Wave 0 | ⬜ pending |
| 05-01-W0 | 01 | 0 | EVNT-01 | stub | `npm test -- tests/events-queries.test.ts` | ❌ Wave 0 | ⬜ pending |
| 05-01-W0 | 01 | 0 | BE-08 | stub | `npm test -- tests/email-send.test.ts` | ❌ Wave 0 | ⬜ pending |
| 05-01-W0 | 01 | 0 | BE-05 | stub | `npm test -- tests/download-route.test.ts` | ❌ Wave 0 | ⬜ pending |
| 05-01-T2 | 01 | 1 | BE-05 | unit | `npm test -- tests/stripe-webhook.test.ts tests/create-payment-intent.test.ts tests/download-route.test.ts` | ❌ Wave 0 | ⬜ pending |
| 05-02-T1 | 02 | 2 | EVNT-01 | unit | `npm test -- tests/events-queries.test.ts` | ❌ Wave 0 | ⬜ pending |
| 05-02-T2 | 02 | 2 | BE-06, BE-07 | unit | `npm test -- tests/ticket-purchase.test.ts tests/create-payment-intent.test.ts` | ❌ Wave 0 | ⬜ pending |
| 05-03-T1 | 03 | 2 | BE-08 | unit | `npm test -- tests/email-send.test.ts` | ❌ Wave 0 | ⬜ pending |
| 05-03-T2 | 03 | 2 | BE-08 | grep | `grep -n "sendBookingConfirmationEmail\|sendBookingInquiryEmail" lib/inquiries/index.ts lib/reservation/index.ts` | N/A | ⬜ pending |
| 05-04-T1 | 04 | 3 | BE-05, BE-06 | tsc | `npx tsc --noEmit 2>&1 \| grep -E "components/checkout"` | N/A | ⬜ pending |
| 05-04-T3 | 04 | 3 | BE-05, BE-06 | manual | Browser checkout flow (Stripe test mode) | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

All six stub files are created in Plan 01 Task 1:

- [ ] `tests/stripe-webhook.test.ts` — stubs for BE-05 (beat fulfillment, idempotency, exclusive lock, email call)
- [ ] `tests/create-payment-intent.test.ts` — stubs for BE-05 (exclusive validation, beat existence)
- [ ] `tests/ticket-purchase.test.ts` — stubs for BE-06, BE-07 (ticket fulfillment, RPC mock, qrTokens→email wiring)
- [ ] `tests/email-send.test.ts` — stubs for BE-08 (mock Resend client, all four send helpers)
- [ ] `tests/events-queries.test.ts` — stubs for EVNT-01 (Supabase query mock, same pattern as beats-queries)
- [ ] `tests/download-route.test.ts` — stubs for BE-05 download token validation

All mocks use `vi.mock()` at module level — same pattern as `tests/beats-queries.test.ts`.
ticket-purchase.test.ts and stripe-webhook.test.ts both mock `@/lib/email/send` for sendTicketPurchaseEmail assertion.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Buyer receives email with download link after beat purchase | BE-08 | Requires live Resend + Stripe test mode | Run `stripe listen`, complete test checkout, check inbox |
| Download link resolves to Supabase signed URL | BE-05 | Requires live Supabase Storage + signed URL | Click link in email, verify file streams |
| Ticket buyer receives email with QR token | BE-08 | Requires live Resend | Same as above, ticket checkout path |
| Exclusive license shows unavailable after purchase | BE-05 | UI state — visual + DB check | Purchase exclusive, reload beat page, verify lock |
| Oversell prevention under concurrent load | BE-06 | Race condition — hard to automate reliably | Two browser tabs, rapid checkout |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (all six stub files created in 05-01 Task 1)
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending execution
