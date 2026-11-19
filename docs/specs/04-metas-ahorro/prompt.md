# 04-metas-ahorro: prompt

Prompt con el que el equipo pidió la spec (18/11/2026), con la fórmula del taller:

- **Qué quiero:** poder fijar una meta de ahorro para cada mes y ver cuánto llevo de ella.
- **Para quién:** una persona con sesión que ya registra ingresos y gastos.
- **Contexto:** depende de la spec 03 (ingresos) para calcular el ahorro real del mes. Se muestra en «Mi ahorro».
- **Formato:** spec con criterios de aceptación numerados: fijar y actualizar la meta, progreso por debajo de la meta, justo en la meta y por encima de ella, y mes sin meta.
- **Restricciones:** tabla nueva `metas_ahorro` con migración y seguridad por filas, única por usuario y mes. Pruebas primero. Texto en español. Sin dependencias nuevas, sin IA.

Decisiones de alcance que tomó el orquestador a partir del informe del `explorador`: el mes actual y el siguiente, sin confirmación al quitar la meta, y si falla la carga de los ingresos o de la meta no se inventa un avance ni un «sin meta».

**Aprobaciones:** el equipo delegó la ejecución de las cuatro specs restantes en el orquestador (18/11/2026) y el plan se aprobó en modo plan antes de escribir código.
