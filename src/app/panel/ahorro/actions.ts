"use server";

import { revalidatePath } from "next/cache";
import { hoyIso } from "@/lib/gastos";
import { validarMeta, type ResultadoMeta } from "@/lib/metas-ahorro";
import { mensajeDeErrorMeta } from "@/lib/metas-ahorro-errores";
import { MENSAJE_SIN_CONFIGURAR, supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { parsearMonto } from "@/lib/validaciones-gasto";

const texto = (f: FormData, campo: string) => String(f.get(campo) ?? "");
const esUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const MENSAJE_SESION = "Tu sesión expiró. Inicia sesión de nuevo.";

/** Fija (o cambia) la meta de ahorro de un mes. */
export async function fijarMetaAhorro(formData: FormData): Promise<ResultadoMeta> {
  const datos = { monto: texto(formData, "monto"), mes: texto(formData, "mes") };

  // Siempre se vuelve a validar en el servidor: las validaciones del navegador se pueden saltar.
  const errores = validarMeta(datos, hoyIso());
  if (Object.keys(errores).length > 0) return { errores };

  if (!supabaseConfigurado()) return { mensaje: MENSAJE_SIN_CONFIGURAR };

  const supabase = await crearClienteServidor();
  const { data: sesion } = await supabase.auth.getUser();
  if (!sesion.user) return { mensaje: MENSAJE_SESION };

  // Si ya había una meta para ese mes, se actualiza en vez de duplicarse.
  // El user_id sale de la sesión comprobada aquí, nunca del formulario.
  const { error } = await supabase.from("metas_ahorro").upsert(
    { user_id: sesion.user.id, mes: `${datos.mes}-01`, monto: parsearMonto(datos.monto) },
    { onConflict: "user_id,mes" },
  );
  if (error) return { mensaje: mensajeDeErrorMeta(error) };

  revalidatePath("/panel", "layout");
  return { ok: true };
}

export async function quitarMetaAhorro(id: string): Promise<ResultadoMeta> {
  if (!esUuid(id)) return { mensaje: "No encontramos esa meta." };
  if (!supabaseConfigurado()) return { mensaje: MENSAJE_SIN_CONFIGURAR };

  const supabase = await crearClienteServidor();
  const { data: sesion } = await supabase.auth.getUser();
  if (!sesion.user) return { mensaje: MENSAJE_SESION };

  // La seguridad por filas garantiza que solo se borren metas del propio usuario.
  const { data, error } = await supabase.from("metas_ahorro").delete().eq("id", id).select("id");
  if (error) return { mensaje: mensajeDeErrorMeta(error) };
  if (!data || data.length === 0) return { mensaje: "No encontramos esa meta." };

  revalidatePath("/panel", "layout");
  return { ok: true };
}
