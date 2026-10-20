import { franquiciasPorCategoria } from "./franquicias";
import type { Oferta } from "./tipos";
import type { Categoria } from "@/types/gasto";

function hash(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) h = Math.imul(h ^ texto.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Datos de EJEMPLO (no son precios reales) para ver la pantalla sin haber configurado un proveedor. */
export function ofertasDeEjemplo(consulta: string, categoria?: Categoria): Oferta[] {
  const base = 3_000 + (hash(consulta.toLowerCase()) % 47_000);
  const tiendas = categoria
    ? franquiciasPorCategoria[categoria]
    : [...new Set(Object.values(franquiciasPorCategoria).flatMap((l) => l.slice(0, 2).map((f) => f.nombre)))].map(
        (nombre) => ({ nombre }),
      );
  const titulo = consulta.charAt(0).toUpperCase() + consulta.slice(1);

  return tiendas.map((t, i) => {
    const factor = 0.82 + ((hash(`${consulta}|${t.nombre}`) % 45) / 100);
    return {
      titulo: `${titulo} · presentación estándar`,
      tienda: t.nombre,
      precio: Math.round((base * factor) / 50) * 50,
      detalle: i % 2 === 0 ? "Precio de ejemplo" : "Ejemplo · envío gratis",
    };
  });
}
