import { categorias, siteConfig } from "@/config/site";
import type { Categoria, Gasto } from "@/types/gasto";

const pad = (n: number) => String(n).padStart(2, "0");

export function totalGastos(gastos: Gasto[]): number {
  return gastos.reduce((acc, g) => acc + g.monto, 0);
}

/** Suma por categoría, de la que más gasto tiene a la que menos. No modifica la lista original. */
export function totalPorCategoria(gastos: Gasto[]): { categoria: Categoria; total: number }[] {
  const mapa = new Map<Categoria, number>();
  for (const g of gastos) mapa.set(g.categoria, (mapa.get(g.categoria) ?? 0) + g.monto);
  return [...mapa.entries()].map(([categoria, total]) => ({ categoria, total })).sort((a, b) => b.total - a.total);
}

/** Variación porcentual respecto al mes anterior, o null si no hay base de comparación. */
export function variacion(actual: number, anterior: number): number | null {
  if (anterior <= 0) return null;
  return Math.round(((actual - anterior) / anterior) * 100);
}

/** Los últimos `cantidad` meses (yyyy-mm), del más antiguo al `mes` indicado, cruzando el cambio de año. */
export function ultimosMeses(mes: string, cantidad: number): string[] {
  const [anio, m] = mes.split("-").map(Number);
  return Array.from({ length: cantidad }, (_, i) => {
    const indice = anio * 12 + (m - 1) - (cantidad - 1 - i);
    return `${Math.floor(indice / 12)}-${pad((indice % 12) + 1)}`;
  });
}

/** Total gastado en cada mes de la lista; los meses sin gastos quedan en 0. */
export function totalesPorMes(gastos: Gasto[], meses: string[]): { mes: string; total: number }[] {
  const totales = new Map<string, number>(meses.map((mes) => [mes, 0]));
  for (const g of gastos) {
    const mes = g.fecha.slice(0, 7);
    if (totales.has(mes)) totales.set(mes, (totales.get(mes) ?? 0) + g.monto);
  }
  return meses.map((mes) => ({ mes, total: totales.get(mes) ?? 0 }));
}

/** Fecha ISO (yyyy-mm-dd) de un instante, vista en la zona horaria de Colombia. */
export function fechaIso(instante: Date): string {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instante);
  const valor = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? "";
  return `${valor("year")}-${valor("month")}-${valor("day")}`;
}

/** Fecha de hoy en Colombia. Es lo único de este archivo que lee el reloj: úsala detrás de `connection()`. */
export function hoyIso(): string {
  return fechaIso(new Date());
}

export function etiquetaCategoria(valor: string): string {
  return categorias.find((c) => c.valor === valor)?.etiqueta ?? valor;
}

/** "2026-10" → "Octubre de 2026" (la forma exacta depende del idioma del sistema). */
export function nombreDelMes(mes: string): string {
  const [anio, m] = mes.split("-").map(Number);
  const nombre = new Date(anio, m - 1, 1).toLocaleDateString(siteConfig.locale, { month: "long", year: "numeric" });
  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
}

/** "2026-10" → "Oct". */
export function mesCorto(mes: string): string {
  const [anio, m] = mes.split("-").map(Number);
  const nombre = new Date(anio, m - 1, 1).toLocaleDateString(siteConfig.locale, { month: "short" }).replace(".", "");
  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
}

/** Colores base: los mismos tokens de src/app/globals.css (una prueba comprueba que coinciden). */
export const coloresBase = {
  brand300: "#8fd3a5",
  brand500: "#3f9a58",
  brand700: "#266a37",
  brand800: "#153519",
  accent: "#f2b84b",
  manzana: "#8fd14f",
  muted: "#6b7280",
} as const;

/** Mezcla un color con blanco (#ffffff) o negro (#000000); `parte` va de 0 a 1 (cuánto se agrega del otro color). */
export function mezclar(hex: string, con: "#ffffff" | "#000000", parte: number): string {
  const destino = con === "#ffffff" ? 255 : 0;
  return (
    "#" +
    [1, 3, 5]
      .map((i) => {
        const canal = parseInt(hex.slice(i, i + 2), 16);
        return Math.round(canal + (destino - canal) * parte)
          .toString(16)
          .padStart(2, "0");
      })
      .join("")
  );
}

/** Color de cada categoría en la dona: solo colores del proyecto y mezclas de ellos con blanco o negro. */
export const coloresCategoria: Record<Categoria, string> = {
  vivienda: coloresBase.brand800,
  alimentacion: coloresBase.brand500,
  transporte: coloresBase.accent,
  servicios: coloresBase.brand300,
  ocio: coloresBase.manzana,
  salud: coloresBase.muted,
  tecnologia: coloresBase.brand700,
  ropa: mezclar(coloresBase.accent, "#000000", 0.25),
  educacion: mezclar(coloresBase.muted, "#ffffff", 0.45),
  mascotas: mezclar(coloresBase.manzana, "#000000", 0.35),
  bebes: mezclar(coloresBase.accent, "#ffffff", 0.45),
  otros: mezclar(coloresBase.muted, "#000000", 0.35),
};

export interface ResumenInicio {
  mes: string;
  total: number;
  cantidad: number;
  porCategoria: { categoria: Categoria; total: number }[];
  /** Categoría con más gasto del mes, si hay gastos. */
  mayor?: { categoria: Categoria; total: number };
  /** Variación del total contra el mes anterior; null si el mes anterior no tiene gastos. */
  variacion: number | null;
  /** Totales de los últimos 6 meses, terminando en el mes de `hoy`. */
  meses: { mes: string; total: number }[];
}

/** Todo lo que muestra la pantalla de inicio, calculado a partir de los gastos y la fecha de hoy (yyyy-mm-dd). */
export function resumirInicio(gastos: Gasto[], hoy: string): ResumenInicio {
  const mes = hoy.slice(0, 7);
  const delMes = gastos.filter((g) => g.fecha.startsWith(mes));
  const meses = totalesPorMes(gastos, ultimosMeses(mes, 6));
  const total = totalGastos(delMes);
  const porCategoria = totalPorCategoria(delMes);

  return {
    mes,
    total,
    cantidad: delMes.length,
    porCategoria,
    mayor: porCategoria[0],
    variacion: variacion(total, meses[meses.length - 2].total),
    meses,
  };
}
