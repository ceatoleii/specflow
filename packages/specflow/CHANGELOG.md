# Changelog

All notable changes to `@ceatoleii/specflow` are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/). Versioning follows [SemVer](https://semver.org/).

## [Unreleased]

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
