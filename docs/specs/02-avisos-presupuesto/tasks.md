# Tareas 02-avisos-presupuesto

## Fase 1: Red (probador)
- [X] T001 Escribir en `src/lib/avisos-presupuesto.test.ts` las pruebas de CA-1 a CA-7 y confirmar que fallan por el motivo esperado.
- [X] T002 Escribir las pruebas de CA-8 (`descripcionDeAviso` y `enlaceAPresupuesto`).
- [X] T003 Dejar las pruebas en su propio commit, antes del código.

## Fase 2: Green (implementador)
- [X] T004 Implementar `src/lib/avisos-presupuesto.ts` hasta que pasen las pruebas.
- [X] T005 Crear `src/components/panel/AvisosPresupuesto.tsx`.
- [X] T006 Cargar los límites en `src/components/panel/Inicio.tsx` y mostrar los avisos, con su propio aviso de error (CA-9).
- [X] T007 Refactorizar sin romper pruebas.

## Fase 3: Verificación y revisión
- [X] T008 `npm run lint`, `npx next typegen`, `npx tsc --noEmit`, `npm test`, pruebas de los hooks y `npm run build`.
- [X] T009 `revisor-pull-request` y `revisor-seguridad`; registrar qué se aceptó o se descartó.

## Fase 4: Cierre
- [X] T010 Pull request con la plantilla (#34), CI en verde y fusión a `main`.
