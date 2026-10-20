import { ofertasDeEjemplo } from "./demo";
import { detectarRubro } from "./detectar";
import { tiendaRelevante, tiendasDelRubro, type Rubro } from "./rubros";
import { consultarSerpApi } from "./serpapi";
import type { Oferta, ResultadoBusqueda } from "./tipos";

const VIGENCIA_MS = 5 * 60_000;
const MAXIMO_ENTRADAS = 200;
const cache = new Map<string, { expira: number; ofertas: Oferta[] }>();

/**
 * Consulta al proveedor con una caché en memoria de 5 minutos: ahorra búsquedas del plan y responde más rápido
 * cuando varias personas buscan lo mismo. Solo se guardan las respuestas correctas, nunca los errores.
 */
async function ofertasReales(consulta: string, clave: string): Promise<Oferta[]> {
  const llave = consulta.toLowerCase();
  const guardada = cache.get(llave);
  if (guardada && guardada.expira > Date.now()) return guardada.ofertas;

  const ofertas = await consultarSerpApi(consulta, clave);

  if (cache.size >= MAXIMO_ENTRADAS) cache.delete(cache.keys().next().value as string);
  cache.set(llave, { expira: Date.now() + VIGENCIA_MS, ofertas });
  return ofertas;
}

/**
 * Busca precios de un producto. El tipo de producto (medicamento, alimento, tecnología…) se detecta por el texto,
 * o lo elige la persona, y cada oferta se marca como relevante si la tienda vende ese tipo de producto.
 */
export async function buscarOfertas(consulta: string, rubroElegido?: Rubro): Promise<ResultadoBusqueda> {
  const clave = process.env.SERPAPI_API_KEY;
  const rubro = rubroElegido ?? detectarRubro(consulta).rubro;

  const crudas = clave ? await ofertasReales(consulta, clave) : ofertasDeEjemplo(consulta, rubro);

  const ofertas = crudas
    .map((o) => ({ ...o, relevante: rubro ? tiendaRelevante(o.tienda, rubro) : true }))
    .sort((a, b) => a.precio - b.precio);

  return {
    ok: true,
    ofertas,
    modo: clave ? "real" : "demo",
    actualizado: new Date().toISOString(),
    rubro,
    automatico: !rubroElegido,
    tiendasDelTipo: rubro ? tiendasDelRubro(rubro).map((f) => f.nombre) : [],
  };
}
