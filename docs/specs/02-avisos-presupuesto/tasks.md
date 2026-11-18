# Tareas 02-avisos-presupuesto

## Fase 1: Red (probador)
- [ ] T001 Escribir en `src/lib/avisos-presupuesto.test.ts` las pruebas de CA-1 a CA-7 y confirmar que fallan por el motivo esperado.
- [ ] T002 Escribir las pruebas de CA-8 (`descripcionDeAviso` y `enlaceAPresupuesto`).
- [ ] T003 Dejar las pruebas en su propio commit, antes del código.

## Fase 2: Green (implementador)
- [ ] T004 Implementar `src/lib/avisos-presupuesto.ts` hasta que pasen las pruebas.
- [ ] T005 Crear `src/components/panel/AvisosPresupuesto.tsx`.
- [ ] T006 Cargar los límites en `src/components/panel/Inicio.tsx` y mostrar los avisos, con su propio aviso de error (CA-9).
- [ ] T007 Refactorizar sin romper pruebas.

## Fase 3: Verificación y revisión
- [ ] T008 `npm run lint`, `npx next typegen`, `npx tsc --noEmit`, `npm test`, pruebas de los hooks y `npm run build`.
- [ ] T009 `revisor-pull-request` y `revisor-seguridad`; registrar qué se aceptó o se descartó.

## Fase 4: Cierre
- [ ] T010 Pull request con la plantilla, CI en verde y fusión a `main`.
