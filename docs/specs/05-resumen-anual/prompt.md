# 05-resumen-anual: prompt

Prompt con el que el equipo pidió la spec (19/11/2026), con la fórmula del taller:

- **Qué quiero:** una pantalla para ver mi año de gastos completo: cuánto gasté cada mes, en qué categorías y unas cifras clave.
- **Para quién:** una persona con sesión que ya registra gastos.
- **Contexto:** «Inicio» solo muestra 6 meses y «Mis gastos» se mira mes a mes. No se necesita tabla nueva: se calcula con los gastos existentes.
- **Formato:** spec con criterios de aceptación numerados: elegir el año, los doce meses, total, cantidad y promedio, categorías con porcentaje, mes de mayor gasto, año vacío, cambio de año y la pantalla.
- **Restricciones:** pruebas primero, texto en español, el total de cada mes dicho en texto (no solo barras), sin dependencias nuevas, sin IA.

Decisiones de alcance que tomó el orquestador a partir del informe del `explorador`: parámetro `anio` en la URL, promedio siempre entre 12, lista de meses con total escrito (la barra de «Inicio» solo muestra el valor al pasar el ratón) y la dona de categorías reutilizada tal cual.

**Aprobaciones:** el equipo delegó la ejecución de las specs restantes en el orquestador (18/11/2026) y el plan se aprobó en modo plan antes de escribir código.
