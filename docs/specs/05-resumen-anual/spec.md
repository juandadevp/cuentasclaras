# 05-resumen-anual: ver cómo cambia el año de gastos

## Qué se construye y por qué
«Inicio» muestra solo los últimos 6 meses y «Mis gastos» se mira mes a mes, así que nadie puede ver su año completo de un vistazo. Se agrega una pantalla **«Resumen anual»** que, para el año elegido, muestra el total gastado en cada mes, el desglose por categoría y unas cifras clave (total del año, promedio mensual y mes de mayor gasto). Se puede navegar entre años.

## Criterios de aceptación
- **CA-1.** Dado el año que pide la persona en la URL, cuando se decide qué año mostrar, entonces se usa ese año si es un número de cuatro cifras entre 2000 y el año de hoy; si no (vacío, texto, anterior a 2000, futuro o ausente), se usa el año de hoy.
- **CA-2.** Dado un año, cuando se piden sus meses, entonces salen los doce, de enero a diciembre, con el formato `AAAA-MM`.
- **CA-3.** Dados unos gastos y un año, cuando se resume, entonces el resultado trae siempre doce meses de enero a diciembre; los meses sin gastos quedan en 0 y los gastos de otros años no se cuentan.
- **CA-4.** Dados unos gastos y un año, cuando se resume, entonces el total es la suma de sus montos, la cantidad es cuántos son y el promedio mensual es el total dividido en 12, redondeado al peso.
- **CA-5.** Dados unos gastos y un año, cuando se resume por categoría, entonces solo salen las categorías con gastos, de mayor a menor total (y, si empatan, por nombre de categoría), cada una con su porcentaje del total del año redondeado a un entero.
- **CA-6.** Dados unos gastos y un año, cuando se calcula el mes de mayor gasto, entonces es el mes con el total más alto (si empatan, el primero del año) y es nulo si el año no tiene gastos.
- **CA-7.** Dado un año sin gastos, cuando se resume, entonces el total y la cantidad son 0, los doce meses están en 0, no hay categorías, el promedio es 0 y no hay mes de mayor gasto.
- **CA-8.** Dado un gasto del 31 de diciembre y otro del 1 de enero siguiente, cuando se resumen ambos años, entonces cada uno cuenta en el año que le corresponde.
- **CA-9.** Dada una persona con sesión, cuando abre `/panel/resumen-anual`, entonces ve el año con flechas para cambiar de año (sin pasar del año actual ni bajar de 2000), el total de cada mes dicho en texto (no solo con barras o colores), el desglose por categoría, un estado vacío claro si no hay gastos, un aviso si falla la consulta y un aviso si hay más de 5.000 gastos en el año (el resumen estaría incompleto); y el menú tiene un enlace «Resumen anual».

## Fuera de alcance
- Comparar un año con otro, exportar el resumen o mostrar ingresos y ahorro por mes.
- Elegir un rango distinto de un año calendario.
- Tabla nueva: el resumen se calcula con los gastos que ya existen.

## Preguntas resueltas
- **¿Dónde va?** En una ruta propia, `/panel/resumen-anual`, con su enlace en el menú. Decidido en la spec.
- **¿Qué años se pueden ver?** Desde 2000 hasta el año actual; no hay años futuros. Decidido en la spec.
- **¿Se cuentan los ingresos?** No: esta spec es de gastos. «Mi ahorro» ya muestra el ahorro real del mes.
- **¿Qué pasa con más de 5.000 gastos?** Se avisa que el resumen está incompleto, igual que «Mis gastos». Decidido en la spec.
