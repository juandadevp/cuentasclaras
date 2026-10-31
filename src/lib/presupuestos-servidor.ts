import type { Presupuesto } from "@/lib/presupuestos";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Categoria } from "@/types/gasto";

type Cliente = Awaited<ReturnType<typeof crearClienteServidor>>;

interface Fila {
  id: string;
  categoria: Categoria;
  monto: number | string;
}

/** Presupuestos del usuario con sesión para un mes (yyyy-mm). La seguridad por filas filtra por usuario. */
export async function presupuestosDelMes(supabase: Cliente, mes: string) {
  const { data, error } = await supabase
    .from("presupuestos")
    .select("id, categoria, monto")
    .eq("mes", `${mes}-01`);

  const presupuestos: Presupuesto[] = ((data ?? []) as Fila[]).map((p) => ({
    id: p.id,
    categoria: p.categoria,
    monto: Number(p.monto),
  }));
  return { presupuestos, error };
}
