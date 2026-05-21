# Architecture
<!-- Read by: Refiner Agent, SDD Agent -->
<!-- Fill this file when setting up the system in a new project. -->
<!-- Be concise — agents read this every task. Avoid verbose descriptions. -->

---

## Project

- **Name:** [project name]
- **Type:** [web-app / api / mobile / cli / library / monorepo]
- **Language:** [TypeScript / Python / Rust / Go / etc.]
- **Framework:** [Next.js / FastAPI / Axum / etc. — or "none"]
- **Runtime:** [Node 20 / Python 3.12 / etc.]
- **Package manager:** [npm / pnpm / poetry / cargo / etc.]

---

## Folder Structure

```
src/
  [describe your actual structure here]
  [be specific — agents use this to navigate the codebase]

Example:
src/
  app/           ← Next.js app router pages
  components/    ← shared UI components
  lib/           ← utilities and helpers
  server/        ← server actions and API logic
  types/         ← TypeScript type definitions
```

---

## Architecture Rules

These are non-negotiable constraints for every task:

- [Rule 1: e.g. "All database access goes through /lib/db — never import prisma directly in components"]
- [Rule 2: e.g. "No business logic in route handlers — use service functions"]
- [Rule 3: e.g. "Every new module must have a corresponding index.ts barrel file"]

---

## State Management

[How is state managed in this project?]

Example:
- Server state: React Query / SWR / tRPC
- Client state: Zustand / Jotai / Context API (only for auth)
- Forms: React Hook Form + Zod

---

## Data Layer

[How does the project access data?]

Example:
- ORM: Prisma
- DB: PostgreSQL (Supabase)
- Schema location: prisma/schema.prisma
- Migrations: run with `prisma migrate dev`

---

## Authentication

[How is auth handled, if applicable?]

Example:
- Provider: NextAuth.js / Clerk / Supabase Auth
- Session access: `getServerSession()` in server components, `useSession()` in client
- Protected routes: middleware.ts handles redirects

---

## External Services

[Key third-party integrations the agents should know about]

| Service | Purpose | Config location |
|---------|---------|-----------------|
| [name]  | [what]  | [env var / file] |

---

## Key Constraints

Things the agents must never do in this project:

- [e.g. "Never use `any` TypeScript type"]
- [e.g. "Never commit .env files — use .env.example"]
- [e.g. "Never write raw SQL — use Prisma query API"]
