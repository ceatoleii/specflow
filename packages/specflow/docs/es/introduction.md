# Introducción

[← Índice](./README.md) · [English](../en/introduction.md)

---

## ¿Por qué SpecFlow?

Los asistentes de código con IA son rápidos, pero las sesiones sin estructura suelen provocar:

- Requisitos vagos que pasan directo a implementación
- Scope creep y cambios sin revisión
- Pérdida de contexto entre mensajes de “planificación” y “código”

**SpecFlow** impone un pipeline ligero: cuatro agentes especializados, una fase a la vez, con archivos en disco como fuente de verdad. Solo el **Implementer** puede editar código; el resto especifica, diseña o verifica.

---

## ¿Qué es SpecFlow?

SpecFlow es un paquete CLI (`@ceatoleii/specflow`) que instala un flujo multi-agente en tu proyecto. Incluye:

- Un **orquestador** que enruta tu asistente de IA al agente de fase correcto
- **Cuatro agentes de fase** — Refiner, SDD, Implementer, Reviewer
- **Plantillas** para specs de tarea, documentos de diseño y revisiones
- **Adaptadores IDE** para que Cursor, Claude Code, Copilot y otros carguen las reglas automáticamente

Compatible con cualquier herramienta que lea [`AGENTS.md`](https://agents.md/) — incluyendo **Cursor**, Claude Code, GitHub Copilot y OpenAI Codex.

---

## Cuándo usarlo

| Usa SpecFlow cuando… | Omítelo cuando… |
|----------------------|-----------------|
| La tarea tiene alcance y criterios de aceptación | Necesitas un fix de una línea |
| Quieres aprobación de diseño antes del código | Ya tienes una spec detallada en otro sitio |
| Varios agentes/herramientas deben seguir las mismas reglas | Prefieres chat totalmente ad-hoc |

SpecFlow añade **cero overhead** hasta que activas el flujo. Sin activación, tu asistente se comporta con normalidad.

---

## Cómo encaja en tu proyecto

```
Tu codebase
├── Código fuente          ← solo el Implementer lo toca
├── .agents/               ← motor SpecFlow (gestionado por init/sync)
├── .agents-docs/          ← conocimiento de tu proyecto (tú lo editas)
└── .agents-state/         ← runtime por tarea (gitignored)
```

Los hechos del proyecto viven en **`.agents-docs/`**. La lógica de agentes vive en **`.agents/`** y se actualiza con **`specflow sync`**.

---

[← Índice](./README.md) · [Primeros pasos →](./getting-started.md)
