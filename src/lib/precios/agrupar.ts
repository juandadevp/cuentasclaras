import type { Oferta } from "./tipos";

export interface Producto {
  clave: string;
  titulo: string;
  imagen?: string;
  /** Ofertas de este producto en distintas tiendas, de la más barata a la más cara. */
  ofertas: Oferta[];
  minimo: number;
  maximo: number;
}

function tituloNormalizado(titulo: string): string {
  return titulo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Junta las ofertas que son del mismo producto: las que comparten identificador del buscador o, si no lo traen,
 * las que tienen exactamente el mismo título. Es conservador a propósito: es mejor mostrar dos tarjetas de un
 * mismo producto que mezclar presentaciones distintas (1 L con 3 L).
 */
export function agruparProductos(ofertas: Oferta[]): Producto[] {
  const grupos = new Map<string, Oferta[]>();
  for (const o of ofertas) {
    const clave = o.idProducto ? `id:${o.idProducto}` : `titulo:${tituloNormalizado(o.titulo)}`;
    grupos.set(clave, [...(grupos.get(clave) ?? []), o]);
  }

  return [...grupos.entries()].map(([clave, lista]) => {
    const ordenadas = [...lista].sort((a, b) => a.precio - b.precio);
    return {
      clave,
      titulo: ordenadas[0].titulo,
      imagen: lista.find((o) => o.imagen)?.imagen,
      ofertas: ordenadas,
      minimo: ordenadas[0].precio,
      maximo: ordenadas[ordenadas.length - 1].precio,
    };
  });
}
