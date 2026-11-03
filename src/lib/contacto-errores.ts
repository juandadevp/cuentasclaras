/** Traduce los errores de la base de datos al enviar un mensaje de contacto. Nunca devuelve el texto crudo. */
export function mensajeDeErrorContacto(error: { code?: string; message?: string }): string {
  switch (error.code) {
    case "42P01":
    case "PGRST205":
      return "Falta crear la tabla de contacto. Ejecuta la migración «contacto» en el SQL Editor de Supabase.";
    case "PGRST204":
      return "Falta actualizar la base de datos. Ejecuta la migración «contacto» en el SQL Editor de Supabase.";
    case "23514":
      return "Los datos no cumplen las reglas de la base de datos. Revisa tu nombre, tu correo y tu mensaje.";
    case "42501":
      return "No pudimos enviar tu mensaje. Inténtalo más tarde.";
  }
  return "No pudimos enviar tu mensaje. Inténtalo de nuevo en un momento.";
}
