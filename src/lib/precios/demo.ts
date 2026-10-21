import { franquicias } from "./franquicias";
import { tiendasDelRubro, type Rubro } from "./rubros";
import type { Oferta } from "./tipos";

function hash(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) h = Math.imul(h ^ texto.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Marcas inventadas a propósito: son datos de ejemplo y no deben confundirse con productos reales. */
const marcas = ["Brillex", "Natúrea", "Casa Fresca", "Ecomax", "Aurora", "Delta Plus", "Nova", "Pura Vida", "Sol Andino"];

const presentaciones: Partial<Record<Rubro, string[]>> & { general: string[] } = {
  general: ["presentación pequeña", "presentación estándar", "presentación familiar", "pack x2", "pack x3", "edición ahorro"],
  medicamentos: ["x10 tabletas", "x20 tabletas", "x50 tabletas", "x100 tabletas", "jarabe 120 ml", "caja x30"],
  alimentos: ["500 g", "1 kg", "2 kg", "x6 unidades", "presentación familiar", "económico"],
  aseo_hogar: ["en polvo 1 kg", "líquido 1,5 L", "concentrado 2 L", "en polvo 3 kg", "líquido 5 L", "bolsa 1,2 L"],
  cuidado_personal: ["250 ml", "400 ml", "x2 unidades", "familiar 750 ml", "viaje 100 ml", "pack ahorro"],
  tecnologia: ["modelo básico", "modelo plus", "modelo pro", "edición 2026", "versión inalámbrica", "kit completo"],
  electrodomesticos: ["modelo compacto", "modelo estándar", "modelo premium", "inverter", "acero inoxidable", "edición familiar"],
  ferreteria: ["kit básico", "uso doméstico", "uso profesional", "x6 unidades", "industrial", "set completo"],
  bebes: ["x30 unidades", "x60 unidades", "etapa 1", "etapa 2", "pack ahorro", "hipoalergénico"],
};

/**
 * Datos de EJEMPLO (no son precios reales) para ver la pantalla sin haber configurado un proveedor.
 * Imitan lo que devuelve un buscador de compras: varios productos distintos, cada uno con su precio y
 * disponible en varias tiendas.
 */
export function ofertasDeEjemplo(consulta: string, rubro: Rubro | null): Oferta[] {
  const nombre = consulta.charAt(0).toUpperCase() + consulta.slice(1);
  const semilla = hash(consulta.toLowerCase());
  const base = 3_000 + (semilla % 27_000);
  const lista = (rubro && presentaciones[rubro]) || presentaciones.general;

  const propias = rubro
    ? tiendasDelRubro(rubro).map((f) => f.nombre)
    : [franquicias.exito.nombre, franquicias.mercadoLibre.nombre, franquicias.falabella.nombre, franquicias.alkosto.nombre];
  const ajenas = (rubro ? [franquicias.amazon.nombre, franquicias.mercadoLibre.nombre] : []).filter((n) => !propias.includes(n));

  const ofertas: Oferta[] = [];
  for (let i = 0; i < 8; i++) {
    const marca = marcas[(semilla + i) % marcas.length];
    const titulo = `${nombre} ${marca} ${lista[i % lista.length]}`;
    const tamano = 1 + (i % 4) * 0.55;
    const cuantas = Math.min(propias.length, 2 + (hash(titulo) % 3));
    const inicio = hash(`${titulo}|inicio`) % propias.length;
    const tiendas = Array.from({ length: cuantas }, (_, k) => propias[(inicio + k) % propias.length]);
    if (ajenas.length && i % 3 === 0) tiendas.push(ajenas[i % ajenas.length]);

    for (const tienda of tiendas) {
      const variacion = 0.85 + (hash(`${titulo}|${tienda}`) % 35) / 100;
      ofertas.push({
        titulo,
        tienda,
        precio: Math.round((base * tamano * variacion) / 50) * 50,
        idProducto: `demo-${semilla}-${i}`,
        detalle: "Precio de ejemplo",
      });
    }
  }
  return ofertas;
}
