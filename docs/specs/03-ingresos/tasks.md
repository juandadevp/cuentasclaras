# Tareas 03-ingresos

## Fase 1: Red (probador)
- [ ] T001 Escribir en `src/lib/ingresos.test.ts` las pruebas de CA-1 a CA-8 y confirmar que fallan por el motivo esperado.
- [ ] T002 Escribir en `src/lib/ingresos-errores.test.ts` las pruebas de CA-9.
- [ ] T003 Dejar las pruebas en su propio commit, antes del código.

## Fase 2: Green (implementador)
- [ ] T004 Tipos y lista de tipos de ingreso; exportar `esFechaReal`; implementar `src/lib/ingresos.ts` y `src/lib/ingresos-errores.ts` hasta que pasen las pruebas.
- [ ] T005 Migración `supabase/migrations/20261118000000_ingresos.sql` con seguridad por filas (ver, crear y borrar) y `src/lib/ingresos-servidor.ts`.
- [ ] T006 Acciones `crearIngreso` y `eliminarIngreso` en `src/app/panel/ingresos/actions.ts`.
- [ ] T007 Pantalla `/panel/ingresos` con formulario, lista y resumen, y el enlace «Ingresos» en el menú.
- [ ] T008 Tarjeta «Ahorro real del mes» en «Mi ahorro» y textos de «Mi ahorro» y de la Ayuda.
- [ ] T009 Refactorizar sin romper pruebas.

## Fase 3: Verificación y revisión
- [ ] T010 `npm run lint`, `npx next typegen`, `npx tsc --noEmit`, `npm test`, pruebas de los hooks y `npm run build`.
- [ ] T011 `revisor-seguridad` (tabla, acciones y datos por usuario) y `revisor-pull-request`; registrar qué se aceptó o se descartó.

## Fase 4: Cierre
- [ ] T012 Pull request con la plantilla, CI en verde y fusión a `main`.
