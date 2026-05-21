# Changelog

All notable changes to `@ceatoleii/specflow` are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/). Versioning follows [SemVer](https://semver.org/).

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
