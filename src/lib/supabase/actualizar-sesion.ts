import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseClave, supabaseConfigurado, supabaseUrl } from "./config";

const RUTAS_SOLO_INVITADOS = ["/", "/login", "/registro", "/recuperar"];
const RUTAS_PRIVADAS = ["/panel"];

/**
 * Refresca la sesión de Supabase en cada petición (renueva las cookies del token)
 * y protege las rutas: con sesión, la portada, /login, /registro y /recuperar llevan al panel; sin sesión, /panel lleva a /login.
 */
export async function actualizarSesion(request: NextRequest) {
  let respuesta = NextResponse.next({ request });

  if (!supabaseConfigurado()) return respuesta;

  const supabase = createServerClient(supabaseUrl!, supabaseClave!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (lista) => {
        lista.forEach(({ name, value }) => request.cookies.set(name, value));
        respuesta = NextResponse.next({ request });
        lista.forEach(({ name, value, options }) => respuesta.cookies.set(name, value, options));
      },
    },
  });

  // No ejecutes código entre createServerClient y getClaims: puede causar cierres de sesión inesperados.
  const { data } = await supabase.auth.getClaims();
  const haySesion = Boolean(data?.claims);

  const ruta = request.nextUrl.pathname;
  const aPrivada = RUTAS_PRIVADAS.some((r) => ruta === r || ruta.startsWith(`${r}/`));
  let destinoRedireccion: string | null = null;
  if (haySesion && RUTAS_SOLO_INVITADOS.includes(ruta)) destinoRedireccion = "/panel"; // con sesión: su propio inicio
  if (!haySesion && aPrivada) destinoRedireccion = "/login"; // sin sesión: no puede ver el panel

  if (destinoRedireccion) {
    const destino = request.nextUrl.clone();
    destino.pathname = destinoRedireccion;
    destino.search = "";
    const redireccion = NextResponse.redirect(destino);
    respuesta.cookies.getAll().forEach((c) => redireccion.cookies.set(c));
    return redireccion;
  }

  return respuesta;
}
