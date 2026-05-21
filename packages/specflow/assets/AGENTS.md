# AGENTS.md — SpecFlow

This project uses **SpecFlow** — a spec-driven multi-agent workflow for implementing
features and tasks. Compatible with Cursor, Claude Code, GitHub Copilot, OpenAI Codex,
and any AI agent that reads AGENTS.md.

Installed via `@ceatoleii/specflow`. Update with `specflow sync`.

---

## Quick Start

**Activate the flow** (say any of these):
> "activar flujo", "nueva tarea", "flow on", "quiero implementar X"

**Return to direct mode** (say any of these):
> "modo directo", "flow off", "desactivar flujo"

When flow is **inactive**: respond normally. Zero overhead.
When flow is **active**: read `.agents-state/current/phase.md` and route to the
corresponding agent in `.agents/rules/`.

---

## How the System Works

### The Switch
Flow state is controlled by a single flag file: `.agents-state/.flow-enabled`
- File **exists** → Flow Mode active
- File **absent** → Direct Mode (default)

### The State
All task state lives in `.agents-state/current/`. These files are gitignored
and regenerated each task. Completed tasks are archived to `.agents-state/history/`.

### The Four Agents
Each agent is defined in `.agents/rules/`. They activate sequentially based on phase:

| Phase          | Agent file          | Can write code? |
|----------------|---------------------|-----------------|
| `refining`     | `refiner.md`        | No              |
| `designing`    | `sdd.md`            | No              |
| `implementing` | `implementer.md`    | **Yes — only one** |
| `reviewing`    | `reviewer.md`       | No              |

### The Project Context
`.agents-docs/` contains project-specific knowledge. This is the ONLY folder
that differs between projects. All four agents read from it — never hardcode
project details in the agent rules.

| File                        | Read by                     |
|-----------------------------|-----------------------------|
| `architecture.md`           | Refiner, SDD                |
| `conventions.md`            | Implementer, Reviewer       |
| `verification.md`           | Reviewer                    |
| `design-system.md`          | SDD, Implementer (if exists)|

---

## Full Folder Structure

```
project-root/
├── AGENTS.md                        ← you are here
├── .specflow-version                ← installed SpecFlow version
├── .agents/
│   ├── rules/
│   │   ├── orchestrator.md
│   │   ├── refiner.md
│   │   ├── sdd.md
│   │   ├── implementer.md
│   │   └── reviewer.md
│   └── templates/
├── .agents-docs/                    ← EDIT THIS per project (manual)
├── .agents-state/                   ← auto-generated, gitignored
└── .cursor/
    └── rules/
        └── _specflow.mdc            ← Cursor adapter
```

---

## The Complete Flow

```
User message
    │
    ▼
Orchestrator checks .agents-state/.flow-enabled
    │
    ├── NOT EXISTS → Direct Mode → respond normally
    │
    └── EXISTS → read phase.md
                    │
                    ├── "refining"     → Refiner Agent
                    ├── "designing"    → SDD Agent (waits for /approve)
                    ├── "implementing" → Implementer Agent
                    └── "reviewing"    → Reviewer Agent
                                         ├── PASS → archive → flow off
                                         └── FAIL → back to implementing
```

---

## Project Setup

1. Install: `npx @ceatoleii/specflow init`
2. Fill in `.agents-docs/` when ready (manual, per project)
3. Update engine: `npx @ceatoleii/specflow sync` (never overwrites your docs)
4. Say: `nueva tarea: [your requirement]`

---

## For AI Agents Reading This

You are the orchestrator. Your first action on every message must be:

1. Check if `.agents-state/.flow-enabled` exists
2. If not → respond normally, ignore the rest of this file
3. If yes → read `.agents-state/current/phase.md`
4. Load and fully adopt `.agents/rules/[current-phase-agent].md`
5. Follow that agent's rules exclusively until the phase changes

The full orchestrator logic is in `.agents/rules/orchestrator.md`.
