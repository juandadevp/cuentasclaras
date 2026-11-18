import { tiposIngreso } from "@/config/site";
import { FECHA_MINIMA, MONTO_MAXIMO, esFechaReal, normalizarDescripcion, parsearMonto } from "@/lib/validaciones-gasto";
import type { Ingreso, TipoIngreso } from "@/types/ingreso";

export interface DatosIngreso {
  descripcion: string;
  tipo: string;
  monto: string;
  fecha: string;
}

export type ErroresIngreso = Partial<Record<keyof DatosIngreso, string>>;

/** Respuesta de las acciones de ingresos (crear y eliminar). */
export interface ResultadoIngreso {
  errores?: ErroresIngreso;
  mensaje?: string;
  ok?: boolean;
}

export const esTipoIngreso = (v: string): v is TipoIngreso => tiposIngreso.some((t) => t.valor === v);

/** Valida un ingreso. `hoy` es la fecha de hoy (yyyy-mm-dd). La usan el formulario y el servidor. */
export function validarIngreso(d: DatosIngreso, hoy: string): ErroresIngreso {
  const errores: ErroresIngreso = {};

  const descripcion = normalizarDescripcion(d.descripcion);
  if (!descripcion) errores.descripcion = "Escribe de dónde viene el ingreso.";
  else if (descripcion.length < 2) errores.descripcion = "La descripción es muy corta.";
  else if (descripcion.length > 80) errores.descripcion = "La descripción es muy larga (máximo 80).";

  const monto = parsearMonto(d.monto);
  if (!d.monto.trim()) errores.monto = "Ingresa el valor del ingreso.";
  else if (monto === null) errores.monto = "El valor solo puede tener números.";
  else if (monto <= 0) errores.monto = "El valor debe ser mayor que cero.";
  else if (monto > MONTO_MAXIMO) errores.monto = "El valor es demasiado grande.";

  if (!esTipoIngreso(d.tipo)) errores.tipo = "Elige un tipo de ingreso.";

  if (!esFechaReal(d.fecha)) errores.fecha = "Elige una fecha válida.";
  else if (d.fecha > hoy) errores.fecha = "La fecha no puede ser futura.";
  else if (d.fecha < FECHA_MINIMA) errores.fecha = "La fecha es demasiado antigua.";

  return errores;
}

export interface ResumenIngresos {
  total: number;
  cantidad: number;
  /** Solo los tipos con ingresos, de mayor a menor total (a igualdad, por tipo ascendente). */
  porTipo: { tipo: TipoIngreso; total: number }[];
}

export function resumirIngresos(lista: Ingreso[]): ResumenIngresos {
  const porTipo = new Map<TipoIngreso, number>();
  let total = 0;
  for (const i of lista) {
    total += i.monto;
    porTipo.set(i.tipo, (porTipo.get(i.tipo) ?? 0) + i.monto);
  }
  return {
    total,
    cantidad: lista.length,
    porTipo: [...porTipo.entries()]
      .map(([tipo, subtotal]) => ({ tipo, total: subtotal }))
      .sort((a, b) => b.total - a.total || a.tipo.localeCompare(b.tipo)),
  };
}

export type AhorroReal =
  | { estado: "sin-ingresos"; ahorro: null }
  | { estado: "sobra" | "falta" | "justo"; ahorro: number };

/** Ingresos menos gastos del mes. Sin ingresos registrados no se inventa un valor. */
export function calcularAhorroReal(totalIngresos: number, totalGastos: number, cantidadIngresos: number): AhorroReal {
  if (cantidadIngresos === 0) return { estado: "sin-ingresos", ahorro: null };
  // Se redondea a 2 decimales para evitar ruido de coma flotante (0,1 + 0,2 contra 0,3); el -0 se vuelve 0.
  const ahorro = Math.round((totalIngresos - totalGastos) * 100) / 100 + 0;
  if (ahorro > 0) return { estado: "sobra", ahorro };
  if (ahorro < 0) return { estado: "falta", ahorro };
  return { estado: "justo", ahorro: 0 };
}

export function etiquetaTipoIngreso(valor: string): string {
  return tiposIngreso.find((t) => t.valor === valor)?.etiqueta ?? valor;
}
