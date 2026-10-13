export type Categoria =
  | "vivienda"
  | "alimentacion"
  | "transporte"
  | "servicios"
  | "ocio"
  | "salud"
  | "otros";

export interface Gasto {
  id: string;
  descripcion: string;
  monto: number;
  categoria: Categoria;
  fecha: string; // ISO yyyy-mm-dd
}

export type NuevoGasto = Omit<Gasto, "id">;
