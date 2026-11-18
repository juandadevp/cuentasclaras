# 03-ingresos: registrar ingresos y ver el ahorro real

## Qué se construye y por qué
Hoy «Mi ahorro» solo compara gastos entre meses y frente al presupuesto, y dice que no incluye los ingresos: no responde a la pregunta «¿cuánto me quedó de verdad?». Se agrega una pantalla «Ingresos» donde la persona registra lo que recibe (salario, ventas, honorarios…) y una tarjeta «Ahorro real del mes» en «Mi ahorro» que muestra ingresos menos gastos del mes. Los ingresos son de cada persona y quedan protegidos con seguridad por filas, igual que los gastos.

## Criterios de aceptación
- **CA-1.** Dado un ingreso con descripción, tipo, monto y fecha válidos, cuando se valida, entonces no hay errores.
- **CA-2.** Dado una descripción de menos de 2 o de más de 80 caracteres (sin contar los espacios de los extremos), cuando se valida, entonces hay un error en la descripción.
- **CA-3.** Dado un monto vacío, no numérico, cero, negativo o mayor que 999.999.999, cuando se valida, entonces hay un error en el monto; un monto como `$ 1.500.000` se entiende como 1500000.
- **CA-4.** Dado un tipo que no está en la lista (salario, ventas, honorarios, otros), cuando se valida, entonces hay un error en el tipo.
- **CA-5.** Dado una fecha que no existe (por ejemplo 2026-02-30), anterior al año 2000 o posterior a hoy, cuando se valida, entonces hay un error en la fecha.
- **CA-6.** Dado una lista de ingresos del mes, cuando se calcula el resumen, entonces el total es la suma de los montos y el desglose por tipo va de mayor a menor.
- **CA-7.** Dado el ingreso total y el gasto total de un mes, cuando se calcula el ahorro real, entonces es ingresos menos gastos; es positivo si sobra, negativo si se gastó más de lo que entró, y cero si son iguales.
- **CA-8.** Dado un mes sin ingresos registrados, cuando se calcula el ahorro real, entonces no se inventa un valor: el resultado dice que no hay ingresos en ese mes.
- **CA-9.** Dado un error de la base de datos al crear o borrar un ingreso, cuando se traduce, entonces el mensaje está en español y nunca muestra el error crudo; si falta la tabla, pide ejecutar la migración «ingresos».
- **CA-10.** Dado una persona con sesión, cuando crea, lista o borra ingresos, entonces solo ve y modifica los suyos: la tabla `ingresos` tiene seguridad por filas con una política por acción (ver, crear y borrar) y el `user_id` sale de la sesión, nunca del formulario.
- **CA-11.** Dado «Mi ahorro» de un mes con ingresos, cuando se abre, entonces muestra la tarjeta «Ahorro real del mes» con ingresos, gastos y el ahorro dicho con texto y flecha (no solo con color), y ya no dice que no incluye los ingresos.

## Fuera de alcance
- Editar un ingreso: se borra y se vuelve a registrar.
- Ingresos recurrentes, categorías personalizadas y fechas futuras.
- Cambiar la comparación mes a mes de «Mi ahorro» (se conserva).

## Preguntas resueltas
- **¿Fecha exacta o mes?** Fecha exacta, como en los gastos; así el ahorro de un mes suma por rango de fechas. Decidido en la spec.
- **¿Qué tipos?** Lista fija: salario, ventas, honorarios y otros. Decidido en la spec.
- **¿Se permiten ingresos con fecha futura?** No, igual que los gastos.
- **¿Se puede editar?** No en esta spec: crear, listar por mes y borrar.
- **¿Dónde va?** En `/panel/ingresos`, con un enlace «Ingresos» en el menú.
- **¿Y si un mes no tiene ingresos?** «Ahorro real» no se calcula y se explica (CA-8).
- **¿Qué pasa con el texto «no incluye tus ingresos»?** Se reemplaza en «Mi ahorro» y en la página de Ayuda.
