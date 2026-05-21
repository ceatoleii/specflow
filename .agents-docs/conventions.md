# Code Conventions

## Naming

| Element | Convention | Example |
|---------|------------|---------|
| TS files | kebab-case | `tools-config.ts` |
| Tests | `*.test.ts` co-located | `init.test.ts` |
| Functions | camelCase | `runInit()` |
| Types | PascalCase | `CopyResult`, `SpecflowCliError` |
| Constants | UPPER_SNAKE | `TOOLS_FILE`, `VERSION_FILE` |
| CLI commands | lowercase | `init`, `sync`, `tools add` |
| Adapter IDs | kebab-case | `claude-code`, `github-copilot` |
| Commits | Conventional Commits (English) | `fix: bin permission on macOS` |

---

## Code Patterns

### ESM + TypeScript

- `"type": "module"` in package
- Imports in `src/` use `.js` extension (Node16)
- Output: `dist/` via `tsc`
- Build: `tsc && chmod +x bin/specflow.js dist/cli.js`

### CLI errors

- Commands throw `SpecflowCliError` with `code`
- `cli.ts` maps to exit 1 — no `process.exit()` inside command modules (except status)

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

## Anti-patterns

- **Duplicating agent logic in adapters** — adapters only point to `orchestrator.md`
- **Editing root `.agents/rules/` for product** — edit `packages/specflow/assets/core/.agents/` instead
- **Shipping tests in npm** — exclude `*.test.ts` from build; verify with `npm pack --dry-run`
- **Hardcoding project facts in agent rules** — use `.agents-docs/`
- **Implementing before flow approval** — use SpecFlow phases for features

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

```bash
npm run typecheck -w @ceatoleii/specflow
npm run test:coverage -w @ceatoleii/specflow
npm run build -w @ceatoleii/specflow
```

Run from repo root unless noted.
