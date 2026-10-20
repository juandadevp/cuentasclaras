export interface Oferta {
  titulo: string;
  /** Nombre de la tienda tal como la devuelve el proveedor. */
  tienda: string;
  /** Precio en pesos colombianos. */
  precio: number;
  /** Enlace a la oferta (solo https). */
  enlace?: string;
  imagen?: string;
  /** Texto extra: envío, calificación, etc. */
  detalle?: string;
}

export interface ResultadoBusqueda {
  ok: boolean;
  ofertas: Oferta[];
  /** "real": precios consultados a un proveedor. "demo": datos de ejemplo (sin proveedor configurado). */
  modo: "real" | "demo";
  /** Momento de la consulta (ISO). */
  actualizado: string;
  mensaje?: string;
}

export type CodigoErrorProveedor = "clave" | "limite" | "red" | "respuesta";

export class ErrorProveedor extends Error {
  constructor(
    public codigo: CodigoErrorProveedor,
    mensaje?: string,
  ) {
    // El código también va en el mensaje por si el error pierde su clase al cruzar una frontera de servidor.
    super(mensaje ? `proveedor:${codigo}:${mensaje}` : `proveedor:${codigo}`);
    this.name = "ErrorProveedor";
  }
}

/** Recupera el código de un error del proveedor aunque haya perdido su clase (p. ej. tras la caché). */
export function codigoDeError(e: unknown): CodigoErrorProveedor {
  if (e instanceof ErrorProveedor) return e.codigo;
  const m = /proveedor:(clave|limite|red|respuesta)/.exec(e instanceof Error ? e.message : String(e));
  return (m?.[1] as CodigoErrorProveedor | undefined) ?? "respuesta";
}
