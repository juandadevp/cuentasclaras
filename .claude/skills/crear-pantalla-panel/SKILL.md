---
name: crear-pantalla-panel
description: Crea una pantalla del portal privado de Cuentas Claras (carpeta src/app/panel) con su enlace en el menú lateral, datos del usuario con sesión, estados vacíos y errores claros. Úsala cuando se pida una página nueva dentro del panel o cambiar una existente.
---

# Crear una pantalla del panel

El panel es la parte privada: cada usuario ve solo lo suyo. Todo el texto visible va en **español**.

## Estructura
1. **Ruta:** `src/app/panel/<nombre>/page.tsx` (nombre en minúsculas, sin tildes). La página solo arma el título y pone el contenido dentro de `<Suspense>`.
2. **Componente de servidor** en `src/components/panel/<Nombre>.tsx` que carga los datos. Si hay formulario, va en otro componente con `"use client"`.
3. **Menú lateral:** agrega el enlace en `MarcoPanel.tsx` (etiqueta, `href` e ícono SVG). Revisa también los nombres de la ruta de migas de pan.
4. **Acciones** del formulario en `actions.ts` de la misma carpeta (skill `crear-accion-servidor`).

## Reglas de Next 16 de este proyecto
- Todo lo que dependa de la sesión o de la fecha de hoy va **detrás de `<Suspense>`** y empieza con `await connection()`. Si no, Next falla al prerenderizar.
- Las propiedades de la página se tipan con `PageProps<"/panel/ruta">`. Esos tipos los genera Next: corre `npx next typegen` si el editor no los reconoce.
- Lee el parámetro `searchParams` con `await` y valida cada valor (largo, lista permitida, formato) antes de usarlo.
- Antes de escribir, consulta `node_modules/next/dist/docs/` si dudas de una API: esta versión tiene cambios.

## Diseño
- Cuerpo **blanco**, sin modo oscuro. No cambies los colores del logo. Usa los tokens de `src/app/globals.css` (`brand-*`, `accent`, `menta`).
- Reutiliza `Tarjeta`, `TituloPagina`, `Campo` y los botones existentes; no inventes estilos nuevos si ya hay uno.
- Móvil primero: sin desbordamiento horizontal y con tablas dentro de un contenedor con `overflow-x-auto`.
- Accesibilidad: cada campo con su etiqueta, errores con `role="alert"`, botones con texto claro.

## Estados que toda pantalla debe cubrir
- **Vacío:** un mensaje que diga qué hacer («Registra tu primer gasto…»).
- **Error de la base de datos:** si falta la tabla (`42P01` o `PGRST205`), un aviso que diga qué migración ejecutar.
- **Cargando:** una caja reservada (`aria-busy`) para que la página no salte.

## Antes de terminar
Corre `npm run lint`, `npx tsc --noEmit`, `npm test` y `npm run build`, y si usas React aplica también `vercel-react-best-practices`.
