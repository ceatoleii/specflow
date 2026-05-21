# Adaptadores IDE

[← Documentación del proyecto](./project-documentation.md) · [English](../en/ide-adapters.md)

---

## ¿Qué son los adaptadores?

Archivos delgados que indican a tu IDE o herramienta IA cargar las reglas SpecFlow en cada interacción. El motor vive en `.agents/`; los adaptadores apuntan a él.

Eliges adaptadores en `init`. Añade o quita después con `specflow tools add` / `specflow tools remove`.

Los instalados quedan en `.specflow-tools.json`.

---

## Matriz de soporte

| Herramienta | Tier | Archivos adapter |
|-------------|------|------------------|
| Cursor | stable | `.cursor/rules/_specflow.mdc` |
| Claude Code | stable | `CLAUDE.md` |
| GitHub Copilot | stable | `.github/copilot-instructions.md` |
| OpenAI Codex | stable | Solo `AGENTS.md` (sin archivo extra) |
| Windsurf | experimental | `.windsurf/rules/specflow.md` |
| Opencode | experimental | `.opencode/rules/specflow.md` |
| Antigravity | experimental | `.antigravity/rules/specflow.md` |

**Stable** — probado con releases actuales.  
**Experimental** — puede ir retrasado o requerir ajustes manuales.

---

## Cómo funcionan

Cada adapter contiene una instrucción breve: *leer y ejecutar `.agents/rules/orchestrator.md` en cada tarea.*

El orquestador entonces:

1. Comprueba si el flujo está activo (`.agents-state/.flow-enabled`)
2. Ejecuta `specflow state ensure` si `stateDb` está habilitado (activación de flujo)
3. Lee la fase desde `phase.md` (shim) o `state.db`
4. Carga las reglas del agente de fase correspondiente

Sin activación de flujo → Modo Direct (comportamiento normal del asistente).

---

## Añadir adaptadores después

```bash
specflow tools list
specflow tools add
specflow tools remove
```

Usa `--dry-run` para vista previa sin escribir.

---

## Configuración multi-herramienta

Puedes instalar varios adaptadores (ej. Cursor + Copilot). Todos apuntan al mismo motor `.agents/`. Una sola fuente de verdad — edita hechos del proyecto en `.agents-docs/`, no en archivos adapter.

---

[← Documentación del proyecto](./project-documentation.md) · [Context Engine →](./context-engine.md)
