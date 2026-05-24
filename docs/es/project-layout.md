# Layout del proyecto

[← Referencia CLI](./cli-reference.md) · [English](../en/project-layout.md)

---

Tras `specflow init`, la raíz de tu repositorio suele verse así:

```
your-project/
├── AGENTS.md                 # Entrada universal (estándar agents.md)
├── .specflow-version         # Versión del motor instalada
├── .specflow-config.json     # locale, includeDocs (init)
├── .specflow-tools.json      # Adaptadores IDE instalados
│
├── .agents/                  # Motor SpecFlow — gestionado por init/sync
│   ├── rules/
│   │   ├── orchestrator.md
│   │   ├── refiner.md
│   │   ├── implementer.md
│   │   └── reviewer.md
│   └── templates/
│       ├── plan-template.md
│       ├── tasks-template.md
│       ├── review-template.md
│       └── sdd-template.md      # deprecated
│
├── .agents-docs/             # TU conocimiento del proyecto (manual)
│   ├── architecture.md
│   ├── conventions.md
│   ├── verification.md
│   └── design-system.md      # opcional — borrar si N/A
│
├── .agents-state/            # Runtime — añadir a .gitignore
│   ├── .flow-enabled
│   ├── current/              # Artefactos de tarea activa (fuente de verdad)
│   │   ├── phase.md
│   │   ├── task.md
│   │   ├── plan.md
│   │   ├── tasks.md
│   │   └── review.md
│   └── history/              # Sesiones archivadas (YYYY-MM-DD-slug/)
│
└── .cursor/                  # Ejemplo adapter (si elegiste Cursor)
    └── rules/
        └── _specflow.mdc
```

Otros adaptadores añaden sus archivos — ver [Adaptadores IDE](./ide-adapters.md).

---

## Roles de directorios

### Gestionado por SpecFlow (`init` / `sync`)

| Ruta | ¿Se actualiza en sync? |
|------|:----------------------:|
| `AGENTS.md` | Sí |
| `.agents/**` | Sí |
| `.specflow-version` | Sí |
| `.specflow-tools.json` | Sí |
| Stubs de adaptadores | Sí (solo instalados) |

### Propio tuyo

| Ruta | Notas |
|------|-------|
| `.agents-docs/**` | Nunca sobrescrito por sync |
| Código fuente | Solo Implementer durante el flujo |
| `.gitignore` | Añade `.agents-state/` |

### Solo runtime

| Ruta | Notas |
|------|-------|
| `.agents-state/**` | Estado por tarea; seguro borrar si inactivo |
| `.specflow-config.json` | Escrito en init (`locale`, `includeDocs`) |

---

## `.gitignore` recomendado

```gitignore
.agents-state/
```

Commitea lo demás que instala SpecFlow — el equipo usa `sync` para alinear versiones del motor.

---

[← Referencia CLI](./cli-reference.md) · [Documentación del proyecto →](./project-documentation.md)
