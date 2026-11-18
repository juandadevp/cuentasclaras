# Tareas 01-exportar-csv

## Fase 1: Red (probador)
- [X] T001 Escribir en `src/lib/exportar-csv.test.ts` las pruebas de CA-1 a CA-7 y confirmar que fallan por el motivo esperado.
- [X] T002 Escribir las pruebas de CA-8, CA-9 y CA-10 (`codigoDeExportacion` y `enlaceExportarCsv`).
- [X] T003 Dejar las pruebas en su propio commit, antes del código.

## Fase 2: Green (implementador)
- [X] T004 Implementar `src/lib/exportar-csv.ts` hasta que pasen las pruebas.
- [X] T005 Crear el Route Handler `src/app/panel/gastos/exportar/route.ts`.
- [X] T006 Agregar el enlace «Exportar CSV» en `src/components/panel/Gastos.tsx`.
- [X] T007 Refactorizar sin romper pruebas.

## Fase 3: Verificación y revisión
- [X] T008 `npm run lint`, `npx next typegen`, `npx tsc --noEmit`, `npm test`, pruebas de los hooks y `npm run build`.
- [X] T009 `revisor-seguridad` (la ruta lee datos de la persona y genera archivos) y `revisor-pull-request`; registrar qué se aceptó o se descartó.

## Fase 4: Cierre
- [ ] T010 Pull request con la plantilla, CI en verde y fusión a `main`.
