# 02-avisos-presupuesto: avisos cuando una categoría se acerca a su límite

## Qué se construye y por qué
Quien fija límites en «Presupuesto» solo se entera de que se está pasando si entra a esa pantalla. Se agrega, en el **inicio del panel**, una sección de avisos que dice qué categorías del mes están cerca de su límite (desde el 80 %) o ya lo superaron, con un enlace a «Presupuesto». Reutiliza las reglas que ya usa «Presupuesto» (`progresoPresupuesto`), para que ambas pantallas digan lo mismo.

## Criterios de aceptación
- **CA-1.** Dado una categoría con límite y lo gastado por debajo del 80 % de ese límite, cuando se calculan los avisos, entonces esa categoría no genera aviso.
- **CA-2.** Dado lo gastado exactamente en el 80 % del límite, cuando se calculan los avisos, entonces genera un aviso de estado «cerca del límite».
- **CA-3.** Dado lo gastado exactamente igual al límite (100 %), cuando se calculan los avisos, entonces el estado sigue siendo «cerca del límite» y no «excedido», igual que en «Presupuesto».
- **CA-4.** Dado lo gastado por encima del límite, cuando se calculan los avisos, entonces genera un aviso «excedido» que incluye cuánto se pasó.
- **CA-5.** Dados varios avisos, cuando se ordenan, entonces salen primero los excedidos y después los cercanos; dentro de cada grupo, primero el de mayor porcentaje de uso.
- **CA-6.** Dado una categoría sin límite en el mes, cuando se calculan los avisos, entonces no genera aviso, aunque tenga muchos gastos.
- **CA-7.** Dado que no hay límites fijados en el mes, o que hay límites pero ningún gasto, cuando se calculan los avisos, entonces no aparece ninguna sección de avisos en el inicio.
- **CA-8.** Dado un aviso, cuando se muestra en el inicio, entonces dice la categoría, lo gastado, el límite y el estado con **texto** (no solo con color), y ofrece un enlace a «Presupuesto» del mismo mes.
- **CA-9.** Dado que falla la consulta de los límites, cuando se carga el inicio, entonces el inicio sigue funcionando y muestra el aviso de error que ya existe, sin romper las demás tarjetas.

## Fuera de alcance
- Correos o notificaciones del navegador, avisos al registrar un gasto o una marca en el menú.
- Avisos de meses anteriores o futuros: solo el mes actual.
- Cambiar el umbral del 80 %, que es fijo.
- Poder descartar un aviso: desaparece solo cuando la categoría vuelve a estar por debajo del 80 %.

## Preguntas resueltas
- **¿Dónde aparece el aviso?** Solo en el inicio del panel. Decidido por el equipo (18/11/2026).
- **¿Qué umbral?** El 80 % fijo, el mismo que usa «Presupuesto» para decir «cerca». Decidido en la spec.
- **¿Se puede descartar?** No: es la opción más simple y el aviso se va solo cuando deja de ser cierto. Decidido en la spec.
