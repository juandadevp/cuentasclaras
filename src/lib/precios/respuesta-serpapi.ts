import { parsearPrecio } from "./parsear-precio";
import type { Oferta } from "./tipos";

/** Un resultado de Google Shopping tal como lo devuelve SerpApi (solo los campos que usamos). */
export interface ResultadoGoogle {
  title?: string;
  product_id?: string | number;
  source?: string;
  price?: string;
  extracted_price?: number;
  link?: string;
  product_link?: string;
  thumbnail?: string;
  delivery?: string;
  rating?: number;
  reviews?: number;
}

/** El enlace solo se acepta si es una dirección https:// válida. */
export function soloHttps(valor: unknown): string | undefined {
  if (typeof valor !== "string" || valor.length > 2000) return undefined;
  try {
    return new URL(valor).protocol === "https:" ? valor : undefined;
  } catch {
    return undefined;
  }
}

/** Convierte la respuesta de SerpApi en ofertas propias. Descarta lo que no sirva y quita repetidos. */
export function ofertasDeRespuesta(datos: { shopping_results?: ResultadoGoogle[] } | null | undefined): Oferta[] {
  const vistos = new Set<string>();
  const ofertas: Oferta[] = [];

  for (const r of Array.isArray(datos?.shopping_results) ? datos.shopping_results : []) {
    if (!r || typeof r.title !== "string" || typeof r.source !== "string" || !r.title.trim() || !r.source.trim()) continue;
    // extracted_price ya viene como número; si falta o no sirve, se lee el texto del precio.
    const precio = parsearPrecio(r.extracted_price) ?? parsearPrecio(r.price);
    if (precio === null) continue;

    const llave = `${r.source}|${r.title}|${precio}|${r.product_id ?? ""}`;
    if (vistos.has(llave)) continue;
    vistos.add(llave);

    const partes = [r.delivery, r.rating ? `★ ${r.rating}${r.reviews ? ` (${r.reviews})` : ""}` : undefined].filter(Boolean);
    ofertas.push({
      titulo: r.title,
      tienda: r.source,
      precio,
      idProducto: r.product_id !== undefined ? String(r.product_id) : undefined,
      enlace: soloHttps(r.link) ?? soloHttps(r.product_link),
      imagen: soloHttps(r.thumbnail),
      detalle: partes.length ? partes.join(" · ") : undefined,
    });
  }
  return ofertas;
}
