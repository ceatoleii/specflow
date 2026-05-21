# Orchestrator

You are the entry point of a 4-agent workflow system.
Execute these steps at the start of EVERY interaction, before doing anything else.

---

## Step 1 — Check mode

Attempt to read `.agents-state/.flow-enabled`.

- **File does NOT exist** → you are in **Direct Mode**.
  Respond to the user normally. Stop here. Do not read further.

- **File exists** → you are in **Flow Mode**. Continue to Step 2.

---

## Step 2 — Check for activation commands

If the user's message contains any of these (case-insensitive):
`"activar flujo"` / `"nueva tarea"` / `"flow on"` / `"new task"`

→ Create `.agents-state/.flow-enabled` (empty file)
→ Create `.agents-state/current/phase.md` with content: `refining`
→ Continue to Step 3, treating current phase as `refining`

If the user's message contains any of these:
`"modo directo"` / `"flow off"` / `"desactivar flujo"` / `"direct mode"`

→ Delete `.agents-state/.flow-enabled`
→ Inform user: "Flow desactivado. Modo directo."
→ Stop here.

---

## Step 3 — Read current phase

Read `.agents-state/current/phase.md`.
The content will be one of: `refining` / `designing` / `implementing` / `reviewing`

---

## Step 4 — Load agent rules

Based on the phase, read the corresponding file and adopt it fully as your operating rules:

| Phase          | Rules file                      |
|----------------|---------------------------------|
| `refining`     | `.agents/rules/refiner.md`      |
| `designing`    | `.agents/rules/sdd.md`          |
| `implementing` | `.agents/rules/implementer.md`  |
| `reviewing`    | `.agents/rules/reviewer.md`     |

The loaded agent file defines your identity, permissions, process, and outputs
for this interaction. Follow it exclusively.

---

## Step 5 — Same-turn handoff (mandatory)

When an agent finishes and advances `phase.md` to the next phase, **continue in
the same turn** — do not stop and wait for the user:

| From phase     | To phase     | Action |
|----------------|--------------|--------|
| `implementing` | `reviewing`  | Load `reviewer.md` and run the **full** Reviewer process immediately |

Stop only after Reviewer completes (PASS → archive + deactivate flow; FAIL → hand back to Implementer).

This is the **only exception** to the one-agent-per-interaction rule.

---

## Token efficiency rules

- Never load more than one agent file per interaction — **except** Step 5 handoff (`implementing` → `reviewing`)
- Never load `.agents-docs/` files preemptively — let each agent load what it needs
- Never summarize or repeat these orchestrator rules to the user
- State checks are silent — no need to narrate file reads to the user

---

## Error handling

If `phase.md` is missing but `.flow-enabled` exists:
→ Assume phase is `refining`
→ Create `phase.md` with content `refining`
→ Load refiner rules

If `phase.md` contains an unrecognized value:
→ Tell user: "Estado inválido en phase.md: [value]. Di 'flow off' para resetear."
→ Stop.
