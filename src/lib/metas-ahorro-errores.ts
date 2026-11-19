/** Traduce los errores de la base de datos al guardar o leer la meta de ahorro a algo que la persona pueda entender. */
export function mensajeDeErrorMeta(error: { code?: string; message?: string }): string {
  switch (error.code) {
    case "42P01":
    case "PGRST205":
      return "Falta crear la tabla de metas de ahorro. Ejecuta la migración «metas_ahorro» en el SQL Editor de Supabase.";
    case "23514":
      return "Los datos no cumplen las reglas de la base de datos. Revisa el monto de la meta y el mes.";
    case "42501":
      return "No tienes permiso para hacer esto. Inicia sesión de nuevo.";
  }
  return "No pudimos completar la operación con tu meta de ahorro. Inténtalo de nuevo.";
}
