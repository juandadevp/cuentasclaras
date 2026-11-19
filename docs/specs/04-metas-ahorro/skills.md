# 04-metas-ahorro: skills, reglas y agentes usados

| Pieza | Para qué se usó en esta spec |
|---|---|
| Skill `crear-migracion-supabase` y regla `.claude/rules/migraciones.md` | La tabla `metas_ahorro` con seguridad por filas, cuatro políticas (porque fijar de nuevo es un upsert), una meta por usuario y mes y permisos mínimos. |
| Skill `crear-accion-servidor` y regla `.claude/rules/acciones-servidor.md` | `fijarMetaAhorro` y `quitarMetaAhorro` validan en el servidor, comprueban la sesión y sacan el `user_id` de ella. |
| Skill `crear-pantalla-panel` y regla `.claude/rules/pantallas-panel.md` | La tarjeta «Meta de ahorro» en «Mi ahorro», con el avance dicho con texto y una barra accesible. |
| Skill `escribir-pruebas` y regla `.claude/rules/pruebas.md` | El `probador` escribió 46 pruebas con los resultados calculados a mano, sin ver el código. |
| Skill `vercel-react-best-practices` | La meta se carga en paralelo con lo demás; componentes de servidor sin efectos. |
| Agente `explorador` | Mapeó el módulo de presupuesto como modelo de «una fila por usuario y mes» y confirmó que no existía nada de metas. |
| Agente `probador` | Pruebas antes del código (`45afc4c`). |
| Agente `implementador` | Código en tres commits (`c5965e3`, `67bd31b` y `0d7479a`); se cortó una vez por el límite de uso y continuó desde donde quedó. |
| Agentes `revisor-seguridad` y `revisor-pull-request` | Revisaron la rama; ver `revision.md`. |
