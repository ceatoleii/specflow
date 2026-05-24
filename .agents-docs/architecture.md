# Architecture

## Project

- **Name:** specflow (`@ceatoleii/specflow`)
- **Type:** CLI / npm package (single package at repo root, no UI)
- **Language:** TypeScript (ESM, Node16)
- **Framework:** none (Commander CLI)
- **Runtime:** Node ≥ 18
- **Package manager:** npm
- **Current engine version:** 2.1.x (see `package.json`)

---

## Folder Structure

```
specflow/                                 ← repo root (dogfooding + publishable package)
├── AGENTS.md / .agents/                 ← installed consumer layout (dogfood)
├── .agents-docs/                        ← project context (this folder; manual)
├── .agents-state/                       ← flow runtime (gitignored)
│   ├── current/                         ← active task artifacts
│   └── history/                         ← archived (YYYY-MM-DD-slug/)
├── .specflow-version / .specflow-config.json / .specflow-tools.json
├── .github/workflows/                   ← CI + npm publish on main
├── .vitepress/                          ← VitePress site config
├── package.json                         ← @ceatoleii/specflow
├── bin/specflow.js                      ← CLI entry (executable)
├── src/
│   ├── cli.ts
│   ├── commands/                        ← init, sync, status, doctor, tools
│   └── lib/                             ← copy, manifest, install, doctor, …
├── assets/
│   ├── core/                            ← SOURCE OF TRUTH (shipped engine)
│   │   ├── AGENTS.md
│   │   ├── .agents/rules/
│   │   ├── .agents/templates/
│   │   └── .agents-docs/                ← scaffold only (not shipped overwrite)
│   └── adapters/                        ← per-IDE thin wrappers
├── docs/en|es/                          ← VitePress source
├── manifest.json
└── dist/                                ← compiled CLI (published)
```

---

## Architecture Rules

1. **Engine source of truth:** `assets/core/` and `assets/adapters/`. Product changes to agent rules go here, not root `.agents/rules/`.

2. **CLI code only in** `src/`. Never put runtime logic in `assets/`.

3. **`manifest.json` v2** drives `init` / `sync`: `core.static`, `core.scaffold`, `adapters.{id}.files`.

4. **`sync` never overwrites** `.agents-docs/` in any consumer project (including this repo).

5. **Published tarball:** `bin/`, `dist/`, `assets/`, `manifest.json`, `CHANGELOG.md`, `README.md` — not `src/` or tests.

6. **Version bumps** only in root `package.json`. Push to `main` → CI publishes if version is new on npm and creates GitHub Release `vX.Y.Z`.

7. **Root `.agents/`** is for dogfooding. After changing `assets/core/`, run `specflow sync` at root — do not edit root rules for product changes.

8. **Two different “wizards”:** `specflow init` (CLI install) ≠ SpecFlow task pipeline (`nueva tarea`). Do not conflate them in specs.

---

## SpecFlow pipeline (v2.1+)

**Requirement → Plan → Tasks → Code**

When the user says **`nueva tarea`** / **`activar flujo`**, follow `.agents/rules/orchestrator.md`:

| Phase | Agent | Key artifacts in `.agents-state/current/` |
|-------|--------|-------------------------------------------|
| `refining` | Refiner | `task.md` (**AC1**, **AC2**, …), `refinement-log.md` |
| `designing` | SDD | `plan.md`, `tasks.md` — waits for **`/approve`** |
| `implementing` | Implementer | code + `tasks.md` checkboxes |
| `reviewing` | Reviewer | `review.md` → archive to `history/` |

Without `.agents-state/.flow-enabled` → **Direct Mode** (normal assistant, no phase routing).

**Legacy:** `sdd.md` may exist in old sessions — treat as `plan.md`.

**State:** markdown files only in `.agents-state/current/` (`phase.md` is source of truth for routing). No `state.db`.

---

## CLI commands (product)

| Command | Purpose |
|---------|---------|
| `specflow init` | Interactive install (core + adapters + optional docs scaffold) |
| `specflow sync` | Update engine/adapters; never touches `.agents-docs/` |
| `specflow status` | Version, adapters, flow active/inactive |
| `specflow doctor` | Verify install + flow artifacts; `--run` runs this `verification.md` |
| `specflow tools` | `list` / `add` / `remove` IDE adapters |

Local dev: `npm run specflow -- <command>` from repo root.

---

## External Services

| Service | Purpose | Config |
|---------|---------|--------|
| npm | Publish `@ceatoleii/specflow` | `NPM_TOKEN` (GitHub Secret) |
| GitHub Actions | CI + publish | `.github/workflows/ci.yml` |
| GitHub Pages | Docs site | `.vitepress/` → `ceatoleii.github.io/specflow` |

---

## Key Constraints

- Public package: `publishConfig.access: public`
- Coverage ≥ 80% lines/statements in `src/`
- Do not commit: `.agents-state/`, `coverage/`, `.test-tmp/`, `.vitepress/.temp/`
- Do not add npm dependencies without explicit approval
- Commits: Conventional Commits in English
- Agent rules in assets must stay aligned with v2.1 artifacts (`plan.md`, AC numbering, review traceability)
