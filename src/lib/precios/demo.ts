import { franquicias } from "./franquicias";
import { rubros, tiendasDelRubro, type Rubro } from "./rubros";
import type { Oferta } from "./tipos";

function hash(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) h = Math.imul(h ^ texto.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Datos de EJEMPLO (no son precios reales) para ver la pantalla sin haber configurado un proveedor. */
export function ofertasDeEjemplo(consulta: string, rubro: Rubro | null): Oferta[] {
  const base = 3_000 + (hash(consulta.toLowerCase()) % 47_000);
  const propias = rubro ? tiendasDelRubro(rubro).map((f) => f.nombre) : [franquicias.exito.nombre, franquicias.mercadoLibre.nombre, franquicias.falabella.nombre];
  // Dos tiendas que no venden este tipo de producto, para que se vea el botón "Ver también otras tiendas".
  const ajenas = (rubro ? [franquicias.amazon.nombre, franquicias.mercadoLibre.nombre] : []).filter((n) => !propias.includes(n));
  const titulo = consulta.charAt(0).toUpperCase() + consulta.slice(1);

  return [...propias, ...ajenas].map((tienda, i) => {
    const factor = 0.82 + (hash(`${consulta}|${tienda}`) % 45) / 100;
    return {
      titulo: `${titulo} · presentación estándar`,
      tienda,
      precio: Math.round((base * factor) / 50) * 50,
      detalle: i % 2 === 0 ? "Precio de ejemplo" : "Ejemplo · envío gratis",
    };
  });
}

export const etiquetaRubro = (rubro: Rubro) => rubros[rubro].etiqueta;
