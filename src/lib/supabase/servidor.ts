import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseClave, supabaseUrl } from "./config";

/** Cliente de Supabase para Server Components, Server Actions y Route Handlers. */
export async function crearClienteServidor() {
  const almacen = await cookies();

  return createServerClient(supabaseUrl!, supabaseClave!, {
    cookies: {
      getAll: () => almacen.getAll(),
      setAll: (lista) => {
        try {
          lista.forEach(({ name, value, options }) => almacen.set(name, value, options));
        } catch {
          // Se llamó desde un Server Component (solo lectura): el proxy refresca la sesión.
        }
      },
    },
  });
}
