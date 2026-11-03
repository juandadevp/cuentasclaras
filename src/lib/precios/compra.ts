import { esRubro, rubros, type Rubro } from "./rubros";
import type { Oferta } from "./tipos";
import {
  esCategoria,
  formatearMontoEscrito,
  MONTO_MAXIMO,
  normalizarDescripcion,
  parsearMonto,
  type DatosGasto,
} from "@/lib/validaciones-gasto";

/** Largo máximo de un enlace o imagen que viaja en la dirección de «Registrar gasto». */
const LARGO_MAXIMO_ENLACE = 600;
const LARGO_MAXIMO_TEXTO = 80;

/** Datos de la compra que llega desde «Recomendar compras», ya validados. */
export interface CompraRecomendada {
  producto: string;
  precio: number;
  tienda?: string;
  enlace?: string;
  imagen?: string;
  tipo?: Rubro;
  categoria?: string;
}

export type ParametrosPagina = Record<string, string | string[] | undefined>;

/** Devuelve la dirección solo si es una URL válida `https://` de hasta 600 caracteres y sin usuario ni clave. */
export function soloHttps(valor: string | undefined): string | undefined {
  if (!valor || valor.length > LARGO_MAXIMO_ENLACE) return undefined;
  try {
    const url = new URL(valor);
    if (url.protocol !== "https:" || url.username || url.password) return undefined;
    return url.href.length <= LARGO_MAXIMO_ENLACE ? url.href : undefined;
  } catch {
    return undefined;
  }
}

/** «https://www.alkosto.com/x» → «alkosto.com». Para mostrar adónde lleva un enlace. */
export function dominioDe(enlace: string): string {
  try {
    return new URL(enlace).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * Enlace a «Registrar gasto» con los datos de la compra: producto, precio, tienda, enlace, foto y tipo.
 * La categoría del gasto se elige sola según el tipo de producto (tecnología → Tecnología).
 */
export function enlaceRegistrar(oferta: Oferta, rubro: Rubro | null | undefined, imagen?: string): string {
  const p = new URLSearchParams({
    origen: "recomendar",
    descripcion: normalizarDescripcion(oferta.titulo).slice(0, LARGO_MAXIMO_TEXTO),
    monto: String(Math.round(oferta.precio)),
    tienda: normalizarDescripcion(oferta.tienda).slice(0, LARGO_MAXIMO_TEXTO),
  });
  if (rubro) {
    p.set("categoria", rubros[rubro].categoriaGasto);
    p.set("tipo", rubro);
  }
  const enlace = soloHttps(oferta.enlace);
  if (enlace) p.set("enlace", enlace);
  const foto = soloHttps(imagen);
  if (foto) p.set("imagen", foto);
  return `/panel/registrar?${p.toString()}`;
}

/** Búsqueda en Google Shopping de este producto en esa tienda: sirve cuando la oferta no trae enlace directo. */
export function enlaceBusquedaTienda(oferta: Oferta, producto: string): string {
  const p = new URLSearchParams({ tbm: "shop", q: `${producto} ${oferta.tienda}`, gl: "co", hl: "es" });
  return `https://www.google.com.co/search?${p.toString()}`;
}

const texto = (v: string | string[] | undefined): string => (typeof v === "string" ? v : "");

/**
 * Lee y limpia los valores con los que puede llegar «Registrar gasto». Vienen de la barra de direcciones, así que
 * nada se usa sin revisar: largo, lista permitida y solo enlaces `https://`.
 */
export function leerParametrosRegistro(params: ParametrosPagina): {
  valoresIniciales: Partial<DatosGasto>;
  compra?: CompraRecomendada;
} {
  const valoresIniciales: Partial<DatosGasto> = {};

  const descripcion = normalizarDescripcion(texto(params.descripcion)).slice(0, LARGO_MAXIMO_TEXTO);
  const precio = parsearMonto(texto(params.monto));
  const montoValido = precio !== null && precio > 0 && precio <= MONTO_MAXIMO;
  const categoria = texto(params.categoria);
  const tienda = normalizarDescripcion(texto(params.tienda)).slice(0, LARGO_MAXIMO_TEXTO);

  if (descripcion) valoresIniciales.descripcion = descripcion;
  if (montoValido) valoresIniciales.monto = formatearMontoEscrito(String(precio));
  if (esCategoria(categoria)) valoresIniciales.categoria = categoria;
  if (tienda) valoresIniciales.tienda = tienda;

  if (texto(params.origen) !== "recomendar" || !descripcion || !montoValido) return { valoresIniciales };

  const tipo = texto(params.tipo);
  return {
    valoresIniciales,
    compra: {
      producto: descripcion,
      precio,
      tienda: tienda || undefined,
      enlace: soloHttps(texto(params.enlace)),
      imagen: soloHttps(texto(params.imagen)),
      tipo: esRubro(tipo) ? tipo : undefined,
      categoria: valoresIniciales.categoria,
    },
  };
}
