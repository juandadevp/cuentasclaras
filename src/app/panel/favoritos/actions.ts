"use server";

import { revalidatePath } from "next/cache";
import { LARGO_CLAVE, limpiarProducto, mensajeDeErrorFavoritos, type ResultadoFavorito } from "@/lib/favoritos";
import { MENSAJE_SIN_CONFIGURAR, supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";

/** Cliente de Supabase con la sesión comprobada, o el mensaje que hay que mostrar. */
async function clienteConSesion() {
  if (!supabaseConfigurado()) return { mensaje: MENSAJE_SIN_CONFIGURAR };
  const supabase = await crearClienteServidor();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { mensaje: "Tu sesión expiró. Inicia sesión de nuevo." };
  return { supabase };
}

/** Guarda un producto en los favoritos de quien tiene la sesión iniciada. */
export async function guardarFavorito(entrada: unknown): Promise<ResultadoFavorito> {
  // Los datos vienen del navegador: se limpian y se revisan aquí, no se confía en ellos.
  const producto = limpiarProducto(entrada);
  if (!producto) return { ok: false, mensaje: "No pudimos guardar este producto." };

  const sesion = await clienteConSesion();
  if (!sesion.supabase) return { ok: false, mensaje: sesion.mensaje };

  // user_id no se envía: la base de datos lo toma de la sesión (default auth.uid()).
  const { error } = await sesion.supabase.from("favoritos").insert({
    clave: producto.clave,
    titulo: producto.titulo,
    imagen: producto.imagen ?? null,
    tipo: producto.tipo ?? null,
    ofertas: producto.ofertas,
  });

  // 23505 = ya estaba guardado: no es un error para quien lo pidió.
  if (error && error.code !== "23505") return { ok: false, mensaje: mensajeDeErrorFavoritos(error) };

  revalidatePath("/panel", "layout");
  return { ok: true };
}

/** Quita un producto de los favoritos. La seguridad por filas solo permite borrar los propios. */
export async function quitarFavorito(clave: string): Promise<ResultadoFavorito> {
  if (typeof clave !== "string" || clave.length === 0 || clave.length > LARGO_CLAVE) return { ok: false, mensaje: "Producto no válido." };

  const sesion = await clienteConSesion();
  if (!sesion.supabase) return { ok: false, mensaje: sesion.mensaje };

  const { error } = await sesion.supabase.from("favoritos").delete().eq("clave", clave);
  if (error) return { ok: false, mensaje: mensajeDeErrorFavoritos(error) };

  revalidatePath("/panel", "layout");
  return { ok: true };
}
