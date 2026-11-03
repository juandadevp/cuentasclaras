import type { NextRequest } from "next/server";
import { actualizarSesion } from "@/lib/supabase/actualizar-sesion";

export async function proxy(request: NextRequest) {
  return actualizarSesion(request);
}

export const config = {
  // Todas las rutas excepto archivos estáticos e imágenes.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
