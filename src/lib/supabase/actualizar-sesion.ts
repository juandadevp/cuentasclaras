import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseClave, supabaseConfigurado, supabaseUrl } from "./config";

const RUTAS_SOLO_INVITADOS = ["/login", "/registro"];

/**
 * Refresca la sesión de Supabase en cada petición (renueva las cookies del token)
 * y redirige a /login y /registro al inicio si el usuario ya inició sesión.
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

  if (haySesion && RUTAS_SOLO_INVITADOS.includes(request.nextUrl.pathname)) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/";
    destino.search = "";
    const redireccion = NextResponse.redirect(destino);
    respuesta.cookies.getAll().forEach((c) => redireccion.cookies.set(c));
    return redireccion;
  }

  return respuesta;
}
