# 01-exportar-csv: exportar los gastos a un archivo CSV

## Qué se construye y por qué
Quien lleva sus cuentas en Cuentas Claras quiere poder sacar sus gastos de la aplicación para abrirlos en Excel o en Google Sheets, guardarlos como respaldo o compartirlos con quien lleva la contabilidad. Se agrega un botón «Exportar CSV» en «Mis gastos» que descarga los gastos que la persona está viendo (con el mismo mes, búsqueda y categoría que tiene aplicados).

## Criterios de aceptación
- **CA-1.** Dado una lista de gastos, cuando se genera el CSV, entonces la primera fila trae los encabezados `fecha,descripcion,categoria,tienda,monto` y después va una fila por gasto, en el mismo orden de la lista.
- **CA-2.** Dado un gasto cuya descripción o tienda contiene comas, comillas o saltos de línea, cuando se genera el CSV, entonces ese campo va entre comillas y las comillas internas se duplican, de modo que una hoja de cálculo lo lea como una sola celda.
- **CA-3.** Dado un texto que empieza por `=`, `+`, `-` o `@`, cuando se genera el CSV, entonces se le antepone una comilla simple (`'`) para que una hoja de cálculo no lo ejecute como fórmula (inyección en CSV).
- **CA-4.** Dado un gasto, cuando se genera el CSV, entonces la categoría sale con su etiqueta en español (por ejemplo «Alimentación»), la fecha en formato `AAAA-MM-DD` y el monto como número, con punto decimal, sin separador de miles ni símbolo de moneda (`125000` o `12500.5`).
- **CA-5.** Dado una lista vacía, cuando se genera el CSV, entonces solo trae la fila de encabezados.
- **CA-6.** Dado el CSV generado, entonces empieza con la marca BOM de UTF-8 (`﻿`) y usa saltos de línea `\r\n`, para que Excel muestre bien las tildes.
- **CA-7.** Dado el mes que la persona tiene elegido (o «todos»), cuando se calcula el nombre del archivo, entonces es `gastos-AAAA-MM.csv` para un mes y `gastos-todos.csv` para todos.
- **CA-8.** Dado una persona sin sesión, cuando pide la descarga, entonces no recibe ningún dato: el proxy la lleva a `/login` y, si la petición llegara a la ruta, esta responde 401. Nunca se ven gastos de otra persona.
- **CA-9.** Dado una persona con sesión, cuando pulsa «Exportar CSV» en «Mis gastos», entonces descarga un archivo con los gastos que está viendo (mismo mes, búsqueda y categoría), y el botón es un enlace accesible con texto claro.
- **CA-10.** Dado que la lista a exportar supera el tope de 5.000 gastos que lee la aplicación, cuando se pide la descarga, entonces no se entrega un archivo incompleto: la ruta responde 422 con un mensaje que pide elegir un mes o filtrar.

## Fuera de alcance
- Importar gastos desde un CSV.
- Exportar a Excel (`.xlsx`) o a PDF.
- Elegir columnas o el separador (siempre coma).

## Preguntas resueltas
- **¿Coma o punto y coma como separador?** Coma, que es el estándar de CSV; la marca BOM hace que Excel abra bien el archivo. Decidido en la spec (18/11/2026).
- **¿Y si hay más de 5.000 gastos?** No se entrega un CSV recortado en silencio: se responde 422 con un mensaje claro (CA-10). Decidido tras el informe del `explorador`.
- **¿Dónde va la ruta?** En `src/app/panel/gastos/exportar/route.ts`, bajo `/panel`, que el proxy ya protege (CA-8). Decidido tras el informe del `explorador`.
- **¿Qué se exporta?** Lo que la persona está viendo, con los mismos filtros de «Mis gastos»; si quiere todo, elige «todos». Decidido en la spec.
