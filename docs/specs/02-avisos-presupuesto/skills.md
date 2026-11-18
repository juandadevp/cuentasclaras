# 02-avisos-presupuesto: skills, reglas y agentes usados

| Pieza | Para qué se usó en esta spec |
|---|---|
| Skill `crear-pantalla-panel` y regla `.claude/rules/pantallas-panel.md` | La tarjeta de avisos en el inicio: componente de servidor, estado dicho con texto, enlaces accesibles. |
| Skill `escribir-pruebas` y regla `.claude/rules/pruebas.md` | El `probador` escribió 26 pruebas con los resultados calculados a mano, sin ver el código. |
| Skill `vercel-react-best-practices` | Los límites se cargan en paralelo con lo demás, sin efectos ni consultas en cascada. |
| Agente `explorador` | Confirmó que `progresoPresupuesto` ya aplica las reglas del 80 % y del 100 %, y que no existía nada de avisos. |
| Agente `probador` | Pruebas antes del código, dos veces (`0989b04` y `00f97c8`). |
| Agente `implementador` | Código en dos rondas (`5fd7f37` y `c0b565f`). |
| Agente `revisor-pull-request` | Revisó la rama; ver `revision.md`. El `revisor-seguridad` no hizo falta: no hay tabla nueva, acción de servidor ni autenticación. |
