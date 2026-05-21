# Review: [Task Title]
_Date: YYYY-MM-DD | Result: **PASS** | **FAIL**_

---

## Task Completeness

- [ ] All tasks in tasks.md marked `[x]`
- [ ] No unresolved items in "Unspecified Items"

---

## Spec Compliance

For each acceptance criterion from sdd.md:

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | [criterion text] | ✅ Pass / ❌ Fail | [specific finding] |
| 2 | [criterion text] | ✅ Pass / ❌ Fail | [specific finding] |

---

## Test Scenarios Coverage

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
Result: ✅ Pass / ❌ Fail

### Build
```
[paste full command output here — or "N/A" if no build step]
```
Result: ✅ Pass / ❌ N/A / ❌ Fail

### Type Check
```
[paste full command output here — or "N/A"]
```
Result: ✅ Pass / ❌ N/A / ❌ Fail

---

## Issues Found

<!-- Only fill this section on FAIL. Be specific and actionable. -->

### Issue 1 — [Short title]
- **Criterion affected:** [which criterion]
- **What happened:** [specific description]
- **Where:** `path/to/file.ext` line N
- **What to fix:** [concrete instruction for the Implementer]

---

## Decision

**Result: PASS / FAIL**

<!-- PASS: task will be archived and flow deactivated -->
<!-- FAIL: returning to Implementer with issues above -->
