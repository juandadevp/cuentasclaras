# Cuentas Claras

Aplicación para administrar gastos mensuales, construida con Next.js (App Router), TypeScript y Tailwind CSS.

## Comandos

```bash
npm install
npm run dev     # desarrollo en http://localhost:3000
npm run build   # build de producción
npm run lint
```

## Base de datos y cuentas (Supabase)

El registro y el inicio de sesión usan **Supabase Auth** (PostgreSQL). Pasos para activarlos:

1. Crea un proyecto en https://supabase.com.
2. En **SQL Editor** ejecuta, en este orden, los dos scripts de `supabase/migrations/`:
   - `20261017000000_perfiles.sql`: tabla `perfiles` y un trigger que guarda el perfil al registrarse.
   - `20261017010000_gastos.sql`: tabla `gastos`.
   - `20261021000000_favoritos.sql`: tabla `favoritos` (la ★ de Recomendar compras).

   Las tres tablas tienen seguridad por filas (RLS): cada usuario solo puede ver y modificar sus propios datos.
3. Copia `.env.example` como `.env.local` y completa `NEXT_PUBLIC_SUPABASE_URL` y
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (**Project Settings → API**). Nunca uses la clave `service_role`.
4. En **Authentication → URL Configuration** agrega `http://localhost:3000/auth/callback`
   (y la URL de producción) en *Redirect URLs*.
5. En **Authentication → Providers → Email**:
   - *Confirm email* **activado** (recomendado): el usuario recibe un correo y debe confirmarlo antes de entrar.
   - *Confirm email* **desactivado** (solo desarrollo): el usuario entra apenas se registra.
6. Reinicia `npm run dev`.

Al iniciar sesión (o registrarse sin confirmación de correo) cada usuario entra a **su propio panel**, una
aplicación con barra lateral y barra superior (separada del sitio público):
- `/panel`: inicio con accesos rápidos, total del mes, gráfico de dona por categoría, barras de los últimos
  6 meses y los últimos gastos.
- `/panel/registrar`: formulario para anotar un gasto.
- `/panel/gastos`: tabla completa con buscador, filtro por categoría, navegación por mes, "Mostrar todo",
  editar (`/panel/gastos/[id]/editar`) y eliminar.

- `/panel/recomendar`: **Recomendar compras**, un comparador de precios (ver abajo).
- `/panel/favoritos`: los productos que cada usuario marcó con la ★; se guardan en su cuenta junto con los precios del momento.

Sin sesión, cualquier ruta de `/panel` lleva a `/login`.

Sin las variables de entorno el sitio funciona, pero el login y el registro muestran un aviso de que falta configurar Supabase.

## Recomendar compras (comparador de precios)

Busca un producto y muestra su precio **solo en las tiendas donde ese tipo de producto se vende**: si buscas
"acetaminofén" salen farmacias (Farmatodo, Cruz Verde, Locatel, La Rebaja…); "leche", supermercados (Éxito,
Jumbo, D1…); "audífonos", tiendas de tecnología (Alkosto, Ktronix, Falabella…); "taladro", Homecenter y Easy.

- **Detección del tipo de producto (sin IA):** un diccionario de ~700 productos y marcas en 15 tipos
  (`src/lib/precios/diccionario.ts`) entiende plurales y errores de escritura ("acetamimofen"). Si no
  reconoce el producto, muestra todas las tiendas y pide elegir el tipo.
- **Tiendas por tipo:** se definen en `src/lib/precios/rubros.ts` (qué tiendas vende cada tipo) y
  `franquicias.ts` (cómo reconocer cada tienda en los resultados). Son fáciles de editar.
- **Se puede cambiar:** el selector "Tipo de producto" fuerza un tipo, y "Ver también otras tiendas" muestra
  las ofertas de tiendas que no son del tipo, marcadas como tales.
- **Un producto por tarjeta**, como en Google Shopping: cada producto (marca y presentación) muestra su precio
  "desde" y el precio en cada tienda, de la más barata a la más cara. Las ofertas del mismo producto se juntan
  por el identificador del buscador (o por título idéntico) en `src/lib/precios/agrupar.ts`.
- Desde cada tienda se puede abrir la oferta o **registrar el gasto**, con la categoría según el tipo.

**Cómo obtiene los precios (sin inteligencia artificial):** consulta Google Shopping de Colombia a través de
[SerpApi](https://serpapi.com), que devuelve ofertas de muchas tiendas con un solo llamado. Hay que crear una
cuenta (tiene plan gratuito) y poner la clave en `.env.local`:

```
SERPAPI_API_KEY=tu_clave
```

La clave es secreta y solo se usa en el servidor. Sin ella, la pantalla funciona en **modo demostración** con
precios de ejemplo claramente marcados. Las respuestas se guardan 5 minutos en memoria para ahorrar búsquedas, y
cada usuario puede hacer una búsqueda cada 1,5 segundos.

> Los precios vienen de un buscador de compras: pueden variar según la ciudad o cambiar en minutos.
> Siempre deben confirmarse en la tienda.

## Estructura

```
src/
├── app/            # Rutas (App Router)
│   ├── auth/       # Acciones de login/registro/cierre de sesión y callback de confirmación
│   ├── (sitio)/    # Sitio público (portada, login, registro) con menú y pie de página
│   └── panel/      # Área privada de cada usuario: layout con barra lateral, registrar/ y gastos/
├── components/     # ui/ (genéricos), layout/ (sitio público), auth/, home/, panel/ (área privada)
├── proxy.ts        # Refresca la sesión de Supabase en cada petición
├── config/         # Configuración del sitio y categorías
├── lib/            # Utilidades, validaciones, clientes de Supabase (lib/supabase) y comparador de precios (lib/precios)
└── types/          # Tipos de TypeScript
```
