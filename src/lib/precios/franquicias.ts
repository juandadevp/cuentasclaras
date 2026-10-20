export interface Franquicia {
  nombre: string;
  /** Fragmentos (sin tildes ni espacios, en minúscula) que, si aparecen en el nombre de la tienda, la identifican. */
  claves: string[];
  /** Nombres cortos que solo cuentan si coinciden exactamente (evita confundir "Ara" con "Para ti"). */
  exactas?: string[];
}

/** Catálogo de tiendas y franquicias de Colombia. Cada tipo de producto (rubros.ts) elige las que le corresponden. */
export const franquicias = {
  exito: { nombre: "Éxito", claves: ["exito"] },
  carulla: { nombre: "Carulla", claves: ["carulla"] },
  jumbo: { nombre: "Jumbo", claves: ["jumbo"] },
  metro: { nombre: "Metro", claves: ["tiendasmetro", "metrocolombia", "metro.com.co"], exactas: ["metro"] },
  olimpica: { nombre: "Olímpica", claves: ["olimpica"] },
  d1: { nombre: "D1", claves: ["tiendasd1", "tiendad1", "d1.com"], exactas: ["d1"] },
  ara: { nombre: "Ara", claves: ["tiendasara", "aracolombia", "ara.com.co"], exactas: ["ara"] },
  pricesmart: { nombre: "PriceSmart", claves: ["pricesmart"] },
  makro: { nombre: "Makro", claves: ["makro"] },
  alkosto: { nombre: "Alkosto", claves: ["alkosto"] },
  ktronix: { nombre: "Ktronix", claves: ["ktronix"] },
  falabella: { nombre: "Falabella", claves: ["falabella"] },
  homecenter: { nombre: "Homecenter", claves: ["homecenter"] },
  easy: { nombre: "Easy", claves: ["easy.com", "easycolombia"], exactas: ["easy"] },
  mercadoLibre: { nombre: "Mercado Libre", claves: ["mercadolibre", "mercadolivre"] },
  amazon: { nombre: "Amazon", claves: ["amazon"] },
  farmatodo: { nombre: "Farmatodo", claves: ["farmatodo"] },
  cruzVerde: { nombre: "Cruz Verde", claves: ["cruzverde"] },
  locatel: { nombre: "Locatel", claves: ["locatel"] },
  laRebaja: { nombre: "La Rebaja", claves: ["larebaja", "drogueriaslarebaja"] },
  colsubsidio: { nombre: "Colsubsidio", claves: ["colsubsidio"] },
  cafam: { nombre: "Cafam", claves: ["cafam"] },
  decathlon: { nombre: "Decathlon", claves: ["decathlon"] },
  panamericana: { nombre: "Panamericana", claves: ["panamericana"] },
  claro: { nombre: "Claro", claves: ["claro"] },
  movistar: { nombre: "Movistar", claves: ["movistar"] },
  tigo: { nombre: "Tigo", claves: ["tigo"] },
  samsung: { nombre: "Samsung", claves: ["samsung"] },
  auteco: { nombre: "Auteco", claves: ["auteco"] },
  tugo: { nombre: "Tugó", claves: ["tugo"] },
  jamar: { nombre: "Muebles Jamar", claves: ["mueblesjamar", "jamar"] },
  arturoCalle: { nombre: "Arturo Calle", claves: ["arturocalle"] },
  studioF: { nombre: "Studio F", claves: ["studiof"] },
  hm: { nombre: "H&M", claves: ["h&m", "hm.com"], exactas: ["hm", "h&m"] },
  zara: { nombre: "Zara", claves: ["zara"] },
} satisfies Record<string, Franquicia>;

export type IdFranquicia = keyof typeof franquicias;

/** Minúsculas, sin tildes y sin espacios ni signos: "Éxito S.A." → "exitosa". */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.&]/g, "");
}

export function perteneceAFranquicia(tienda: string, franquicia: Franquicia): boolean {
  const t = normalizar(tienda);
  return franquicia.claves.some((c) => t.includes(c)) || (franquicia.exactas ?? []).includes(t);
}
