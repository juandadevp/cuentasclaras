import type { Favorito, OfertaFavorita } from "@/lib/favoritos";
import type { crearClienteServidor } from "@/lib/supabase/servidor";

type Cliente = Awaited<ReturnType<typeof crearClienteServidor>>;
type ErrorBD = { code?: string; message?: string };

interface Fila {
  id: string;
  clave: string;
  titulo: string;
  imagen: string | null;
  tipo: string | null;
  ofertas: OfertaFavorita[] | null;
  fecha: string;
}

/** Favoritos del usuario con sesión, del más reciente al más antiguo. La seguridad por filas filtra por usuario. */
export async function listarFavoritos(supabase: Cliente): Promise<{ favoritos: Favorito[]; error: ErrorBD | null }> {
  const { data, error } = await supabase
    .from("favoritos")
    .select("id, clave, titulo, imagen, tipo, ofertas, fecha")
    .order("fecha", { ascending: false });

  const favoritos = ((data ?? []) as Fila[]).map((f) => ({
    id: f.id,
    clave: f.clave,
    titulo: f.titulo,
    imagen: f.imagen ?? undefined,
    tipo: f.tipo ?? undefined,
    ofertas: Array.isArray(f.ofertas) ? f.ofertas : [],
    fecha: f.fecha,
  }));
  return { favoritos, error };
}

/** Solo las claves de los productos guardados: lo que necesita «Recomendar compras» para pintar las estrellas. */
export async function clavesFavoritas(supabase: Cliente): Promise<{ claves: string[]; error: ErrorBD | null }> {
  const { data, error } = await supabase.from("favoritos").select("clave");
  return { claves: (data ?? []).map((f) => String(f.clave)), error };
}
