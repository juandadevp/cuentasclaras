"use server";

import { MENSAJE_SIN_CONFIGURAR, supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { validarContacto, type ErroresContacto } from "@/lib/validaciones-contacto";

export interface ResultadoContacto {
  ok?: boolean;
  errores?: ErroresContacto;
  mensaje?: string;
}

const ultimoEnvio = new Map<string, number>();
const texto = (f: FormData, campo: string) => String(f.get(campo) ?? "");

export async function enviarContacto(formData: FormData): Promise<ResultadoContacto> {
  const datos = { nombre: texto(formData, "nombre"), email: texto(formData, "email"), asunto: texto(formData, "asunto"), mensaje: texto(formData, "mensaje") };
  // Siempre se vuelve a validar en el servidor.
  const errores = validarContacto(datos);
  if (Object.keys(errores).length > 0) return { errores };

  if (!supabaseConfigurado()) return { mensaje: MENSAJE_SIN_CONFIGURAR };

  // Freno contra abusos: un mensaje cada 20 s por correo.
  const clave = datos.email.trim().toLowerCase();
  const ahora = Date.now();
  if (ahora - (ultimoEnvio.get(clave) ?? 0) < 20_000) return { mensaje: "Ya enviaste un mensaje. Espera unos segundos antes de enviar otro." };
  ultimoEnvio.set(clave, ahora);

  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("mensajes_contacto").insert({
    nombre: datos.nombre.trim().replace(/\s+/g, " "),
    email: clave,
    asunto: datos.asunto,
    mensaje: datos.mensaje.trim(),
  });
  if (error) {
    const falta = error.code === "42P01" || error.code === "PGRST205";
    return { mensaje: falta ? "Falta crear la tabla de contacto. Ejecuta la migración «contacto» en Supabase." : "No pudimos enviar tu mensaje. Inténtalo de nuevo en un momento." };
  }
  return { ok: true };
}
