# 04-metas-ahorro: fijar una meta de ahorro y ver el avance

## Qué se construye y por qué
Con los ingresos registrados, «Mi ahorro» ya muestra cuánto ahorró la persona en el mes, pero no le dice si eso es suficiente. Se agrega una **meta de ahorro mensual**: la persona fija cuánto quiere ahorrar en un mes y «Mi ahorro» muestra su avance (ahorro real del mes frente a la meta). Hay una sola meta por persona y mes, y cambiarla la actualiza.

## Criterios de aceptación
- **CA-1.** Dado un monto y un mes válidos, cuando se valida la meta, entonces no hay errores; un monto como `$ 500.000` se entiende como 500000.
- **CA-2.** Dado un monto vacío, no numérico, cero, negativo o mayor que 999.999.999, cuando se valida, entonces hay un error en el monto.
- **CA-3.** Dado un mes con formato inválido, anterior a 2000-01 o posterior al mes siguiente al actual, cuando se valida, entonces hay un error en el mes; el mes actual y el siguiente son válidos.
- **CA-4.** Dado que no hay meta fijada para el mes, cuando se calcula el avance, entonces el estado es «sin meta», sin porcentaje.
- **CA-5.** Dado que hay meta pero el mes no tiene ingresos (el ahorro real es desconocido), cuando se calcula el avance, entonces el estado es «sin ingresos» y no se inventa un porcentaje.
- **CA-6.** Dado un ahorro real por debajo de la meta (incluso negativo o cero), cuando se calcula el avance, entonces el estado es «por debajo», con lo que falta para llegar y un porcentaje que nunca es menor que 0.
- **CA-7.** Dado un ahorro real exactamente igual a la meta, cuando se calcula el avance, entonces el estado es «alcanzada», con 100 % y nada por faltar.
- **CA-8.** Dado un ahorro real mayor que la meta, cuando se calcula el avance, entonces el estado es «superada», con un porcentaje mayor que 100 y lo que se superó.
- **CA-9.** Dado un error de la base de datos al fijar o quitar una meta, cuando se traduce, entonces el mensaje está en español y nunca muestra el error crudo; si falta la tabla, pide ejecutar la migración «metas_ahorro».
- **CA-10.** Dada una persona con sesión, cuando fija, cambia, lista o quita su meta, entonces solo ve y modifica la suya: la tabla `metas_ahorro` tiene seguridad por filas con una política por acción (ver, crear, editar y borrar), una sola meta por persona y mes, y el `user_id` sale de la sesión, nunca del formulario.
- **CA-11.** Dado «Mi ahorro» del mes actual, cuando se abre, entonces muestra la tarjeta «Meta de ahorro» con el avance dicho con texto y una barra accesible (no solo con color), un formulario para fijar o cambiar la meta y un botón para quitarla.

## Fuera de alcance
- Metas anuales, por categoría o con fecha límite.
- Avisos o notificaciones cuando se alcanza la meta.
- Historial de metas de meses anteriores.

## Preguntas resueltas
- **¿Una meta por mes o una general?** Una por persona y mes, como los límites de presupuesto. Decidido en la spec.
- **¿Hasta qué mes se puede fijar?** El mes actual y el siguiente, igual que los límites de presupuesto.
- **¿Dónde se ve?** En «Mi ahorro», debajo de «Ahorro real del mes»; no hay ruta ni enlace de menú nuevos.
- **¿Cómo se cambia?** Con el mismo formulario: fijar de nuevo la meta del mes la actualiza.
- **¿Qué pasa si el ahorro real es negativo?** El estado es «por debajo» y el porcentaje es 0.
- **¿Se confirma antes de quitar la meta?** No: igual que los límites de presupuesto, se quita con un clic y se puede volver a fijar. Decidido tras el informe del `explorador`.
- **¿Y si falla la carga de los ingresos?** La tarjeta no inventa un avance: dice que no pudo cargar los ingresos, como ya hace «Ahorro real del mes». El formulario de la meta sigue disponible. Decidido tras el informe del `explorador`.
