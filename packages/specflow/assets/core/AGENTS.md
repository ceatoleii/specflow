# AGENTS.md — SpecFlow

> Compatible with [AGENTS.md](https://agents.md/) — instructions for AI coding agents.

## SpecFlow (required)

This project uses **SpecFlow** — a spec-driven multi-agent workflow.

**Pipeline:** Requirement → Plan → Tasks → Code

**On every task, before responding:**

1. Read and execute `.agents/rules/orchestrator.md`
2. If flow is active, adopt the phase agent from `.agents/rules/` (see `phase.md` in `.agents-state/current/`)
3. Only the **Implementer** agent may write or edit code

**Activate flow:** `nueva tarea` · `activar flujo` · `flow on`  
**Direct mode:** `modo directo` · `flow off` · `desactivar flujo`

Installed via `@ceatoleii/specflow`. Update engine: `specflow sync` (never overwrites `.agents-docs/`).

Verify setup: `specflow doctor` (optional: `--run` to execute verification commands).

---

## Quick Start

When flow is **inactive**: respond normally. Zero overhead.  
When flow is **active**: route via orchestrator → phase agent.

---

## The Four Agents

| Phase | Agent | Writes code? |
|-------|--------|:------------:|
| `refining` | Refiner | No |
| `designing` | SDD | No (waits for `/approve`) |
| `implementing` | Implementer | **Yes** |
| `reviewing` | Reviewer | No |

Rules: `.agents/rules/` · Templates: `.agents/templates/`

---

## Project context

`.agents-docs/` is manual per project:

| File | Read by |
|------|---------|
| `architecture.md` | Refiner, SDD |
| `conventions.md` | Implementer, Reviewer |
| `verification.md` | Reviewer |
| `design-system.md` | SDD, Implementer (optional) |

---

## Layout

```
AGENTS.md
.specflow-version
.specflow-config.json    ← locale, includeDocs (init)
.specflow-tools.json    ← installed IDE adapters
.agents/
.agents-docs/           ← you edit
.agents-state/          ← runtime (gitignored)
  current/              ← task.md, plan.md, tasks.md, phase.md, …
  history/              ← archived sessions (YYYY-MM-DD-slug/)
```

Legacy: `sdd.md` may exist in old sessions — treat as `plan.md`.

---

## For AI agents

Orchestrator logic: `.agents/rules/orchestrator.md`

Do not skip the orchestrator check when `.agents-state/.flow-enabled` exists.
