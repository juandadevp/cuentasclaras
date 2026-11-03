# Cuentas Claras

Aplicación web para llevar el control de los gastos mensuales (Next.js, Supabase y TypeScript).

> **Proyecto en reconstrucción.** La versión original (v1) se conserva en la rama [`legacy/v1`](../../tree/legacy/v1). Ahora cada funcionalidad se construye en su **propia rama**, con un **prompt**, un **plan** (modo plan) y las **skills** del arnés, y llega a `main` por pull request.

## Arnés del agente
- **Memoria:** `AGENTS.md` (contenido) y `CLAUDE.md` (importa a `AGENTS.md`).
- **Skills:** carpeta `.claude/skills/`.
- **Verificación:** pruebas con vitest (`npm test`) y GitHub Actions (`.github/workflows/ci.yml`).
- **Evidencia por funcionalidad:** `docs/solicitudes/NN-nombre/` (`prompt.md`, `plan.md`, `skills.md`).
- **Historial de prompts de la v1:** `docs/historial-de-prompts.md`.

## Comandos
```bash
npm install
npm run dev
npm run lint
npx tsc --noEmit
npm test
npm run build
```
