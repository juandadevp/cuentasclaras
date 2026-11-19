# 04-metas-ahorro: evidencia de calidad

## Historial (las pruebas van antes del código)
| Commit | Qué es |
|---|---|
| `bc6f8ed`, `95f9758` | Spec (y su ajuste tras la exploración). |
| `e1f6916` | Plan (idéntico al aprobado en modo plan) y tareas. |
| `45afc4c` | **Red:** 46 pruebas, sin código. |
| `c5965e3` | **Green, parte 1:** lógica pura y mensajes de error. |
| `67bd31b` | **Green, parte 2:** migración, consulta, acciones y tarjeta de «Mi ahorro». |
| `0d7479a` | Arreglos tras la revisión. |

## Evidencia del Red
`npx vitest run src/lib/metas-ahorro.test.ts src/lib/metas-ahorro-errores.test.ts` falló en `45afc4c` con `Cannot find package '@/lib/metas-ahorro'` y `Cannot find package '@/lib/metas-ahorro-errores'`: 2 archivos fallidos y 0 pruebas ejecutadas, porque los módulos todavía no existían. La confirmación la declaró el `probador` y la repetí ejecutando las pruebas yo mismo. Tras el Green pasan las 908 pruebas del proyecto.

## Informe de `revisor-seguridad`
Sin bloqueantes. Comprobó que nadie puede leer, crear a nombre de otro, editar ni borrar metas ajenas (cuatro políticas con `with check`, `user_id` de la sesión, `id` validado como uuid, campo `mes` oculto validado en el servidor, errores traducidos, sin XSS ni secretos).

| # | Hallazgo | Decisión |
|---|---|---|
| 1 | El borrado dependía solo de RLS. | **Aceptado.** Se añadió `.eq("user_id", sesion.user.id)` como segunda barrera (`0d7479a`). |
| 2 | Volver a ejecutar la migración no recuperaba la restricción de una meta por mes en una tabla anterior. | **Aceptado.** La restricción `unique` se agrega ahora con `drop constraint if exists` y `add constraint` (`0d7479a`). |
| 3 | La base de datos no pone tope superior al mes. | **Descartado.** Un `check` con la fecha de hoy no es fiable; el servidor ya limita el mes a «hasta el siguiente». |
| 4 | No hay límite de frecuencia. | **Descartado.** Exigen sesión y son acciones baratas: una fila por persona y mes. |

## Informe de `revisor-pull-request`
| # | Hallazgo | Decisión |
|---|---|---|
| 1 | Si fallaba la carga de la meta, la tarjeta decía «Aún no fijas una meta» (afirmaba algo que no se sabe). | **Aceptado.** Nueva bandera `falloMeta`: la tarjeta dice que no pudo cargarla (`0d7479a`). |
| 2 | Faltaban `prompt.md`, `skills.md`, `revision.md` y marcar las tareas. | **Aceptado.** Creados al cierre. |
| 3 | El `aria-label` de «Quitar meta» no contenía el texto visible (WCAG 2.5.3). | **Aceptado.** Ahora es «Quitar meta de ahorro» (`0d7479a`). |
| 4 | `Math.round(montoInicial)` muestra un monto redondeado. | **Descartado.** La aplicación trabaja con pesos enteros: el campo solo admite dígitos. |
| 5 | Colores `rose-*` y `neutral-*` fuera de los tokens. | **Aceptado como convención existente** del proyecto. |
| 6 | Faltaba la fila del README. | **Aceptado.** Añadida con el número del pull request. |
| 7 | No se pudo comprobar el Red en el commit antiguo. | **Aceptado.** La evidencia está arriba. |

## Lo que queda por comprobar a mano
- Ejecutar la migración en el SQL Editor y confirmar con `select policyname, cmd from pg_policies where tablename = 'metas_ahorro';` que salen exactamente 4 políticas.
- Con dos cuentas, que cada una ve y cambia solo su meta (CA-10).
- Ver la tarjeta «Meta de ahorro» sin meta, sin ingresos, por debajo, justo en la meta y por encima (CA-11).
