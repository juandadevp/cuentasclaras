# Cuentas Claras

Aplicación para administrar gastos mensuales, construida con Next.js (App Router), TypeScript y Tailwind CSS.

## Comandos

```bash
npm install
npm run dev     # desarrollo en http://localhost:3000
npm run build   # build de producción
npm run lint
```

## Estructura

```
src/
├── app/            # Rutas (App Router): páginas, layout y API routes
│   ├── api/gastos/ # Endpoint REST de gastos
│   └── gastos/     # Página de listado de gastos
├── components/     # ui/ (genéricos), layout/ (estructura), gastos/ (dominio)
├── config/         # Configuración del sitio y categorías
├── hooks/          # Hooks de React
├── lib/            # Utilidades y formateo
├── services/       # Acceso a datos (hoy en memoria; reemplazar por BD)
└── types/          # Tipos de TypeScript
```
