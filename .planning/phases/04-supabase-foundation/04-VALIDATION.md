---
phase: 4
slug: supabase-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-21
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (none currently — Wave 0 installs) |
| **Config file** | `vitest.config.ts` — Wave 0 creates |
| **Quick run command** | `npx vitest run tests/beats-queries.test.ts --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/beats-queries.test.ts --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | BE-01 | manual | Supabase dashboard — project created, env vars in .env.local | N/A | ⬜ pending |
| 04-01-02 | 01 | 1 | BE-01 | unit | `npx vitest run tests/beats-queries.test.ts` | ❌ Wave 0 | ⬜ pending |
| 04-02-01 | 02 | 1 | BE-01 | manual | Supabase dashboard — table inspector confirms all 6 tables | N/A | ⬜ pending |
| 04-02-02 | 02 | 1 | BE-01 | manual | Supabase dashboard — seed data visible in beats table | N/A | ⬜ pending |
| 04-03-01 | 03 | 2 | BE-01 | manual | Supabase dashboard — RLS enabled on all tables | N/A | ⬜ pending |
| 04-03-02 | 03 | 2 | BE-01 | integration | `npx vitest run tests/rls.test.ts` | ❌ Wave 0 | ⬜ pending |
| 04-03-03 | 03 | 2 | BE-04 | manual | Supabase Storage — 3 buckets visible (preview-audio public, full-audio private, artwork public) | N/A | ⬜ pending |
| 04-03-04 | 03 | 2 | BE-04 | unit | `npx vitest run tests/signed-urls.test.ts` | ❌ Wave 0 | ⬜ pending |
| 04-04-01 | 04 | 2 | BE-03 | unit | `npx vitest run tests/beats-queries.test.ts` | ❌ Wave 0 | ⬜ pending |
| 04-04-02 | 04 | 2 | BE-03 | manual | Browser — /beats page loads real data from Supabase | N/A | ⬜ pending |
| 04-04-03 | 04 | 2 | BE-04 | unit | `npx vitest run tests/beats-queries.test.ts` | ❌ Wave 0 | ⬜ pending |
| 04-04-04 | 04 | 2 | BE-04 | manual | Browser — /beats/[slug] page loads; audio preview plays | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `npm install -D vitest` — test runner
- [ ] `vitest.config.ts` — configure with `environment: 'node'`
- [ ] `tests/beats-queries.test.ts` — unit tests for getPublishedBeats(), getBeatBySlug(), full_key exclusion (BE-03, BE-04)
- [ ] `tests/signed-urls.test.ts` — unit tests for getPreviewAudioUrl() URL shape (BE-04)
- [ ] `tests/rls.test.ts` — integration test stubs for RLS behavior using Supabase client with anon key (BE-01)

*Wave 0 must complete before Plan 04-02 executes.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| All 6 tables exist with correct columns | BE-01 | Schema-level; no query layer to test against | Check Supabase dashboard Table Editor — verify beats, events, orders_beat, orders_ticket, tickets, bookings |
| RLS enabled on all tables | BE-01 | Infra config, not code | Supabase dashboard → Authentication → Policies — confirm each table has RLS on |
| Storage buckets created with correct access | BE-01 | Infra config | Supabase dashboard → Storage — verify preview-audio (public), full-audio (private), artwork (public) |
| /beats page renders real Supabase data | BE-03 | UI rendering | Open browser at localhost:3000/beats — confirm beats from seeded DB appear |
| /beats/[slug] detail page renders | BE-03 | UI rendering | Open any beat detail page — confirm metadata and audio preview load |
| Audio preview plays from Supabase Storage | BE-04 | Audio playback | Click play on a beat card — confirm preview audio streams from Supabase Storage URL |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
