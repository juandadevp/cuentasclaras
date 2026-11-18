---
description: "Guía una spec completa con desarrollo guiado por especificaciones: spec, plan, tareas, pruebas primero, código, revisores y pull request."
argument-hint: "<NN-nombre> (por ejemplo 01-ingresos)"
---

Vamos a construir la spec **$ARGUMENTS** con el sistema de agentes del proyecto. Explica cada paso en palabras simples y **no avances al siguiente sin mi confirmación**. Tú eres el orquestador: coordinas y no programas; el código lo escribe el `implementador` y las pruebas el `probador`.

1. **Preparar.** Comprueba que `git status --short` esté vacío y que estemos en `main` actualizado. Propón la rama `feat/$ARGUMENTS` y la carpeta `docs/specs/$ARGUMENTS/` (copia las tres plantillas de `docs/specs/_plantilla/`).
2. **Spec.** Ayúdame a escribir `spec.md`: qué se construye y por qué, criterios de aceptación numerados (CA-1, CA-2…) que se puedan verificar, lo que queda fuera de alcance. Espera mi aprobación.
3. **Explorar.** Pide al subagente `explorador` que busque lo que ya existe para reutilizar.
4. **Plan.** Pasa a modo plan y genera `plan.md` (decisiones, archivos, tabla criterio → prueba, riesgos). **No lo edites a mano.** Espera mi aprobación; sin ella no se escribe código.
5. **Tareas.** Crea `tasks.md` con las fases Red, Green, Verificación y Cierre.
6. **Red.** Delega en el subagente `probador` las pruebas de los criterios. Comprueba su evidencia (cada prueba falla por el motivo esperado). Sube las pruebas en **su propio commit**, antes del código.
7. **Green.** Delega en el subagente `implementador` el código. Si falla la verificación, máximo 2 vueltas; después te detienes y me preguntas.
8. **Revisar.** Delega en `revisor-pull-request` (siempre) y en `revisor-seguridad` (si hay tablas, acciones o autenticación). Anota cada hallazgo y qué se decidió: aceptado (con el commit que lo arregla) o descartado (con la razón). Los hallazgos sobre pruebas vuelven al `probador`; los de código, al `implementador`.
9. **Cerrar.** Marca `[X]` solo las tareas con evidencia. Muestra `git status --short -uall`, propón los `git add` con rutas exactas (nunca `git add .`), los commits y el push de la rama. Abre el pull request con la plantilla. **No fusiones a `main`**: eso lo hago yo cuando el CI esté en verde.
