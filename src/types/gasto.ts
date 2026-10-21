export type Categoria =
  | "vivienda"
  | "alimentacion"
  | "transporte"
  | "servicios"
  | "ocio"
  | "salud"
  | "tecnologia"
  | "ropa"
  | "educacion"
  | "mascotas"
  | "bebes"
  | "otros";

export interface Gasto {
  id: string;
  descripcion: string;
  monto: number;
  categoria: Categoria;
  fecha: string; // ISO yyyy-mm-dd
  /** Tienda donde se hizo la compra (opcional). */
  tienda?: string;
}

export type NuevoGasto = Omit<Gasto, "id">;
