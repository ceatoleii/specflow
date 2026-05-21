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

Output includes: version comparison (up to date / outdated / not installed), installed adapters, whether flow is active, current phase.

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

## `specflow state`

Flow state database commands (SQLite `state.db` in `.agents-state/`). Available in **1.3+**.

### `specflow state status`

```bash
specflow state status [-C, --cwd <dir>]
```

Shows active session, phase, and task counts.

### `specflow state query`

```bash
specflow state query --slice <name> [options]
```

| Option | Description |
|--------|-------------|
| `--slice <name>` | **Required.** One of: `phase`, `task`, `active-task`, `criteria`, `decisions`, `sdd-summary` |
| `--json` | JSON output |
| `-C, --cwd <dir>` | Target directory |

### `specflow state search`

```bash
specflow state search <term> [-C, --cwd <dir>]
```

Full-text search over decisions and refinement messages.

### `specflow state migrate`

```bash
specflow state migrate [-C, --cwd <dir>]
```

Import legacy `.agents-state/current/*.md` into `state.db`.

Also runs automatically on `init`/`sync` when legacy markdown exists and flow is inactive.

### `specflow state export`

```bash
specflow state export [-C, --cwd <dir>]
```

Archive the active session to `.agents-state/history/`.

### `specflow state set-phase`

```bash
specflow state set-phase <phase> [-C, --cwd <dir>]
```

Set flow phase. Updates both `state.db` and `phase.md` shim.

`<phase>`: `refining` | `designing` | `implementing` | `reviewing`

### `specflow state sync-task`

```bash
specflow state sync-task --code <id> --status <status> [-C, --cwd <dir>]
```

| Option | Description |
|--------|-------------|
| `--code <id>` | Task code, e.g. `T01` |
| `--status <status>` | `pending` \| `in_progress` \| `done` |

---

## Versioning workflow

```bash
npx @ceatoleii/specflow status   # → up to date | outdated | not installed
npx @ceatoleii/specflow sync       # after npm update @ceatoleii/specflow
```

`.specflow-version` records the installed engine version. `status` tells you when to sync.

---

[← How It Works](./how-it-works.md) · [Project Layout →](./project-layout.md)
