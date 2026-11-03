"use server";

import { revalidatePath } from "next/cache";
import { mensajeDeErrorGasto } from "@/lib/gastos-errores";
import { hoyIso } from "@/lib/gastos";
import type { ResultadoGasto } from "@/lib/gastos-tipos";
import { MENSAJE_SIN_CONFIGURAR, supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import {
  normalizarDescripcion,
  normalizarTienda,
  parsearMonto,
  validarGasto,
  type DatosGasto,
} from "@/lib/validaciones-gasto";

const texto = (f: FormData, campo: string) => String(f.get(campo) ?? "");
const esUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const MENSAJE_NO_ENCONTRADO = "No encontramos ese gasto.";
const MENSAJE_SESION = "Tu sesión expiró. Inicia sesión de nuevo.";

function leerDatos(formData: FormData): DatosGasto {
  return {
    descripcion: texto(formData, "descripcion"),
    monto: texto(formData, "monto"),
    categoria: texto(formData, "categoria"),
    fecha: texto(formData, "fecha"),
    tienda: texto(formData, "tienda"),
  };
}

/** Los campos ya validados, listos para guardar. user_id no se envía: la base de datos lo toma de la sesión. */
function filaDeGasto(d: DatosGasto) {
  return {
    descripcion: normalizarDescripcion(d.descripcion),
    monto: parsearMonto(d.monto),
    categoria: d.categoria,
    fecha: d.fecha,
    tienda: normalizarTienda(d.tienda),
  };
}

/** Cliente de Supabase con la sesión comprobada, o el mensaje que hay que mostrar. */
async function clienteConSesion() {
  if (!supabaseConfigurado()) return { mensaje: MENSAJE_SIN_CONFIGURAR };
  const supabase = await crearClienteServidor();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { mensaje: MENSAJE_SESION };
  return { supabase };
}

export async function crearGasto(formData: FormData): Promise<ResultadoGasto> {
  const datos = leerDatos(formData);

  // Siempre se vuelve a validar en el servidor: las validaciones del navegador se pueden saltar.
  const errores = validarGasto(datos, hoyIso());
  if (Object.keys(errores).length > 0) return { errores };

  const sesion = await clienteConSesion();
  if (!sesion.supabase) return { mensaje: sesion.mensaje };

  const { error } = await sesion.supabase.from("gastos").insert(filaDeGasto(datos));
  if (error) return { mensaje: mensajeDeErrorGasto(error) };

  revalidatePath("/panel", "layout");
  return { ok: true };
}

export async function actualizarGasto(id: string, formData: FormData): Promise<ResultadoGasto> {
  const datos = leerDatos(formData);

  const errores = validarGasto(datos, hoyIso());
  if (Object.keys(errores).length > 0) return { errores };
  if (!esUuid(id)) return { mensaje: MENSAJE_NO_ENCONTRADO };

  const sesion = await clienteConSesion();
  if (!sesion.supabase) return { mensaje: sesion.mensaje };

  // La seguridad por filas hace que solo se pueda editar un gasto propio.
  const { data, error } = await sesion.supabase.from("gastos").update(filaDeGasto(datos)).eq("id", id).select("id");
  if (error) return { mensaje: mensajeDeErrorGasto(error) };
  if (!data || data.length === 0) return { mensaje: MENSAJE_NO_ENCONTRADO };

  revalidatePath("/panel", "layout");
  return { ok: true };
}

export async function eliminarGasto(id: string): Promise<ResultadoGasto> {
  if (!esUuid(id)) return { mensaje: MENSAJE_NO_ENCONTRADO };

  const sesion = await clienteConSesion();
  if (!sesion.supabase) return { mensaje: sesion.mensaje };

  // La seguridad por filas garantiza que solo se borren gastos del propio usuario.
  const { data, error } = await sesion.supabase.from("gastos").delete().eq("id", id).select("id");
  if (error) return { mensaje: mensajeDeErrorGasto(error) };
  if (!data || data.length === 0) return { mensaje: MENSAJE_NO_ENCONTRADO };

  revalidatePath("/panel", "layout");
  return { ok: true };
}
