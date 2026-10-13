import type { Gasto } from "@/types/gasto";

export function totalGastos(gastos: Gasto[]): number {
  return gastos.reduce((acc, g) => acc + g.monto, 0);
}

export function gastosDelMes(gastos: Gasto[], anio: number, mes: number): Gasto[] {
  return gastos.filter((g) => {
    const f = new Date(`${g.fecha}T00:00:00`);
    return f.getFullYear() === anio && f.getMonth() === mes;
  });
}
