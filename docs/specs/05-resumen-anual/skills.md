# 05-resumen-anual: skills, reglas y agentes usados

| Pieza | Para qué se usó en esta spec |
|---|---|
| Skill `crear-pantalla-panel` y regla `.claude/rules/pantallas-panel.md` | La pantalla `/panel/resumen-anual` con su enlace en el menú, `Suspense` + `connection()`, estado vacío, aviso de error y flechas de año. |
| Skill `escribir-pruebas` y regla `.claude/rules/pruebas.md` | El `probador` escribió 38 pruebas con los resultados calculados a mano, sin ver el código. |
| Skill `vercel-react-best-practices` | Componente de servidor sin efectos; los datos derivados se calculan al renderizar. |
| Agente `explorador` | Encontró lo reutilizable (`gastosEntre`, `DonaCategorias`, navegación por flechas de Presupuesto) y que `BarrasMeses` no sirve para decir el total en texto. |
| Agente `probador` | Pruebas antes del código (`c3dcbd7`). |
| Agente `implementador` | Código (`2ed26bb`) y la ronda de arreglos tras la revisión. Descubrió que `gastosEntre` excluye la fecha final. |
| Agente `revisor-pull-request` | Revisó la rama; ver `revision.md`. No se usó `revisor-seguridad`: no hay tablas, acciones ni autenticación nuevas. |
