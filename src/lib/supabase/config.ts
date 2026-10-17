export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseClave =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** true cuando las variables de entorno de Supabase están definidas. */
export function supabaseConfigurado(): boolean {
  return Boolean(supabaseUrl && supabaseClave);
}

export const MENSAJE_SIN_CONFIGURAR =
  "El servicio de cuentas aún no está configurado. Agrega las variables de Supabase en .env.local.";
