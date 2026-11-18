## Módulo o spec
<!-- Número y nombre, por ejemplo: 12 · Favoritos (módulo) o 01-ingresos (spec) -->

## Qué incluye
<!-- 3 a 5 viñetas de lo que hace -->
-

## Evidencia del proceso
- Módulos 1 a 13: `docs/solicitudes/NN-nombre/` (`prompt.md`, `plan.md`, `skills.md`)
- Specs: `docs/specs/NN-nombre/` (`spec.md`, `plan.md`, `tasks.md`, con las tareas marcadas)
- Skills usadas: <!-- de .claude/skills/ -->

## Cómo se probó
- [ ] `npm run lint`
- [ ] `npx next typegen` y `npx tsc --noEmit`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] Probado en pantalla (captura o descripción)

## Evidencia de calidad (specs)
- [ ] Las pruebas se subieron en un commit anterior al del código: <!-- enlace a cada commit -->
- [ ] El `probador` confirmó el Red (cada prueba falló por el motivo esperado)
- [ ] Informe de `revisor-pull-request` y, si toca tablas, acciones o autenticación, de `revisor-seguridad`
- [ ] Cada hallazgo tiene su decisión: aceptado (con el commit que lo arregla) o descartado (con la razón)

## Revisión del arnés
- [ ] El plan lo generó el modo plan y no se editó a mano
- [ ] Ningún archivo nuevo quedó sin subir (se revisaron los imports)
- [ ] Sin claves ni `.env.local` en los cambios
- [ ] Si hay tabla nueva: migración con seguridad por filas, indicada abajo

## Migración a ejecutar en Supabase
<!-- Nombre del archivo en supabase/migrations/, o «ninguna» -->
