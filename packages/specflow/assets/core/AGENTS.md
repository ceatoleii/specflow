# AGENTS.md — SpecFlow

> Compatible with [AGENTS.md](https://agents.md/) — instructions for AI coding agents.

## SpecFlow (required)

This project uses **SpecFlow** — a spec-driven multi-agent workflow.

**On every task, before responding:**

1. Read and execute `.agents/rules/orchestrator.md`
2. If flow is active, adopt the phase agent from `.agents/rules/` (see `phase.md` in `.agents-state/current/`)
3. Only the **Implementer** agent may write or edit code

**Activate flow:** `nueva tarea` · `activar flujo` · `flow on`  
**Direct mode:** `modo directo` · `flow off` · `desactivar flujo`

Installed via `@ceatoleii/specflow`. Update engine: `specflow sync` (never overwrites `.agents-docs/`).

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
.specflow-tools.json    ← installed IDE adapters
.agents/
.agents-docs/           ← you edit
.agents-state/          ← runtime (gitignored)
  state.db              ← flow source of truth (when present)
  current/              ← phase.md shim + markdown export/debug
```

**Context Engine (1.3+):** `specflow init` asks for `stateDb` → stored in `.specflow-config.json`. When `stateDb: true`, agents use `specflow state ensure|query|…`; when `false`, markdown only.

---

## For AI agents

Orchestrator logic: `.agents/rules/orchestrator.md`

Do not skip the orchestrator check when `.agents-state/.flow-enabled` exists.
