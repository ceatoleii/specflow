# Adaptadores IDE

[← Documentación del proyecto](./project-documentation.md) · [English](../en/ide-adapters.md)

---

## Qué son los adaptadores

Archivos finos que indican a tu IDE que cargue las reglas SpecFlow en cada interacción. El motor vive en `.agents/`; los adaptadores apuntan al orquestador.

**`specflow init` (v2.2+)** pregunta si instalar el adaptador **Cursor** — camino recomendado, sobre todo con [integración Linear](./linear-integration.md).

Otros adaptadores siguen en el paquete; `specflow tools add` en v2.2.x ofrece solo **Cursor**.

Instalados quedan en `.specflow-tools.json`.

---

## Cursor (por defecto)

| | |
|---|---|
| **Tier** | stable |
| **Archivo** | `.cursor/rules/_specflow.mdc` |
| **Linear MCP** | Sí — plugin Linear en Cursor por separado |

---

## Otras herramientas (en el paquete, no en `init`)

| Herramienta | Tier | Archivos |
|-------------|------|----------|
| Claude Code | stable | `CLAUDE.md` |
| GitHub Copilot | stable | `.github/copilot-instructions.md` |
| OpenAI Codex | stable | solo `AGENTS.md` |
| Windsurf | experimental | `.windsurf/rules/specflow.md` |
| Opencode | experimental | `.opencode/rules/specflow.md` |
| Antigravity | experimental | `.antigravity/rules/specflow.md` |

Por ahora el camino soportado es **Cursor + SpecFlow**.

---

## Cómo funcionan

Cada adaptador manda a leer `.agents/rules/orchestrator.md`. El orquestador:

1. Comprueba si el flujo está activo
2. Lee `phase.md`
3. Carga el agente de fase
4. Si Linear está activo, aplica `.agents/rules/linear.md`

Sin activación → modo directo.

---

## Añadir Cursor después

```bash
specflow tools list
specflow tools add
specflow tools remove
```

---

[← Documentación del proyecto](./project-documentation.md) · [Integración Linear →](./linear-integration.md)
