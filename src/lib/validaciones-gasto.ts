import { categorias } from "@/config/site";
import type { Categoria } from "@/types/gasto";

export interface DatosGasto {
  descripcion: string;
  monto: string;
  categoria: string;
  fecha: string;
}

export type ErroresGasto = Partial<Record<keyof DatosGasto, string>>;

export const MONTO_MAXIMO = 999_999_999;

/** Convierte "12.500" o "$ 12 500" en 12500. Devuelve null si no es un número entero válido. */
export function parsearMonto(texto: string): number | null {
  const limpio = texto.replace(/[\s$.,]/g, "");
  if (!/^\d+$/.test(limpio)) return null;
  return Number(limpio);
}

/** Deja solo los dígitos y los muestra con separador de miles (12500 → "12.500"). */
export function formatearMontoEscrito(texto: string): string {
  const digitos = texto.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 9);
  return digitos ? Number(digitos).toLocaleString("es-CO") : "";
}

export function normalizarDescripcion(valor: string): string {
  return valor.trim().replace(/\s+/g, " ");
}

export function validarGasto(d: DatosGasto, hoy: string): ErroresGasto {
  const errores: ErroresGasto = {};

  const descripcion = normalizarDescripcion(d.descripcion);
  if (!descripcion) errores.descripcion = "Escribe en qué gastaste.";
  else if (descripcion.length < 2) errores.descripcion = "La descripción es muy corta.";
  else if (descripcion.length > 80) errores.descripcion = "La descripción es muy larga (máximo 80).";

  const monto = parsearMonto(d.monto);
  if (!d.monto.trim()) errores.monto = "Ingresa el valor del gasto.";
  else if (monto === null) errores.monto = "El valor solo puede tener números.";
  else if (monto <= 0) errores.monto = "El valor debe ser mayor que cero.";
  else if (monto > MONTO_MAXIMO) errores.monto = "El valor es demasiado grande.";

  if (!categorias.some((c) => c.valor === d.categoria)) errores.categoria = "Elige una categoría.";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.fecha) || Number.isNaN(Date.parse(d.fecha))) {
    errores.fecha = "Elige una fecha válida.";
  } else if (d.fecha > hoy) errores.fecha = "La fecha no puede ser futura.";
  else if (d.fecha < "2000-01-01") errores.fecha = "La fecha es demasiado antigua.";

  return errores;
}

export const esCategoria = (v: string): v is Categoria => categorias.some((c) => c.valor === v);
