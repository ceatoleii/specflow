# Code Conventions

## Naming

| Element | Convention | Example |
|---------|------------|---------|
| TS files | kebab-case | `tools-config.ts`, `doctor.ts` |
| Tests | `*.test.ts` co-located | `init.test.ts`, `doctor.test.ts` |
| Functions | camelCase | `runInit()`, `runDoctor()` |
| Types | PascalCase | `CopyResult`, `DoctorReport` |
| Constants | UPPER_SNAKE | `TOOLS_FILE`, `FLOW_PHASE_FILE` |
| CLI commands | lowercase | `init`, `sync`, `doctor`, `tools add` |
| Adapter IDs | kebab-case | `claude-code`, `github-copilot` |
| Commits | Conventional Commits (English) | `feat: add specflow doctor command` |

---

## Code Patterns

### ESM + TypeScript

- `"type": "module"` in package
- Imports in `src/` use `.js` extension (Node16)
- Output: `dist/` via `tsc`
- Build: `tsc && chmod +x bin/specflow.js dist/cli.js`

### CLI errors

- Commands throw `SpecflowCliError` with `code`
- `cli.ts` maps to exit 1 — no `process.exit()` inside command modules (except `status` / `doctor` when checks fail)

### Copy engine

- File installs via `src/lib/copy.ts` + `install.ts`
- Strip prefixes: `core/` → project root, `adapters/{id}/` → project root

### Interactive CLI

- `@clack/prompts` for `specflow init` (guided wizard with i18n)
- `@inquirer/prompts` for `tools add` / `tools remove`
- `specflow init` requires an interactive terminal (no `--yes`)

### Tests

- Vitest + `vitest.setup.ts` (cleanup `.test-tmp/`)
- Integration tests run `dist/cli.js`
- Mock `@inquirer/prompts` for interactive paths
- `fileParallelism: false`, `maxWorkers: 1`

---

## SpecFlow flow artifacts (when dogfooding)

When writing or reviewing flow artifacts in `.agents-state/current/`:

| File | Owner | Rules |
|------|-------|-------|
| `task.md` | Refiner | Acceptance criteria as **AC1**, **AC2**, … |
| `plan.md` | SDD | Technical design; map each AC to scenarios (S01…) |
| `tasks.md` | SDD / Implementer | TDD order: `[test]` tasks before `[impl]` for same slice |
| `review.md` | Reviewer | One row per AC with concrete evidence; FAIL if any AC missing |

Do not introduce `sdd.md` in new tasks — use `plan.md`.

---

## Anti-patterns

- **Duplicating agent logic in adapters** — adapters only point to `orchestrator.md`
- **Editing root `.agents/rules/` for product** — edit `assets/core/.agents/` instead
- **Shipping tests in npm** — verify with `npm pack --dry-run`
- **Hardcoding project facts in agent rules** — use `.agents-docs/`
- **Implementing before `/approve`** in flow mode
- **Vague acceptance criteria** without AC ids — breaks review traceability
- **Impl tasks before test tasks** in `tasks.md` when the plan defines both

---

## Comments

- Minimal; self-explanatory code preferred
- No TODOs in committed code

---

## Error Handling

- `SpecflowCliError` for user-facing CLI errors
- `loadManifest()` throws on unsupported manifest version
- Unexpected errors bubble from CLI

---

## Imports

1. Node built-ins
2. External packages
3. Relative `./` with `.js` suffix

---

## Testing

From repo root:

```bash
npm run typecheck
npm run test:coverage
npm run build
npm run docs:build
```

Smoke: `npm run specflow -- doctor`
