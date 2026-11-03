export interface ResultadoAuth {
  /** Errores por campo (validación o correo duplicado). */
  errores?: Partial<Record<string, string>>;
  /** Error general (credenciales incorrectas, servicio caído, etc.). */
  mensaje?: string;
  /** El registro se creó pero falta confirmar el correo. */
  requiereConfirmacion?: boolean;
  /** Se pidió recuperar la contraseña. Es true exista o no la cuenta, para no revelar qué correos están registrados. */
  enlaceEnviado?: boolean;
}
