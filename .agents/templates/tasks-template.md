# Tasks: [Task Title]
_Date: YYYY-MM-DD | Phase: implementing_

---

## Implementation Tasks

<!-- Status: [ ] pending | [~] in-progress | [x] done -->
<!-- Types: [test] [impl] [verify] [review] — TDD: [test] before [impl] per AC/Sxx -->
<!-- Each task needs Files + Verify + Done when (see examples below) -->

- [ ] **T01** — [test] S01 / AC1: [one-line action]
  - **Files:** `tests/example.test.ts`
  - **Verify:** `npm test -- example.test.ts`
  - **Done when:** test fails asserting [expected behavior]

- [ ] **T02** — [impl] S01 / AC1: [one-line action]
  - **Files:** `src/example.ts`
  - **Verify:** `npm test -- example.test.ts`
  - **Done when:** same test passes; minimal implementation only

- [ ] **T03** — [review] Slice: AC1 (S01, T01–T02)
  - **Scope:** AC1, S01, T01–T02
  - **Done when:** Slice Reviews row shows PASS

- [ ] **T04** — [test] S02 / AC2: [one-line action]
  - **Files:** `tests/other.test.ts`
  - **Verify:** `npm test -- other.test.ts`
  - **Done when:** test fails for [behavior]

- [ ] **T05** — [impl] S02 / AC2: [one-line action]
  - **Files:** `src/other.ts`
  - **Verify:** `npm test -- other.test.ts`
  - **Done when:** test passes

- [ ] **T06** — [verify] Project verification (if not fully covered by Reviewer)
  - **Files:** _(none — run only)_
  - **Verify:** `[command from verification.md]`
  - **Done when:** exit 0; output noted in Task Notes

---

## Slice Reviews

<!-- Implementer fills after each [review] task — Reviewer checks on final review -->

| Task | Scope | Result | Notes |
|------|-------|--------|-------|
| | | | |

---

## Task Notes

<!-- Implementer: TDD evidence — **T01 RED:** `cmd` → failure; **T02 GREEN:** `cmd` → pass -->

---

## Unspecified Items

<!-- If the implementer finds gaps in the plan, they are logged here before asking -->

---

## Retry Notes

<!-- If this task returned from Reviewer, the review.md failure details are summarized here -->

---

_Total: N tasks | Done: 0/N_
