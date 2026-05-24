# CLI Reference

[← How It Works](./how-it-works.md) · [Español](../es/cli-reference.md)

---

## Global

```bash
specflow --version
specflow --help
```

All commands accept `-C, --cwd <dir>` to target a directory other than the current one.

---

## `specflow init`

Interactive guided install.

```bash
specflow init [options]
```

| Option | Description |
|--------|-------------|
| `-C, --cwd <dir>` | Target directory (default: current) |
| `--no-docs` | Skip `.agents-docs/` scaffold |
| `--dry-run` | Preview without writing files |

---

## `specflow sync`

Update core engine and installed IDE adapters. **Never** touches `.agents-docs/`.

```bash
specflow sync [options]
```

| Option | Description |
|--------|-------------|
| `-C, --cwd <dir>` | Target directory |
| `--dry-run` | Preview changes |
| `-y, --yes` | Allow sync while a flow task is active |

---

## `specflow status`

Show installed version, adapter list, and flow state.

```bash
specflow status [options]
```

| Option | Description |
|--------|-------------|
| `-C, --cwd <dir>` | Target directory |

Exit code **1** if SpecFlow is not installed in the target directory.

Output includes: version comparison (up to date / outdated / not installed), installed adapters, whether flow is active, and **locale config** (`locale=es` or `locale=en`) when `.specflow-config.json` exists.

---

## `specflow doctor`

Verify SpecFlow installation, gitignore, templates, and (when flow is active) required artifacts for the current phase.

```bash
specflow doctor [options]
```

| Option | Description |
|--------|-------------|
| `-C, --cwd <dir>` | Target directory |
| `--run` | Execute bash commands from `.agents-docs/verification.md` |
| `--json` | Machine-readable output |

Exit code **1** if any check has severity `error`. Warnings alone exit **0**.

When flow is active, `doctor` validates `phase.md` and phase-specific files (`task.md`, `plan.md` or legacy `sdd.md`, `tasks.md`).

---

## `specflow tools`

Manage IDE adapters.

### `specflow tools list`

```bash
specflow tools list [-C, --cwd <dir>]
```

Shows installed and available adapters from `manifest.json`.

### `specflow tools add`

```bash
specflow tools add [options]
```

Interactive. Installs adapter files for selected tools.

| Option | Description |
|--------|-------------|
| `-C, --cwd <dir>` | Target directory |
| `--dry-run` | Preview changes |

### `specflow tools remove`

```bash
specflow tools remove [options]
```

Interactive. Removes adapter files for selected tools.

| Option | Description |
|--------|-------------|
| `-C, --cwd <dir>` | Target directory |
| `--dry-run` | Preview changes |

---

## Versioning workflow

```bash
npx @ceatoleii/specflow status   # → up to date | outdated | not installed
npx @ceatoleii/specflow sync       # after npm update @ceatoleii/specflow
```

`.specflow-version` records the installed engine version. `status` tells you when to sync.

---

[← How It Works](./how-it-works.md) · [Project Layout →](./project-layout.md)
