# 13-ahorro: Mi ahorro

Reconstruir la pantalla «Mi ahorro» de `legacy/v1`, sin inteligencia artificial, y conectarla con el presupuesto del módulo 6: comparar cada mes con el anterior y ver cuánto se ahorra frente a los límites fijados.

- Pantalla «Mi ahorro» en `/panel/ahorro` con tres bloques:
  - «Ahorro mes a mes»: los últimos 6 meses, del más reciente al más antiguo. Cada mes muestra lo gastado y la diferencia con el mes anterior (gastó menos, gastó más, igual o sin mes con qué comparar). El mes en curso se marca como incompleto.
  - «Categorías: este mes vs. el anterior»: lo gastado en cada categoría este mes y el anterior, y en cuáles se gasta menos.
  - «Frente a tu presupuesto»: de los límites del mes, cuánto se presupuestó, cuánto se gastó en esas categorías, cuánto sobra (o cuánto se pasó) y qué categorías excedieron su límite.
- No hay ingresos en la aplicación: «ahorro» es lo gastado de menos frente al mes anterior o frente a los límites, y la pantalla lo aclara.
- Enlace «Mi ahorro» al final de la sección «Gastos» del menú lateral, miga de pan y una pregunta en la página de Ayuda.
- Sin tablas nuevas (solo lee `gastos` y `presupuestos`). Si falta alguna tabla, aviso claro que pida ejecutar la migración. Pruebas con vitest de la lógica pura. Sin dependencias nuevas, textos en español, sin IA.

Skills usadas: `crear-pantalla-panel`, `escribir-pruebas`, `vercel-react-best-practices`.
