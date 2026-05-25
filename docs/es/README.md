# Guía SpecFlow

**Flujo multi-agente spec-driven para Cursor**, con sincronización opcional con **Linear**.

Instálalo una vez por proyecto. Actívalo cuando la tarea merezca estructura.

**Other language:** [English](../en/README.md)

---

## Empieza aquí

| Quiero… | Leer |
|---------|------|
| Entender por qué existe SpecFlow | [Introducción](./introduction.md) |
| Instalarlo en mi repo | [Primeros pasos](./getting-started.md) |
| Conectar Cursor ↔ Linear (MCP) | [Integración Linear](./linear-integration.md) |
| Mi primera tarea completa | [Tu primer flujo](./getting-started.md#tu-primer-flujo) |
| Arrancar desde un issue Linear | [Integración Linear](./linear-integration.md#empezar-desde-un-issue) |
| Fases, archivos y frases | [Cómo funciona](./how-it-works.md) |
| Carpetas del proyecto | [Layout del proyecto](./project-layout.md) |
| Contexto de *mi* proyecto | [Documentación del proyecto](./project-documentation.md) |

---

## Mapa de la guía

| Capítulo | Contenido |
|----------|-----------|
| [Introducción](./introduction.md) | Problema, solución, cuándo usarlo |
| [Primeros pasos](./getting-started.md) | `init`, verificar, primer flujo |
| [Cómo funciona](./how-it-works.md) | Modo directo vs flujo |
| [Referencia CLI](./cli-reference.md) | Comandos |
| [Layout del proyecto](./project-layout.md) | Árbol tras `init` |
| [Documentación del proyecto](./project-documentation.md) | `.agents-docs/` |
| [Adaptadores IDE](./ide-adapters.md) | Adaptador Cursor |
| [Integración Linear](./linear-integration.md) | Plugin, MCP, estados |
| [Principios de diseño](./design-principles.md) | Reglas del flujo |
| [Solución de problemas](./troubleshooting.md) | FAQ |

---

## Instalación rápida

```bash
npx @ceatoleii/specflow init
specflow doctor
specflow linear setup    # opcional — tras plugin Linear en Cursor
```

Luego: **`nueva tarea`** o **`nueva tarea desde TEAM-123`**.

---

[Introducción →](./introduction.md)
