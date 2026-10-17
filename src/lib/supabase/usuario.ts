import { cache } from "react";
import { connection } from "next/server";
import { supabaseConfigurado } from "./config";
import { crearClienteServidor } from "./servidor";

export interface UsuarioSesion {
  id: string;
  email: string;
  nombre: string;
}

/**
 * Devuelve el usuario con sesión iniciada, o null si no hay sesión (o Supabase no está configurado).
 * Se memoriza por petición: varios componentes pueden llamarla sin repetir la consulta.
 */
export const obtenerUsuario = cache(async (): Promise<UsuarioSesion | null> => {
  // Siempre dinámico: la sesión depende de cada petición (así nunca se congela como "invitado" en el HTML estático).
  await connection();
  if (!supabaseConfigurado()) return null;

  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const email = data.user.email ?? "";
  const nombre = (data.user.user_metadata?.nombre as string | undefined) || email.split("@")[0];
  return { id: data.user.id, email, nombre };
});
