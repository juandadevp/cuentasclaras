export interface OfertaFavorita {
  tienda: string;
  precio: number;
  enlace?: string;
  detalle?: string;
}

export interface ProductoFavorito {
  clave: string;
  titulo: string;
  imagen?: string;
  rubro?: string;
  ofertas: OfertaFavorita[];
}

export interface Favorito extends ProductoFavorito {
  id: string;
  creadoEn: string;
}

const texto = (v: unknown, max: number): string | undefined => {
  if (typeof v !== "string") return undefined;
  const limpio = v.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  return limpio ? limpio.slice(0, max) : undefined;
};

const soloHttps = (v: unknown): string | undefined => {
  if (typeof v !== "string" || v.length > 600) return undefined;
  try {
    return new URL(v).protocol === "https:" ? v : undefined;
  } catch {
    return undefined;
  }
};

/**
 * Valida y limpia lo que llega del navegador antes de guardarlo: nunca se confía en los datos del cliente.
 * Devuelve null si no se puede aprovechar.
 */
export function limpiarProducto(entrada: unknown): ProductoFavorito | null {
  if (typeof entrada !== "object" || entrada === null) return null;
  const e = entrada as Record<string, unknown>;

  const clave = texto(e.clave, 200);
  const titulo = texto(e.titulo, 200);
  if (!clave || !titulo || !Array.isArray(e.ofertas)) return null;

  const ofertas: OfertaFavorita[] = [];
  for (const o of e.ofertas.slice(0, 30)) {
    if (typeof o !== "object" || o === null) continue;
    const x = o as Record<string, unknown>;
    const tienda = texto(x.tienda, 80);
    const precio = typeof x.precio === "number" && Number.isFinite(x.precio) ? Math.round(x.precio) : 0;
    if (!tienda || precio <= 0 || precio > 999_999_999) continue;
    ofertas.push({ tienda, precio, enlace: soloHttps(x.enlace), detalle: texto(x.detalle, 120) });
  }
  if (ofertas.length === 0) return null;

  return { clave, titulo, imagen: soloHttps(e.imagen), rubro: texto(e.rubro, 40), ofertas };
}
