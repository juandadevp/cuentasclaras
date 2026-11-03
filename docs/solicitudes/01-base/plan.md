# Plan: base visual y de configuración (feat/01-base)

## Contexto
Hoy `src/app/` solo tiene un `layout.tsx` mínimo y un `page.tsx` con estilos en línea; no existen `globals.css`, `src/config`, `src/types`, `src/components/ui` ni las utilidades de `src/lib`. Se reconstruye la base igual que en `origin/legacy/v1` (la rama local `legacy/v1` no existe; se lee con `git show origin/legacy/v1:<ruta>`), para que autenticación, portal y gastos se construyan encima sin repetir estilos. Ya estamos en la rama `feat/01-base`. Tailwind 4 y `@tailwindcss/turbopack` ya están en `package.json` y `next.config.ts` ya enlaza el loader para `*.css`: no hay dependencias nuevas.

Antes de escribir código se leerá la guía de Next 16 pertinente en `node_modules/next/dist/docs/` (AGENTS.md lo exige), en particular fuentes, `Viewport` y `LayoutProps`.

## Archivos

**Crear**
- `src/app/globals.css`: `@import "tailwindcss"`; `:root` con `--background #fff`, `--foreground #343333`, `--surface`, `--muted`, `--border` y `color-scheme: only light`; `@theme inline` con `brand-50 #f3fef8`, `100 #dcf5e5`, `300 #8fd3a5`, `500 #3f9a58`, `700 #266a37`, `800 #153519`, `accent #f2b84b`, `manzana #8fd14f`, `menta #c4f1e0` y las fuentes; `html`/`body` en blanco.
- `src/types/gasto.ts`: tipo `Categoria` (unión de las 12 claves), más `Gasto` y `NuevoGasto` como en v1 (los usarán los módulos de gastos).
- `src/config/site.ts`: `siteConfig` (nombre, descripción, moneda `COP`, locale `es-CO`), `enlacesPrincipales` (Contacto, Servicios, Ayuda), `enlacesCuenta` (Iniciar sesión, Crear cuenta) y `categorias` (12 entradas `{valor, etiqueta}`, tipadas con `Categoria`).
- `src/components/ui/Campo.tsx`: etiqueta enlazada con `htmlFor`, `aria-invalid`, `aria-describedby`, error con `role="alert"`, ayuda, slots `derecha` y `pie`.
- `src/components/ui/BotonOjo.tsx`: `type="button"`, `aria-label` y `title` según el estado, SVG con `aria-hidden`.
- `src/components/ui/ImagenDeFondo.tsx`: `next/image` con `fill`, decorativa (`alt=""`, `aria-hidden`), capa de color opcional.
- `src/lib/format.ts`: `formatearMoneda` (`Intl.NumberFormat` con `siteConfig`, sin decimales) y `formatearFecha` (ISO `yyyy-mm-dd` a fecha local es-CO).
- `src/lib/format.test.ts`: pruebas de ambas funciones (AGENTS.md pide prueba al tocar `src/lib/`).
- `docs/solicitudes/01-base/` con `prompt.md` y `plan.md` (convención de AGENTS.md; la carpeta aún no existe).

**Modificar**
- `src/app/layout.tsx`: importar `globals.css`; `Inter` y `Geist_Mono` de `next/font/google` con variables CSS; `export const viewport = { colorScheme: "only light" }`; `metadata` desde `siteConfig`; `<html lang="es">` con las clases de las variables, `antialiased`; `<body className="min-h-full flex flex-col">`.
- `src/app/page.tsx`: quitar estilos en línea y usar clases/tokens (texto de la página de reconstrucción). Es una página de transición hasta que llegue la portada.

## Pasos en orden
1. Leer las guías de Next 16 sobre fuentes/viewport y `SKILL.md` de `vercel-react-best-practices` (y las reglas que apliquen).
2. Crear `types/gasto.ts`, luego `config/site.ts` (depende del tipo).
3. Crear `globals.css` y actualizar `layout.tsx`, y `page.tsx`.
4. Crear los tres componentes de `ui`, aplicando la skill: Server Components por defecto (ninguno necesita `"use client"`; `BotonOjo` solo recibe `onClick` del padre, que sí será cliente), imports directos sin barrel `index.ts`, JSX estático sin cálculos innecesarios, props tipadas.
5. Crear `lib/format.ts` y su prueba.
6. Guardar prompt y plan en `docs/solicitudes/01-base/`.

## Mejoras puntuales respecto a v1 (a confirmar)
- Nombrar la variable de Inter `--font-inter` (v1 la llamaba `--font-geist-sans` aunque era Inter, lo cual confunde).
- `ImagenDeFondo`: v1 fuerza `priority` y `sizes="100vw"` siempre; se expone `priority` como prop (por defecto `false`) para no precargar imágenes que no están en pantalla. Mantener `unoptimized` para GIF (los GIF animados no se optimizan).
- `Campo`: `className` va a la `<input>`; se usa `useId` si no hay `id` ni `name`, así el `label` nunca queda sin enlazar (esto lo haría Client Component; alternativa más simple: exigir `name` o `id`. Se prefiere la simple y se mantiene Server Component).
- Rosa de error (`rose-500/600`) viene de Tailwind, no de los tokens; se deja así por fidelidad a v1.

## Verificación
1. `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build` (los cuatro que repite CI). El build detecta problemas de `cacheComponents` y de tipos de `LayoutProps`.
2. `npm run dev` y revisar en el navegador: fondo blanco, texto `#343333`, fuente Inter aplicada (inspeccionar `font-family`), sin cambio al activar modo oscuro del sistema (`color-scheme: only light`), `lang="es"`.
3. Prueba visual temporal (no se commitea): una página que renderice `Campo` con y sin error, `BotonOjo` en ambos estados, `ImagenDeFondo` con `public/login.png`, y muestras de cada token de color; comprobar el logo sin cambios (`public/logo.svg` no se toca). Verificar el foco por teclado y que un lector de pantalla anuncie el error (`role="alert"`).
4. Pruebas: `formatearMoneda(1500000)` produce `$ 1.500.000` (cuidado: `Intl` usa espacio de no separación ` `), `formatearFecha("2026-11-03")` produce `3/11/2026`; fecha inválida no debe lanzar excepción.

## Riesgos
- **Next 16 distinto al conocido**: `LayoutProps<"/">` y las APIs de fuentes pueden haber cambiado; por eso se lee la doc local primero.
- **Tailwind 4 + Turbopack**: si el loader del `next.config.ts` no procesa `globals.css`, los tokens no se generan; se detecta en el paso 2 de la verificación. No se agrega `postcss.config` (el proyecto usa el loader de Turbopack).
- **`next/font/google` necesita red en el build**: falla sin conexión (y en CI sin acceso); alternativa `next/font/local` queda fuera de alcance salvo que falle.
- **Zona horaria en `formatearFecha`**: `new Date("...T00:00:00")` es hora local, por eso no desfasa el día; usar `new Date("yyyy-mm-dd")` sí lo desfasaría.
- **Pruebas frágiles por `Intl`**: depende de los datos de ICU de Node; se comparan con normalización del espacio no separable.
- **Código sin uso todavía**: `Campo`, `BotonOjo`, `ImagenDeFondo` y `categorias` no se usan hasta los módulos siguientes; ESLint no se queja de exports sin uso, pero la verificación visual (paso 3) es la única forma de comprobarlos ahora.
- **`.env.local` / `AGENTS.md`**: no se tocan ni se leen secretos.
