"use server";

import { revalidatePath } from "next/cache";
import { hoyIso } from "@/lib/gastos";
import { validarPresupuesto, type ErroresPresupuesto } from "@/lib/presupuestos";
import { MENSAJE_SIN_CONFIGURAR, supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { parsearMonto } from "@/lib/validaciones-gasto";

export interface ResultadoPresupuesto {
  errores?: ErroresPresupuesto;
  mensaje?: string;
  ok?: boolean;
}

const texto = (f: FormData, campo: string) => String(f.get(campo) ?? "");

/** Traduce los errores de la base de datos a algo que la persona pueda entender. */
function mensajeDeError(error: { code?: string }): string {
  if (error.code === "42P01" || error.code === "PGRST205") {
    return "Falta crear la tabla de presupuestos. Ejecuta la migración «presupuestos» en el SQL Editor de Supabase.";
  }
  return "No pudimos guardar el presupuesto. Inténtalo de nuevo.";
}

/** Fija (o cambia) el límite de una categoría en un mes. */
export async function fijarPresupuesto(formData: FormData): Promise<ResultadoPresupuesto> {
  const datos = {
    categoria: texto(formData, "categoria"),
    monto: texto(formData, "monto"),
    mes: texto(formData, "mes"),
  };

  // Siempre se vuelve a validar en el servidor.
  const errores = validarPresupuesto(datos, hoyIso());
  if (Object.keys(errores).length > 0) return { errores };

  if (!supabaseConfigurado()) return { mensaje: MENSAJE_SIN_CONFIGURAR };

  const supabase = await crearClienteServidor();
  const { data: sesion } = await supabase.auth.getUser();
  if (!sesion.user) return { mensaje: "Tu sesión expiró. Inicia sesión de nuevo." };

  // Si ya había un límite para esa categoría y mes, se actualiza en vez de duplicarse.
  const { error } = await supabase.from("presupuestos").upsert(
    {
      user_id: sesion.user.id,
      categoria: datos.categoria,
      mes: `${datos.mes}-01`,
      monto: parsearMonto(datos.monto),
      actualizado_en: new Date().toISOString(),
    },
    { onConflict: "user_id,categoria,mes" },
  );

  if (error) return { mensaje: mensajeDeError(error) };

  revalidatePath("/panel", "layout");
  return { ok: true };
}

export async function quitarPresupuesto(formData: FormData): Promise<void> {
  const id = texto(formData, "id");
  if (!/^[0-9a-f-]{36}$/i.test(id) || !supabaseConfigurado()) return;

  const supabase = await crearClienteServidor();
  // La seguridad por filas garantiza que solo se borren presupuestos del propio usuario.
  await supabase.from("presupuestos").delete().eq("id", id);
  revalidatePath("/panel", "layout");
}
