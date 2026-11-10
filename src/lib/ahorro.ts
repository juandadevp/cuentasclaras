import { totalPorCategoria } from "@/lib/gastos";
import { progresoPresupuesto, resumirPresupuestos, type Presupuesto } from "@/lib/presupuestos";
import type { Categoria, Gasto } from "@/types/gasto";

export interface FilaAhorro {
  /** Mes en formato yyyy-mm. */
  mes: string;
  total: number;
  /** true si es el mes actual, que todavía no terminó. */
  enCurso: boolean;
  /** Mes anterior menos este mes: positivo si gastó menos, negativo si gastó más. null si falta alguno de los dos. */
  ahorro: number | null;
}

/**
 * Compara cada mes con el anterior. `meses` va del más antiguo al más reciente.
 * Se descartan los meses vacíos del principio (aún no había datos), pero el primer mes con gastos
 * sí se compara con el mes anterior de la lista, aunque esté vacío: en ese caso `ahorro` es null.
 */
export function filasDeAhorro(meses: { mes: string; total: number }[], mesActual: string): FilaAhorro[] {
  const filas = meses.map((m, i) => {
    const previo = i > 0 ? meses[i - 1].total : 0;
    return {
      mes: m.mes,
      total: m.total,
      enCurso: m.mes === mesActual,
      ahorro: previo > 0 && m.total > 0 ? previo - m.total : null,
    };
  });
  const primero = filas.findIndex((f) => f.total > 0);
  return primero === -1 ? [] : filas.slice(primero);
}

export interface CambioCategoria {
  categoria: Categoria;
  actual: number;
  anterior: number;
}

/** Lo gastado en cada categoría este mes y el anterior (0 si no hubo), de la que más gastó este mes a la que menos. */
export function cambiosPorCategoria(actual: Gasto[], anterior: Gasto[]): CambioCategoria[] {
  const ahora = new Map(totalPorCategoria(actual).map((t) => [t.categoria, t.total]));
  const antes = new Map(totalPorCategoria(anterior).map((t) => [t.categoria, t.total]));
  const categorias = new Set<Categoria>([...ahora.keys(), ...antes.keys()]);
  return [...categorias]
    .map((categoria) => ({ categoria, actual: ahora.get(categoria) ?? 0, anterior: antes.get(categoria) ?? 0 }))
    .sort((a, b) => b.actual - a.actual || b.anterior - a.anterior);
}

/** Las categorías en las que gastó menos que el mes anterior, de la mayor reducción a la menor. */
export function categoriasQueBajaron(cambios: CambioCategoria[]): (CambioCategoria & { reduccion: number })[] {
  return cambios
    .filter((c) => c.anterior > c.actual)
    .map((c) => ({ ...c, reduccion: c.anterior - c.actual }))
    .sort((a, b) => b.reduccion - a.reduccion);
}

export interface AhorroContraPresupuesto {
  presupuestado: number;
  /** Solo lo gastado en las categorías que tienen límite. */
  gastado: number;
  /** Lo que sobra de los límites; negativo si en total se pasó. */
  restante: number;
  /** Categorías que superaron su límite, de mayor a menor exceso. Gastar justo el límite no cuenta. */
  excedidas: { categoria: Categoria; exceso: number }[];
}

/** Compara los límites del mes con lo gastado: cuánto sobra en total y qué categorías se pasaron. */
export function ahorroContraPresupuesto(presupuestos: Presupuesto[], gastos: Gasto[]): AhorroContraPresupuesto {
  const gastado = new Map(totalPorCategoria(gastos).map((t) => [t.categoria, t.total]));
  const resumen = resumirPresupuestos(presupuestos, gastado);
  const excedidas = presupuestos
    .filter((p) => progresoPresupuesto(gastado.get(p.categoria) ?? 0, p.monto).estado === "excedido")
    .map((p) => ({ categoria: p.categoria, exceso: (gastado.get(p.categoria) ?? 0) - p.monto }))
    .sort((a, b) => b.exceso - a.exceso);
  return { ...resumen, excedidas };
}
