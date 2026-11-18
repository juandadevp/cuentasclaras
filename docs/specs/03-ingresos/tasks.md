# Tareas 03-ingresos

## Fase 1: Red (probador)
- [X] T001 Escribir en `src/lib/ingresos.test.ts` las pruebas de CA-1 a CA-8 y confirmar que fallan por el motivo esperado.
- [X] T002 Escribir en `src/lib/ingresos-errores.test.ts` las pruebas de CA-9.
- [X] T003 Dejar las pruebas en su propio commit, antes del código.

## Fase 2: Green (implementador)
- [X] T004 Tipos y lista de tipos de ingreso; exportar `esFechaReal`; implementar `src/lib/ingresos.ts` y `src/lib/ingresos-errores.ts` hasta que pasen las pruebas.
- [X] T005 Migración `supabase/migrations/20261118000000_ingresos.sql` con seguridad por filas (ver, crear y borrar) y `src/lib/ingresos-servidor.ts`.
- [X] T006 Acciones `crearIngreso` y `eliminarIngreso` en `src/app/panel/ingresos/actions.ts`.
- [X] T007 Pantalla `/panel/ingresos` con formulario, lista y resumen, y el enlace «Ingresos» en el menú.
- [X] T008 Tarjeta «Ahorro real del mes» en «Mi ahorro» y textos de «Mi ahorro» y de la Ayuda.
- [X] T009 Refactorizar sin romper pruebas.

## Fase 3: Verificación y revisión
- [X] T010 `npm run lint`, `npx next typegen`, `npx tsc --noEmit`, `npm test`, pruebas de los hooks y `npm run build`.
- [X] T011 `revisor-seguridad` (tabla, acciones y datos por usuario) y `revisor-pull-request`; registrar qué se aceptó o se descartó.

## Fase 4: Cierre
- [ ] T012 Pull request con la plantilla, CI en verde y fusión a `main`.
