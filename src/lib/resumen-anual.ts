import type { Categoria, Gasto } from "@/types/gasto";

/** Primer año que se puede ver en el resumen anual. */
export const ANIO_MINIMO = 2000;

export interface MesResumen {
  mes: string;
  total: number;
}

export interface CategoriaResumen {
  categoria: Categoria;
  total: number;
  /** Porcentaje entero del total del año. */
  porcentaje: number;
}

export interface ResumenAnual {
  anio: number;
  total: number;
  cantidad: number;
  promedioMensual: number;
  meses: MesResumen[];
  categorias: CategoriaResumen[];
  /** Mes (AAAA-MM) con más gasto; null si el año no tiene gastos. */
  mesMayor: string | null;
}

/** Año a mostrar: el pedido si son cuatro cifras entre 2000 y el año de `hoy` (AAAA-MM-DD); si no, el de hoy. */
export function anioDeResumen(valor: string | undefined, hoy: string): number {
  const actual = Number(hoy.slice(0, 4));
  if (valor && /^\d{4}$/.test(valor)) {
    const anio = Number(valor);
    if (anio >= ANIO_MINIMO && anio <= actual) return anio;
  }
  return actual;
}

/** Los doce meses del año, de enero a diciembre, como AAAA-MM. */
export function mesesDelAnio(anio: number): string[] {
  return Array.from({ length: 12 }, (_, i) => `${anio}-${String(i + 1).padStart(2, "0")}`);
}

/** Resumen de un año calendario. Cuenta por el texto de `fecha`, sin crear fechas. No modifica la lista. */
export function resumirAnio(gastos: Gasto[], anio: number): ResumenAnual {
  const prefijo = `${anio}-`;
  const delAnio = gastos.filter((g) => g.fecha.startsWith(prefijo));
  const total = delAnio.reduce((acc, g) => acc + g.monto, 0);

  const porMes = new Map<string, number>(mesesDelAnio(anio).map((mes) => [mes, 0]));
  const porCategoria = new Map<Categoria, number>();
  for (const g of delAnio) {
    const mes = g.fecha.slice(0, 7);
    porMes.set(mes, (porMes.get(mes) ?? 0) + g.monto);
    porCategoria.set(g.categoria, (porCategoria.get(g.categoria) ?? 0) + g.monto);
  }

  const meses = [...porMes.entries()].map(([mes, t]) => ({ mes, total: t }));
  const categorias = [...porCategoria.entries()]
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .map(([categoria, t]) => ({ categoria, total: t, porcentaje: Math.round((t * 100) / total) }));

  let mesMayor: string | null = null;
  let maximo = 0;
  for (const m of meses) {
    if (m.total > maximo) {
      maximo = m.total;
      mesMayor = m.mes;
    }
  }

  return {
    anio,
    total,
    cantidad: delAnio.length,
    promedioMensual: Math.round(total / 12),
    meses,
    categorias,
    mesMayor,
  };
}
