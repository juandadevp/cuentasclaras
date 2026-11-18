---
paths:
  - "src/app/**/page.tsx"
  - "src/components/**/*.tsx"
---

# Reglas del frontend (páginas y componentes)

- Los componentes son de servidor por defecto. `"use client"` solo para formularios y para lo que necesita interacción del navegador.
- Lo dinámico (sesión, fecha de hoy, `searchParams`) va detrás de `<Suspense>` y precedido de `await connection()`; si no, Next falla al prerenderizar.
- Antes de escribir una página nueva se consulta la guía de Next 16 en `node_modules/next/dist/docs/`: esta versión cambia APIs y convenciones.
- Todo el texto visible va en español.
- Los colores salen solo de los tokens de `src/app/globals.css`. Cuerpo blanco, sin modo oscuro, y no se cambian los colores del logo.
- Cada pantalla tiene estado vacío y estado de error claro (`AvisoPanel` con `role="alert"`).
- Accesibilidad: los campos llevan etiqueta, los errores se anuncian y el estado se dice con texto o flecha, no solo con color.
- Los imports son directos (sin archivos «barril»), los datos derivados se calculan al renderizar (sin `useEffect`) y ningún componente se declara dentro de otro.
