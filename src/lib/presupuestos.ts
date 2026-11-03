import { MONTO_MAXIMO, esCategoria, parsearMonto } from "@/lib/validaciones-gasto";
import type { Categoria } from "@/types/gasto";

export interface Presupuesto {
  id: string;
  categoria: Categoria;
  monto: number;
}

export interface DatosPresupuesto {
  categoria: string;
  monto: string;
  /** Mes en formato yyyy-mm. */
  mes: string;
}

export type ErroresPresupuesto = Partial<Record<keyof DatosPresupuesto, string>>;

/** Respuesta de las acciones de presupuesto (fijar y quitar un límite). */
export interface ResultadoPresupuesto {
  errores?: ErroresPresupuesto;
  mensaje?: string;
  ok?: boolean;
}

export const MES_MINIMO = "2000-01";
const FORMATO_MES = /^\d{4}-(0[1-9]|1[0-2])$/;

/** Último mes en el que se puede fijar un límite: el mes siguiente al actual (para planear con tiempo). */
export function ultimoMesPermitido(hoy: string): string {
  const [anio, mes] = hoy.slice(0, 7).split("-").map(Number);
  return mes === 12 ? `${anio + 1}-01` : `${anio}-${String(mes + 1).padStart(2, "0")}`;
}

/** Mes (yyyy-mm) que se muestra: el pedido si es válido y está en el rango permitido; si no, el mes de `hoy`. */
export function mesDePresupuesto(pedido: string | undefined, hoy: string): string {
  const valido = pedido !== undefined && FORMATO_MES.test(pedido) && pedido >= MES_MINIMO && pedido <= ultimoMesPermitido(hoy);
  return valido ? pedido : hoy.slice(0, 7);
}

/** Valida un límite. `hoy` es la fecha de hoy (yyyy-mm-dd). La usan el formulario y el servidor. */
export function validarPresupuesto(d: DatosPresupuesto, hoy: string): ErroresPresupuesto {
  const errores: ErroresPresupuesto = {};

  if (!esCategoria(d.categoria)) errores.categoria = "Elige una categoría.";

  const monto = parsearMonto(d.monto);
  if (!d.monto.trim()) errores.monto = "Ingresa el límite del mes.";
  else if (monto === null) errores.monto = "El límite solo puede tener números.";
  else if (monto <= 0) errores.monto = "El límite debe ser mayor que cero.";
  else if (monto > MONTO_MAXIMO) errores.monto = "El límite es demasiado grande.";

  if (!FORMATO_MES.test(d.mes) || d.mes < MES_MINIMO) errores.mes = "Mes no válido.";
  else if (d.mes > ultimoMesPermitido(hoy)) errores.mes = "Solo puedes planear hasta el mes siguiente.";

  return errores;
}

export type EstadoPresupuesto = "bien" | "cerca" | "excedido";

export interface Progreso {
  /** Porcentaje gastado del límite (pasa de 100 si se excedió). */
  porcentaje: number;
  /** Lo que queda por gastar; negativo si ya se pasó. */
  restante: number;
  estado: EstadoPresupuesto;
}

/**
 * Compara lo gastado con el límite: menos de 80 % va bien, de 80 a 100 % está cerca, más de 100 % se excedió.
 * Gastar exactamente el límite no cuenta como excedido. El estado se decide con números exactos, no con el
 * porcentaje redondeado: 79,6 % sigue siendo «bien» y se muestra como 79 %.
 */
export function progresoPresupuesto(gastado: number, limite: number): Progreso {
  const restante = limite - gastado;
  if (limite <= 0) return { porcentaje: 0, restante, estado: "bien" };

  if (gastado > limite) {
    return { porcentaje: Math.max(101, Math.round((gastado * 100) / limite)), restante, estado: "excedido" };
  }
  const porcentaje = Math.floor((gastado * 100) / limite);
  return { porcentaje, restante, estado: gastado * 100 >= limite * 80 ? "cerca" : "bien" };
}

const uso = (p: Presupuesto, gastado: ReadonlyMap<Categoria, number>) => (gastado.get(p.categoria) ?? 0) / p.monto;

/** Los límites ordenados del que está más cerca de pasarse al que menos. No modifica la lista original. */
export function ordenarPorUso(presupuestos: Presupuesto[], gastado: ReadonlyMap<Categoria, number>): Presupuesto[] {
  return [...presupuestos].sort((a, b) => uso(b, gastado) - uso(a, gastado));
}

export interface ResumenPresupuestos {
  presupuestado: number;
  /** Solo lo gastado en las categorías que tienen límite. */
  gastado: number;
  /** Negativo si en total se pasó. */
  restante: number;
}

export function resumirPresupuestos(presupuestos: Presupuesto[], gastado: ReadonlyMap<Categoria, number>): ResumenPresupuestos {
  const presupuestado = presupuestos.reduce((acc, p) => acc + p.monto, 0);
  const gastadoTotal = presupuestos.reduce((acc, p) => acc + (gastado.get(p.categoria) ?? 0), 0);
  return { presupuestado, gastado: gastadoTotal, restante: presupuestado - gastadoTotal };
}
