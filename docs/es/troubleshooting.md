# Solución de problemas

[← Principios de diseño](./design-principles.md) · [English](../en/troubleshooting.md)

---

## FAQ

### ¿SpecFlow funciona sin `.agents-docs/`?

Sí. Los agentes tienen menos contexto y pueden preguntar más. Completa docs antes de tareas serias.

### ¿Puedo editar `.agents/rules/`?

No recomendado. `sync` sobrescribe cambios. Reglas específicas del proyecto van en `.agents-docs/`.

### ¿Commiteo `.agents-state/`?

No. Añádelo a `.gitignore`. Contiene estado runtime por tarea.

### ¿En qué idioma hablan los agentes?

Las reglas están en inglés. Puedes chatear en español o inglés. Las frases de activación funcionan en ambos.

---

## Problemas comunes

### `status` dice outdated

Hay una versión más nueva en npm.

```bash
npx @ceatoleii/specflow sync
```

### `sync` bloqueado — tarea de flujo activa

Sync no corre con tarea activa (salvo `--yes`):

```bash
specflow sync --yes
```

O desactiva el flujo: **`flow off`** / **`modo directo`**.

### `status` sale con código 1

SpecFlow no está instalado en ese directorio. Ejecuta `init` primero.

### El agente ignora el flujo / fase incorrecta

Comprueba:

1. Existe `.agents-state/.flow-enabled`
2. `.agents-state/current/phase.md` tiene fase válida
3. Tu adapter IDE está instalado (`specflow tools list`)
4. No borraste el archivo adapter manualmente

Reset: **`flow off`**, luego **`nueva tarea`**.

### Implementación empezó sin `/approve`

El SDD debe esperar aprobación. Si hubo cambios no deseados, **`flow off`**, revierte y reinicia la tarea.

### La revisión falla verificación

Revisa comandos en `.agents-docs/verification.md`. Corrige tests/lint y continúa en implementing o reinicia review.

### `init` se cancela al instante

El asistente requiere terminal interactiva. Ejecuta en TTY real, no en CI no interactivo.

---

## Ayuda

- [GitHub Issues](https://github.com/ceatoleii/specflow/issues)
- [Changelog](../../CHANGELOG.md)

---

[← Principios de diseño](./design-principles.md) · [Índice](./README.md)
