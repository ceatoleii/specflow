# Project Layout

[← CLI Reference](./cli-reference.md) · [Español](../es/project-layout.md)

---

After `specflow init`, your repository root typically looks like this:

```
your-project/
├── AGENTS.md                 # Universal agent entry (agents.md standard)
├── .specflow-version         # Installed engine version
├── .specflow-config.json     # locale, includeDocs (init)
├── .specflow-tools.json      # Installed IDE adapters
│
├── .agents/                  # SpecFlow engine — managed by init/sync
│   ├── rules/
│   │   ├── orchestrator.md   # Routes to phase agents
│   │   ├── refiner.md
│   │   ├── sdd.md
│   │   ├── implementer.md
│   │   └── reviewer.md
│   └── templates/
│       ├── plan-template.md
│       ├── tasks-template.md
│       ├── review-template.md
│       └── sdd-template.md      # deprecated → use plan-template
│
├── .agents-docs/             # YOUR project knowledge (manual)
│   ├── architecture.md
│   ├── conventions.md
│   ├── verification.md
│   └── design-system.md      # optional — delete if N/A
│
├── .agents-state/            # Runtime — gitignore this
│   ├── .flow-enabled         # Present when flow is active
│   ├── current/              # Active task artifacts (source of truth)
│   │   ├── phase.md
│   │   ├── task.md
│   │   ├── plan.md
│   │   ├── tasks.md
│   │   └── review.md
│   └── history/              # Archived sessions (YYYY-MM-DD-slug/)
│
└── .cursor/                  # Example adapter (if Cursor selected)
    └── rules/
        └── _specflow.mdc
```

Other adapters add their own files — see [IDE Adapters](./ide-adapters.md).

---

## Directory roles

### Managed by SpecFlow (`init` / `sync`)

| Path | Updates on sync? |
|------|:----------------:|
| `AGENTS.md` | Yes |
| `.agents/**` | Yes |
| `.specflow-version` | Yes |
| `.specflow-tools.json` | Yes |
| Adapter stub files | Yes (installed adapters only) |

### Owned by you

| Path | Notes |
|------|-------|
| `.agents-docs/**` | Never overwritten by sync |
| Source code | Only Implementer edits during flow |
| `.gitignore` | Add `.agents-state/` |

### Runtime only

| Path | Notes |
|------|-------|
| `.agents-state/**` | Per-task state; safe to delete when inactive |
| `.specflow-config.json` | Written at init (`locale`, `includeDocs`) |

---

## Recommended `.gitignore`

```gitignore
.agents-state/
```

Commit everything else SpecFlow installs — team members run `sync` to stay aligned on engine version.

---

[← CLI Reference](./cli-reference.md) · [Project Documentation →](./project-documentation.md)
