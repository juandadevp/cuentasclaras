import { categorias } from "@/config/site";
import type { Categoria } from "@/types/gasto";
import { ofertasDeEjemplo } from "./demo";
import { tiendaEnCategoria } from "./franquicias";
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

export const esCategoriaValida = (v: string): v is Categoria => categorias.some((c) => c.valor === v);

export async function buscarOfertas(consulta: string, categoria?: Categoria): Promise<ResultadoBusqueda> {
  const clave = process.env.SERPAPI_API_KEY;
  const modo = clave ? "real" : "demo";

  let ofertas = clave ? await ofertasReales(consulta, clave) : ofertasDeEjemplo(consulta, categoria);

  if (categoria && clave) {
    ofertas = ofertas.filter((o) => tiendaEnCategoria(o.tienda, categoria));
  }
  ofertas.sort((a, b) => a.precio - b.precio);

  return { ok: true, ofertas, modo, actualizado: new Date().toISOString() };
}
