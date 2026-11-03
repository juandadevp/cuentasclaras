import type { CodigoErrorProveedor } from "./tipos";

const mensajes: Record<CodigoErrorProveedor, string> = {
  clave: "La clave del servicio de precios no es válida. Revisa SERPAPI_API_KEY.",
  limite: "Se alcanzó el límite de búsquedas del servicio de precios. Inténtalo más tarde.",
  red: "No pudimos conectarnos al servicio de precios. Inténtalo de nuevo en un momento.",
  respuesta: "El servicio de precios respondió algo inesperado. Inténtalo de nuevo.",
};

/** Mensaje en español para cada tipo de fallo del proveedor. Nunca incluye el texto crudo del proveedor. */
export function mensajeDeErrorProveedor(codigo: CodigoErrorProveedor): string {
  return mensajes[codigo];
}
