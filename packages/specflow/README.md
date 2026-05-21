# @ceatoleii/specflow

Spec-driven multi-agent workflow for Cursor and AI coding tools.

Four agents — **Refiner → SDD → Implementer → Reviewer** — run in sequence so every feature starts with a clear spec before any code is written.

## Install

```bash
npx @ceatoleii/specflow init
```

In an existing project with SpecFlow already installed:

```bash
npx @ceatoleii/specflow sync
```

## Commands

| Command | Description |
|---------|-------------|
| `specflow init` | Install engine (rules, templates, cursor rule) |
| `specflow sync` | Update engine — **never** overwrites `.agents-docs/` |
| `specflow status` | Compare installed vs CLI version |

### Options

```bash
specflow init --no-docs      # skip .agents-docs/ scaffold
specflow init --dry-run      # preview changes
specflow sync --yes          # sync while a flow task is active
specflow sync --dry-run
specflow status -C ./my-app  # target directory
```

## After install

```
your-project/
├── AGENTS.md
├── .specflow-version
├── .agents/           ← do not edit (updated by sync)
├── .agents-docs/      ← YOU edit (manual, per project)
├── .agents-state/     ← runtime, gitignored
└── .cursor/rules/_specflow.mdc
```

1. Fill `.agents-docs/` when ready (`architecture.md`, `conventions.md`, `verification.md`)
2. In Cursor: **"nueva tarea: add user login"**

## Flow triggers

| Activate | Deactivate |
|----------|------------|
| `nueva tarea` | `modo directo` |
| `activar flujo` | `flow off` |
| `flow on` | `desactivar flujo` |

## Versioning

- Project version: `.specflow-version`
- `sync` updates only static files (`.agents/`, `AGENTS.md`, cursor rule)
- Your docs in `.agents-docs/` are never touched by `sync`

## Development

```bash
cd packages/specflow
npm install
npm run build
npm test
node dist/cli.js init -C /tmp/my-test-project
```

## License

MIT © ceatoleii
