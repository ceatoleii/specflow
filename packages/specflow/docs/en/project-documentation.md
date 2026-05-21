# Project Documentation

[← Project Layout](./project-layout.md) · [Español](../es/project-documentation.md)

---

## What is `.agents-docs/`?

`.agents-docs/` is the **only** directory meant to differ between projects. It holds facts about *your* codebase — stack, conventions, how to verify changes.

SpecFlow works without it, but agents have less context and may ask more questions or miss project patterns.

Templates are scaffolded on `init` unless you pass `--no-docs`.

---

## Files

| File | Read by | Contents |
|------|---------|----------|
| `architecture.md` | Refiner, SDD | Stack, folder structure, architecture rules, external services |
| `conventions.md` | Implementer, Reviewer | Naming, patterns, anti-patterns, code style |
| `verification.md` | Reviewer | Test, lint, build commands and expected exit codes |
| `design-system.md` | SDD, Implementer | UI tokens, components, accessibility (optional) |

### `architecture.md`

Answer: *What is this project and how is it organized?*

Include:

- Project name, type (web app, CLI, API, …)
- Language, framework, runtime
- Folder structure with brief descriptions
- Architecture rules agents must follow
- External services and config locations

### `conventions.md`

Answer: *How should code look in this repo?*

Include:

- Naming conventions (files, functions, components)
- Preferred patterns and abstractions
- Anti-patterns to avoid
- Import style, error handling expectations

### `verification.md`

Answer: *How do we know a change is correct?*

Include:

- Commands in run order (install, lint, test, build)
- Expected exit codes
- Coverage thresholds if any
- CI notes

The Reviewer agent runs these commands during the reviewing phase.

### `design-system.md` (optional)

Answer: *How should UI look and behave?*

Include tokens, component library, spacing, typography, accessibility rules. Delete this file if your project has no UI.

---

## When to fill it in

| Timing | Recommendation |
|--------|----------------|
| At `init` | Keep scaffold templates — edit when you start using flow |
| Before first real task | Fill `architecture.md` and `verification.md` minimum |
| Front-end projects | Add or complete `design-system.md` |

---

## What sync does *not* touch

```bash
specflow sync   # never overwrites .agents-docs/
```

Your documentation survives engine upgrades. Compare upstream template changes manually if needed.

---

## Tips

1. **Be concrete** — “Use React Query for server state” beats “follow best practices”
2. **Keep verification current** — stale commands cause review failures
3. **Link to real paths** — `src/features/auth/` not “the auth module somewhere”
4. **Delete unused files** — remove `design-system.md` in backend-only projects

---

[← Project Layout](./project-layout.md) · [IDE Adapters →](./ide-adapters.md)
