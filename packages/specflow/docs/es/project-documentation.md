# Documentación del proyecto

[← Layout del proyecto](./project-layout.md) · [English](../en/project-documentation.md)

---

## ¿Qué es `.agents-docs/`?

`.agents-docs/` es el **único** directorio pensado para diferir entre proyectos. Contiene hechos sobre *tu* codebase — stack, convenciones, cómo verificar cambios.

SpecFlow funciona sin él, pero los agentes tienen menos contexto y pueden hacer más preguntas o perder patrones del proyecto.

Las plantillas se crean en `init` salvo que uses `--no-docs`.

---

## Archivos

| Archivo | Leído por | Contenido |
|---------|-----------|-----------|
| `architecture.md` | Refiner, SDD | Stack, estructura, reglas de arquitectura, servicios externos |
| `conventions.md` | Implementer, Reviewer | Nombres, patrones, anti-patrones, estilo |
| `verification.md` | Reviewer | Comandos test, lint, build y exit codes esperados |
| `design-system.md` | SDD, Implementer | Tokens UI, componentes, accesibilidad (opcional) |

### `architecture.md`

Responde: *¿Qué es este proyecto y cómo está organizado?*

Incluye nombre, tipo, lenguaje, framework, estructura de carpetas, reglas de arquitectura y servicios externos.

### `conventions.md`

Responde: *¿Cómo debe verse el código en este repo?*

Incluye convenciones de nombres, patrones preferidos, anti-patrones, estilo de imports y manejo de errores.

### `verification.md`

Responde: *¿Cómo sabemos que un cambio es correcto?*

Incluye comandos en orden, exit codes esperados, umbrales de coverage y notas de CI.

El agente Reviewer ejecuta estos comandos en la fase reviewing.

### `design-system.md` (opcional)

Responde: *¿Cómo debe verse y comportarse la UI?*

Incluye tokens, librería de componentes, espaciado, tipografía y accesibilidad. Borra el archivo si no hay UI.

---

## Cuándo completarlo

| Momento | Recomendación |
|---------|---------------|
| En `init` | Mantén plantillas — edita al usar el flujo |
| Antes de la primera tarea real | Mínimo `architecture.md` y `verification.md` |
| Proyectos front-end | Añade o completa `design-system.md` |

---

## Qué no toca `sync`

```bash
specflow sync   # nunca sobrescribe .agents-docs/
```

Tu documentación sobrevive a actualizaciones del motor. Compara cambios upstream manualmente si hace falta.

---

## Consejos

1. **Sé concreto** — “Usar React Query para server state” gana a “seguir buenas prácticas”
2. **Mantén verification al día** — comandos obsoletos fallan la revisión
3. **Rutas reales** — `src/features/auth/` no “el módulo auth en algún sitio”
4. **Borra lo que no uses** — elimina `design-system.md` en proyectos solo backend

---

[← Layout del proyecto](./project-layout.md) · [Adaptadores IDE →](./ide-adapters.md)
