import type { Categoria } from "@/types/gasto";

export const siteConfig = {
  nombre: "Cuentas Claras",
  descripcion: "Administra tus gastos mensuales",
  moneda: "COP",
  locale: "es-CO",
};

/** Enlaces de navegación compartidos por el menú y el pie de página. */
export const enlacesPrincipales = [
  { href: "/#funciones", etiqueta: "Funciones" },
  { href: "/#como-funciona", etiqueta: "Cómo funciona" },
  { href: "/#precios", etiqueta: "Precios" },
];

export const enlacesCuenta = [
  { href: "/login", etiqueta: "Iniciar sesión" },
  { href: "/registro", etiqueta: "Crear cuenta" },
];

export const categorias: { valor: Categoria; etiqueta: string }[] = [
  { valor: "vivienda", etiqueta: "Vivienda" },
  { valor: "alimentacion", etiqueta: "Alimentación" },
  { valor: "transporte", etiqueta: "Transporte" },
  { valor: "servicios", etiqueta: "Servicios" },
  { valor: "salud", etiqueta: "Salud" },
  { valor: "tecnologia", etiqueta: "Tecnología" },
  { valor: "ropa", etiqueta: "Ropa y calzado" },
  { valor: "educacion", etiqueta: "Educación y papelería" },
  { valor: "mascotas", etiqueta: "Mascotas" },
  { valor: "bebes", etiqueta: "Bebés y maternidad" },
  { valor: "ocio", etiqueta: "Ocio" },
  { valor: "otros", etiqueta: "Otros" },
];
