import type { Favorito, OfertaFavorita } from "@/lib/favoritos";
import { crearClienteServidor } from "@/lib/supabase/servidor";

type Cliente = Awaited<ReturnType<typeof crearClienteServidor>>;

interface Fila {
  id: string;
  clave: string;
  titulo: string;
  imagen: string | null;
  rubro: string | null;
  ofertas: OfertaFavorita[] | null;
  creado_en: string;
}

/** Favoritos del usuario con sesión, del más reciente al más antiguo. La seguridad por filas filtra por usuario. */
export async function listarFavoritos(supabase: Cliente) {
  const { data, error } = await supabase
    .from("favoritos")
    .select("id, clave, titulo, imagen, rubro, ofertas, creado_en")
    .order("creado_en", { ascending: false });

  const favoritos: Favorito[] = ((data ?? []) as Fila[]).map((f) => ({
    id: f.id,
    clave: f.clave,
    titulo: f.titulo,
    imagen: f.imagen ?? undefined,
    rubro: f.rubro ?? undefined,
    ofertas: Array.isArray(f.ofertas) ? f.ofertas : [],
    creadoEn: f.creado_en,
  }));
  return { favoritos, error };
}

export async function clavesFavoritas(supabase: Cliente): Promise<string[]> {
  const { data } = await supabase.from("favoritos").select("clave");
  return (data ?? []).map((f) => String(f.clave));
}
