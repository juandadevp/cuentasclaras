import { siteConfig } from "@/config/site";

export function formatearMoneda(valor: number): string {
  return new Intl.NumberFormat(siteConfig.locale, {
    style: "currency",
    currency: siteConfig.moneda,
    maximumFractionDigits: 0,
  }).format(valor);
}

export function formatearFecha(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(siteConfig.locale);
}
