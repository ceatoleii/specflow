# Context Engine

[← IDE Adapters](./ide-adapters.md) · [Español](../es/context-engine.md)

---

## Overview

Starting in **SpecFlow 1.3**, flow state can live in a SQLite database (`.agents-state/state.db`) in addition to markdown files in `.agents-state/current/`.

The Context Engine lets agents query **slices** of state instead of reading full files — saving tokens and keeping context focused.

Whether agents use the database is controlled by **`.specflow-config.json`** → `stateDb` (default `true` on new installs). When `stateDb` is `true`, markdown under `current/` remains a shim synced from `state.db`. When `stateDb` is `false`, agents read and write markdown only (no `state query`, no automatic migration).

---

## Configuration (`stateDb`)

| `stateDb` | Agent behavior | `state.db` |
|-----------|----------------|------------|
| `true` (default) | Prefer `specflow state query` slices | Created on flow activation via `state ensure` |
| `false` | Read/write `.agents-state/current/*.md` only | Not used |

Set at install time (wizard step; current releases default to enabled). Stored in `.specflow-config.json` alongside `locale` and `includeDocs`.

---

## Bootstrap (`state ensure`)

When you activate flow (`nueva tarea`, `flow on`, …), the orchestrator runs:

```bash
specflow state ensure
```

if `stateDb` is enabled. This command:

- Creates or opens `state.db` and applies the schema
- Runs **conditional** legacy import (see Migration) when applicable
- Does **not** start a new session by itself — sessions begin when agents write artifacts

You can run `specflow state ensure` manually after install to prepare the database before the first task.

---

## How agents use it

When flow is active, `stateDb` is enabled, and `state.db` exists, agents prefer:

```bash
specflow state query --slice task
specflow state query --slice active-task
specflow state query --slice sdd-summary
```

Instead of reading entire `task.md`, `tasks.md`, or `sdd.md`.

Available slices:

| Slice | Content |
|-------|---------|
| `phase` | Current flow phase |
| `task` | Full task definition |
| `active-task` | Current implementation task |
| `criteria` | Acceptance criteria |
| `decisions` | Design decisions from SDD |
| `sdd-summary` | Condensed SDD for Implementer |

Add `--json` for machine-readable output.

---

## Migration from markdown

Legacy projects store state only in `.agents-state/current/*.md`.

**Automatic migration** runs on `init`, `sync`, or `state ensure` when **all** of the following hold:

- `stateDb` is enabled in `.specflow-config.json`
- Legacy markdown exists in `current/`
- Flow is **not** active (no `.flow-enabled`)
- Import has not already run for this project

**Manual migration:**

```bash
specflow state migrate
```

Imports `task.md`, `sdd.md`, `tasks.md`, `phase.md`, and refinement logs into `state.db`. Requires `stateDb` enabled; skipped while flow is active.

---

## Session management

### Check state

```bash
specflow state status
```

Shows active session, phase, task counts.

### Search history

```bash
specflow state search "authentication"
```

Full-text search over decisions and refinement messages.

### Export archive

```bash
specflow state export
```

Moves active session to `.agents-state/history/` for long-term reference.

### Update phase or tasks

```bash
specflow state set-phase implementing
specflow state sync-task --code T01 --status done
```

Updates both `state.db` and the `phase.md` shim.

---

## Markdown fallback

Agents use markdown only when:

- `stateDb` is `false` in `.specflow-config.json`, or
- `state.db` does not exist yet and `state ensure` has not run

Pre-1.2 projects without `.specflow-config.json` behave as markdown-only until you run `init` or `sync`.

---

## When to migrate

| Situation | Action |
|-----------|--------|
| New install with `stateDb: true` | `state.db` bootstrapped on first `state ensure` (flow activation or manual) |
| Existing markdown-only project | `specflow state migrate`, or `sync` / `state ensure` while flow inactive |
| `stateDb: false` | No migration — keep using markdown |
| Flow currently active | Finish or deactivate flow before migrating |

---

[← IDE Adapters](./ide-adapters.md) · [Design Principles →](./design-principles.md)
