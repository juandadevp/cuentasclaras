import { categorias } from "@/config/site";
import type { Categoria, Gasto } from "@/types/gasto";

const pad = (n: number) => String(n).padStart(2, "0");

/** "2026-10" → { mes: "2026-10", inicio: "2026-10-01", fin: "2026-11-01" }. Si no es válido usa `hoy`. */
export function rangoDelMes(mesParam: string | undefined, hoy: string) {
  const valido = mesParam && /^\d{4}-(0[1-9]|1[0-2])$/.test(mesParam) ? mesParam : hoy.slice(0, 7);
  const [anio, mes] = valido.split("-").map(Number);
  const siguiente = mes === 12 ? `${anio + 1}-01` : `${anio}-${pad(mes + 1)}`;
  const anterior = mes === 1 ? `${anio - 1}-12` : `${anio}-${pad(mes - 1)}`;
  return { mes: valido, inicio: `${valido}-01`, fin: `${siguiente}-01`, anterior, siguiente };
}

export function nombreDelMes(mes: string): string {
  const [anio, m] = mes.split("-").map(Number);
  const nombre = new Date(anio, m - 1, 1).toLocaleDateString("es-CO", { month: "long", year: "numeric" });
  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
}

export function etiquetaCategoria(valor: string): string {
  return categorias.find((c) => c.valor === valor)?.etiqueta ?? valor;
}

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

/** Fecha de hoy en formato ISO (yyyy-mm-dd) en la zona horaria de Colombia. */
export function hoyIso(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());
}

/** Color de cada categoría en gráficos y etiquetas (paleta del logo + un acento cálido). */
export const coloresCategoria: Record<Categoria, string> = {
  vivienda: "#153519",
  alimentacion: "#266a37",
  transporte: "#3f9a58",
  servicios: "#8fd3a5",
  ocio: "#f2b84b",
  salud: "#6b7280",
  otros: "#c4c9cf",
};

/** "2026-10" → "Oct". */
export function mesCorto(mes: string): string {
  const [anio, m] = mes.split("-").map(Number);
  const nombre = new Date(anio, m - 1, 1).toLocaleDateString("es-CO", { month: "short" }).replace(".", "");
  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
}
