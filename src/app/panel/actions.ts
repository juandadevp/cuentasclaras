"use server";

import { revalidatePath } from "next/cache";
import { hoyIso } from "@/lib/gastos";
import { MENSAJE_SIN_CONFIGURAR, supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { normalizarDescripcion, normalizarTienda, parsearMonto, validarGasto, type ErroresGasto } from "@/lib/validaciones-gasto";

export interface ResultadoGasto {
  errores?: ErroresGasto;
  mensaje?: string;
  ok?: boolean;
}

const texto = (f: FormData, campo: string) => String(f.get(campo) ?? "");

/** Traduce los errores de la base de datos a algo que la persona pueda entender. */
function mensajeDeError(error: { code?: string; message?: string }): string {
  if (error.code === "42P01" || error.code === "PGRST205") {
    return "Falta crear la tabla de gastos en Supabase. Ejecuta la migración de gastos.";
  }
  // La categoría nueva (p. ej. Tecnología) o el campo tienda necesitan la migración más reciente.
  if (error.code === "PGRST204" || /gastos_categoria_valida|tienda/.test(error.message ?? "")) {
    return "Falta actualizar la base de datos. Ejecuta la migración «categorias_y_tienda» en el SQL Editor de Supabase.";
  }
  return "No pudimos guardar el gasto. Inténtalo de nuevo.";
}

export async function crearGasto(formData: FormData): Promise<ResultadoGasto> {
  const datos = {
    descripcion: texto(formData, "descripcion"),
    monto: texto(formData, "monto"),
    categoria: texto(formData, "categoria"),
    fecha: texto(formData, "fecha"),
    tienda: texto(formData, "tienda"),
  };

  // Siempre se vuelve a validar en el servidor.
  const errores = validarGasto(datos, hoyIso());
  if (Object.keys(errores).length > 0) return { errores };

  if (!supabaseConfigurado()) return { mensaje: MENSAJE_SIN_CONFIGURAR };

  const supabase = await crearClienteServidor();
  const { data: sesion } = await supabase.auth.getUser();
  if (!sesion.user) return { mensaje: "Tu sesión expiró. Inicia sesión de nuevo." };

  // user_id no se envía: la base de datos lo toma de la sesión (auth.uid()).
  const { error } = await supabase.from("gastos").insert({
    descripcion: normalizarDescripcion(datos.descripcion),
    monto: parsearMonto(datos.monto),
    categoria: datos.categoria,
    fecha: datos.fecha,
    tienda: normalizarTienda(datos.tienda),
  });

  if (error) return { mensaje: mensajeDeError(error) };

  revalidatePath("/panel", "layout");
  return { ok: true };
}

export async function actualizarGasto(id: string, formData: FormData): Promise<ResultadoGasto> {
  const datos = {
    descripcion: texto(formData, "descripcion"),
    monto: texto(formData, "monto"),
    categoria: texto(formData, "categoria"),
    fecha: texto(formData, "fecha"),
    tienda: texto(formData, "tienda"),
  };

  const errores = validarGasto(datos, hoyIso());
  if (Object.keys(errores).length > 0) return { errores };
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { mensaje: "No encontramos ese gasto." };
  if (!supabaseConfigurado()) return { mensaje: MENSAJE_SIN_CONFIGURAR };

  const supabase = await crearClienteServidor();
  // La seguridad por filas hace que solo se pueda editar un gasto propio.
  const { data, error } = await supabase
    .from("gastos")
    .update({
      descripcion: normalizarDescripcion(datos.descripcion),
      monto: parsearMonto(datos.monto),
      categoria: datos.categoria,
      fecha: datos.fecha,
      tienda: normalizarTienda(datos.tienda),
    })
    .eq("id", id)
    .select("id");

  if (error) return { mensaje: mensajeDeError(error) };
  if (!data || data.length === 0) return { mensaje: "No encontramos ese gasto." };

  revalidatePath("/panel", "layout");
  return { ok: true };
}

export async function eliminarGasto(formData: FormData): Promise<void> {
  const id = texto(formData, "id");
  if (!/^[0-9a-f-]{36}$/i.test(id) || !supabaseConfigurado()) return;

  const supabase = await crearClienteServidor();
  // La seguridad por filas garantiza que solo se borren gastos del propio usuario.
  await supabase.from("gastos").delete().eq("id", id);
  revalidatePath("/panel", "layout");
}
