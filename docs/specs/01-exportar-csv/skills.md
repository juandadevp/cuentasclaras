# 01-exportar-csv: skills, reglas y agentes usados

| Pieza | Para qué se usó en esta spec |
|---|---|
| Skill `escribir-pruebas` y regla `.claude/rules/pruebas.md` | El `probador` escribió 63 pruebas con los resultados calculados a mano, sin ver el código. |
| Skill `crear-accion-servidor` y regla `.claude/rules/acciones-servidor.md` | El Route Handler comprueba la sesión, valida lo que llega de la URL, traduce los errores y no confía en el navegador. |
| Skill `crear-pantalla-panel` y regla `.claude/rules/pantallas-panel.md` | El enlace «Exportar CSV» usa los tokens de color y las clases de botón de «Mis gastos». |
| Agente `explorador` | Buscó lo que ya existía (`leerFiltros`, `gastosFiltrados`, `obtenerUsuario`) y confirmó que no había nada de CSV. |
| Agente `probador` | Escribió las pruebas antes del código, dos veces (commits `d112390` y `fcbfc75`). |
| Agente `implementador` | Escribió el código (commits `145cb53` y `2e82d09`). |
| Agentes `revisor-seguridad` y `revisor-pull-request` | Revisaron la rama; ver `revision.md`. |
