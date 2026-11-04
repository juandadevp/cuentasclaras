import type { Producto } from "@/lib/precios/agrupar";
import { soloHttps, type ParametrosPagina } from "@/lib/precios/compra";
import { esRubro, type Rubro } from "@/lib/precios/rubros";
import { BUSQUEDA_MAXIMA } from "@/lib/precios/validar-busqueda";

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
  tipo?: string;
  ofertas: OfertaFavorita[];
}

export interface Favorito extends ProductoFavorito {
  id: string;
  fecha: string;
}

export interface ResultadoFavorito {
  ok: boolean;
  mensaje?: string;
}

export const MAXIMO_OFERTAS = 30;
export const LARGO_CLAVE = 200;
const PRECIO_MAXIMO = 999_999_999;

/** Quita caracteres de control y espacios de más; devuelve undefined si no queda nada. */
function texto(valor: unknown, maximo: number): string | undefined {
  if (typeof valor !== "string") return undefined;
  const limpio = valor.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  return limpio ? limpio.slice(0, maximo) : undefined;
}

/** La clave de un producto, con el largo máximo que acepta la base. La usan la estrella y el servidor. */
export const recortarClave = (clave: string): string => clave.slice(0, LARGO_CLAVE);

/**
 * Valida y limpia lo que llega del navegador antes de guardarlo: nunca se confía en esos datos.
 * Devuelve null si no se puede aprovechar.
 */
export function limpiarProducto(entrada: unknown): ProductoFavorito | null {
  if (typeof entrada !== "object" || entrada === null || Array.isArray(entrada)) return null;
  const e = entrada as Record<string, unknown>;

  const clave = typeof e.clave === "string" && e.clave.trim() ? recortarClave(e.clave.trim()) : undefined;
  const titulo = texto(e.titulo, 200);
  if (!clave || !titulo || !Array.isArray(e.ofertas)) return null;

  const ofertas: OfertaFavorita[] = [];
  for (const o of e.ofertas) {
    if (ofertas.length >= MAXIMO_OFERTAS) break;
    if (typeof o !== "object" || o === null) continue;
    const x = o as Record<string, unknown>;
    const tienda = texto(x.tienda, 80);
    const precio = typeof x.precio === "number" && Number.isFinite(x.precio) ? Math.round(x.precio) : 0;
    if (!tienda || precio <= 0 || precio > PRECIO_MAXIMO) continue;
    ofertas.push({
      tienda,
      precio,
      enlace: soloHttps(typeof x.enlace === "string" ? x.enlace : undefined),
      detalle: texto(x.detalle, 120),
    });
  }
  if (ofertas.length === 0) return null;

  return {
    clave,
    titulo,
    imagen: soloHttps(typeof e.imagen === "string" ? e.imagen : undefined),
    tipo: texto(e.tipo, 40),
    ofertas,
  };
}

/** Lo que se envía a guardar cuando se marca la estrella de un producto de «Recomendar compras». */
export function productoAFavorito(producto: Producto, tipo: Rubro | null | undefined): ProductoFavorito {
  return {
    clave: recortarClave(producto.clave),
    titulo: producto.titulo,
    imagen: producto.imagen,
    tipo: tipo ?? undefined,
    // Las ofertas ya vienen de la más barata a la más cara: si hay más de 30 se conservan las más baratas.
    ofertas: producto.ofertas.slice(0, MAXIMO_OFERTAS).map((o) => ({ tienda: o.tienda, precio: o.precio, enlace: o.enlace, detalle: o.detalle })),
  };
}

/** Conjunto nuevo de claves favoritas con un cambio aplicado (no modifica el original). */
export function aplicarCambioFavorito(claves: ReadonlySet<string>, cambio: { clave: string; activo: boolean }): Set<string> {
  const nuevo = new Set(claves);
  if (cambio.activo) nuevo.add(cambio.clave);
  else nuevo.delete(cambio.clave);
  return nuevo;
}

/** Ofertas de menor a mayor precio (sin modificar la lista) con el precio mínimo y máximo. */
export function resumirOfertas(ofertas: OfertaFavorita[]): { ordenadas: OfertaFavorita[]; minimo: number; maximo: number } {
  const ordenadas = [...ofertas].sort((a, b) => a.precio - b.precio);
  return { ordenadas, minimo: ordenadas[0]?.precio ?? 0, maximo: ordenadas[ordenadas.length - 1]?.precio ?? 0 };
}

/** Enlace de «Buscar precios actuales»: abre «Recomendar compras» con el producto ya escrito. */
export function enlaceBuscarPrecios(favorito: Pick<ProductoFavorito, "titulo" | "tipo">): string {
  const p = new URLSearchParams({ q: favorito.titulo.replace(/\s+/g, " ").trim().slice(0, BUSQUEDA_MAXIMA) });
  if (favorito.tipo && esRubro(favorito.tipo)) p.set("tipo", favorito.tipo);
  return `/panel/recomendar?${p.toString()}`;
}

const valor = (v: string | string[] | undefined): string => (typeof v === "string" ? v : "");

/** Lee y limpia el texto y el tipo con los que puede llegar «Recomendar compras» (vienen de la barra de direcciones). */
export function leerBusquedaInicial(params: ParametrosPagina): { consulta: string; tipo: Rubro | "" } {
  const consulta = valor(params.q)
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, BUSQUEDA_MAXIMA);
  const tipo = valor(params.tipo);
  return { consulta, tipo: esRubro(tipo) ? tipo : "" };
}

/** Traduce los errores de la base de datos al guardar o leer favoritos. Nunca devuelve el texto crudo. */
export function mensajeDeErrorFavoritos(error: { code?: string; message?: string }): string {
  switch (error.code) {
    case "42P01":
    case "PGRST205":
      return "Falta crear la tabla de favoritos. Ejecuta la migración «favoritos» en el SQL Editor de Supabase.";
    case "PGRST204":
      return "Falta actualizar la base de datos. Ejecuta la migración «favoritos» en el SQL Editor de Supabase.";
    case "23514":
      return "No pudimos guardar este producto: los datos no cumplen las reglas.";
    case "42501":
      return "No tienes permiso para hacer esto. Inicia sesión de nuevo.";
  }
  return "No pudimos actualizar tus favoritos. Inténtalo de nuevo.";
}
