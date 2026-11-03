# Plan: portada pública (feat/01b-portada)

## Contexto
Una persona que llega por primera vez debe entender qué hace Cuentas Claras y animarse a crear su cuenta. Se reconstruye la portada de `origin/legacy/v1` (`git show origin/legacy/v1:<ruta>`): menú superior, hero con ilustración, secciones y pie de página, **sin** la sección de vista previa. El menú es para una persona sin sesión; más adelante se adapta a quien ya inició sesión.

**Estado actual** (rama `feat/01b-portada`, limpia, en `2f3d665` = `main` con base, autenticación y portal ya integrados):
- `src/app/page.tsx` es la página mínima que la portada reemplaza.
- `src/app/(sitio)/` ya existe pero solo con `login/` y `registro/`; **no tiene `layout.tsx`**. Esas dos páginas están hechas para ir solas: usan `min-h-screen` y llevan su propio `<Logo />` (`src/components/ui/Logo.tsx`, texto oscuro) encima del título.
- `src/proxy.ts` solo redirige `/login` y `/registro` (con sesión) y `/panel` (sin sesión); no toca `/`.
- `src/config/site.ts` ya trae `enlacesPrincipales` y `enlacesCuenta`. Los tokens de color, `ImagenDeFondo` (con prop `priority`) y las imágenes de `public/` ya existen.

**Trabajo previo reutilizable.** La portada ya se hizo antes (sin autenticación) y quedó guardada, sin commit, en `stash@{0}` («portada sin commit (feat/03-portada)»): `Marca`, `AccionesSesion`, `Header`, `Footer`, `MarcoSitio`, `Hero`, `home/{Funciones,ComoFunciona,Diferenciales,LlamadoFinal}`, `(sitio)/layout.tsx`, `(sitio)/page.tsx` y la documentación. Pasó lint, tipos, build y la medición de desbordamiento en 360/390/768/1280 px. Se recupera copiando esos archivos desde el stash (los nuevos están en `stash@{0}^3`) en vez de reescribirlos, y se adapta a la autenticación. El stash no se borra.

Antes de escribir código: leer la doc local de Next 16 sobre grupos de rutas y layouts, `next/image` y `use cache`, y las reglas de `vercel-react-best-practices` que aplican.

## Lo que cambia por tener autenticación
Al añadir el layout compartido de `(sitio)`, `/login` y `/registro` quedarán dentro de Header y Footer. Sin ajuste habría **dos logos** (el del header y el `Logo` de la página) y un alto de pantalla de más (`min-h-screen` + header + pie). Por eso:
- En `login/page.tsx` y `registro/page.tsx`: quitar `<Logo />` y su margen (el título pasa de `mt-8` a sin margen superior) y cambiar `min-h-screen` por `min-h-[calc(100vh-4.5rem)]` (alto del header de 72 px), como en v1.
- Borrar `src/components/ui/Logo.tsx`: queda sin uso (el panel dibuja el suyo en `MarcoPanel`) y `Marca` es el logo único del sitio, así se evita tener dos componentes iguales con colores distintos.
- `src/app/page.tsx` se elimina (si no, chocaría con `(sitio)/page.tsx` en `/`).

## Archivos

**Crear** (a partir del stash)
- `src/app/(sitio)/layout.tsx`: envuelve con `MarcoSitio`.
- `src/app/(sitio)/page.tsx`: `Hero`, `Funciones`, `ComoFunciona`, `Diferenciales`, `LlamadoFinal`, en ese orden; metadata con título absoluto «Cuentas Claras» y descripción.
- `src/components/layout/MarcoSitio.tsx`: Header + `<main className="flex-1">` + Footer.
- `src/components/layout/Marca.tsx`: logo (`/logo.svg` sin tocar colores) y nombre en blanco, enlazado a `/`; la usan Header y Footer. `priority` solo en el header.
- `src/components/layout/Header.tsx`: `sticky top-0 z-50 bg-neutral-800`, `<nav aria-label="Principal">`; izquierda `Marca`; centro Contacto, Servicios (`/#funciones`) y Ayuda desde `md`; derecha `AccionesSesion`.
- `src/components/layout/AccionesSesion.tsx`: «Iniciar sesión» (`/login`) y «Crear cuenta gratis» (`/registro`); en celular el segundo se acorta a «Crear cuenta». Es un componente aparte y estático para poder volverlo sensible a la sesión después sin tocar el Header.
- `src/components/layout/Hero.tsx`: fondo `bg-menta`, dos círculos decorativos `aria-hidden`, titular «Tus gastos del mes, por fin claros.», párrafo corto, `ilustracion.gif` con `ImagenDeFondo` (`priority`); titular `text-4xl` en celular.
- `src/components/layout/Footer.tsx`: `bg-neutral-800` (mismos colores del header), `Marca`, columnas «Producto» y «Cuenta», © con el año calculado en un componente `"use cache"` + `cacheLife("days")` (necesario con `cacheComponents`).
- `src/components/home/Funciones.tsx` (`id="funciones"`, `scroll-mt-20`): «Todo lo que necesitas para controlar tu dinero» con Registro rápido (`registro-recorte.png`), Gráficos y reportes (`graficos-recorte.png`) y Presupuestos por categoría (ilustración propia en SVG: barras de avance por categoría, como se decidió antes; `ahorro-recorte.png` no se usa). Imágenes con ancho y alto reales y `sizes`.
- `src/components/home/ComoFunciona.tsx`: «Empieza en tres pasos»; el paso 3 habla de presupuestos por categoría (no de «ahorro mes a mes»).
- `src/components/home/Diferenciales.tsx`: franja `bg-neutral-800` con comparar precios, presupuesto por categoría y datos privados.
- `src/components/home/LlamadoFinal.tsx`: tarjeta `bg-brand-800` con «Crear cuenta gratis» (`/registro`) y «Tengo dudas» (`/ayuda`).
- `docs/solicitudes/01b-portada/prompt.md` y `plan.md` (carpeta con el nombre de la rama; `docs/solicitudes/` ya tiene 01-base, 02-autenticacion y 04-portal).

**Modificar**
- `src/app/(sitio)/login/page.tsx` y `registro/page.tsx` (ver arriba).

**Eliminar**
- `src/app/page.tsx`, `src/components/ui/Logo.tsx`.

**No se tocan**: `proxy.ts`, `auth/*`, `panel/*`, `globals.css`, `layout.tsx` raíz, `config/site.ts`, ni `MenuPerfil`/`MarcoPanel`.

## Pasos en orden
1. Leer docs y reglas; confirmar que `git stash show -p --include-untracked stash@{0}` contiene lo esperado.
2. Copiar desde el stash los componentes de `layout/` y `home/` y las dos páginas de `(sitio)`; borrar `src/app/page.tsx`.
3. Adaptar `login/` y `registro/` y borrar `Logo.tsx`.
4. Revisar a mano lo copiado contra esta lista (nada de `VistaPrevia`, textos de presupuesto, sin «ahorro»).
5. Pasar lint, tipos, pruebas y build; medir en celular.
6. Documentar en `docs/solicitudes/01b-portada/`.

Aplicación de `vercel-react-best-practices`: todo son Server Components (ningún `"use client"`); datos e íconos como constantes de módulo; ternarios en vez de `&&`; sin archivos `index.ts`; `priority` solo en el logo del header y la ilustración del hero; sin librerías nuevas.

## Verificación
1. `npm run lint`, `npx next typegen && npx tsc --noEmit` (si hay tipos viejos, borrar `.next`), `npm test`, `npm run build`. `/` debe salir estática (`○`) y `/panel` seguir como `◐`.
2. En el navegador (`npm run dev`, con y sin sesión):
   - `/`: orden de secciones correcto, sin vista previa, textos en español; header fijo y oscuro al hacer scroll; «Servicios» baja a «Todo lo que necesitas…» sin quedar tapado; footer con los colores del header.
   - Enlaces: Iniciar sesión → `/login`, Crear cuenta gratis → `/registro`; Contacto y Ayuda dan 404 hasta su módulo (pedido así).
   - `/login` y `/registro`: un solo logo (el del header), header y pie visibles, formulario y botón «Iniciar sesión»/«Crear cuenta» sin cambios, sin barra de scroll vertical de más en escritorio.
   - Con sesión: `/login` y `/registro` siguen redirigiendo a `/panel`; `/panel` conserva su propio marco (sin header del sitio). En `/` el header mostrará los botones de visitante hasta adaptarlo.
   - Fondo blanco, sin cambio con el modo oscuro del sistema; logo con sus colores originales.
3. **Celular sin desbordamiento horizontal**: medir `scrollWidth <= innerWidth` en `/`, `/login` y `/registro` a 360, 390 y 768 px (con Chrome sin ventana, como la vez anterior); vigilar círculos del hero, GIF ampliado y header con dos botones.
4. Accesibilidad: un solo `h1` por página, `alt` en las capturas y vacío en lo decorativo, foco visible con teclado, contraste del gris sobre el header oscuro.

## Riesgos
- **Dos logos / alto de más en login y registro**: es el efecto lateral principal del layout compartido; cubierto en «Lo que cambia por tener autenticación» y en la verificación.
- **Sesión en el header**: hoy un usuario con sesión que abra `/` verá «Iniciar sesión / Crear cuenta gratis». Se deja así (pedido) y aislado en `AccionesSesion` y la columna «Cuenta» del pie; adaptarlo exigirá `obtenerUsuario()` detrás de `Suspense` y `connection()` (si no, el build falla al prerenderizar) y dejará de ser estático.
- **Enlaces rotos temporales**: `/contacto` y `/ayuda` dan 404 (pedido). `/recuperar`, enlazado desde el login, también hasta su módulo.
- **Menú central oculto en celular**: bajo `md` los enlaces del centro no caben; quedan accesibles en el pie. Un menú desplegable sería una decisión aparte (componente de cliente).
- **`cacheComponents`**: el año del pie debe calcularse en un componente con `"use cache"`; calcularlo con `new Date()` suelto rompe el build.
- **Stash**: contiene trabajo hecho sobre una base anterior; se copian archivos, no se aplica el stash completo, para no traer cambios ajenos (como el borrado de `src/app/page.tsx` ya hecho aparte). Si algo del stash ya no cuadra con `main`, se corrige a mano.
- **GIF**: no se optimiza (los GIF animados no se convierten); si pesa mucho se avisa al equipo, no se cambia.
- **Capturas de v1**: `public/funciones` muestra pantallas de la versión anterior; deben coincidir con lo que se construya. Sin pruebas automáticas nuevas porque no hay lógica en `src/lib/`.
