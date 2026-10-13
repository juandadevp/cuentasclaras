import type { Categoria } from "@/types/gasto";

export const siteConfig = {
  nombre: "Cuentas Claras",
  descripcion: "Administra tus gastos mensuales",
  moneda: "COP",
  locale: "es-CO",
};

export const categorias: { valor: Categoria; etiqueta: string }[] = [
  { valor: "vivienda", etiqueta: "Vivienda" },
  { valor: "alimentacion", etiqueta: "Alimentación" },
  { valor: "transporte", etiqueta: "Transporte" },
  { valor: "servicios", etiqueta: "Servicios" },
  { valor: "ocio", etiqueta: "Ocio" },
  { valor: "salud", etiqueta: "Salud" },
  { valor: "otros", etiqueta: "Otros" },
];
