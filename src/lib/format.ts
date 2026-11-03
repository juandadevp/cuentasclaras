import { siteConfig } from "@/config/site";

const formatoMoneda = new Intl.NumberFormat(siteConfig.locale, {
  style: "currency",
  currency: siteConfig.moneda,
  maximumFractionDigits: 0,
});

export function formatearMoneda(valor: number): string {
  return formatoMoneda.format(valor);
}

/** Convierte una fecha ISO (yyyy-mm-dd) a fecha local, sin desfase de zona horaria. */
export function formatearFecha(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(siteConfig.locale);
}
