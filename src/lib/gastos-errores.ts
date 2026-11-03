/** Traduce los errores de la base de datos al guardar o leer gastos a algo que la persona pueda entender. */
export function mensajeDeErrorGasto(error: { code?: string; message?: string }): string {
  switch (error.code) {
    case "42P01":
    case "PGRST205":
      return "Falta crear la tabla de gastos. Ejecuta la migración «gastos» en el SQL Editor de Supabase.";
    case "PGRST204":
      return "Falta actualizar la base de datos. Ejecuta la migración «gastos» en el SQL Editor de Supabase.";
    case "23514":
      return "Los datos no cumplen las reglas de la base de datos. Revisa la descripción, el valor, la fecha y la categoría.";
    case "42501":
      return "No tienes permiso para hacer esto. Inicia sesión de nuevo.";
  }
  return "No pudimos completar la operación con tus gastos. Inténtalo de nuevo.";
}
