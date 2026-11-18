# 03-ingresos: evidencia de calidad

## Historial (las pruebas van antes del código)
| Commit | Qué es |
|---|---|
| `ad64d21` | Spec. |
| `a7d978b` | Plan (idéntico al aprobado en modo plan) y tareas. |
| `aed284e` | **Red:** 74 pruebas, sin código. |
| `3de3659` | **Green:** lógica, migración, acciones, pantalla, menú y tarjeta de «Mi ahorro». |
| `9df3ef3` | Arreglos tras la revisión. |

## Evidencia del Red
`npx vitest run src/lib/ingresos.test.ts src/lib/ingresos-errores.test.ts` falló en `aed284e` con `Cannot find package '@/lib/ingresos'` y `Cannot find package '@/lib/ingresos-errores'`: 2 archivos fallidos y 0 pruebas ejecutadas, porque los módulos todavía no existían. La confirmación la declaró el `probador` y la repetí ejecutando las pruebas yo mismo. Tras el Green pasan las 862 pruebas del proyecto.

## Informe de `revisor-seguridad`
Sin bloqueantes. Comprobó que un usuario no puede leer los ingresos de otro, crear uno a nombre de otro ni borrar uno ajeno (seguridad por filas, `user_id` de la sesión, `id` validado como uuid, errores traducidos, sin XSS ni secretos).

| # | Hallazgo | Decisión |
|---|---|---|
| 1 | Una tabla `ingresos` anterior podría quedar con huecos (el comentario prometía más de lo que cumple). | **Aceptado.** Comentario corregido en `9df3ef3` y consulta de comprobación a `pg_policies` (deben salir exactamente 3 políticas). |
| 2 | El largo de la descripción no tenía tope real en la base (`"ab"` más miles de espacios). | **Aceptado.** `check (descripcion = btrim(descripcion) and char_length(descripcion) between 2 and 80)` en `9df3ef3`. |
| 3 | La fecha futura solo la valida la aplicación. | **Descartado.** Quien se salte la app solo falsea sus propios ingresos; la seguridad por filas sigue protegiendo los de los demás. Un disparador queda como mejora opcional. |
| 4 | Las acciones no limitan la frecuencia. | **Descartado.** Exigen sesión, no son públicas ni llaman servicios caros; está en los riesgos del plan. |

## Informe de `revisor-pull-request`
| # | Hallazgo | Decisión |
|---|---|---|
| 1 | «Ahorro real» decía «No has registrado ingresos» cuando la consulta había fallado. | **Aceptado.** Ahora dice que no se pudieron cargar y no inventa nada (`9df3ef3`). |
| 2 | Faltaba la fila del README. | **Aceptado.** Añadida con el número del pull request. |
| 3 | Faltaban `prompt.md`, `skills.md` y `revision.md`. | **Aceptado.** Creados al cierre. |
| 4 | La primera línea de la migración debe explicar cómo ejecutarla. | **Aceptado.** Corregido en `9df3ef3`. |
| 5 | Colores `rose-*` y `neutral-*` fuera de los tokens de `globals.css`. | **Aceptado como convención existente:** ya se usan en otras pantallas del proyecto; ampliar `globals.css` queda fuera de esta spec. |
| 6 | `Ingresos.tsx` importa `MES_MINIMO` de `@/lib/presupuestos`. | **Descartado.** Funciona y moverlo toca otro archivo sin necesidad. |
| 7 | No hay registro de quién aprobó el plan. | **Aceptado.** Anotado en `prompt.md`. |

## Lo que queda por comprobar a mano
- Ejecutar la migración en el SQL Editor y confirmar con `select policyname, cmd from pg_policies where tablename = 'ingresos';` que salen exactamente 3 políticas.
- Comprobar con dos cuentas que cada una ve solo sus ingresos (CA-10).
- Ver la tarjeta «Ahorro real del mes» con y sin ingresos (CA-11).
