# Tareas NN-nombre

> Plantilla. Cada tarea se marca `[X]` solo cuando tiene evidencia (prueba en verde, commit o informe). El orden respeta TDD: primero Red, después Green.

## Fase 1: Red (probador)
- [ ] T001 Escribir las pruebas de CA-1 en `src/lib/….test.ts` y confirmar que fallan por el motivo esperado.
- [ ] T002 Escribir las pruebas de CA-2 y CA-3.
- [ ] T003 Dejar las pruebas en su propio commit, antes del código.

## Fase 2: Green (implementador)
- [ ] T004 Implementar la lógica en `src/lib/….ts` hasta que pasen las pruebas.
- [ ] T005 Pantalla o acción en `src/…`.
- [ ] T006 Refactorizar sin romper pruebas.

## Fase 3: Verificación y revisión
- [ ] T007 `npm run lint`, `npx next typegen`, `npx tsc --noEmit`, `npm test` y `npm run build`.
- [ ] T008 `revisor-seguridad` (si toca tablas, acciones o autenticación) y `revisor-pull-request`; registrar sus hallazgos y qué se aceptó o se descartó.

## Fase 4: Cierre
- [ ] T009 Pull request con la plantilla completa, CI en verde y fusión a `main`.
