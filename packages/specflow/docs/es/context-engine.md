# Context Engine

[← Adaptadores IDE](./ide-adapters.md) · [English](../en/context-engine.md)

---

## Resumen

Desde **SpecFlow 1.3**, el estado del flujo puede vivir en SQLite (`.agents-state/state.db`) además de markdown en `.agents-state/current/`.

El Context Engine permite a los agentes consultar **slices** de estado en lugar de leer archivos completos — ahorra tokens y mantiene el contexto enfocado.

Los archivos markdown siguen como shim y fallback cuando no hay `state.db`.

---

## Uso por agentes

Con flujo activo y `state.db` presente, los agentes prefieren:

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

**Migración automática** en `init` o `sync` cuando:

- Existe markdown legacy en `current/`
- El flujo **no** está activo

**Migración manual:**

```bash
specflow state migrate
```

Importa `task.md`, `sdd.md`, `tasks.md`, `phase.md` y logs de refinamiento a `state.db`.

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

Sin `state.db`, los agentes leen markdown directamente. Proyectos antiguos e installs nuevos siguen funcionando sin migración.

---

## Cuándo migrar

| Situación | Acción |
|-----------|--------|
| Install nuevo (1.3+) | `state.db` se crea al iniciar flujo |
| Proyecto solo markdown | Ejecutar `sync` o `state migrate` |
| Flujo activo ahora | Terminar o desactivar flujo antes de migrar |

---

[← Adaptadores IDE](./ide-adapters.md) · [Principios de diseño →](./design-principles.md)
