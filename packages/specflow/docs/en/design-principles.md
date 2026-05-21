# Design Principles

[← Context Engine](./context-engine.md) · [Español](../es/design-principles.md)

---

SpecFlow enforces five core principles. They apply regardless of IDE or project type.

---

## 1. Spec before code

No implementation until the SDD is approved.

The SDD agent produces `sdd.md` and `tasks.md`, presents the design, and waits for explicit **`/approve`**. The Implementer cannot start until approval is received.

This prevents “coding first, thinking later.”

---

## 2. Single writer

Only the **Implementer** agent may create, edit, or delete source files.

| Agent | Can write code? |
|-------|:---------------:|
| Refiner | No |
| SDD | No |
| Implementer | **Yes** |
| Reviewer | No |

Refiner and SDD specify. Reviewer verifies. One agent owns the diff.

---

## 3. Explicit state

Phase and artifacts live on disk in `.agents-state/current/` (markdown shim) and, when `stateDb` is enabled, in `state.db` as the source of truth.

You can inspect:

- Current phase (`phase.md` shim, or `specflow state query --slice phase`)
- Requirement (`task.md`)
- Design (`sdd.md`)
- Progress (`tasks.md`)
- Review result (`review.md`)

Nothing relies on chat history alone.

---

## 4. Portable rules

Agent logic ships with the npm package (`.agents/`). Project facts live in `.agents-docs/`.

Upgrade the engine with `specflow sync` without losing your project documentation. The same workflow works across Cursor, Copilot, Claude Code, and Codex.

---

## 5. Safe upgrades

`sync` refreshes `.agents/`, `AGENTS.md`, and adapter stubs. It **never** overwrites `.agents-docs/`.

Your architecture notes, conventions, and verification commands survive every engine update.

---

## Zero overhead by default

Direct Mode is the default. SpecFlow adds no pipeline until you say `nueva tarea`, `flow on`, or equivalent.

Use flow for scoped tasks with acceptance criteria. Use direct mode for quick fixes and exploration.

---

[← Context Engine](./context-engine.md) · [Troubleshooting →](./troubleshooting.md)
