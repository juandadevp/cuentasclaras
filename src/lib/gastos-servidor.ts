import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Categoria, Gasto } from "@/types/gasto";

interface FilaGasto {
  id: string;
  descripcion: string;
  monto: number | string;
  categoria: Categoria;
  fecha: string;
}

const aGasto = (g: FilaGasto): Gasto => ({ ...g, monto: Number(g.monto) });

type Cliente = Awaited<ReturnType<typeof crearClienteServidor>>;

/** Gastos del usuario con sesión entre dos fechas ([inicio, fin)). La seguridad por filas filtra por usuario. */
export async function gastosEntre(supabase: Cliente, inicio: string, fin: string) {
  const { data, error } = await supabase
    .from("gastos")
    .select("id, descripcion, monto, categoria, fecha")
    .gte("fecha", inicio)
    .lt("fecha", fin)
    .order("fecha", { ascending: false })
    .order("creado_en", { ascending: false });
  return { gastos: ((data ?? []) as FilaGasto[]).map(aGasto), error };
}

/** Los últimos gastos registrados, sin importar el mes. */
export async function ultimosGastos(supabase: Cliente, cantidad = 5) {
  const { data, error } = await supabase
    .from("gastos")
    .select("id, descripcion, monto, categoria, fecha")
    .order("fecha", { ascending: false })
    .order("creado_en", { ascending: false })
    .limit(cantidad);
  return { gastos: ((data ?? []) as FilaGasto[]).map(aGasto), error };
}
