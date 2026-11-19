# Tareas 05-resumen-anual

## Fase 1: Red (probador)
- [ ] T001 Escribir en `src/lib/resumen-anual.test.ts` las pruebas de CA-1 a CA-8 y confirmar que fallan por el motivo esperado.
- [ ] T002 Dejar las pruebas en su propio commit, antes del código.

## Fase 2: Green (implementador)
- [ ] T003 Implementar `src/lib/resumen-anual.ts` hasta que pasen las pruebas.
- [ ] T004 Pantalla `src/app/panel/resumen-anual/page.tsx` y `src/components/panel/ResumenAnual.tsx` (meses con texto, categorías, vacío, avisos, flechas de año).
- [ ] T005 Enlace «Resumen anual» y nombre de ruta en `MarcoPanel.tsx`.
- [ ] T006 Refactorizar sin romper pruebas.

## Fase 3: Verificación y revisión
- [ ] T007 `npm run lint`, `npx next typegen`, `npx tsc --noEmit`, `npm test`, pruebas de los hooks y `npm run build`.
- [ ] T008 `revisor-pull-request`; registrar qué se aceptó o se descartó (sin `revisor-seguridad`: no hay tablas, acciones ni autenticación nuevas).

## Fase 4: Cierre
- [ ] T009 Pull request con la plantilla, CI en verde y fusión a `main`.
