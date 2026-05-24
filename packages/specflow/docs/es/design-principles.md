# Principios de diseño

[← Adaptadores IDE](./ide-adapters.md) · [English](../en/design-principles.md)

---

SpecFlow impone cinco principios core. Aplican sin importar IDE o tipo de proyecto.

---

## 1. Spec antes que código

No hay implementación hasta aprobar el SDD.

El agente SDD produce `plan.md` y `tasks.md`, presenta el diseño y espera **`/approve`** explícito. El Implementer no arranca sin aprobación.

Evita “codificar primero, pensar después”.

---

## 2. Un solo escritor

Solo el agente **Implementer** puede crear, editar o borrar archivos fuente.

| Agente | ¿Escribe código? |
|--------|:----------------:|
| Refiner | No |
| SDD | No |
| Implementer | **Sí** |
| Reviewer | No |

Refiner y SDD especifican. Reviewer verifica. Un agente es dueño del diff.

---

## 3. Estado explícito

Fase y artefactos viven como archivos markdown en `.agents-state/current/`. `phase.md` es la fuente de verdad para el enrutamiento.

Puedes inspeccionar fase, requisito, diseño, progreso y revisión en esos archivos. Las sesiones completadas pasan a `.agents-state/history/`. Nada depende solo del historial del chat.

---

## 4. Reglas portables

La lógica de agentes viaja con el paquete npm (`.agents/`). Los hechos del proyecto viven en `.agents-docs/`.

Actualiza el motor con `sync` sin perder documentación del proyecto. El mismo flujo funciona en Cursor, Copilot, Claude Code y Codex.

---

## 5. Actualizaciones seguras

`sync` refresca `.agents/`, `AGENTS.md` y stubs de adaptadores. **Nunca** sobrescribe `.agents-docs/`.

Tus notas de arquitectura, convenciones y comandos de verificación sobreviven cada update del motor.

---

## Cero overhead por defecto

Direct Mode es el default. SpecFlow no añade pipeline hasta que dices `nueva tarea`, `flow on` o equivalente.

Usa flujo para tareas con alcance y criterios. Usa modo directo para fixes rápidos y exploración.

---

[← Adaptadores IDE](./ide-adapters.md) · [Solución de problemas →](./troubleshooting.md)
