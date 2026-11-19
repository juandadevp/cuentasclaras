# 05-resumen-anual: evidencia de calidad

## Historial (las pruebas van antes del código)
| Commit | Qué es |
|---|---|
| `6c6cac9` | Spec. |
| `2cd1ba2` | Plan (idéntico al aprobado en modo plan) y tareas. |
| `c3dcbd7` | **Red:** 38 pruebas, sin código. |
| `2ed26bb` | **Green:** lógica pura, pantalla y enlace del menú. |
| `505e8a5` | Arreglos tras la revisión. |

## Evidencia del Red
`npx vitest run src/lib/resumen-anual.test.ts` falló en `c3dcbd7` con `Cannot find module './resumen-anual'`: 1 archivo fallido y 0 pruebas ejecutadas, porque el módulo todavía no existía. La confirmación la declaró el `probador` y la repetí yo. Tras el Green pasan las 38 pruebas nuevas y las 946 del proyecto.

## Informe de `revisor-pull-request`
No se usó `revisor-seguridad`: no hay tabla, acción ni autenticación nuevas; la consulta ya está protegida por la seguridad por filas de `gastos`.

| # | Hallazgo | Decisión |
|---|---|---|
| 1 | Si la consulta fallaba, se mostraba el aviso de error junto a «No tienes gastos en {año}», que es engañoso. | **Aceptado.** Con error solo se muestra el aviso (`505e8a5`). |
| 2 | La fila 05 del README estaba pendiente. | **Aceptado.** Completada con el número del pull request. |
| 3 | El plan decía `gastosEntre(…, "AAAA-12-31")` pero el fin de la consulta es exclusivo. | **Aceptado en el código, plan sin tocar.** El código usa `AAAA+1-01-01` (`gastosEntre` excluye el fin); el plan queda tal como se aprobó y la corrección se anota aquí. |
| 4 | Las casillas de `tasks.md` estaban sin marcar. | **Aceptado.** Marcadas al cierre. |
| 5 | Colores `neutral-*` fuera de los tokens. | **Aceptado como convención existente** del proyecto. |
| 6 | El nombre del mes se sacaba con `split(" ")[0]`, frágil según el idioma. | **Aceptado.** Se usa `mesCorto` y el mes completo para lectores de pantalla (`505e8a5`). |
| 7 | El aviso decía «más de 5.000» pero `recortado` también salta con exactamente 5.000. | **Aceptado.** Ahora dice «5.000 o más» (`505e8a5`). |
| 8 | Los porcentajes redondeados por categoría pueden no sumar 100 %. | **Descartado.** La spec pide «redondeado a un entero» por categoría. |
| 9 | CA-9 no tiene prueba automática. | **Aceptado.** Es una pantalla; queda la comprobación manual de abajo. |

## Lo que queda por comprobar a mano
- Abrir `/panel/resumen-anual` y cambiar de año con las flechas; en 2000 y en el año actual la flecha correspondiente no se puede usar.
- Probar `?anio=abc` y `?anio=3000`: vuelve al año de hoy.
- Un año sin gastos: aparece el estado vacío. Cada mes dice su total en texto.
- El menú muestra el enlace «Resumen anual».
