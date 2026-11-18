# 01-exportar-csv: prompt

Encargo del equipo (18/11/2026): hacer las cinco specs del proyecto integrador con el arnés y los agentes, y empezar por «exportar los gastos a CSV». El orquestador (Claude Code) lo convirtió en la spec con la fórmula del taller:

- **Qué quiero:** un botón «Exportar CSV» en «Mis gastos» que descargue los gastos que se están viendo (mismo mes, búsqueda y categoría).
- **Para quién:** una persona con sesión que quiere llevar sus gastos a Excel o a Google Sheets, o guardarlos como respaldo.
- **Contexto:** los gastos se consultan con `gastosFiltrados` (`src/lib/gastos-servidor.ts`) y los filtros se leen con `leerFiltros` (`src/lib/gastos.ts`). No existe nada que genere CSV (lo confirmó el `explorador`). Las rutas bajo `/panel` ya las protege el proxy.
- **Formato:** spec con criterios de aceptación numerados (CA-1 a CA-10), plan generado en modo plan, tareas por fases y pruebas escritas antes del código.
- **Restricciones:** lógica pura con pruebas en `src/lib/`, validar todo lo que llega de la URL, neutralizar la inyección de fórmulas en CSV, no entregar archivos incompletos, texto en español, sin tablas nuevas, sin dependencias nuevas y sin IA.
