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
→ Run `specflow state start-session` (creates new DB session + phase `refining`)
→ If `ACTIVE_SESSION` error: tell user to finish or run `specflow state close-session`
→ Continue to Step 3, treating current phase as `refining`

If the user's message contains any of these:
`"modo directo"` / `"flow off"` / `"desactivar flujo"` / `"direct mode"`

→ Delete `.agents-state/.flow-enabled`
→ Inform user: "Flow desactivado. Modo directo."
→ Stop here.

---

## Step 3 — Read current phase

Run `specflow state query --slice phase`.
The result will be one of: `refining` / `designing` / `implementing` / `reviewing`

If empty and flow is enabled, assume `refining`.

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

When an agent finishes and advances phase to the next phase, **continue in
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
- **`.agents-docs/` once per phase** — each phase agent loads only the docs it needs, once at the start of that phase (not every turn)
- **Flow state:** use `specflow state query --slice phase` only in the orchestrator
- Human approval files in `current/`: only `sdd.md` and `tasks.md` — do not read them in the orchestrator
- Never summarize or repeat these orchestrator rules to the user
- State checks are silent — no need to narrate file reads to the user

---

## Error handling

If phase query returns empty but `.flow-enabled` exists:
→ Run `specflow state set-phase refining`
→ Load refiner rules

If phase contains an unrecognized value:
→ Tell user: "Estado inválido en state.db. Di 'flow off' para resetear."
→ Stop.
