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

const pad = (n: number) => String(n).padStart(2, "0");

/** Último mes en el que se puede fijar un límite: el mes siguiente al actual (para planear con tiempo). */
export function ultimoMesPermitido(hoy: string): string {
  const [anio, mes] = hoy.slice(0, 7).split("-").map(Number);
  return mes === 12 ? `${anio + 1}-01` : `${anio}-${pad(mes + 1)}`;
}

export function validarPresupuesto(d: DatosPresupuesto, hoy: string): ErroresPresupuesto {
  const errores: ErroresPresupuesto = {};

  if (!esCategoria(d.categoria)) errores.categoria = "Elige una categoría.";

  const monto = parsearMonto(d.monto);
  if (!d.monto.trim()) errores.monto = "Ingresa el límite del mes.";
  else if (monto === null) errores.monto = "El límite solo puede tener números.";
  else if (monto <= 0) errores.monto = "El límite debe ser mayor que cero.";
  else if (monto > MONTO_MAXIMO) errores.monto = "El límite es demasiado grande.";

  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(d.mes) || d.mes < "2000-01") errores.mes = "Mes no válido.";
  else if (d.mes > ultimoMesPermitido(hoy)) errores.mes = "Solo puedes planear hasta el mes siguiente.";

  return errores;
}

export type EstadoPresupuesto = "bien" | "cerca" | "excedido";

export interface Progreso {
  /** Porcentaje gastado del límite (puede pasar de 100). */
  porcentaje: number;
  /** Lo que queda por gastar; negativo si ya se pasó. */
  restante: number;
  estado: EstadoPresupuesto;
}

/** Compara lo gastado con el límite: menos de 80 % va bien, de 80 a 100 % está cerca, más de 100 % se excedió. */
export function progresoPresupuesto(gastado: number, limite: number): Progreso {
  const porcentaje = limite > 0 ? Math.round((gastado / limite) * 100) : 0;
  const estado: EstadoPresupuesto = gastado > limite ? "excedido" : porcentaje >= 80 ? "cerca" : "bien";
  return { porcentaje, restante: limite - gastado, estado };
}
