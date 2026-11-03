import type { ErroresGasto } from "@/lib/validaciones-gasto";

/** Respuesta de las acciones de gastos (crear, editar, eliminar). */
export interface ResultadoGasto {
  /** Errores por campo (validación). */
  errores?: ErroresGasto;
  /** Error general (sesión vencida, base de datos, etc.). */
  mensaje?: string;
  ok?: boolean;
}
