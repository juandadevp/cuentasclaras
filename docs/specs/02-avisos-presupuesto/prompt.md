# 02-avisos-presupuesto: prompt

Prompt con el que el equipo pidió la spec (18/11/2026), con la fórmula del taller:

- **Qué quiero:** que en el inicio del panel aparezca un aviso cuando una categoría llegó al 80 % de su límite de presupuesto del mes, o ya lo superó.
- **Para quién:** una persona con sesión que fijó límites en «Presupuesto».
- **Contexto:** ya existen `progresoPresupuesto` y `resumirPresupuestos` en `src/lib/presupuestos.ts`, `presupuestosDelMes` en `presupuestos-servidor.ts` y el inicio en `src/components/panel/Inicio.tsx`. No hace falta tabla nueva.
- **Formato:** spec con criterios de aceptación numerados (CA-1, CA-2…), incluyendo exactamente 80 %, justo el 100 %, más del 100 %, sin límites y mes sin gastos.
- **Restricciones:** lógica pura en `src/lib` con pruebas escritas primero. Texto en español. El aviso dice el estado con texto y no solo con color. Sin dependencias nuevas, sin IA.

Decisiones de alcance que dio el equipo: el aviso va solo en el inicio del panel, el umbral es el 80 % fijo y el aviso no se puede descartar.

**Aprobaciones:** el equipo delegó la ejecución de las cuatro specs restantes en el orquestador (18/11/2026) y aprobó el plan en modo plan antes de escribir código. La spec 2 se tomó como aprobada con esa instrucción.
