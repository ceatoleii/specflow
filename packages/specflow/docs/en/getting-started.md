# Getting Started

[← Introduction](./introduction.md) · [Español](../es/getting-started.md)

---

## Prerequisites

- **Node.js ≥ 18**
- An interactive terminal (the install wizard uses prompts)
- A git repository (recommended — `.agents-state/` should be gitignored)

---

## Install

Run from your project root:

```bash
npx @ceatoleii/specflow init
```

No global install required. `npx` downloads the latest package and runs the wizard.

### Wizard steps

The CLI guides you step by step:

1. **Language** — Español or English (affects CLI prompts, not agent rules)
2. **Confirm directory** — defaults to current working directory
3. **AI tools** — select which IDE adapters to install (Cursor, Claude Code, …)
4. **Project docs** — whether to scaffold `.agents-docs/` templates
5. **Summary** — review and confirm

There is no `--yes` shortcut for `init`. The wizard is always interactive.

### Options

```bash
specflow init --no-docs       # skip .agents-docs/ scaffold
specflow init --dry-run       # preview without writing files
specflow init -C ./my-app     # target a different directory
```

---

## What gets installed

| Path | Managed by | Purpose |
|------|------------|---------|
| `AGENTS.md` | `init` / `sync` | Universal entry point ([agents.md](https://agents.md/)) |
| `.agents/` | `init` / `sync` | Orchestrator + 4 phase agents — **do not edit** |
| `.specflow-tools.json` | `init` / `sync` | Installed IDE adapters |
| `.specflow-config.json` | `init` | Project preferences (locale, docs) |
| `.specflow-version` | `init` / `sync` | Installed engine version |
| Adapter files | per tool | e.g. `.cursor/rules/`, `CLAUDE.md` |
| `.agents-docs/` | **You** | Project context (manual) |
| `.agents-state/` | Runtime | Per-task state (gitignored) |

### Safe to edit

- `.agents-docs/**` — your project knowledge
- Your source code (via Implementer agent during flow)

### Do not edit manually

- `.agents/**` — use `specflow sync` to update from npm
- Adapter stub files — managed by `init` / `sync` / `tools add`

---

## After install

1. Add `.agents-state/` to `.gitignore` if not already present
2. Fill in [`.agents-docs/`](./project-documentation.md) when ready
3. Say **`nueva tarea`** or **`flow on`** in your AI chat to start a task

---

## Updating SpecFlow

When a new version is published:

```bash
npx @ceatoleii/specflow status   # check if outdated
npx @ceatoleii/specflow sync     # update engine + adapters
```

`sync` never overwrites `.agents-docs/`.

See [Troubleshooting](./troubleshooting.md) if sync is blocked while a flow task is active.

---

[← Introduction](./introduction.md) · [How It Works →](./how-it-works.md)
