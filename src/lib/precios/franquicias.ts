import type { Categoria } from "@/types/gasto";

export interface Franquicia {
  nombre: string;
  /** Fragmentos (sin tildes ni espacios, en minúscula) que, si aparecen en el nombre de la tienda, la identifican. */
  claves: string[];
  /** Nombres cortos que solo cuentan si coinciden exactamente (evita confundir "Ara" con "Para ti"). */
  exactas?: string[];
}

const exito = { nombre: "Éxito", claves: ["exito"] };
const carulla = { nombre: "Carulla", claves: ["carulla"] };
const jumbo = { nombre: "Jumbo", claves: ["jumbo"] };
const metro = { nombre: "Metro", claves: ["tiendasmetro", "metrocolombia", "metro.com.co"], exactas: ["metro"] };
const olimpica = { nombre: "Olímpica", claves: ["olimpica"] };
const d1 = { nombre: "D1", claves: ["tiendasd1", "tiendad1", "d1.com"], exactas: ["d1"] };
const ara = { nombre: "Ara", claves: ["tiendasara", "aracolombia", "ara.com.co"], exactas: ["ara"] };
const alkosto = { nombre: "Alkosto", claves: ["alkosto"] };
const ktronix = { nombre: "Ktronix", claves: ["ktronix"] };
const falabella = { nombre: "Falabella", claves: ["falabella"] };
const homecenter = { nombre: "Homecenter", claves: ["homecenter"] };
const easy = { nombre: "Easy", claves: ["easy.com", "easycolombia"], exactas: ["easy"] };
const mercadoLibre = { nombre: "Mercado Libre", claves: ["mercadolibre", "mercadolivre"] };
const amazon = { nombre: "Amazon", claves: ["amazon"] };
const farmatodo = { nombre: "Farmatodo", claves: ["farmatodo"] };
const cruzVerde = { nombre: "Cruz Verde", claves: ["cruzverde"] };
const locatel = { nombre: "Locatel", claves: ["locatel"] };
const laRebaja = { nombre: "La Rebaja", claves: ["larebaja", "drogueriaslarebaja"] };
const decathlon = { nombre: "Decathlon", claves: ["decathlon"] };
const panamericana = { nombre: "Panamericana", claves: ["panamericana"] };
const claro = { nombre: "Claro", claves: ["claro"] };
const movistar = { nombre: "Movistar", claves: ["movistar"] };
const auteco = { nombre: "Auteco", claves: ["auteco"] };

/** Tiendas y franquicias de Colombia que se relacionan con cada categoría de gasto. */
export const franquiciasPorCategoria: Record<Categoria, Franquicia[]> = {
  alimentacion: [exito, carulla, jumbo, metro, olimpica, d1, ara, alkosto],
  vivienda: [homecenter, easy, alkosto, falabella, exito, mercadoLibre],
  transporte: [mercadoLibre, alkosto, auteco, falabella, exito],
  servicios: [alkosto, ktronix, claro, movistar, falabella, mercadoLibre],
  ocio: [falabella, alkosto, ktronix, decathlon, panamericana, mercadoLibre, exito],
  salud: [farmatodo, cruzVerde, locatel, laRebaja, olimpica, exito],
  otros: [mercadoLibre, amazon, falabella, alkosto, exito],
};

/** Minúsculas, sin tildes y sin espacios ni signos: "Éxito S.A." → "exitosa". */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "");
}

export function perteneceAFranquicia(tienda: string, franquicia: Franquicia): boolean {
  const t = normalizar(tienda);
  return franquicia.claves.some((c) => t.includes(c)) || (franquicia.exactas ?? []).includes(t);
}

/** Franquicias de una categoría que reconocen a esta tienda (normalmente 0 o 1). */
export function tiendaEnCategoria(tienda: string, categoria: Categoria): boolean {
  return franquiciasPorCategoria[categoria].some((f) => perteneceAFranquicia(tienda, f));
}
