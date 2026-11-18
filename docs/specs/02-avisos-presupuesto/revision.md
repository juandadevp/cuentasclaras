# 02-avisos-presupuesto: evidencia de calidad

## Historial (las pruebas van antes del código)
| Commit | Qué es |
|---|---|
| `c8cf026` | Spec. |
| `014b8f8` | Plan (idéntico al aprobado en modo plan) y tareas. |
| `0989b04` | **Red:** 20 pruebas, sin código. |
| `5fd7f37` | **Green:** lógica, tarjeta y cambio en el inicio. |
| `00f97c8` | **Red de la ronda de arreglos:** 6 pruebas nuevas. |
| `c0b565f` | **Green de la ronda de arreglos.** |

## Evidencia del Red
- **Primera ronda (`0989b04`):** `npx vitest run src/lib/avisos-presupuesto.test.ts` falló con `Cannot find package '@/lib/avisos-presupuesto'`, con 0 pruebas ejecutadas, porque el módulo todavía no existía.
- **Ronda de arreglos (`00f97c8`):** 2 pruebas fallaron **por aserción** (ordenaban `ocio` antes que `ropa` cuando debía ir al revés: 80,9 % frente a 80,1 % y 101,0 % frente a 100,4 %). Las otras 4 eran de regresión y ya pasaban. Tras el Green pasan las 788 pruebas del proyecto.
- La confirmación la declaró el `probador` y la repetí ejecutando las pruebas yo mismo.

## Informe de `revisor-pull-request`
| # | Hallazgo | Decisión |
|---|---|---|
| 1 | CA-5 no se cumplía en empates de porcentaje redondeado: se ordenaba por el porcentaje y no por la razón exacta gastado/límite. | **Aceptado.** Pruebas en `00f97c8` y arreglo en `c0b565f`. |
| 2 | Faltaban `prompt.md`, `skills.md`, `revision.md`, marcar las tareas y la fila del README. | **Aceptado.** Creados al cierre. |
| 3 | El cliente de Supabase se crea varias veces en `Inicio.tsx`. | **Descartado.** `crearClienteServidor` no hace red y el cambio sale del alcance de esta spec. |
| 4 | Los enlaces repetidos «Ver en Presupuesto» no dicen la categoría a un lector de pantalla. | **Aceptado.** `aria-label` con la categoría en `c0b565f`; luego se ajustó a «Ver en Presupuesto: categoría» para que contenga el texto visible (WCAG 2.5.3, etiqueta en el nombre). |
| 5 | Una excepción en la consulta de límites tumbaría todo el inicio (CA-9). | **Aceptado.** `try/catch` en `c0b565f`. |
| 6 | `bg-rose-50 text-rose-700` no son tokens de `globals.css`. | **Aceptado como deuda existente.** Se usan los mismos colores que «Presupuesto» para que las dos pantallas se vean igual; ampliar `globals.css` queda fuera de esta spec. |
| 7 | No hay registro de quién aprobó el plan. | **Aceptado.** Anotado en `prompt.md`. |

## Sobre el redondeo del porcentaje
El `porcentaje` que se muestra es el de `progresoPresupuesto` (hacia abajo hasta el 100 % y, si se excede, redondeado con un mínimo de 101). Solo se usa para mostrar: el **estado** y el **orden** usan los números exactos.

## Lo que no cubre
CA-9 (que el inicio siga funcionando si falla la consulta de los límites) y el aspecto de la tarjeta se comprueban a mano, porque viven en componentes sin prueba automática.
