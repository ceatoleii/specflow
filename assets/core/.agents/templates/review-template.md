# Review: [Task Title]
_Date: YYYY-MM-DD | Result: **PASS** | **FAIL**_

---

## Verification-before-completion gate

All must be checked before **PASS**. Any unchecked → **FAIL**.

- [ ] All tasks in `tasks.md` marked `[x]`
- [ ] No unresolved items in `## Unspecified Items`
- [ ] Every `[review]` slice (if any) is **PASS** in `## Slice Reviews`
- [ ] Every AC has a row below with ✅ and concrete evidence
- [ ] Every Sxx has a passing test
- [ ] Every `[test]` has **RED** and every `[impl]` has **GREEN** in Task Notes (or waiver in `task.md`)
- [ ] Every `verification.md` command run; full output pasted below; exit 0
- [ ] No ✅ without evidence observed this review

---

## Task Completeness

- [ ] All tasks in tasks.md marked `[x]`
- [ ] No unresolved items in "Unspecified Items"

---

## TDD Evidence (from tasks.md → Task Notes)

| Task | Type | RED / GREEN recorded? | Valid? |
|------|------|----------------------|--------|
| T01 | test | RED | ✅ / ❌ |
| T02 | impl | GREEN | ✅ / ❌ |

---

## Acceptance Criteria (from task.md)

Every **AC** in `task.md` must have a row. Missing row → **FAIL**.

| AC | Criterion | Met? | Evidence (file / test / command) |
|----|-----------|------|----------------------------------|
| AC1 | [text from task.md] | ✅ / ❌ | `tests/...` or `src/...` |
| AC2 | [text from task.md] | ✅ / ❌ | |

---

## Test Scenarios Coverage (from plan.md)

| Scenario | Test exists? | Test passes? | Notes |
|----------|-------------|--------------|-------|
| S01 — [name] | ✅ Yes / ❌ No | ✅ / ❌ | |
| S02 — [name] | ✅ Yes / ❌ No | ✅ / ❌ | |

---

## Verification Results

### Tests
```
[paste full command output here]
```
Result: ✅ Pass / ❌ Fail

### Lint
```
[paste full command output here]
```
Result: ✅ Pass / ❌ Fail / N/A

### Build
```
[paste full command output here]
```
Result: ✅ Pass / ❌ N/A / ❌ Fail

### Type Check
```
[paste full command output here]
```
Result: ✅ Pass / ❌ N/A / ❌ Fail

---

## Issues Found

<!-- Only on FAIL. Be specific and actionable. -->

### Issue 1 — [Short title]
- **AC affected:** AC1
- **What happened:** [description]
- **Where:** `path/to/file.ext`
- **What to fix:** [concrete instruction]

---

## Decision

**Result: PASS / FAIL**
