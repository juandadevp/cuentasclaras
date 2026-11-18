import { formatearMoneda } from "@/lib/format";
import { etiquetaCategoria } from "@/lib/gastos";
import { progresoPresupuesto, type Presupuesto } from "@/lib/presupuestos";
import type { Categoria } from "@/types/gasto";

export interface AvisoPresupuesto {
  categoria: Categoria;
  gastado: number;
  limite: number;
  porcentaje: number;
  /** Negativo si ya se pasó del límite. */
  restante: number;
  estado: "cerca" | "excedido";
}

/**
 * Límites del mes que llegaron al 80 % (cerca) o se pasaron (excedido).
 * Primero los excedidos, luego los cercanos; mayor porcentaje primero y, si empatan, por categoría.
 */
export function avisosDePresupuesto(presupuestos: Presupuesto[], gastadoPorCategoria: ReadonlyMap<Categoria, number>): AvisoPresupuesto[] {
  const avisos: AvisoPresupuesto[] = [];
  for (const p of presupuestos) {
    const gastado = gastadoPorCategoria.get(p.categoria) ?? 0;
    const { porcentaje, restante, estado } = progresoPresupuesto(gastado, p.monto);
    if (estado === "bien") continue;
    avisos.push({ categoria: p.categoria, gastado, limite: p.monto, porcentaje, restante, estado });
  }
  // Razón exacta gastado/limite por multiplicación cruzada (no el porcentaje redondeado).
  return [...avisos].sort(
    (a, b) =>
      Number(b.estado === "excedido") - Number(a.estado === "excedido") ||
      b.gastado * a.limite - a.gastado * b.limite ||
      a.categoria.localeCompare(b.categoria),
  );
}

/** Frase completa del aviso, pensada también para lectores de pantalla. */
export function descripcionDeAviso(aviso: AvisoPresupuesto): string {
  const estado = aviso.estado === "excedido" ? "Excedido" : "Cerca del límite";
  const detalle =
    aviso.estado === "excedido"
      ? `Te pasaste por ${formatearMoneda(-aviso.restante)}`
      : `Te quedan ${formatearMoneda(aviso.restante)}`;
  return `${etiquetaCategoria(aviso.categoria)}: ${estado}, ${formatearMoneda(aviso.gastado)} de ${formatearMoneda(aviso.limite)} (${aviso.porcentaje} %). ${detalle}.`;
}

export function enlaceAPresupuesto(mes: string, categoria: Categoria): string {
  return `/panel/presupuesto?mes=${mes}&categoria=${categoria}`;
}
