# Cuentas Claras

Aplicación web para llevar el control de los gastos mensuales (Next.js, Supabase y TypeScript).

> **Proyecto en reconstrucción.** La versión original (v1) se conserva en la rama [`legacy/v1`](../../tree/legacy/v1). Ahora cada funcionalidad se construye en su **propia rama**, con un **prompt**, un **plan** (modo plan) y las **skills** del arnés, y llega a `main` por pull request.

## Arnés del agente
El proyecto se construye con Claude Code dentro de un arnés: memoria, skills, subagentes, permisos con un hook de protección, pruebas con CI y un proceso de prompt → plan → pull request. **El mapa completo está en [`docs/ARNES.md`](docs/ARNES.md)** y la arquitectura en [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md).

| Capa | Dónde |
|---|---|
| Guía | `AGENTS.md`, `CLAUDE.md`, `.claude/skills/`, `.claude/agents/`, `.claude/commands/` |
| Control | `.claude/settings.json` y `.claude/hooks/` |
| Verificación | `npm test` (vitest) y `.github/workflows/ci.yml` |
| Proceso y evidencia | `docs/solicitudes/NN-nombre/` (`prompt.md`, `plan.md`, `skills.md`) |
| Historial de la v1 | `docs/historial-de-prompts.md` |

## Comandos
```bash
npm install
npm run dev
npm run lint
npx tsc --noEmit
npm test
npm run build
```
