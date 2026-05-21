# Context Engine

[← IDE Adapters](./ide-adapters.md) · [Español](../es/context-engine.md)

---

## Overview

Starting in **SpecFlow 1.3**, flow state can live in a SQLite database (`.agents-state/state.db`) in addition to markdown files in `.agents-state/current/`.

The Context Engine lets agents query **slices** of state instead of reading full files — saving tokens and keeping context focused.

Markdown files remain as a shim and fallback when `state.db` is absent.

---

## How agents use it

When flow is active and `state.db` exists, agents prefer:

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

**Automatic migration** runs on `init` or `sync` when:

- Legacy markdown exists in `current/`
- Flow is **not** active

**Manual migration:**

```bash
specflow state migrate
```

Imports `task.md`, `sdd.md`, `tasks.md`, `phase.md`, and refinement logs into `state.db`.

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

If `state.db` is missing, agents read markdown files directly. This keeps older projects and fresh installs working without migration.

---

## When to migrate

| Situation | Action |
|-----------|--------|
| New install (1.3+) | `state.db` created automatically when flow starts |
| Existing markdown-only project | Run `sync` or `state migrate` |
| Flow currently active | Finish or deactivate flow before migrating |

---

[← IDE Adapters](./ide-adapters.md) · [Design Principles →](./design-principles.md)
