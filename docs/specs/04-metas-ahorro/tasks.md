# Tareas 04-metas-ahorro

## Fase 1: Red (probador)
- [ ] T001 Escribir en `src/lib/metas-ahorro.test.ts` las pruebas de CA-1 a CA-8 y confirmar que fallan por el motivo esperado.
- [ ] T002 Escribir en `src/lib/metas-ahorro-errores.test.ts` las pruebas de CA-9.
- [ ] T003 Dejar las pruebas en su propio commit, antes del código.

## Fase 2: Green (implementador)
- [ ] T004 Implementar `src/lib/metas-ahorro.ts` y `src/lib/metas-ahorro-errores.ts` hasta que pasen las pruebas.
- [ ] T005 Migración `supabase/migrations/20261118010000_metas_ahorro.sql` con seguridad por filas y `src/lib/metas-ahorro-servidor.ts`.
- [ ] T006 Acciones `fijarMetaAhorro` y `quitarMetaAhorro` en `src/app/panel/ahorro/actions.ts`.
- [ ] T007 Tarjeta «Meta de ahorro» con formulario, botón de quitar y barra accesible, integrada en `Ahorro.tsx`.
- [ ] T008 Refactorizar sin romper pruebas.

## Fase 3: Verificación y revisión
- [ ] T009 `npm run lint`, `npx next typegen`, `npx tsc --noEmit`, `npm test`, pruebas de los hooks y `npm run build`.
- [ ] T010 `revisor-seguridad` (tabla, acciones y datos por usuario) y `revisor-pull-request`; registrar qué se aceptó o se descartó.

## Fase 4: Cierre
- [ ] T011 Pull request con la plantilla, CI en verde y fusión a `main`.
