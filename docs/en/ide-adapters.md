# IDE Adapters

[← Project Documentation](./project-documentation.md) · [Español](../es/ide-adapters.md)

---

## What are adapters?

Adapters are thin files that tell your IDE to load SpecFlow rules on every interaction. The engine lives in `.agents/`; adapters point to the orchestrator.

**`specflow init` (v2.2+)** asks whether to install the **Cursor** adapter — the default and recommended path, especially for [Linear integration](./linear-integration.md).

Other adapters remain in the package for future releases; `specflow tools add` currently offers **Cursor only** when adding to an existing project.

Installed adapters are recorded in `.specflow-tools.json`.

---

## Cursor (default)

| | |
|---|---|
| **Tier** | stable |
| **File** | `.cursor/rules/_specflow.mdc` |
| **Linear MCP** | Yes — install the Linear plugin in Cursor separately |

The `.mdc` rule tells Cursor to read `.agents/rules/orchestrator.md` on each task. Flow routing and Linear MCP behavior are defined there and in `.agents/rules/linear.md`.

---

## Other tools (in package, not in `init` wizard)

These adapters still ship in `@ceatoleii/specflow` but are not offered during `init` in v2.2.x:

| Tool | Tier | Adapter files |
|------|------|---------------|
| Claude Code | stable | `CLAUDE.md` |
| GitHub Copilot | stable | `.github/copilot-instructions.md` |
| OpenAI Codex | stable | `AGENTS.md` only |
| Windsurf | experimental | `.windsurf/rules/specflow.md` |
| Opencode | experimental | `.opencode/rules/specflow.md` |
| Antigravity | experimental | `.antigravity/rules/specflow.md` |

They may return to the install wizard in a future version. For now, use Cursor + SpecFlow as the supported path.

---

## How adapters work

Each adapter file instructs the tool: *read and execute `.agents/rules/orchestrator.md` on every task.*

The orchestrator then:

1. Checks if flow is active (`.agents-state/.flow-enabled`)
2. Reads current phase from `phase.md`
3. Loads the matching phase agent rules
4. If Linear is enabled, also applies `.agents/rules/linear.md`

Without flow activation → Direct Mode (normal assistant behavior).

---

## Adding Cursor later

```bash
specflow tools list
specflow tools add           # interactive — Cursor only in v2.2.x
specflow tools remove
```

Use `--dry-run` to preview file changes.

---

## Multi-tool setups

Running Cursor for daily work and another tool occasionally is fine — install only the adapters you actually use. Each installed adapter is updated on `specflow sync`.

Linear state sync requires **Cursor + Linear MCP** regardless of other adapters.

---

[← Project Documentation](./project-documentation.md) · [Linear Integration →](./linear-integration.md)
