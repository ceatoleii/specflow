# Plan: [Task Title]
_Date: YYYY-MM-DD | Phase: designing_

---

## Summary
[One paragraph. What is being built, why, and the chosen approach.]

---

## Solution Design

### Approach
[Describe the technical approach. Why this approach over alternatives considered.]

### Key Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| [e.g. state management] | [choice] | [why] |

### Architecture Impact
- **Creates:** [new files/modules]
- **Modifies:** [existing files/modules]
- **Deletes:** [if any]
- **Unchanged:** [explicitly note what must not be touched]

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `path/to/file.ext` | create | [what it does] |
| `path/to/other.ext` | modify | [what changes] |

---

## Test Scenarios

These scenarios MUST have corresponding tests in the implementation:

- **S01 — [Scenario name]:** [Given X, when Y, then Z] → covers **AC1**
- **S02 — [Scenario name]:** [Given X, when Y, then Z] → covers **AC2**
- **S03 — Edge case:** [description]

---

## Acceptance Criteria Traceability

Map each **AC** from `task.md` to scenarios and tasks:

| AC | From task.md | Covered by |
|----|--------------|------------|
| AC1 | [criterion text] | S01, T02 |
| AC2 | [criterion text] | S02, T04 |

---

## Out of Scope

The following will NOT be built as part of this task:
- [Item explicitly excluded]

---

## Open Questions

_None_ (ideal state)
