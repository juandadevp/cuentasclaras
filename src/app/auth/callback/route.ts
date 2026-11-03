import { NextResponse, type NextRequest } from "next/server";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";

/** A dónde puede llevar el enlace del correo. Solo rutas de esta lista: nunca una dirección que venga en la URL. */
const DESTINOS_PERMITIDOS = ["/panel"];

/** Destino del enlace que envía Supabase para confirmar el correo. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const pedido = searchParams.get("siguiente") ?? "";
  const destino = DESTINOS_PERMITIDOS.includes(pedido) ? pedido : "/panel";

  if (code && supabaseConfigurado()) {
    const supabase = await crearClienteServidor();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${destino}`);
  }

  return NextResponse.redirect(`${origin}/login`);
}
