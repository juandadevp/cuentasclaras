export type TipoIngreso = "salario" | "ventas" | "honorarios" | "otros";

export interface Ingreso {
  id: string;
  descripcion: string;
  tipo: TipoIngreso;
  monto: number;
  fecha: string; // ISO yyyy-mm-dd
}
