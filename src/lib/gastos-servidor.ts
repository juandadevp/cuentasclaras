import { escaparComodines } from "@/lib/gastos";
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

type Cliente = Awaited<ReturnType<typeof crearClienteServidor>>;
type ErrorBD = { code?: string; message?: string };

const COLUMNAS = "id, descripcion, monto, categoria, fecha, tienda";
/** PostgREST devuelve como máximo 1000 filas por consulta: se pide por páginas. */
const POR_PAGINA = 1000;
const TOPE_FILAS = 5000;

const aGasto = (g: FilaGasto): Gasto => ({ ...g, monto: Number(g.monto), tienda: g.tienda ?? undefined });

export interface ResultadoLista {
  gastos: Gasto[];
  error: ErrorBD | null;
  /** true si había más gastos que el tope y la lista quedó incompleta. */
  recortado: boolean;
}

/** Lee todas las páginas de una consulta ordenada, hasta TOPE_FILAS. */
async function leerPaginas(
  pedir: (desde: number, hasta: number) => PromiseLike<{ data: unknown[] | null; error: ErrorBD | null }>,
): Promise<ResultadoLista> {
  const filas: FilaGasto[] = [];
  for (let desde = 0; desde < TOPE_FILAS; desde += POR_PAGINA) {
    const { data, error } = await pedir(desde, desde + POR_PAGINA - 1);
    if (error) return { gastos: [], error, recortado: false };
    const pagina = (data ?? []) as FilaGasto[];
    filas.push(...pagina);
    if (pagina.length < POR_PAGINA) return { gastos: filas.map(aGasto), error: null, recortado: false };
  }
  return { gastos: filas.map(aGasto), error: null, recortado: true };
}

/** Gastos del usuario con sesión entre dos fechas ([inicio, fin)). La seguridad por filas filtra por usuario. */
export function gastosEntre(supabase: Cliente, inicio: string, fin: string) {
  return leerPaginas((desde, hasta) =>
    supabase
      .from("gastos")
      .select(COLUMNAS)
      .gte("fecha", inicio)
      .lt("fecha", fin)
      .order("fecha", { ascending: false })
      .order("creado_en", { ascending: false })
      .order("id")
      .range(desde, hasta),
  );
}

export interface FiltrosConsulta {
  /** Texto a buscar dentro de la descripción. */
  q?: string;
  categoria?: string;
}

/** Igual que gastosEntre, pero con búsqueda por texto y por categoría. */
export function gastosFiltrados(supabase: Cliente, inicio: string, fin: string, filtros: FiltrosConsulta) {
  return leerPaginas((desde, hasta) => {
    let consulta = supabase.from("gastos").select(COLUMNAS).gte("fecha", inicio).lt("fecha", fin);
    if (filtros.categoria) consulta = consulta.eq("categoria", filtros.categoria);
    // Se escapan los comodines de LIKE para que la persona busque texto literal.
    if (filtros.q) consulta = consulta.ilike("descripcion", `%${escaparComodines(filtros.q)}%`);
    return consulta
      .order("fecha", { ascending: false })
      .order("creado_en", { ascending: false })
      .order("id")
      .range(desde, hasta);
  });
}

/** Los últimos gastos registrados, sin importar el mes. */
export async function ultimosGastos(supabase: Cliente, cantidad = 5) {
  const { data, error } = await supabase
    .from("gastos")
    .select(COLUMNAS)
    .order("fecha", { ascending: false })
    .order("creado_en", { ascending: false })
    .limit(cantidad);
  return { gastos: ((data ?? []) as FilaGasto[]).map(aGasto), error: error as ErrorBD | null };
}

export async function gastoPorId(supabase: Cliente, id: string) {
  const { data, error } = await supabase.from("gastos").select(COLUMNAS).eq("id", id).maybeSingle();
  return { gasto: data ? aGasto(data as FilaGasto) : null, error: error as ErrorBD | null };
}
