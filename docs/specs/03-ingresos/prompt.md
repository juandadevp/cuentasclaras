# 03-ingresos: prompt

Prompt con el que el equipo pidió la spec (18/11/2026), con la fórmula del taller:

- **Qué quiero:** poder registrar mis ingresos del mes (por ejemplo salario o ventas) y que «Mi ahorro» muestre el ahorro real: ingresos menos gastos del mes.
- **Para quién:** una persona con sesión que quiere saber cuánto le queda de verdad.
- **Contexto:** «Mi ahorro» está en `src/components/panel/Ahorro.tsx` y su lógica en `src/lib/ahorro.ts`. Hoy no hay ingresos. Sirve de modelo el módulo de presupuesto (migración con seguridad por filas, acciones de servidor y pantalla).
- **Formato:** spec con criterios de aceptación numerados: crear, listar y borrar ingresos, ahorro positivo, negativo y cero, y mes sin ingresos.
- **Restricciones:** tabla nueva `ingresos` con migración y seguridad por filas (skill `crear-migracion-supabase`). Validar en el servidor. Pruebas primero. Texto en español. Sin dependencias nuevas, sin IA.

Decisiones de alcance que tomó el orquestador a partir del informe del `explorador`: fecha exacta como en los gastos, tipos fijos (salario, ventas, honorarios y otros), sin fechas futuras, sin editar (se borra y se vuelve a registrar) y un mes sin ingresos no inventa un ahorro.

**Aprobaciones:** el equipo delegó la ejecución de las cuatro specs restantes en el orquestador (18/11/2026) y el plan se aprobó en modo plan antes de escribir código.
