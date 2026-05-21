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

```bash
npm publish -w @ceatoleii/specflow --access public
```

---

## Links

- [npm package](https://www.npmjs.com/package/@ceatoleii/specflow)
- [Changelog](./packages/specflow/CHANGELOG.md)
- [License MIT](./packages/specflow/LICENSE)
