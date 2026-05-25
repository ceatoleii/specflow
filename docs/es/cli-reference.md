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

La salida incluye: versión (actualizado / desactualizado / no instalado), adaptadores, si el flujo está activo, y **config de locale** (`locale=es` o `locale=en`) cuando existe `.specflow-config.json`.

---

## `specflow doctor`

Verifica instalación de SpecFlow, `.gitignore`, plantillas y (con flujo activo) artefactos requeridos para la fase actual.

```bash
specflow doctor [opciones]
```

| Opción | Descripción |
|--------|-------------|
| `-C, --cwd <dir>` | Directorio destino |
| `--run` | Ejecuta comandos bash de `.agents-docs/verification.md` |
| `--json` | Salida JSON |

Exit code **1** si hay checks con severidad `error`. Solo warnings → exit **0**.

Con flujo activo valida `phase.md` y archivos por fase (`task.md`, `plan.md` o `sdd.md` legacy, `tasks.md`).

---

## `specflow linear setup`

Configura la sincronización opcional con Linear (solo MCP en Cursor).

```bash
specflow linear setup
specflow linear setup --enable
specflow linear setup --disable
```

Escribe `.specflow-linear.json` con el mapeo de estados (por defecto: Todo → In Progress → Done). Requiere el plugin Linear en Cursor.

Iniciar tarea enlazada: `nueva tarea desde TEAM-123` o pegar la URL del issue.

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

## Flujo de versiones

```bash
npx @ceatoleii/specflow status   # → up to date | outdated | not installed
npx @ceatoleii/specflow sync     # tras npm update @ceatoleii/specflow
```

`.specflow-version` registra la versión del motor. `status` indica cuándo sincronizar.

---

[← Cómo funciona](./how-it-works.md) · [Layout del proyecto →](./project-layout.md)
