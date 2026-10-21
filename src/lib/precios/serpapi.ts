import { ErrorProveedor, type Oferta } from "./tipos";
import { parsearPrecio } from "./parsear-precio";

interface ResultadoGoogle {
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

const URL_API = process.env.PRECIOS_API_URL ?? "https://serpapi.com/search.json";

const soloHttps = (valor?: string) => {
  try {
    return valor && new URL(valor).protocol === "https:" ? valor : undefined;
  } catch {
    return undefined;
  }
};

/**
 * Consulta Google Shopping (Colombia) a través de SerpApi, un servicio de pago con plan gratuito.
 * Devuelve ofertas de muchas tiendas con un solo llamado.
 */
export async function consultarSerpApi(consulta: string, clave: string): Promise<Oferta[]> {
  const parametros = new URLSearchParams({
    engine: "google_shopping",
    q: consulta,
    gl: "co",
    hl: "es",
    google_domain: "google.com.co",
    location: "Colombia",
    api_key: clave,
  });

  let respuesta: Response;
  try {
    respuesta = await fetch(`${URL_API}?${parametros.toString()}`, { signal: AbortSignal.timeout(15_000) });
  } catch {
    throw new ErrorProveedor("red");
  }

  if (respuesta.status === 401 || respuesta.status === 403) throw new ErrorProveedor("clave");
  if (respuesta.status === 429) throw new ErrorProveedor("limite");
  if (!respuesta.ok) throw new ErrorProveedor("respuesta", `Estado ${respuesta.status}`);

  let datos: { shopping_results?: ResultadoGoogle[]; error?: string };
  try {
    datos = await respuesta.json();
  } catch {
    throw new ErrorProveedor("respuesta");
  }
  if (datos.error) {
    if (/invalid api key/i.test(datos.error)) throw new ErrorProveedor("clave");
    if (/run out of searches|limit/i.test(datos.error)) throw new ErrorProveedor("limite");
    // "Google hasn't returned any results" no es un fallo: simplemente no hay resultados.
    if (!/hasn't returned any results|no results/i.test(datos.error)) throw new ErrorProveedor("respuesta", datos.error);
  }

  const vistos = new Set<string>();
  const ofertas: Oferta[] = [];
  for (const r of datos.shopping_results ?? []) {
    const precio = parsearPrecio(r.price) ?? null;
    if (!r.title || !r.source || precio === null) continue;
    const clave = `${r.source}|${r.title}|${precio}|${r.product_id ?? ""}`;
    if (vistos.has(clave)) continue;
    vistos.add(clave);

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
