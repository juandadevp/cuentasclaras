/** Traduce los errores de la base de datos al guardar o leer presupuestos a algo que la persona pueda entender. */
export function mensajeDeErrorPresupuesto(error: { code?: string; message?: string }): string {
  switch (error.code) {
    case "42P01":
    case "PGRST205":
      return "Falta crear la tabla de presupuestos. Ejecuta la migración «presupuestos» en el SQL Editor de Supabase.";
    case "23514":
      return "Los datos no cumplen las reglas de la base de datos. Revisa la categoría, el límite y el mes.";
    case "42501":
      return "No tienes permiso para hacer esto. Inicia sesión de nuevo.";
  }
  return "No pudimos completar la operación con tus presupuestos. Inténtalo de nuevo.";
}
