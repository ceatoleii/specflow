# Verification
<!-- Read by: Reviewer Agent ONLY -->
<!-- Define exactly how to verify the project is working correctly. -->
<!-- The Reviewer runs these commands in order and captures all output. -->

---

## Commands

Replace the examples below with your actual project commands.
Remove any section that doesn't apply to your project.

### 1. Tests (required)
```bash
# Example — replace with your test command:
npm test
# or
pnpm test
# or
pytest
# or
cargo test
# or
go test ./...
```
Expected: exit code 0, all tests passing.

### 2. Type Check (if applicable)
```bash
# Example:
npx tsc --noEmit
# or
pyright
# or (Rust/Go — types are checked at build time, skip this step)
```
Expected: exit code 0, zero errors.

### 3. Lint (if applicable)
```bash
# Example:
npm run lint
# or
pnpm lint
# or
ruff check .
# or
clippy — cargo clippy -- -D warnings
```
Expected: exit code 0, zero warnings or errors.

### 4. Build (if applicable)
```bash
# Example:
npm run build
# or
pnpm build
# or (for libraries/CLIs)
cargo build --release
```
Expected: exit code 0, build artifacts generated.

---

## Verification Rules

- Commands are run **in the order listed above**
- All commands must exit 0 for the review to PASS
- If a command is not applicable (e.g. no build step), remove it — don't leave it with a dummy value
- The Reviewer captures **full output** of each command, not just the exit code

---

## Notes

[Any project-specific notes the Reviewer should know]

Examples:
- "Tests require a local .env.test file — it's in 1Password under 'Project Test Env'"
- "The build step requires `NEXT_PUBLIC_API_URL` to be set — use the value from .env.example"
- "Ignore warnings from the `legacy-peer-deps` package — it's a known issue"
