import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Ingreso, TipoIngreso } from "@/types/ingreso";

type Cliente = Awaited<ReturnType<typeof crearClienteServidor>>;

interface Fila {
  id: string;
  descripcion: string;
  tipo: TipoIngreso;
  monto: number | string;
  fecha: string;
}

/** Ingresos del usuario con sesión entre dos fechas ([inicio, fin)), hasta 1000. La seguridad por filas filtra por usuario. */
export async function ingresosEntre(supabase: Cliente, inicio: string, fin: string) {
  const { data, error } = await supabase
    .from("ingresos")
    .select("id, descripcion, tipo, monto, fecha")
    .gte("fecha", inicio)
    .lt("fecha", fin)
    .order("fecha", { ascending: false })
    .order("creado_en", { ascending: false })
    .limit(1000);

  const ingresos: Ingreso[] = ((data ?? []) as Fila[]).map((i) => ({ ...i, monto: Number(i.monto) }));
  return { ingresos, error: error as { code?: string; message?: string } | null };
}
