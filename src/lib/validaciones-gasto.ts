import { categorias } from "@/config/site";
import type { Categoria } from "@/types/gasto";

export interface DatosGasto {
  descripcion: string;
  monto: string;
  categoria: string;
  fecha: string;
  /** Tienda donde se compró (opcional). */
  tienda: string;
}

export type ErroresGasto = Partial<Record<keyof DatosGasto, string>>;

export const MONTO_MAXIMO = 999_999_999;
export const FECHA_MINIMA = "2000-01-01";

// Solo dígitos, o dígitos con separadores de miles bien puestos (12.500, 12,500, 12 500).
const MONTO_CON_MILES = /^\d{1,3}(?:[.,\s]\d{3})+$/;

/** Convierte "12.500" o "$ 12 500" en 12500. Devuelve null si no es un número entero de pesos válido. */
export function parsearMonto(texto: string): number | null {
  const limpio = texto.replace("$", "").trim();
  if (/^\d+$/.test(limpio)) return Number(limpio);
  if (MONTO_CON_MILES.test(limpio)) return Number(limpio.replace(/\D/g, ""));
  return null;
}

/** Deja solo los dígitos y los muestra con separador de miles (12500 → "12.500"). */
export function formatearMontoEscrito(texto: string): string {
  const digitos = texto.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 9);
  return digitos.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function normalizarDescripcion(valor: string): string {
  return valor.trim().replace(/\s+/g, " ");
}

/** Tienda opcional: texto limpio o null si está vacía. */
export function normalizarTienda(valor: string): string | null {
  const limpio = normalizarDescripcion(valor ?? "").slice(0, 80);
  return limpio || null;
}

export const esCategoria = (v: string): v is Categoria => categorias.some((c) => c.valor === v);

/** true si el texto es una fecha real con forma yyyy-mm-dd (no acepta 2026-02-30). */
function esFechaReal(fecha: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const d = new Date(`${fecha}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === fecha;
}

/** Valida un gasto. `hoy` es la fecha de hoy (yyyy-mm-dd). La usan el formulario y el servidor. */
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

  if (!esCategoria(d.categoria)) errores.categoria = "Elige una categoría.";

  if (normalizarDescripcion(d.tienda ?? "").length > 80) errores.tienda = "El nombre de la tienda es muy largo (máximo 80).";

  if (!esFechaReal(d.fecha)) errores.fecha = "Elige una fecha válida.";
  else if (d.fecha > hoy) errores.fecha = "La fecha no puede ser futura.";
  else if (d.fecha < FECHA_MINIMA) errores.fecha = "La fecha es demasiado antigua.";

  return errores;
}
