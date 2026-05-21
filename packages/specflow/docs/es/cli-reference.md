# Referencia CLI

[← Cómo funciona](./how-it-works.md) · [English](../en/cli-reference.md)

---

## Global

```bash
specflow --version
specflow --help
```

Todos los comandos aceptan `-C, --cwd <dir>` para apuntar a otro directorio.

---

## `specflow init`

Instalación guiada interactiva.

```bash
specflow init [opciones]
```

| Opción | Descripción |
|--------|-------------|
| `-C, --cwd <dir>` | Directorio destino (default: actual) |
| `--no-docs` | Omitir scaffold de `.agents-docs/` |
| `--dry-run` | Vista previa sin escribir |

---

## `specflow sync`

Actualiza motor core y adaptadores IDE instalados. **Nunca** toca `.agents-docs/`.

```bash
specflow sync [opciones]
```

| Opción | Descripción |
|--------|-------------|
| `-C, --cwd <dir>` | Directorio destino |
| `--dry-run` | Vista previa |
| `-y, --yes` | Permitir sync con tarea de flujo activa |

---

## `specflow status`

Muestra versión instalada, adaptadores y estado del flujo.

```bash
specflow status [opciones]
```

| Opción | Descripción |
|--------|-------------|
| `-C, --cwd <dir>` | Directorio destino |

Exit code **1** si SpecFlow no está instalado en ese directorio.

La salida incluye: versión (actualizado / desactualizado / no instalado), adaptadores, si el flujo está activo, **config `stateDb`** (`stateDb=on` cuando existe `.specflow-config.json`) y estadísticas de **State DB** (sesiones activas/archivadas, id y fase) si hay `state.db`.

---

## `specflow tools`

Gestiona adaptadores IDE.

### `specflow tools list`

```bash
specflow tools list [-C, --cwd <dir>]
```

Muestra adaptadores instalados y disponibles desde `manifest.json`.

### `specflow tools add`

```bash
specflow tools add [opciones]
```

Interactivo. Instala archivos adapter para herramientas seleccionadas.

| Opción | Descripción |
|--------|-------------|
| `-C, --cwd <dir>` | Directorio destino |
| `--dry-run` | Vista previa |

### `specflow tools remove`

```bash
specflow tools remove [opciones]
```

Interactivo. Elimina archivos adapter seleccionados.

| Opción | Descripción |
|--------|-------------|
| `-C, --cwd <dir>` | Directorio destino |
| `--dry-run` | Vista previa |

---

## `specflow state`

Comandos de base de datos de estado (SQLite `state.db` en `.agents-state/`). Disponible en **1.3+**. La mayoría requiere `stateDb` habilitado en `.specflow-config.json`.

### `specflow state ensure`

```bash
specflow state ensure [-C, --cwd <dir>]
```

Inicializa `state.db` (solo esquema). Importa markdown legacy si aplica (ver [Context Engine](./context-engine.md)). Se ejecuta al activar el flujo si `stateDb` está habilitado.

### `specflow state status`

```bash
specflow state status [-C, --cwd <dir>]
```

Muestra sesión activa, fase y conteo de tareas.

### `specflow state query`

```bash
specflow state query --slice <nombre> [opciones]
```

| Opción | Descripción |
|--------|-------------|
| `--slice <nombre>` | **Requerido.** Uno de: `phase`, `task`, `active-task`, `criteria`, `decisions`, `sdd-summary` |
| `--json` | Salida JSON |
| `-C, --cwd <dir>` | Directorio destino |

### `specflow state search`

```bash
specflow state search <término> [-C, --cwd <dir>]
```

Búsqueda full-text en decisiones y mensajes de refinamiento.

### `specflow state migrate`

```bash
specflow state migrate [-C, --cwd <dir>]
```

Importa legacy `.agents-state/current/*.md` a `state.db`.

También corre en `init`, `sync` o `state ensure` cuando `stateDb` está habilitado, hay markdown legacy, el flujo está inactivo y la importación aún no se ejecutó.

### `specflow state export`

```bash
specflow state export [-C, --cwd <dir>]
```

Archiva la sesión activa en `.agents-state/history/`.

### `specflow state set-phase`

```bash
specflow state set-phase <fase> [-C, --cwd <dir>]
```

Establece fase del flujo. Actualiza `state.db` y shim `phase.md`.

`<fase>`: `refining` | `designing` | `implementing` | `reviewing`

### `specflow state sync-task`

```bash
specflow state sync-task --code <id> --status <estado> [-C, --cwd <dir>]
```

| Opción | Descripción |
|--------|-------------|
| `--code <id>` | Código de tarea, ej. `T01` |
| `--status <estado>` | `pending` \| `in_progress` \| `done` |

---

## Flujo de versiones

```bash
npx @ceatoleii/specflow status   # → up to date | outdated | not installed
npx @ceatoleii/specflow sync     # tras npm update @ceatoleii/specflow
```

`.specflow-version` registra la versión del motor. `status` indica cuándo sincronizar.

---

[← Cómo funciona](./how-it-works.md) · [Layout del proyecto →](./project-layout.md)
