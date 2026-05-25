# Changelog

All notable changes to `@ceatoleii/specflow` are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/). Versioning follows [SemVer](https://semver.org/).

## [Unreleased]

## [2.2.1] - 2026-05-24

### Fixed

- Test coverage for `specflow linear setup` (`src/commands/linear.ts`) — CI threshold ≥80% restored

## [2.2.0] - 2026-05-24

### Added

- **Linear integration (Cursor MCP):** start flow from `LIN-xxx` or issue URL; sync states Refining→Todo, `/approve`→In Progress, review PASS→Done
- **`specflow linear setup`** and opt-in during `init` (`.specflow-linear.json`)
- **`.agents/rules/linear.md`** for MCP `get_issue` / `save_issue` behavior

### Changed

- **`specflow init`** installs **Cursor adapter only** (other IDE adapters remain in package; use `tools add` later when re-enabled)
- `specflow status` shows Linear enabled/disabled

## [2.1.1] - 2026-05-24

### Changed

- **Repository layout:** single package at repo root (removed npm workspaces / `packages/`)
- **User documentation:** rewritten `README.md` (npm + GitHub) and VitePress guide (EN/ES parity)
- Guides now include step-by-step first flow, “what to read per phase”, and mermaid diagrams on GitHub Pages only
- Troubleshooting links to first-flow walkthrough

## [2.1.0] - 2026-05-24

### Added

- **`plan.md`** as primary design artifact (replaces `sdd.md` for new tasks)
- **`plan-template.md`** with AC traceability and test scenarios
- **AC1, AC2…** numbered acceptance criteria in `task.md` (Refiner)
- **Review traceability** — every AC must have evidence in `review.md` (Reviewer)
- **TDD task ordering** — `[test]` before `[impl]` in `tasks-template.md`
- **Refiner context levels** — vague / medium / detailed input handling
- **`specflow doctor`** — install and flow-state checks; optional `--run` for verification.md

### Changed

- Implementer and Reviewer read `plan.md` first, fallback to legacy `sdd.md`
- Reviewer archives to `history/YYYY-MM-DD-slug/`
- Docs and `AGENTS.md` updated for Requirement → Plan → Tasks → Code pipeline

### Deprecated

- `sdd.md` / `sdd-template.md` — use `plan.md` / `plan-template.md`

## [2.0.0] - 2026-05-24

### Removed

- **Context Engine (SQLite):** `state.db`, `specflow state` CLI, and `stateDb` config option
- Dependency: `better-sqlite3`

### Changed

- Flow state is **markdown-only** in `.agents-state/current/` (`phase.md`, `task.md`, `sdd.md`, `tasks.md`, …)
- Agent rules simplified — no dual DB/markdown paths
- `specflow status` shows locale config instead of State DB stats
- Docs: removed Context Engine guide

## [1.3.3] - 2026-05-21

### Added

- `specflow init` prompts for **state.db**; preference stored in `.specflow-config.json` (`stateDb`)
- `specflow state ensure` bootstraps DB when `stateDb: true` (also on `nueva tarea` via orchestrator rules)
- `specflow status` shows `stateDb` config flag

### Changed

- Legacy migrate / sync one-shot only runs when `stateDb: true` in project config
- Package docs (`docs/en`, `docs/es`): `stateDb`, `state ensure`, conditional migration, CLI reference

### Removed

- CodeGraph companion adapter and `codegraph` project config option

## [1.3.2] - 2026-05-21

### Changed

- State management and agent rules improvements

## [1.3.0] - 2026-05-21

### Added

- **Context Engine:** `.agents-state/state.db` (SQLite + FTS5) as flow source of truth
- `specflow state` CLI: `status`, `query`, `search`, `migrate`, `export`, `set-phase`, `sync-task`
- One-shot legacy import from `.agents-state/current/*.md` on `init` / `sync` (skipped when flow is active)
- Agent rules: tool-first state queries; markdown fallback when no DB

### Changed

- `phase.md` remains a shim synced from state.db
- `specflow status` shows active state session/phase when present
- Dependency: `better-sqlite3` (required)

## [1.2.0] - 2026-05-21

### Added

- Guided `specflow init` wizard with `@clack/prompts`: ASCII banner, language selection (ES/EN), step-by-step flow
- `.specflow-config.json` stores per-project preferences (`locale`, `includeDocs`)

### Changed

- `specflow init` always interactive; removed `--yes` / `-y` flag
- Init prompts fully localized (Spanish / English)
- Orchestrator: Implementer auto-handoffs to Reviewer in the same turn (no manual trigger)
- CI: push to `main` auto-publishes new versions to npm and creates GitHub Release (no manual deploy)

### Removed

- `specflow init --yes` non-interactive mode

## [1.1.1] - 2026-05-21

### Fixed

- CLI `Permission denied` on macOS/external volumes: bin now uses `bin/specflow.js` wrapper with execute bit

## [1.1.0] - 2026-05-21

### Added

- Interactive `specflow init` with checkbox/radio prompts (`@inquirer/prompts`)
- Multi-IDE adapters: Cursor, Claude Code, GitHub Copilot, Codex, Windsurf, Opencode, Antigravity
- `.specflow-tools.json` tracks installed adapters per project
- `specflow tools list` / `specflow tools add` / `specflow tools remove`
- `specflow init --yes` for non-interactive install (CI-friendly)
- Assets reorganized: `assets/core/` + `assets/adapters/`
- AGENTS.md aligned with [agents.md](https://agents.md/) standard

### Changed

- `sync` updates core + adapters from `.specflow-tools.json` (never `.agents-docs/`)
- Manifest version 2

## [1.0.0] - 2026-05-21

### Added

- CLI: `init`, `sync`, `status`
- Spec-driven 4-agent workflow (Refiner, SDD, Implementer, Reviewer)
- `.specflow-version` for per-project version tracking
- `sync` never overwrites `.agents-docs/`
- Cursor rule `_specflow.mdc`
- Scaffold templates for `.agents-docs/`
