import type { Gasto, NuevoGasto } from "@/types/gasto";

// Almacén en memoria (placeholder). Reemplazar por una base de datos real.
const gastos: Gasto[] = [];

export async function listarGastos(): Promise<Gasto[]> {
  return gastos;
}

export async function crearGasto(nuevo: NuevoGasto): Promise<Gasto> {
  const gasto: Gasto = { id: crypto.randomUUID(), ...nuevo };
  gastos.push(gasto);
  return gasto;
}
