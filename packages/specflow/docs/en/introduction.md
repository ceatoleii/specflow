# Introduction

[← Index](./README.md) · [Español](../es/introduction.md)

---

## Why SpecFlow?

AI coding assistants are fast, but unstructured sessions often lead to:

- Vague requirements carried straight into implementation
- Scope creep and unreviewed changes
- Lost context between “planning” and “coding” messages

**SpecFlow** enforces a lightweight pipeline: four specialized agents, one phase at a time, with files on disk as the source of truth. Only the **Implementer** can edit code; every other agent specifies, designs, or verifies.

---

## What is SpecFlow?

SpecFlow is a CLI package (`@ceatoleii/specflow`) that installs a multi-agent workflow into your project. It ships:

- An **orchestrator** that routes your AI assistant to the correct phase agent
- **Four phase agents** — Refiner, SDD, Implementer, Reviewer
- **Templates** for task specs, design docs, and reviews
- **IDE adapters** so Cursor, Claude Code, Copilot, and others pick up the rules automatically

Compatible with any tool that reads [`AGENTS.md`](https://agents.md/) — including **Cursor**, Claude Code, GitHub Copilot, and OpenAI Codex.

---

## When to use it

| Use SpecFlow when… | Skip it when… |
|--------------------|---------------|
| Tasks have real scope and acceptance criteria | You need a one-line fix |
| You want design approval before code | You already have a detailed spec elsewhere |
| Multiple agents/tools should follow the same rules | You prefer fully ad-hoc chat |

SpecFlow adds **zero overhead** until you activate flow mode. Without activation, your assistant behaves normally.

---

## How it fits your project

```
Your codebase
├── Source code          ← only Implementer touches this
├── .agents/             ← SpecFlow engine (managed by init/sync)
├── .agents-docs/        ← your project knowledge (you edit)
└── .agents-state/       ← per-task runtime (gitignored)
```

Project facts live in **`.agents-docs/`**. Agent logic lives in **`.agents/`** and updates safely via **`specflow sync`**.

---

[← Index](./README.md) · [Getting Started →](./getting-started.md)
