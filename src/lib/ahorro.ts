import { totalPorCategoria } from "@/lib/gastos";
import type { Categoria, Gasto } from "@/types/gasto";

export interface FilaMes {
  mes: string;
  total: number;
  /** Mes que aún no termina: su total todavía puede crecer. */
  enCurso: boolean;
  /** Lo que se gastó de menos (+) o de más (−) frente al mes anterior; null si no hay base. */
  ahorro: number | null;
}

/** Compara cada mes con el anterior. Un mes con total 0 se toma como "sin datos". */
export function filasDeAhorro(meses: { mes: string; total: number }[], mesActual: string): FilaMes[] {
  return meses.map((m, i) => {
    const previo = i > 0 ? meses[i - 1].total : 0;
    return { ...m, enCurso: m.mes === mesActual, ahorro: previo > 0 && m.total > 0 ? previo - m.total : null };
  });
}

export interface CambioCategoria {
  categoria: Categoria;
  actual: number;
  anterior: number;
}

export function cambiosPorCategoria(actual: Gasto[], anterior: Gasto[]): CambioCategoria[] {
  const a = new Map(totalPorCategoria(actual).map((x) => [x.categoria, x.total]));
  const p = new Map(totalPorCategoria(anterior).map((x) => [x.categoria, x.total]));
  return [...new Set([...a.keys(), ...p.keys()])].map((categoria) => ({
    categoria,
    actual: a.get(categoria) ?? 0,
    anterior: p.get(categoria) ?? 0,
  }));
}

/** Lo que muestra la pantalla «Mi ahorro»: meses recientes y categorías del mes en curso vs. el anterior. */
export interface ResumenAhorro {
  mesActual: string;
  filas: FilaMes[];
  categorias: CambioCategoria[];
}
