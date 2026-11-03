import type { Producto } from "./agrupar";
import type { Rubro } from "./rubros";
import type { Oferta } from "./tipos";

/** Cuántas tiendas se ven en cada tarjeta antes del desplegable. */
export const TIENDAS_VISIBLES = 3;

/**
 * Ofertas que se muestran: todas, o solo las de tiendas donde se vende el tipo de producto detectado
 * (a menos que la persona pida ver también las otras).
 */
export function ofertasVisibles(ofertas: Oferta[], { detectado, verOtras }: { detectado: Rubro | null | undefined; verOtras: boolean }): Oferta[] {
  if (verOtras || !detectado) return ofertas;
  return ofertas.filter((o) => o.relevante !== false);
}

/** Cuántas ofertas son de tiendas que no venden este tipo de producto. */
export const contarAjenas = (ofertas: Oferta[]): number => ofertas.filter((o) => o.relevante === false).length;

/** Nombres de tienda sin repetir, en el orden en que aparecen. */
export const tiendasDe = (ofertas: Oferta[]): string[] => [...new Set(ofertas.map((o) => o.tienda))];

export const filtrarPorTienda = (ofertas: Oferta[], tienda: string | null): Oferta[] =>
  tienda ? ofertas.filter((o) => o.tienda === tienda) : ofertas;

/** La oferta de menor precio; si hay empate, la primera. */
export function ofertaMasBarata(ofertas: Oferta[]): Oferta | undefined {
  return ofertas.reduce<Oferta | undefined>((mejor, o) => (!mejor || o.precio < mejor.precio ? o : mejor), undefined);
}

/** Productos ordenados por su precio mínimo. No modifica la lista original. */
export function ordenarProductos(productos: Producto[], orden: "asc" | "desc"): Producto[] {
  return [...productos].sort((a, b) => (orden === "asc" ? a.minimo - b.minimo : b.minimo - a.minimo));
}

/** Las primeras tiendas de un producto y el resto (que va en un desplegable). */
export function dividirTiendas(ofertas: Oferta[]): { primeras: Oferta[]; otras: Oferta[] } {
  return { primeras: ofertas.slice(0, TIENDAS_VISIBLES), otras: ofertas.slice(TIENDAS_VISIBLES) };
}

/** «hace unos segundos» o «hace N min». Recibe la hora actual para no depender del reloj. */
export function haceCuanto(isoActualizado: string, ahoraMs: number): string {
  const segundos = Math.max(0, Math.round((ahoraMs - new Date(isoActualizado).getTime()) / 1000));
  return Number.isNaN(segundos) || segundos < 60 ? "hace unos segundos" : `hace ${Math.round(segundos / 60)} min`;
}
