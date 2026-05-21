<div align="center">

# SpecFlow

Monorepo for [`@ceatoleii/specflow`](https://www.npmjs.com/package/@ceatoleii/specflow) — spec-driven multi-agent workflow for Cursor and AI coding tools.

[![CI](https://github.com/ceatoleii/specflow/actions/workflows/ci.yml/badge.svg)](https://github.com/ceatoleii/specflow/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@ceatoleii/specflow.svg?style=flat-square)](https://www.npmjs.com/package/@ceatoleii/specflow)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**Full documentation → [packages/specflow/README.md](./packages/specflow/README.md)**

```bash
npx @ceatoleii/specflow init
```

</div>

---

## Repository structure

```
.
├── packages/specflow/     # Publishable npm package (@ceatoleii/specflow)
│   ├── assets/            # Agent rules, templates, AGENTS.md (shipped to users)
│   ├── src/               # CLI (TypeScript)
│   └── README.md          # npm & GitHub package documentation
├── .github/workflows/     # CI (test + coverage)
└── package.json           # npm workspaces root
```

---

## Development

```bash
npm install
npm run build -w @ceatoleii/specflow
npm test
npm run test:coverage
```

### Publish to npm

Automated via GitHub Actions (`.github/workflows/ci.yml`) on push to `main`:

1. Add repo secret **`NPM_TOKEN`** (granular npm token with publish + bypass 2FA)
2. Bump `packages/specflow/package.json` version and update `CHANGELOG.md`
3. Push to `main` → CI runs tests, publishes to npm if the version is new, creates GitHub Release `vX.Y.Z`

Manual re-run: **Actions → CI → Run workflow**

---

## Links

- [npm package](https://www.npmjs.com/package/@ceatoleii/specflow)
- [Changelog](./packages/specflow/CHANGELOG.md)
- [License MIT](./packages/specflow/LICENSE)
