"use server";

import { revalidatePath } from "next/cache";
import { limpiarProducto } from "@/lib/favoritos";
import { MENSAJE_SIN_CONFIGURAR, supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export interface ResultadoFavorito {
  ok: boolean;
  mensaje?: string;
}

async function usuarioActual() {
  if (!supabaseConfigurado()) return { error: MENSAJE_SIN_CONFIGURAR } as const;
  const supabase = await crearClienteServidor();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "Tu sesión expiró. Inicia sesión de nuevo." } as const;
  return { supabase, usuario: data.user } as const;
}

/** Guarda un producto en los favoritos de quien tiene la sesión iniciada. */
export async function guardarFavorito(entrada: unknown): Promise<ResultadoFavorito> {
  const producto = limpiarProducto(entrada);
  if (!producto) return { ok: false, mensaje: "No pudimos guardar este producto." };

  const sesion = await usuarioActual();
  if ("error" in sesion) return { ok: false, mensaje: sesion.error };

  const { error } = await sesion.supabase.from("favoritos").insert({
    user_id: sesion.usuario.id,
    clave: producto.clave,
    titulo: producto.titulo,
    imagen: producto.imagen ?? null,
    rubro: producto.rubro ?? null,
    ofertas: producto.ofertas,
  });

  // 23505 = ya estaba guardado: no es un error para quien lo pidió.
  if (error && error.code !== "23505") {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return { ok: false, mensaje: "Falta crear la tabla de favoritos en Supabase. Ejecuta la migración de favoritos." };
    }
    return { ok: false, mensaje: "No pudimos guardar el favorito. Inténtalo de nuevo." };
  }

  revalidatePath("/panel", "layout");
  return { ok: true };
}

/** Quita un producto de los favoritos. La seguridad por filas solo permite borrar los propios. */
export async function quitarFavorito(clave: string): Promise<ResultadoFavorito> {
  if (typeof clave !== "string" || clave.length === 0 || clave.length > 200) return { ok: false, mensaje: "Producto no válido." };

  const sesion = await usuarioActual();
  if ("error" in sesion) return { ok: false, mensaje: sesion.error };

  const { error } = await sesion.supabase.from("favoritos").delete().eq("clave", clave);
  if (error) return { ok: false, mensaje: "No pudimos quitar el favorito. Inténtalo de nuevo." };

  revalidatePath("/panel", "layout");
  return { ok: true };
}

/** Versión para formularios (botón de la estrella en la página de favoritos). */
export async function quitarFavoritoForm(formData: FormData): Promise<void> {
  await quitarFavorito(String(formData.get("clave") ?? ""));
}
