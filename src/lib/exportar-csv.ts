import { etiquetaCategoria, type FiltrosGastos } from "@/lib/gastos";
import type { Gasto } from "@/types/gasto";

const BOM = "﻿";
const SALTO = "\r\n";
const ENCABEZADO = "fecha,descripcion,categoria,tienda,monto";
const MES_VALIDO = /^\d{4}-(0[1-9]|1[0-2])$/;

/** Escapa un campo de texto para CSV: evita fórmulas de hoja de cálculo y protege comas, comillas y saltos de línea. */
export function escaparCampoCsv(valor: string): string {
  const seguro = /^([\s﻿]*[=+\-@＝＋－＠]|[\t\r])/.test(valor) ? `'${valor}` : valor;
  return /[",\r\n]/.test(seguro) ? `"${seguro.replace(/"/g, '""')}"` : seguro;
}

/** Convierte los gastos a CSV (con BOM de UTF-8 y saltos \r\n), en el mismo orden recibido. */
export function gastosACsv(gastos: Gasto[]): string {
  const filas = gastos.map((g) =>
    [
      g.fecha,
      escaparCampoCsv(g.descripcion),
      escaparCampoCsv(etiquetaCategoria(g.categoria)),
      escaparCampoCsv(g.tienda ?? ""),
      String(g.monto),
    ].join(","),
  );
  return BOM + [ENCABEZADO, ...filas].join(SALTO) + SALTO;
}

/** `gastos-AAAA-MM.csv` para un mes válido y `gastos-todos.csv` para todo lo demás. */
export function nombreArchivoCsv(mes: string): string {
  return MES_VALIDO.test(mes) ? `gastos-${mes}.csv` : "gastos-todos.csv";
}

/** Enlace de descarga con los mismos filtros que tiene aplicados «Mis gastos». */
export function enlaceExportarCsv(filtros: FiltrosGastos, mes: string): string {
  const p = new URLSearchParams({ mes: filtros.todos ? "todos" : mes });
  if (filtros.q) p.set("q", filtros.q);
  if (filtros.categoria) p.set("categoria", filtros.categoria);
  return `/panel/gastos/exportar?${p.toString()}`;
}

/** Código HTTP de la exportación: sin sesión 401, error 500, lista recortada 422, si no 200. */
export function codigoDeExportacion(estado: { haySesion: boolean; hayError: boolean; recortado: boolean }): 200 | 401 | 422 | 500 {
  if (!estado.haySesion) return 401;
  if (estado.hayError) return 500;
  if (estado.recortado) return 422;
  return 200;
}
