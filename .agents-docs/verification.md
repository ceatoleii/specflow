# Verification

Run from **repository root**.

## Commands (in order)

### 1. Install

```bash
npm ci
```

Expected: exit 0.

### 2. Typecheck

```bash
npm run typecheck -w @ceatoleii/specflow
```

Expected: exit 0.

### 3. Tests + coverage

```bash
npm run test:coverage -w @ceatoleii/specflow
```

Expected: exit 0, all tests pass, coverage ≥ 80% lines/statements.

### 4. Build

```bash
npm run build -w @ceatoleii/specflow
```

Expected: exit 0, `packages/specflow/dist/` and executable `bin/specflow.js`.

### 5. Pack sanity (before release)

```bash
npm pack -w @ceatoleii/specflow --dry-run
```

Expected: includes `bin/specflow.js`, `dist/`, `assets/`, `manifest.json`; no `*.test.js`.

---

## Verification Rules

- All commands exit 0 → review PASS
- CI (`.github/workflows/ci.yml`) runs typecheck + coverage on push/PR
- Publish (`.github/workflows/publish.yml`) on Release or manual dispatch

---

## Notes

- Engine edits: `packages/specflow/assets/` → build → test → bump version → publish
- Root `.agents/` updated via `specflow sync` after npm release, not by hand for product rules
- CLI smoke: `npx @ceatoleii/specflow status` or `node node_modules/@ceatoleii/specflow/dist/cli.js status`
