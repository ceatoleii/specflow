# Code Conventions
<!-- Read by: Implementer Agent, Reviewer Agent -->
<!-- This file defines HOW code is written — style, patterns, anti-patterns. -->
<!-- It complements architecture.md (which defines WHAT the structure is). -->

---

## Naming

| Element       | Convention     | Example                        |
|---------------|----------------|--------------------------------|
| Files         | [kebab-case]   | `user-profile.ts`              |
| Components    | [PascalCase]   | `UserProfile.tsx`              |
| Functions     | [camelCase]    | `getUserById()`                |
| Variables     | [camelCase]    | `const currentUser`            |
| Constants     | [UPPER_SNAKE]  | `MAX_RETRY_COUNT`              |
| Types/Interfaces | [PascalCase] | `type UserProfile = {...}`     |
| CSS classes   | [kebab-case]   | `.user-profile-card`           |
| DB tables     | [snake_case]   | `user_profiles`                |
| Env vars      | [UPPER_SNAKE]  | `DATABASE_URL`                 |

---

## Code Patterns

### [Pattern name — e.g. Service Layer]
[When to use it and how]

Example:
**Repository Pattern**
All data access is encapsulated in repository functions in `/lib/repositories/`.
Never write Prisma queries outside of repository files.
```
// ✅ correct
import { getUserById } from '@/lib/repositories/users'

// ❌ wrong
import { prisma } from '@/lib/db'
const user = await prisma.user.findUnique(...)
```

### [Pattern name — e.g. Error handling]
[Description]

---

## Anti-patterns

Things that must never appear in this codebase:

- **[Anti-pattern 1]:** [why and what to do instead]
  ```
  // ❌ never do this
  // ✅ do this instead
  ```

- **[Anti-pattern 2]:** [why and what to do instead]

---

## Comments

- [When to write comments: e.g. "Only for non-obvious business logic, not for what the code does"]
- [JSDoc / docstrings: e.g. "Required for all exported functions"]
- [TODO policy: e.g. "No TODOs in committed code — create a task instead"]

---

## Error Handling

[How errors are handled in this project]

Example:
- All async functions use try/catch — never unhandled promise rejections
- User-facing errors use the `AppError` class from `/lib/errors`
- Internal errors are logged with the logger from `/lib/logger`
- API routes return `{ error: string }` with appropriate HTTP status codes

---

## Imports

[Import order and style]

Example:
1. Node built-ins
2. External packages
3. Internal aliases (`@/...`)
4. Relative imports (`./...`)

No default exports except for React components and Next.js pages.

---

## Testing

[How tests are written in this project]

Example:
- Test files: `[name].test.ts` co-located with the file they test
- Test naming: `describe('functionName', () => { it('should [behavior]', ...) })`
- Mock strategy: [vi.mock / jest.mock / MSW for API mocks]
- Each test file covers: unit behavior + edge cases + error paths
