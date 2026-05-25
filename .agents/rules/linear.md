# Linear integration (Cursor MCP)

Use this file when `.specflow-linear.json` exists and `"enabled": true`.

Linear sync is **optional**. If the Linear MCP server is unavailable, continue the SpecFlow flow locally and tell the user once.

---

## Prerequisites

- Cursor with the **Linear** plugin enabled and authenticated
- MCP tools: `get_issue`, `save_issue` (server: `linear`)

Read state names from `.specflow-linear.json` → `states`:

| Key | Default | When to apply |
|-----|---------|---------------|
| `onRefiningComplete` | Todo | Refining done, `task.md` written, phase → `designing` |
| `onApprove` | In Progress | User `/approve`, phase → `implementing` |
| `onReviewPass` | Done | Review **PASS**, before archive |
| `onReviewFail` | In Progress | Review **FAIL** (do not move to Todo) |

---

## Session file: `.agents-state/current/linear.json`

Create or update when starting a task from Linear:

```json
{
  "identifier": "TEAM-123",
  "url": "https://linear.app/..."
}
```

`identifier` is required for `get_issue` / `save_issue`. `url` is optional (from issue or user message).

---

## Parse issue from user message

Extract `TEAM-123` from:

- `nueva tarea desde TEAM-123` / `new task from TEAM-123`
- Linear issue URLs (`linear.app/.../issue/TEAM-123`)
- Bare identifier in a flow-start message

If multiple identifiers appear, ask the user to pick one.

---

## MCP: load issue (Refiner)

When flow starts with a Linear reference and `linear.json` is missing or incomplete:

1. `get_issue` with `id` = identifier
2. Write `linear.json`
3. Seed `task.md` **Requirement** from issue title + description (markdown)
4. Add section **Linear Issue** with identifier and URL

---

## MCP: update state

Call `save_issue` with `id` = `linear.json.identifier` and `state` = mapped name from config.

On MCP error: log a short user-visible warning; **do not** block the SpecFlow phase transition.

---

## Activation phrases (Linear)

In addition to normal flow start, treat these as flow + Linear issue:

- `nueva tarea desde <ID>` · `new task from <ID>`
- `activar flujo <ID>` · `flow on <ID>`
- Message containing a Linear issue URL with flow intent

---
