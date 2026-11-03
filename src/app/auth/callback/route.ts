import { NextResponse, type NextRequest } from "next/server";
import { elegirDestino, rutaSiFallaElEnlace } from "@/lib/auth-destinos";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";

/** Destino del enlace que envía Supabase: confirmar el correo o recuperar la contraseña. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  // Solo rutas de la lista cerrada: nunca una dirección que venga en la URL.
  const destino = elegirDestino(searchParams.get("siguiente"));

  if (code && supabaseConfigurado()) {
    const supabase = await crearClienteServidor();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${destino}`);
  }

  // Un enlace vencido, ya usado o abierto en otro navegador vuelve a pedir uno nuevo.
  return NextResponse.redirect(`${origin}${rutaSiFallaElEnlace(destino)}`);
}
