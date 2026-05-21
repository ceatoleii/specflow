# Primeros pasos

[← Introducción](./introduction.md) · [English](../en/getting-started.md)

---

## Requisitos

- **Node.js ≥ 18**
- Terminal interactiva (el asistente de instalación usa prompts)
- Repositorio git (recomendado — `.agents-state/` debe estar en `.gitignore`)

---

## Instalación

Ejecuta desde la raíz de tu proyecto:

```bash
npx @ceatoleii/specflow init
```

No hace falta instalación global. `npx` descarga el paquete y ejecuta el asistente.

### Pasos del asistente

1. **Idioma** — Español o English (afecta prompts del CLI, no las reglas de agentes)
2. **Confirmar directorio** — por defecto el directorio actual
3. **Herramientas IA** — selecciona adaptadores IDE (Cursor, Claude Code, …)
4. **Docs del proyecto** — si crear plantillas en `.agents-docs/`
5. **State DB** — si usar `state.db` como fuente de verdad del flujo (por defecto: sí; solo markdown si no)
6. **Resumen** — revisar y confirmar

> **Nota:** Releases actuales del CLI pueden dejar `stateDb` activado por defecto sin mostrar el paso 5; la preferencia igual se guarda en `.specflow-config.json`.

No existe atajo `--yes` para `init`. El asistente siempre es interactivo.

### Opciones

```bash
specflow init --no-docs       # omitir scaffold de .agents-docs/
specflow init --dry-run       # vista previa sin escribir archivos
specflow init -C ./my-app     # directorio destino distinto
```

---

## Qué se instala

| Ruta | Gestionado por | Propósito |
|------|----------------|-----------|
| `AGENTS.md` | `init` / `sync` | Punto de entrada universal ([agents.md](https://agents.md/)) |
| `.agents/` | `init` / `sync` | Orquestador + 4 agentes — **no editar** |
| `.specflow-tools.json` | `init` / `sync` | Adaptadores IDE instalados |
| `.specflow-config.json` | `init` | Preferencias (`locale`, `includeDocs`, `stateDb`) |
| `.specflow-version` | `init` / `sync` | Versión del motor instalada |
| Archivos adapter | por herramienta | ej. `.cursor/rules/`, `CLAUDE.md` |
| `.agents-docs/` | **Tú** | Contexto del proyecto (manual) |
| `.agents-state/` | Runtime | Estado por tarea (gitignored) |

### Seguro editar

- `.agents-docs/**` — conocimiento de tu proyecto
- Tu código fuente (vía agente Implementer durante el flujo)

### No editar manualmente

- `.agents/**` — usa `specflow sync` para actualizar desde npm
- Stubs de adaptadores — gestionados por `init` / `sync` / `tools add`

---

## Después de instalar

1. Añade `.agents-state/` a `.gitignore` si no está
2. Completa [`.agents-docs/`](./project-documentation.md) cuando estés listo
3. Di **`nueva tarea`** o **`flow on`** en tu chat de IA

Con `stateDb` habilitado, el orquestador ejecuta `specflow state ensure` al activar el flujo. Ver [Context Engine](./context-engine.md).

### Campos de `.specflow-config.json`

| Campo | Descripción |
|-------|-------------|
| `locale` | `es` o `en` — idioma del asistente CLI |
| `includeDocs` | Si se crearon plantillas en `.agents-docs/` |
| `stateDb` | `true` → Context Engine (`state.db`); `false` → solo markdown en `current/` |
| `installedAt` | Marca ISO de la instalación |
| `manifestVersion` | Versión del manifest (actualmente `2`) |

---

## Actualizar SpecFlow

Cuando salga una nueva versión:

```bash
npx @ceatoleii/specflow status   # comprobar si está desactualizado
npx @ceatoleii/specflow sync     # actualizar motor + adaptadores
```

`sync` nunca sobrescribe `.agents-docs/`.

Ver [Solución de problemas](./troubleshooting.md) si sync se bloquea con una tarea activa.

---

[← Introducción](./introduction.md) · [Cómo funciona →](./how-it-works.md)
