# Plan 13-ahorro

## Qué se hizo
- `src/lib/ahorro.ts` (lógica pura): `filasDeAhorro` (compara cada mes con el anterior y descarta los meses vacíos del principio), `cambiosPorCategoria`, `categoriasQueBajaron` y `ahorroContraPresupuesto` (reutiliza `resumirPresupuestos` y `progresoPresupuesto` del módulo 6). Con 19 pruebas en `src/lib/ahorro.test.ts`.
- `src/components/panel/Ahorro.tsx` y `src/app/panel/ahorro/page.tsx`: una sola consulta de gastos para los 6 meses (de ahí salen el total de cada mes y las categorías de este mes y del anterior) y otra de presupuestos, en paralelo. Detrás de `Suspense` y `connection()`.
- Enlace «Mi ahorro» al final de la sección «Gastos» del menú, miga de pan en `MarcoPanel.tsx` y pregunta «¿Qué es «Mi ahorro»?» en la página de Ayuda.

## Diferencias con v1
- Se revisan todos los errores de carga (v1 ignoraba el del mes anterior) y se avisa si hay más de 5.000 gastos.
- Nueva tarjeta «Frente a tu presupuesto», que une este módulo con el 6.
- Una sola consulta de gastos en lugar de tres.
- El estado se dice con texto y flecha (▼ Ahorraste, ▲ más), no solo con color, y se aclara que no incluye ingresos.
- No hay migración nueva ni skills de tablas o acciones: solo se leen datos.

## Verificación
`lint`, `tsc`, `npm test` (27 archivos, 699 pruebas) y `npm run build` pasan. La ruta `/panel/ahorro` aparece en el build.

## Pendiente para el equipo
Probar con una cuenta real y gastos de varios meses: mes en curso con menos y con más gasto que el anterior, un mes sin gastos entre dos con gastos, cambio diciembre ↔ enero, con y sin límites de presupuesto, una categoría excedida y el aspecto a 375 px de ancho.

## Riesgos
El mes en curso está incompleto, así que casi siempre parece «ahorro» (se avisa en pantalla); sin ingresos el ahorro es relativo; con más de 5.000 gastos algunos meses salen incompletos (se avisa); la tarjeta de presupuesto solo cuenta las categorías con límite.
