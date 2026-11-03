"use server";

import { mensajeDeErrorContacto } from "@/lib/contacto-errores";
import type { ResultadoContacto } from "@/lib/contacto-tipos";
import { puedeIntentar } from "@/lib/limite-frecuencia";
import { MENSAJE_SIN_CONFIGURAR, supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { normalizarContacto, validarContacto } from "@/lib/validaciones-contacto";

/** Un mensaje cada 20 segundos por correo. Vive en la memoria de cada servidor: es una capa extra, no la única. */
const VENTANA_ENVIO_MS = 20_000;
const ultimosEnvios = new Map<string, number>();

const texto = (f: FormData, campo: string) => String(f.get(campo) ?? "");

/**
 * Guarda un mensaje del formulario de Contacto. Es público (no pide sesión): la protección es la validación,
 * el freno por correo y la seguridad por filas de la tabla, que solo permite insertar.
 */
export async function enviarContacto(formData: FormData): Promise<ResultadoContacto> {
  const datos = normalizarContacto({
    nombre: texto(formData, "nombre"),
    correo: texto(formData, "correo"),
    asunto: texto(formData, "asunto"),
    mensaje: texto(formData, "mensaje"),
  });

  // Siempre se vuelve a validar en el servidor: las validaciones del navegador se pueden saltar.
  const errores = validarContacto(datos);
  if (Object.keys(errores).length > 0) return { errores };

  if (!supabaseConfigurado()) return { mensaje: MENSAJE_SIN_CONFIGURAR };

  if (!puedeIntentar(ultimosEnvios, datos.correo, Date.now(), VENTANA_ENVIO_MS)) {
    return { mensaje: "Ya enviaste un mensaje. Espera unos segundos antes de enviar otro." };
  }

  const supabase = await crearClienteServidor();
  // Sin .select(): la tabla no tiene política de lectura, así que pedir la fila de vuelta fallaría.
  const { error } = await supabase.from("mensajes_contacto").insert(datos);

  if (error) {
    // Si no se guardó, la persona puede reintentar enseguida.
    ultimosEnvios.delete(datos.correo);
    return { mensaje: mensajeDeErrorContacto(error) };
  }
  return { ok: true };
}
