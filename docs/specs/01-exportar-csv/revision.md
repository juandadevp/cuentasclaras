# 01-exportar-csv: evidencia de calidad

## Historial (las pruebas van antes del código)
| Commit | Qué es |
|---|---|
| `b3ee4d5`, `2995078` | Spec (y su ajuste tras la exploración). |
| `f73fb7d` | Plan (idéntico al aprobado en modo plan) y tareas. |
| `d112390` | **Red:** 48 pruebas, sin código. |
| `145cb53` | **Green:** `exportar-csv.ts`, la ruta y el botón. |
| `fcbfc75` | **Red de la ronda de arreglos:** 15 pruebas nuevas. |
| `2e82d09` | **Green de la ronda de arreglos.** |

## Evidencia del Red
- **Primera ronda (`d112390`):** `npx vitest run src/lib/exportar-csv.test.ts` falló con `Cannot find package '@/lib/exportar-csv'`: 1 archivo fallido y 0 pruebas ejecutadas, porque el módulo todavía no existía. Es el motivo esperado.
- **Ronda de arreglos (`fcbfc75`):** 10 pruebas nuevas fallaron **por aserción** (la función ya existía y no neutralizaba fórmulas precedidas de espacios, saltos de línea, BOM o signos de ancho completo). Las 5 restantes pasaban ya por ser casos de borde (monto 0, texto normal con espacios). Tras el Green, las 762 pruebas del proyecto pasan.
- La confirmación la declaró el `probador` y la repetí ejecutando las pruebas yo mismo.

## Informe de `revisor-seguridad`
Sin bloqueantes. Comprobó que solo se exportan los gastos propios (sesión comprobada, seguridad por filas y nada de la URL como `user_id`), el escapado de comas, comillas y saltos de línea, el nombre de archivo (solo con un mes validado), los parámetros de la URL, las respuestas de error, el `no-store` y el proxy.

| # | Hallazgo | Decisión |
|---|---|---|
| 1 | La neutralización de fórmulas solo miraba el primer carácter: ` =1`, `\n=1` y `＝1` pasaban sin la comilla. | **Aceptado.** Pruebas en `fcbfc75` y arreglo en `2e82d09`. |
| 2 | Categoría y tienda también pasan por el escapado. | Sin acción: es correcto. |
| 3 | El error 500 dice «ejecuta la migración» si falta una tabla. | **Descartado.** Es el mensaje que ya usa toda la aplicación y no revela datos de otras personas. |
| 4 | Parámetros repetidos (`?q=a&q=b`): la ruta tomaba el último y la página ninguno. | **Aceptado.** Arreglado en `2e82d09`: ahora se leen igual. |
| 5 | No hay límite de frecuencia en la descarga. | **Descartado.** Exige sesión y el riesgo es bajo; añadirlo sumaría complejidad que la spec no pide. |
| 6 | Código que no se ejecuta (`supabaseConfigurado()` tras `obtenerUsuario()`). | Sin acción: se deja como defensa. |

## Informe de `revisor-pull-request`
| # | Hallazgo | Decisión |
|---|---|---|
| 1 | Faltaban `prompt.md` y `skills.md`. | **Aceptado.** Creados en esta misma carpeta. |
| 2 | `tasks.md` sin marcar. | **Aceptado.** Marcadas las tareas con evidencia. |
| 3 | Faltaba el registro de las revisiones. | **Aceptado.** Es este archivo. |
| 4 | Faltaba la fila de la spec en el README. | **Aceptado.** Añadida con el número del pull request. |
| 5 | Comprobación manual del botón (CA-9) pendiente. | **Pendiente, anotado en el pull request.** Se prueba con una sesión real. |
| 6 | No había evidencia escrita del Red. | **Aceptado.** Está arriba. |
| 7 | `download` con sesión caducada podría guardar el HTML de login. | **Descartado.** La página de «Mis gastos» ya exige sesión; se prueba a mano. |
| 8 | Faltaba la prueba del monto 0. | **Aceptado.** Añadida en `fcbfc75`. |
| 9 | Regex del mes duplicada y condición redundante en la ruta. | **Mixto.** Condición redundante simplificada en `2e82d09`; la regex se deja (no se exporta de `gastos.ts` y no justifica tocar otro archivo). |

## Lo que no cubre
La ruta no tiene una prueba automática propia (solo su lógica pura); su flujo con una sesión real se comprueba a mano.
