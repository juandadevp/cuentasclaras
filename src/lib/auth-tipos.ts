export interface ResultadoAuth {
  /** Errores por campo (validación o correo duplicado). */
  errores?: Partial<Record<string, string>>;
  /** Error general (credenciales incorrectas, servicio caído, etc.). */
  mensaje?: string;
  /** El registro se creó pero falta confirmar el correo. */
  requiereConfirmacion?: boolean;
}
