# 03-ingresos: skills, reglas y agentes usados

| Pieza | Para qué se usó en esta spec |
|---|---|
| Skill `crear-migracion-supabase` y regla `.claude/rules/migraciones.md` | La tabla `ingresos` con seguridad por filas, tres políticas (ver, crear y borrar), permisos mínimos y checks de datos. |
| Skill `crear-accion-servidor` y regla `.claude/rules/acciones-servidor.md` | `crearIngreso` y `eliminarIngreso` validan en el servidor, comprueban la sesión y sacan el `user_id` de ella. |
| Skill `crear-pantalla-panel` y regla `.claude/rules/pantallas-panel.md` | La pantalla `/panel/ingresos`, su enlace en el menú y la tarjeta «Ahorro real del mes». |
| Skill `escribir-pruebas` y regla `.claude/rules/pruebas.md` | El `probador` escribió 74 pruebas con los resultados calculados a mano, sin ver el código. |
| Skill `vercel-react-best-practices` | Consultas en paralelo y componentes de servidor sin efectos. |
| Agente `explorador` | Mapeó los módulos de gastos y presupuesto como modelo y confirmó que no existía nada de ingresos. |
| Agente `probador` | Pruebas antes del código (`aed284e`). |
| Agente `implementador` | Código (`3de3659`) y arreglos de la revisión (`9df3ef3`). |
| Agentes `revisor-seguridad` y `revisor-pull-request` | Revisaron la rama; ver `revision.md`. |
