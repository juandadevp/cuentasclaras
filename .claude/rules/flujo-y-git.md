# Reglas del flujo de trabajo (se aplican siempre)

- Cada spec tiene su carpeta `docs/specs/NN-nombre/` con `spec.md`, `plan.md` y `tasks.md`, y su propia rama `feat/NN-nombre`.
- El orden es: spec → plan (en modo plan, sin editarlo a mano) → tareas → pruebas (Red) → código (Green) → revisores → pull request.
- Una persona aprueba el plan **antes** de que se escriba código. Ningún agente hace merge a `main`.
- Las pruebas van en su propio commit, anterior al del código que las hace pasar.
- Commits cortos, en español y en imperativo («Agregar filtro por categoría»). Nunca `git add .`: se añaden los archivos por su ruta. Nunca `--force` ni `git reset --hard`.
- No se lee, se edita ni se muestra ningún archivo `.env` (excepto `.env.example`).
- Antes de dar algo por terminado: `npm run lint`, `npx next typegen`, `npx tsc --noEmit`, `npm test` y `npm run build`.
- El pull request usa la plantilla de `.github/pull_request_template.md` y no se fusiona hasta que el CI esté en verde.
- Cada hallazgo de un revisor se anota con lo que se decidió: aceptado (y el commit que lo arregla) o descartado (y la razón).
