export interface DatosContacto {
  nombre: string;
  correo: string;
  asunto: string;
  mensaje: string;
}

export type ErroresContacto = Partial<Record<keyof DatosContacto, string>>;

export interface ResultadoContacto {
  ok?: boolean;
  errores?: ErroresContacto;
  mensaje?: string;
}
