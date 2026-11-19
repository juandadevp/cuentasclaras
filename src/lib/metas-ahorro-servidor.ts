import type { MetaAhorro } from "@/lib/metas-ahorro";
import type { crearClienteServidor } from "@/lib/supabase/servidor";

type Cliente = Awaited<ReturnType<typeof crearClienteServidor>>;

interface Fila {
  id: string;
  monto: number | string;
}

/** Meta de ahorro del usuario con sesión para un mes (yyyy-mm), o null si no la fijó. La seguridad por filas filtra por usuario. */
export async function metaDelMes(supabase: Cliente, mes: string) {
  const { data, error } = await supabase.from("metas_ahorro").select("id, monto").eq("mes", `${mes}-01`).maybeSingle();

  const fila = data as Fila | null;
  const meta: MetaAhorro | null = fila ? { id: fila.id, monto: Number(fila.monto) } : null;
  return { meta, error: error as { code?: string; message?: string } | null };
}
