# Context Engine

[← Adaptadores IDE](./ide-adapters.md) · [English](../en/context-engine.md)

---

## Resumen

Desde **SpecFlow 1.3**, el estado del flujo puede vivir en SQLite (`.agents-state/state.db`) además de markdown en `.agents-state/current/`.

El Context Engine permite a los agentes consultar **slices** de estado en lugar de leer archivos completos — ahorra tokens y mantiene el contexto enfocado.

Si los agentes usan la base de datos lo define **`.specflow-config.json`** → `stateDb` (por defecto `true` en installs nuevos). Con `stateDb: true`, el markdown en `current/` es shim sincronizado desde `state.db`. Con `stateDb: false`, los agentes solo leen y escriben markdown (sin `state query` ni migración automática).

---

## Configuración (`stateDb`)

| `stateDb` | Comportamiento | `state.db` |
|-----------|----------------|------------|
| `true` (default) | Prefieren `specflow state query` | Se crea al activar flujo vía `state ensure` |
| `false` | Solo `.agents-state/current/*.md` | No se usa |

Se define en `init` (paso del asistente; releases actuales pueden activarlo por defecto sin mostrar el paso). Se guarda en `.specflow-config.json` junto a `locale` e `includeDocs`.

---

## Bootstrap (`state ensure`)

Al activar el flujo (`nueva tarea`, `flow on`, …), el orquestador ejecuta:

```bash
specflow state ensure
```

si `stateDb` está habilitado. Este comando:

- Crea o abre `state.db` y aplica el esquema
- Ejecuta import legacy **condicional** (ver Migración)
- **No** inicia una sesión nueva por sí solo

Puedes ejecutar `specflow state ensure` manualmente tras `init` para preparar la base antes de la primera tarea.

---

## Uso por agentes

Con flujo activo, `stateDb` habilitado y `state.db` presente, los agentes prefieren:

```bash
specflow state query --slice task
specflow state query --slice active-task
specflow state query --slice sdd-summary
```

En lugar de leer `task.md`, `tasks.md` o `sdd.md` enteros.

Slices disponibles:

| Slice | Contenido |
|-------|-----------|
| `phase` | Fase actual del flujo |
| `task` | Definición completa de tarea |
| `active-task` | Tarea de implementación actual |
| `criteria` | Criterios de aceptación |
| `decisions` | Decisiones de diseño del SDD |
| `sdd-summary` | SDD condensado para Implementer |

Añade `--json` para salida machine-readable.

---

## Migración desde markdown

Proyectos legacy guardan estado solo en `.agents-state/current/*.md`.

**Migración automática** en `init`, `sync` o `state ensure` cuando se cumplen **todas** estas condiciones:

- `stateDb` habilitado en `.specflow-config.json`
- Existe markdown legacy en `current/`
- El flujo **no** está activo (sin `.flow-enabled`)
- La importación aún no se ejecutó en este proyecto

**Migración manual:**

```bash
specflow state migrate
```

Importa `task.md`, `sdd.md`, `tasks.md`, `phase.md` y logs de refinamiento a `state.db`. Requiere `stateDb` habilitado; se omite con flujo activo.

---

## Gestión de sesión

### Ver estado

```bash
specflow state status
```

### Buscar en historial

```bash
specflow state search "autenticación"
```

### Exportar archivo

```bash
specflow state export
```

Mueve la sesión activa a `.agents-state/history/`.

### Actualizar fase o tareas

```bash
specflow state set-phase implementing
specflow state sync-task --code T01 --status done
```

Actualiza `state.db` y shim `phase.md`.

---

## Fallback markdown

Los agentes usan solo markdown cuando:

- `stateDb` es `false` en `.specflow-config.json`, o
- `state.db` aún no existe y no se ejecutó `state ensure`

Proyectos pre-1.2 sin `.specflow-config.json` se comportan como solo-markdown hasta `init` o `sync`.

---

## Cuándo migrar

| Situación | Acción |
|-----------|--------|
| Install nuevo con `stateDb: true` | `state.db` al primer `state ensure` (activación de flujo o manual) |
| Proyecto solo markdown | `specflow state migrate`, o `sync` / `state ensure` con flujo inactivo |
| `stateDb: false` | Sin migración — seguir con markdown |
| Flujo activo ahora | Terminar o desactivar flujo antes de migrar |

---

[← Adaptadores IDE](./ide-adapters.md) · [Principios de diseño →](./design-principles.md)
