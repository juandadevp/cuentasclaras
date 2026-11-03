import { ofertasDeRespuesta, type ResultadoGoogle } from "./respuesta-serpapi";
import { ErrorProveedor, type Oferta } from "./tipos";

const URL_SERPAPI = "https://serpapi.com/search.json";
const TIEMPO_MAXIMO_MS = 15_000;
const SERVIDORES_LOCALES = new Set(["localhost", "127.0.0.1", "[::1]"]);

/**
 * Dirección del servicio. `PRECIOS_API_URL` permite apuntar a un servidor de pruebas sin gastar cuota.
 * Debe ser https:// (o http:// solo en el propio equipo): si no, devuelve null para no enviar la clave a cualquier sitio.
 */
export function urlDelServicio(valor: string | undefined = process.env.PRECIOS_API_URL): string | null {
  if (!valor?.trim()) return URL_SERPAPI;
  try {
    const url = new URL(valor.trim());
    const seguro = url.protocol === "https:" || (url.protocol === "http:" && SERVIDORES_LOCALES.has(url.hostname));
    return seguro ? url.toString() : null;
  } catch {
    return null;
  }
}

export interface OpcionesConsulta {
  /** Para las pruebas: reemplaza a fetch. */
  fetch?: typeof fetch;
  /** Para las pruebas: reemplaza a PRECIOS_API_URL. */
  url?: string;
  tiempoMaximoMs?: number;
}

/**
 * Consulta Google Shopping (Colombia) a través de SerpApi, un servicio de pago con plan gratuito.
 * Devuelve ofertas de muchas tiendas con un solo llamado. Los fallos salen como ErrorProveedor con un código
 * (clave, limite, red, respuesta); nunca se registra la dirección (lleva la clave) ni el error crudo.
 */
export async function consultarSerpApi(consulta: string, clave: string, opciones: OpcionesConsulta = {}): Promise<Oferta[]> {
  const base = urlDelServicio(opciones.url ?? process.env.PRECIOS_API_URL);
  if (!base) throw new ErrorProveedor("respuesta", "PRECIOS_API_URL no es válida");

  const url = new URL(base);
  const parametros: Record<string, string> = {
    engine: "google_shopping",
    q: consulta,
    gl: "co",
    hl: "es",
    google_domain: "google.com.co",
    location: "Colombia",
    api_key: clave,
  };
  for (const [nombre, valor] of Object.entries(parametros)) url.searchParams.set(nombre, valor);

  let respuesta: Response;
  try {
    respuesta = await (opciones.fetch ?? fetch)(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(opciones.tiempoMaximoMs ?? TIEMPO_MAXIMO_MS),
    });
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

  if (datos?.error) {
    if (/invalid api key/i.test(datos.error)) throw new ErrorProveedor("clave");
    if (/run out of searches|limit/i.test(datos.error)) throw new ErrorProveedor("limite");
    // «Google hasn't returned any results» no es un fallo: simplemente no hay resultados.
    if (!/hasn't returned any results|no results/i.test(datos.error)) throw new ErrorProveedor("respuesta");
  }

  return ofertasDeRespuesta(datos);
}
