# Verification

Run from **repository root**.

Use `specflow doctor` for a quick static check; use the commands below for full review (Reviewer) or CI parity.

---

## Quick check (optional)

```bash
npm run specflow -- doctor
```

Expected: all checks passed (exit 0). Warnings alone still exit 0; errors exit 1.

To run the same commands as this file automatically:

```bash
npm run specflow -- doctor --run
```

---

## Commands (in order)

### 1. Install

```bash
npm ci
```

Expected: exit 0.

### 2. Typecheck

```bash
npm run typecheck
```

Expected: exit 0.

### 3. Tests + coverage

```bash
npm run test:coverage
```

Expected: exit 0, all tests pass, coverage ≥ 80% lines/statements.

### 4. Build

```bash
npm run build
```

Expected: exit 0, `dist/` and executable `bin/specflow.js`.

### 5. Docs build

```bash
npm run docs:build
```

Expected: exit 0, VitePress build completes (no dead links in guide).

### 6. Pack sanity (before release)

```bash
npm pack --dry-run
```

Expected: includes `bin/specflow.js`, `dist/`, `assets/`, `manifest.json`; no `*.test.js`.

---

## Verification Rules

- All commands above exit 0 → review **PASS**
- Reviewer must map each **AC** from `task.md` to evidence in `review.md` (see review template)
- CI (`.github/workflows/ci.yml`) runs typecheck + coverage on push/PR
- Publish on push to `main` when package version is new on npm

---

## Notes

- **Product changes:** `assets/core/` → update rules/templates → `npm test` → bump `package.json` → publish
- **Dogfood root:** after release, `specflow sync` at repo root (updates `.agents/`, not `.agents-docs/`)
- **Engine version:** keep `.specflow-version` at root in sync after sync (currently tracks installed engine)
- **CLI smoke:** `npm run specflow -- status` · `npm run specflow -- doctor`
- **Flow archive:** on PASS, Reviewer copies `current/` → `history/YYYY-MM-DD-slug/` (slug from `# Task:` title)
