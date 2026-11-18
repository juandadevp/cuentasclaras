"use server";

import { revalidatePath } from "next/cache";
import { hoyIso } from "@/lib/gastos";
import { validarIngreso, type ResultadoIngreso } from "@/lib/ingresos";
import { mensajeDeErrorIngreso } from "@/lib/ingresos-errores";
import { MENSAJE_SIN_CONFIGURAR, supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { normalizarDescripcion, parsearMonto } from "@/lib/validaciones-gasto";

const texto = (f: FormData, campo: string) => String(f.get(campo) ?? "");
const esUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const MENSAJE_SESION = "Tu sesión expiró. Inicia sesión de nuevo.";

/** Registra un ingreso del usuario con sesión. */
export async function crearIngreso(formData: FormData): Promise<ResultadoIngreso> {
  const datos = {
    descripcion: texto(formData, "descripcion"),
    tipo: texto(formData, "tipo"),
    monto: texto(formData, "monto"),
    fecha: texto(formData, "fecha"),
  };

  // Siempre se vuelve a validar en el servidor: las validaciones del navegador se pueden saltar.
  const errores = validarIngreso(datos, hoyIso());
  if (Object.keys(errores).length > 0) return { errores };

  if (!supabaseConfigurado()) return { mensaje: MENSAJE_SIN_CONFIGURAR };

  const supabase = await crearClienteServidor();
  const { data: sesion } = await supabase.auth.getUser();
  if (!sesion.user) return { mensaje: MENSAJE_SESION };

  // El user_id sale de la sesión comprobada aquí, nunca del formulario.
  const { error } = await supabase.from("ingresos").insert({
    user_id: sesion.user.id,
    descripcion: normalizarDescripcion(datos.descripcion),
    tipo: datos.tipo,
    monto: parsearMonto(datos.monto),
    fecha: datos.fecha,
  });
  if (error) return { mensaje: mensajeDeErrorIngreso(error) };

  revalidatePath("/panel", "layout");
  return { ok: true };
}

export async function eliminarIngreso(id: string): Promise<ResultadoIngreso> {
  if (!esUuid(id)) return { mensaje: "No encontramos ese ingreso." };
  if (!supabaseConfigurado()) return { mensaje: MENSAJE_SIN_CONFIGURAR };

  const supabase = await crearClienteServidor();
  const { data: sesion } = await supabase.auth.getUser();
  if (!sesion.user) return { mensaje: MENSAJE_SESION };

  // La seguridad por filas garantiza que solo se borren ingresos del propio usuario.
  const { data, error } = await supabase.from("ingresos").delete().eq("id", id).select("id");
  if (error) return { mensaje: mensajeDeErrorIngreso(error) };
  if (!data || data.length === 0) return { mensaje: "No encontramos ese ingreso." };

  revalidatePath("/panel", "layout");
  return { ok: true };
}
