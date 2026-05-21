# Troubleshooting

[← Design Principles](./design-principles.md) · [Español](../es/troubleshooting.md)

---

## FAQ

### Does SpecFlow work without `.agents-docs/`?

Yes. Agents have less project context and may ask more questions. Fill in docs before serious tasks.

### Can I edit `.agents/rules/`?

Not recommended. Changes are overwritten on `sync`. Put project-specific rules in `.agents-docs/`.

### Do I commit `.agents-state/`?

No. Add it to `.gitignore`. It contains per-task runtime state.

### Which language do agents speak?

Agent rules are English. You can chat in Spanish or English. Activation phrases work in both.

---

## Common issues

### `status` says outdated

A newer SpecFlow version is on npm.

```bash
npx @ceatoleii/specflow sync
```

### `sync` blocked — flow task active

Sync refuses to run while a flow task is active (unless you pass `--yes`):

```bash
specflow sync --yes
```

Or deactivate flow first: say **`flow off`** / **`modo directo`**.

### `status` exits with code 1

SpecFlow is not installed in that directory. Run `init` first.

### Agent ignores flow / wrong phase

Check:

1. `.agents-state/.flow-enabled` exists
2. `.agents-state/current/phase.md` has a valid phase
3. Your IDE adapter is installed (`specflow tools list`)
4. Adapter file wasn't deleted manually

Reset: say **`flow off`**, then **`nueva tarea`** to start fresh.

### Implementation started without `/approve`

The SDD agent should wait for approval. If code changed prematurely, say **`flow off`**, revert unwanted changes, and restart the task.

### Review fails verification

Check `.agents-docs/verification.md` commands. Fix failing tests/lint, then continue in implementing phase or restart review.

### Legacy markdown not in `state.db`

Requires `stateDb: true` in `.specflow-config.json` and flow **inactive**:

```bash
specflow state migrate
```

Or run `sync` or `state ensure` while flow is inactive.

### `state.db` missing after install

Run `specflow state ensure` or activate flow (`nueva tarea`) when `stateDb` is enabled. If you chose markdown-only (`stateDb: false`), agents never create `state.db` — that is expected.

### Agents still read full markdown files

Check `.specflow-config.json` → `stateDb` must be `true` and `state.db` must exist. Run `specflow status` to see `stateDb` and State DB lines.

### `init` cancelled immediately

The wizard requires an interactive terminal. Run in a real TTY, not a non-interactive CI step.

---

## Getting help

- [GitHub Issues](https://github.com/ceatoleii/specflow/issues)
- [Changelog](../../CHANGELOG.md) for version-specific changes

---

[← Design Principles](./design-principles.md) · [Index](./README.md)
