---
description: Guía el flujo de una funcionalidad nueva: rama, prompt con la fórmula del taller, plan, evidencia y pull request.
argument-hint: <NN-nombre> (por ejemplo 13-ahorro)
---

Vamos a construir la funcionalidad **$ARGUMENTS** siguiendo el flujo del proyecto. Explica cada paso en palabras simples y no avances sin mi confirmación.

1. **Preparar.** Comprueba que `git status --short` esté vacío y que estemos en `main` actualizado. Propón la rama `feat/$ARGUMENTS` y la carpeta `docs/solicitudes/$ARGUMENTS/`.
2. **Prompt.** Ayúdame a redactarlo con la fórmula: *qué quiero, para quién, contexto, formato y restricciones*. Debe nombrar las skills de `.claude/skills/` que correspondan.
3. **Plan.** Pasa a modo plan y genera el plan (archivos, pasos, verificación y riesgos). Espera mi aprobación; no escribas código antes.
4. **Evidencia.** Tras aprobar, guarda el prompt en `prompt.md`, el plan sin editarlo en `plan.md` y crea `skills.md` con las skills usadas y para qué.
5. **Implementar** aplicando las skills indicadas.
6. **Verificar.** `npm run lint`, `npx next typegen`, `npx tsc --noEmit`, `npm test` y `npm run build`. Usa el subagente `revisor-seguridad` si hay tablas, acciones o autenticación, y `revisor-pull-request` antes de subir.
7. **Subir.** Muestra `git status --short -uall`, propón los `git add` con rutas exactas (nunca `git add .`), el commit y el push de la rama. Nada de `--force`. No fusiones a `main`: eso se hace con un pull request con el CI en verde.
