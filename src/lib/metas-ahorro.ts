import { MES_MINIMO, ultimoMesPermitido } from "@/lib/presupuestos";
import { MONTO_MAXIMO, parsearMonto } from "@/lib/validaciones-gasto";

export interface MetaAhorro {
  id: string;
  monto: number;
}

export interface DatosMeta {
  monto: string;
  /** Mes en formato yyyy-mm. */
  mes: string;
}

export type ErroresMeta = Partial<Record<keyof DatosMeta, string>>;

/** Respuesta de las acciones de meta de ahorro (fijar y quitar). */
export interface ResultadoMeta {
  errores?: ErroresMeta;
  mensaje?: string;
  ok?: boolean;
}

const FORMATO_MES = /^\d{4}-(0[1-9]|1[0-2])$/;

/** Valida una meta de ahorro. `hoy` es la fecha de hoy (yyyy-mm-dd). La usan el formulario y el servidor. */
export function validarMeta(d: DatosMeta, hoy: string): ErroresMeta {
  const errores: ErroresMeta = {};

  const monto = parsearMonto(d.monto);
  if (!d.monto.trim()) errores.monto = "Ingresa cuánto quieres ahorrar.";
  else if (monto === null) errores.monto = "La meta solo puede tener números.";
  else if (monto <= 0) errores.monto = "La meta debe ser mayor que cero.";
  else if (monto > MONTO_MAXIMO) errores.monto = "La meta es demasiado grande.";

  if (!FORMATO_MES.test(d.mes) || d.mes < MES_MINIMO) errores.mes = "Mes no válido.";
  else if (d.mes > ultimoMesPermitido(hoy)) errores.mes = "Solo puedes planear hasta el mes siguiente.";

  return errores;
}

export type EstadoMeta = "sin-meta" | "sin-ingresos" | "por-debajo" | "alcanzada" | "superada";

export interface ProgresoMeta {
  estado: EstadoMeta;
  /** Porcentaje de la meta (null sin meta o sin ingresos). */
  porcentaje: number | null;
  /** Lo que falta (por debajo) o lo que se superó (superada); 0 si se alcanzó; null sin meta o sin ingresos. */
  diferencia: number | null;
}

const redondear2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Compara el ahorro real del mes con la meta. `ahorro` es null si el mes no tiene ingresos; `meta` es null si no hay meta.
 * El estado se decide con números exactos, no con el porcentaje redondeado: 99,99 de 100 se muestra como 99 %.
 */
export function progresoMeta(ahorro: number | null, meta: number | null): ProgresoMeta {
  if (meta === null) return { estado: "sin-meta", porcentaje: null, diferencia: null };
  if (ahorro === null) return { estado: "sin-ingresos", porcentaje: null, diferencia: null };

  if (ahorro === meta) return { estado: "alcanzada", porcentaje: 100, diferencia: 0 };
  if (ahorro > meta) {
    return { estado: "superada", porcentaje: Math.max(101, Math.round((ahorro * 100) / meta)), diferencia: redondear2(ahorro - meta) };
  }
  return { estado: "por-debajo", porcentaje: Math.max(0, Math.floor((ahorro * 100) / meta)), diferencia: redondear2(meta - ahorro) };
}
