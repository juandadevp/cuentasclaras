import { ofertasDeEjemplo } from "./demo";
import { detectarRubro } from "./detectar";
import { tiendaRelevante, tiendasDelRubro, type Rubro } from "./rubros";
import { consultarSerpApi } from "./serpapi";
import type { Oferta, ResultadoBusqueda } from "./tipos";

const VIGENCIA_MS = 5 * 60_000;
const MAXIMO_ENTRADAS = 200;

// Caché propia en memoria (no `use cache`: en producción los errores que pasan por ahí pierden su clase).
// Guarda solo ofertas públicas de respuestas correctas, nunca errores ni datos de personas.
const cache = new Map<string, { expira: number; ofertas: Oferta[] }>();
// Búsquedas idénticas que todavía no terminan: comparten una sola consulta al proveedor.
const enCurso = new Map<string, Promise<Oferta[]>>();

export interface Dependencias {
  /** Clave del proveedor; por defecto SERPAPI_API_KEY (solo servidor). */
  clave?: string;
  consultar?: typeof consultarSerpApi;
  ahora?: () => number;
}

/** true si hay una clave configurada (modo real); si no, el comparador usa precios de ejemplo. */
export function hayClaveConfigurada(clave: string | undefined = process.env.SERPAPI_API_KEY): boolean {
  return Boolean(clave?.trim());
}

/** Solo para pruebas. */
export function vaciarCacheDePrecios() {
  cache.clear();
  enCurso.clear();
}

const llaveDeCache = (consulta: string) => consulta.trim().replace(/\s+/g, " ").toLowerCase();

/** Consulta al proveedor con caché de 5 minutos: ahorra búsquedas del plan y responde más rápido. */
async function ofertasReales(consulta: string, clave: string, consultar: typeof consultarSerpApi, ahora: () => number) {
  const llave = llaveDeCache(consulta);
  const guardada = cache.get(llave);
  if (guardada && guardada.expira > ahora()) return guardada.ofertas;

  const pendiente = enCurso.get(llave);
  if (pendiente) return pendiente;

  const consultaNueva = consultar(consulta, clave)
    .then((ofertas) => {
      if (cache.size >= MAXIMO_ENTRADAS) cache.delete(cache.keys().next().value as string);
      cache.set(llave, { expira: ahora() + VIGENCIA_MS, ofertas });
      return ofertas;
    })
    .finally(() => enCurso.delete(llave));
  enCurso.set(llave, consultaNueva);
  return consultaNueva;
}

/**
 * Busca precios de un producto. El tipo de producto (medicamento, alimento, tecnología…) se detecta por el texto,
 * o lo elige la persona, y cada oferta se marca como relevante si la tienda vende ese tipo de producto.
 * Sin clave configurada devuelve precios de ejemplo (modo «demo»).
 */
export async function buscarOfertas(consulta: string, rubroElegido?: Rubro, dependencias: Dependencias = {}): Promise<ResultadoBusqueda> {
  const clave = (dependencias.clave ?? process.env.SERPAPI_API_KEY)?.trim();
  const rubro = rubroElegido ?? detectarRubro(consulta).rubro;

  const crudas = clave
    ? await ofertasReales(consulta, clave, dependencias.consultar ?? consultarSerpApi, dependencias.ahora ?? Date.now)
    : ofertasDeEjemplo(consulta, rubro);

  const ofertas = crudas
    .map((o) => ({ ...o, relevante: rubro ? tiendaRelevante(o.tienda, rubro) : true }))
    .sort((a, b) => a.precio - b.precio);

  return {
    ok: true,
    ofertas,
    modo: clave ? "real" : "demo",
    actualizado: new Date((dependencias.ahora ?? Date.now)()).toISOString(),
    rubro,
    automatico: !rubroElegido,
    tiendasDelTipo: rubro ? tiendasDelRubro(rubro).map((f) => f.nombre) : [],
  };
}
