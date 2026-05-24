<div align="center">

# SpecFlow

**Turn AI coding sessions into a repeatable spec-driven workflow.**

[![CI](https://github.com/ceatoleii/specflow/actions/workflows/ci.yml/badge.svg)](https://github.com/ceatoleii/specflow/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@ceatoleii/specflow.svg?style=flat-square)](https://www.npmjs.com/package/@ceatoleii/specflow)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/node/v/@ceatoleii/specflow.svg?style=flat-square)](https://nodejs.org)

```bash
npx @ceatoleii/specflow init
```

**Full guide:** [English](https://ceatoleii.github.io/specflow/) · [Español](https://ceatoleii.github.io/specflow/es/)

</div>

---

## What it does

SpecFlow installs a **four-phase pipeline** into your repo so your AI assistant:

1. **Clarifies** the requirement before coding (`task.md` with acceptance criteria)
2. **Designs** a plan you approve (`plan.md`, `tasks.md`)
3. **Implements** only what was approved (one agent writes code)
4. **Reviews** against your criteria and verification commands (`review.md`)

Until you start a task, nothing changes — your assistant works as usual (**Direct mode**). When you say **`nueva tarea`** or **`flow on`**, **Flow mode** routes each message to the right phase agent.

Works with **Cursor**, Claude Code, GitHub Copilot, Codex, Windsurf, and any tool that reads [`AGENTS.md`](https://agents.md/).

---

## Install (2 minutes)

From your **project root** (Node.js ≥ 18, interactive terminal):

```bash
npx @ceatoleii/specflow init
```

The wizard asks for language, IDE adapters, and whether to scaffold `.agents-docs/` templates. Then:

```bash
specflow doctor          # verify install
```

Add to `.gitignore`:

```gitignore
.agents-state/
```

---

## Your first task (cheat sheet)

| Step | You say | You get |
|------|---------|---------|
| Start | `nueva tarea` or `flow on` | Refiner asks clarifying questions |
| Refine | Answer questions | `.agents-state/current/task.md` |
| Design | Wait, then review plan | `plan.md`, `tasks.md` |
| Approve | `/approve` | Implementer writes code |
| Done | Wait for review | Archive + flow off on **PASS** |

Stop anytime: `flow off` or `modo directo`.

**Details, diagrams, and what to read in each phase:** [How it works](https://ceatoleii.github.io/specflow/how-it-works.html) · [Primer flujo (ES)](https://ceatoleii.github.io/specflow/es/getting-started.html)

---

## Everyday commands

| Command | Why use it |
|---------|------------|
| `specflow init` | First-time install in a project |
| `specflow doctor` | Check files, adapters, flow state |
| `specflow doctor --run` | Same + run your `verification.md` commands |
| `specflow status` | Installed version vs latest on npm |
| `specflow sync` | Update engine & adapters (keeps `.agents-docs/`) |
| `specflow tools list` | See installed IDE adapters |

---

## What you edit vs what SpecFlow manages

| You own | SpecFlow manages (`init` / `sync`) |
|---------|-------------------------------------|
| `.agents-docs/` — stack, conventions, how to test | `.agents/` — orchestrator & phase rules |
| Your source code (via Implementer in flow) | `AGENTS.md`, adapters, `.specflow-version` |
| `.gitignore` entry for `.agents-state/` | |

Fill [`.agents-docs/`](https://ceatoleii.github.io/specflow/project-documentation.html) before serious tasks so agents know your stack and test commands.

---

## Documentation

| | |
|---|---|
| **Guide (EN)** | [ceatoleii.github.io/specflow](https://ceatoleii.github.io/specflow/) |
| **Guía (ES)** | [ceatoleii.github.io/specflow/es](https://ceatoleii.github.io/specflow/es/) |
| **npm** | [`@ceatoleii/specflow`](https://www.npmjs.com/package/@ceatoleii/specflow) |
| **Changelog** | [CHANGELOG.md](./CHANGELOG.md) |

---

## License

[MIT](./LICENSE) © [ceatoleii](https://github.com/ceatoleii)
