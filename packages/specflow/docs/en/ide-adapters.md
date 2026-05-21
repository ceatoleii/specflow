# IDE Adapters

[← Project Documentation](./project-documentation.md) · [Español](../es/ide-adapters.md)

---

## What are adapters?

Adapters are thin files that tell your IDE or AI tool to load SpecFlow rules on every interaction. The engine lives in `.agents/`; adapters point to it.

You choose adapters during `init`. Add or remove later with `specflow tools add` / `specflow tools remove`.

Installed adapters are recorded in `.specflow-tools.json`.

---

## Support matrix

| Tool | Tier | Adapter files |
|------|------|---------------|
| Cursor | stable | `.cursor/rules/_specflow.mdc` |
| Claude Code | stable | `CLAUDE.md` |
| GitHub Copilot | stable | `.github/copilot-instructions.md` |
| OpenAI Codex | stable | `AGENTS.md` only (no extra file) |
| Windsurf | experimental | `.windsurf/rules/specflow.md` |
| Opencode | experimental | `.opencode/rules/specflow.md` |
| Antigravity | experimental | `.antigravity/rules/specflow.md` |

**Stable** — tested with current SpecFlow releases.  
**Experimental** — may lag behind or need manual tweaks.

---

## How adapters work

Each adapter file contains a short instruction: *read and execute `.agents/rules/orchestrator.md` on every task.*

The orchestrator then:

1. Checks if flow is active (`.agents-state/.flow-enabled`)
2. Runs `specflow state ensure` when `stateDb` is enabled (flow activation)
3. Reads current phase from `phase.md` (shim) or `state.db`
4. Loads the matching phase agent rules

Without flow activation → Direct Mode (normal assistant behavior).

---

## Adding adapters later

```bash
specflow tools list          # see what's available
specflow tools add           # interactive picker
specflow tools remove        # interactive removal
```

Use `--dry-run` to preview file changes without writing.

---

## Multi-tool setups

You can install multiple adapters (e.g. Cursor + Copilot). All point to the same `.agents/` engine. Keep one source of truth — edit project facts in `.agents-docs/`, not adapter files.

---

[← Project Documentation](./project-documentation.md) · [Context Engine →](./context-engine.md)
