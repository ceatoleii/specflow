# Architecture

## Project

- **Name:** specflow (`@ceatoleii/specflow`)
- **Type:** CLI / npm package (monorepo, no UI)
- **Language:** TypeScript (ESM, Node16)
- **Framework:** none (Commander CLI)
- **Runtime:** Node ≥ 18
- **Package manager:** npm workspaces

---

## Folder Structure

```
eh-sdd-flow/                         ← repo root (dogfooding SpecFlow)
├── AGENTS.md / .agents/             ← consumer layout (from specflow init)
├── .agents-docs/                    ← project context (this folder)
├── .specflow-version / .specflow-tools.json
├── .github/workflows/               ← ci.yml, publish.yml
├── packages/
│   └── specflow/                    ← publishable npm package
│       ├── bin/specflow.js          ← CLI entry (executable)
│       ├── src/                     ← TypeScript source
│       │   ├── cli.ts
│       │   ├── commands/            ← init, sync, status, tools
│       │   └── lib/                 ← copy, manifest, prompts, install
│       ├── assets/
│       │   ├── core/                ← SOURCE OF TRUTH (shipped engine)
│       │   │   ├── AGENTS.md
│       │   │   ├── .agents/rules/
│       │   │   └── .agents/templates/
│       │   └── adapters/            ← per-IDE thin wrappers
│       ├── manifest.json            ← manifest v2
│       ├── dist/                    ← compiled CLI (published)
│       └── package.json
└── package.json                     ← workspace root
```

---

## Architecture Rules

1. **Engine source of truth:** `packages/specflow/assets/core/` and `packages/specflow/assets/adapters/`. Product changes to agent rules go here, not root `.agents/rules/`.

2. **CLI code only in** `packages/specflow/src/`. Never put runtime logic in `assets/`.

3. **`manifest.json` v2** drives `init` / `sync`: `core.static`, `core.scaffold`, `adapters.{id}.files`.

4. **`sync` never overwrites** `.agents-docs/` in any consumer project (including this repo).

5. **Published tarball:** `bin/`, `dist/`, `assets/`, `manifest.json` — not `src/` or tests.

6. **Version bumps** only in `packages/specflow/package.json`. Publish via GitHub Release `vX.Y.Z` or Actions → Publish npm.

7. **Root `.agents/`** is for dogfooding the installed package. After changing `assets/core/`, release npm and run `specflow sync` at root — do not edit root rules for product changes.

8. **Two different “wizards”:** `specflow init` (CLI install) ≠ product onboarding features. Do not conflate them in specs.

---

## SpecFlow flow (this repo)

When user says **`nueva tarea`** / **`activar flujo`**, agents must follow `.agents/rules/orchestrator.md`:

`refining` → `designing` (/approve) → `implementing` → `reviewing`

Without flow activation → Direct Mode (normal Cursor behavior).

---

## External Services

| Service | Purpose | Config |
|---------|---------|--------|
| npm | Publish `@ceatoleii/specflow` | `NPM_TOKEN` (GitHub Secret) |
| GitHub Actions | CI + publish | `.github/workflows/` |

---

## Key Constraints

- Public package: `publishConfig.access: public`
- Coverage ≥ 80% lines/statements in `packages/specflow`
- Do not commit: `.agents-state/`, `coverage/`, `.test-tmp/`
- Do not add npm dependencies without explicit approval
- Commits: Conventional Commits in English
