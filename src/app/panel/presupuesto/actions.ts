"use server";

import { revalidatePath } from "next/cache";
import { hoyIso } from "@/lib/gastos";
import { validarPresupuesto, type ResultadoPresupuesto } from "@/lib/presupuestos";
import { mensajeDeErrorPresupuesto } from "@/lib/presupuestos-errores";
import { MENSAJE_SIN_CONFIGURAR, supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { parsearMonto } from "@/lib/validaciones-gasto";

const texto = (f: FormData, campo: string) => String(f.get(campo) ?? "");
const esUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const MENSAJE_SESION = "Tu sesión expiró. Inicia sesión de nuevo.";

/** Fija (o cambia) el límite de una categoría en un mes. */
export async function fijarPresupuesto(formData: FormData): Promise<ResultadoPresupuesto> {
  const datos = {
    categoria: texto(formData, "categoria"),
    monto: texto(formData, "monto"),
    mes: texto(formData, "mes"),
  };

  // Siempre se vuelve a validar en el servidor: las validaciones del navegador se pueden saltar.
  const errores = validarPresupuesto(datos, hoyIso());
  if (Object.keys(errores).length > 0) return { errores };

  if (!supabaseConfigurado()) return { mensaje: MENSAJE_SIN_CONFIGURAR };

  const supabase = await crearClienteServidor();
  const { data: sesion } = await supabase.auth.getUser();
  if (!sesion.user) return { mensaje: MENSAJE_SESION };

  // Si ya había un límite para esa categoría y mes, se actualiza en vez de duplicarse.
  // El user_id sale de la sesión comprobada aquí, nunca del formulario; la fecha de actualización la pone un disparador.
  const { error } = await supabase.from("presupuestos").upsert(
    {
      user_id: sesion.user.id,
      categoria: datos.categoria,
      mes: `${datos.mes}-01`,
      monto: parsearMonto(datos.monto),
    },
    { onConflict: "user_id,categoria,mes" },
  );
  if (error) return { mensaje: mensajeDeErrorPresupuesto(error) };

  revalidatePath("/panel", "layout");
  return { ok: true };
}

export async function quitarPresupuesto(id: string): Promise<ResultadoPresupuesto> {
  if (!esUuid(id)) return { mensaje: "No encontramos ese límite." };
  if (!supabaseConfigurado()) return { mensaje: MENSAJE_SIN_CONFIGURAR };

  const supabase = await crearClienteServidor();
  const { data: sesion } = await supabase.auth.getUser();
  if (!sesion.user) return { mensaje: MENSAJE_SESION };

  // La seguridad por filas garantiza que solo se borren presupuestos del propio usuario.
  const { data, error } = await supabase.from("presupuestos").delete().eq("id", id).select("id");
  if (error) return { mensaje: mensajeDeErrorPresupuesto(error) };
  if (!data || data.length === 0) return { mensaje: "No encontramos ese límite." };

  revalidatePath("/panel", "layout");
  return { ok: true };
}
