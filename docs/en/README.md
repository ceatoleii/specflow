# SpecFlow Guide

**Spec-driven multi-agent workflow for Cursor**, with optional **Linear** issue sync.

Install once per project. Activate when a task deserves structure. One agent writes code; the others specify, design, and verify.

**Other language:** [Español](../es/README.md)

---

## Start here

| I want to… | Read |
|------------|------|
| Understand why SpecFlow exists | [Introduction](./introduction.md) |
| Install in my repo | [Getting Started](./getting-started.md) |
| Connect Cursor ↔ Linear (MCP) | [Linear Integration](./linear-integration.md) |
| Run my first full task | [Getting Started → Your first flow](./getting-started.md#your-first-flow) |
| Start from a Linear issue | [Linear Integration → Start from issue](./linear-integration.md#start-a-task-from-a-linear-issue) |
| See phases, files, and phrases | [How It Works](./how-it-works.md) |
| Know what each folder is for | [Project Layout](./project-layout.md) |
| Teach agents about *my* project | [Project Documentation](./project-documentation.md) |

---

## Guide map

| Chapter | What you'll learn |
|---------|-------------------|
| [Introduction](./introduction.md) | Problem, solution, when to use it |
| [Getting Started](./getting-started.md) | `init`, verify, first flow walkthrough |
| [How It Works](./how-it-works.md) | Direct vs Flow, four agents, what to inspect |
| [CLI Reference](./cli-reference.md) | Commands and flags |
| [Project Layout](./project-layout.md) | Tree after install, git & team notes |
| [Project Documentation](./project-documentation.md) | `.agents-docs/` files and tips |
| [IDE Adapters](./ide-adapters.md) | Cursor adapter (default in `init`) |
| [Linear Integration](./linear-integration.md) | Cursor plugin, MCP, state mapping |
| [Design Principles](./design-principles.md) | Rules the workflow enforces |
| [Troubleshooting](./troubleshooting.md) | Common issues |

---

## Quick install

```bash
npx @ceatoleii/specflow init
specflow doctor
specflow linear setup    # optional — after Linear plugin in Cursor
```

Then in your AI chat: **`nueva tarea`** or **`nueva tarea desde TEAM-123`**.

---

## Links

- [npm](https://www.npmjs.com/package/@ceatoleii/specflow)
- [GitHub](https://github.com/ceatoleii/specflow)
- [Changelog](../../CHANGELOG.md) · [MIT License](../../LICENSE)

---

[Introduction →](./introduction.md)
