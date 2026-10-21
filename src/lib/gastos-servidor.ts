import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Categoria, Gasto } from "@/types/gasto";

interface FilaGasto {
  id: string;
  descripcion: string;
  monto: number | string;
  categoria: Categoria;
  fecha: string;
  tienda?: string | null;
}

const aGasto = (g: FilaGasto): Gasto => ({ ...g, monto: Number(g.monto), tienda: g.tienda ?? undefined });

type Cliente = Awaited<ReturnType<typeof crearClienteServidor>>;

/** Gastos del usuario con sesión entre dos fechas ([inicio, fin)). La seguridad por filas filtra por usuario. */
export async function gastosEntre(supabase: Cliente, inicio: string, fin: string) {
  const { data, error } = await supabase
    .from("gastos")
    .select("id, descripcion, monto, categoria, fecha, tienda")
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
    .select("id, descripcion, monto, categoria, fecha, tienda")
    .order("fecha", { ascending: false })
    .order("creado_en", { ascending: false })
    .limit(cantidad);
  return { gastos: ((data ?? []) as FilaGasto[]).map(aGasto), error };
}

export interface FiltrosGastos {
  /** Texto a buscar dentro de la descripción. */
  q?: string;
  categoria?: string;
}

/** Igual que gastosEntre, pero con búsqueda por texto y por categoría. */
export async function gastosFiltrados(supabase: Cliente, inicio: string, fin: string, filtros: FiltrosGastos) {
  let consulta = supabase
    .from("gastos")
    .select("id, descripcion, monto, categoria, fecha, tienda")
    .gte("fecha", inicio)
    .lt("fecha", fin);

  if (filtros.categoria) consulta = consulta.eq("categoria", filtros.categoria);
  if (filtros.q) {
    // Se escapan los comodines de LIKE para que el usuario busque texto literal.
    const texto = filtros.q.replace(/[\\%_]/g, (c) => `\\${c}`);
    consulta = consulta.ilike("descripcion", `%${texto}%`);
  }

  const { data, error } = await consulta
    .order("fecha", { ascending: false })
    .order("creado_en", { ascending: false });
  return { gastos: ((data ?? []) as FilaGasto[]).map(aGasto), error };
}

export async function gastoPorId(supabase: Cliente, id: string) {
  const { data, error } = await supabase
    .from("gastos")
    .select("id, descripcion, monto, categoria, fecha, tienda")
    .eq("id", id)
    .maybeSingle();
  return { gasto: data ? aGasto(data as FilaGasto) : null, error };
}

/** Total gastado en cada uno de los últimos `cantidad` meses (el último es `hastaMes`, formato yyyy-mm). */
export async function totalesPorMes(supabase: Cliente, hastaMes: string, cantidad = 6) {
  const [anio, mes] = hastaMes.split("-").map(Number);
  const meses: string[] = [];
  for (let i = cantidad - 1; i >= 0; i--) {
    const d = new Date(anio, mes - 1 - i, 1);
    meses.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  const siguiente = new Date(anio, mes, 1);
  const fin = `${siguiente.getFullYear()}-${String(siguiente.getMonth() + 1).padStart(2, "0")}-01`;

  const { data, error } = await supabase
    .from("gastos")
    .select("monto, fecha")
    .gte("fecha", `${meses[0]}-01`)
    .lt("fecha", fin);

  const totales = new Map(meses.map((m) => [m, 0]));
  for (const fila of data ?? []) {
    const clave = String(fila.fecha).slice(0, 7);
    if (totales.has(clave)) totales.set(clave, (totales.get(clave) ?? 0) + Number(fila.monto));
  }
  return { meses: meses.map((m) => ({ mes: m, total: totales.get(m) ?? 0 })), error };
}
