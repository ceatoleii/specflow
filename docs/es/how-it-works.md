# Cómo funciona

[← Primeros pasos](./getting-started.md) · [English](../en/how-it-works.md)

---

## Pipeline

**Requisito → Plan → Tasks → Código**

| Paso | Artefacto | Agente |
|------|-----------|--------|
| Requisito | `task.md` (AC1, AC2…) | Refiner |
| Plan | `plan.md` + `tasks.md` | SDD |
| Código | archivos fuente | Implementer |
| Verificación | `review.md` | Reviewer |

Proyectos legacy pueden tener `sdd.md` en lugar de `plan.md` — los agentes leen `plan.md` primero.

---

## Dos modos

| Modo | Disparador | Comportamiento |
|------|------------|----------------|
| **Direct** | Por defecto | Asistente normal, cero overhead |
| **Flow** | Existe `.agents-state/.flow-enabled` | Orquestador enruta al agente de fase |

---

## Cuatro agentes, un pipeline

```mermaid
flowchart LR
  A[Refiner] --> B[SDD]
  B -->|/approve| C[Implementer]
  C --> D[Reviewer]
  D -->|PASS| E[Archivar y off]
  D -->|FAIL| C
```

| Fase | Agente | ¿Escribe código? | Salida |
|------|--------|:----------------:|--------|
| `refining` | Refiner | No | `task.md` con **AC1**, **AC2**… |
| `designing` | SDD | No | `plan.md` + `tasks.md` (requiere `/approve`) |
| `implementing` | Implementer | **Sí** | Código + checklist |
| `reviewing` | Reviewer | No | `review.md` + verificación |

### Refiner

Clarifica el requisito. Ajusta las preguntas según el nivel de detalle (idea vaga vs PRD completo). Produce `task.md` con criterios numerados. Nunca escribe código.

### SDD

Diseña desde `task.md`. Escribe `plan.md` (diseño + trazabilidad) y `tasks.md` (orden TDD). Espera **`/approve`** explícito.

### Implementer

Único agente que edita código. Ejecuta `tasks.md` (`[test]` antes de `[impl]`).

### Reviewer

Verifica cada **AC** con evidencia, ejecuta `verification.md`, archiva en `history/YYYY-MM-DD-slug/` al PASS.

---

## Frases de activación

| Iniciar | Terminar |
|---------|----------|
| `nueva tarea` · `activar flujo` · `flow on` | `modo directo` · `flow off` · `desactivar flujo` |

---

## Estado en disco

| Archivo | Fase | Propósito |
|---------|------|-----------|
| `phase.md` | todas | Fase actual |
| `task.md` | refining+ | Requisito + AC1… |
| `plan.md` | designing+ | Plan técnico (legacy: `sdd.md`) |
| `tasks.md` | implementing+ | Checklist |
| `review.md` | reviewing | Resultado review |

---

## Puerta de aprobación

`/approve` · `aprobado` · `dale` — sin esto no hay implementación.

---

## Verificar setup

```bash
specflow doctor
specflow doctor --run
```

---

[← Primeros pasos](./getting-started.md) · [Referencia CLI →](./cli-reference.md)
