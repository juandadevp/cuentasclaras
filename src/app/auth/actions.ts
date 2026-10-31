"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { ResultadoAuth } from "@/lib/auth-tipos";
import { MENSAJE_SIN_CONFIGURAR, supabaseConfigurado } from "@/lib/supabase/config";
import { traducirErrorAuth } from "@/lib/supabase/errores";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import {
  normalizarNombre,
  soloDigitosTelefono,
  validarLogin,
  validarNuevaClave,
  validarRecuperacion,
  validarRegistro,
} from "@/lib/validaciones";

const texto = (f: FormData, campo: string) => String(f.get(campo) ?? "");

async function urlDelSitio(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const protocolo = h.get("x-forwarded-proto") ?? "http";
  return `${protocolo}://${h.get("host")}`;
}

export async function registrar(formData: FormData): Promise<ResultadoAuth> {
  const datos = {
    nombre: texto(formData, "nombre"),
    email: texto(formData, "email"),
    telefono: texto(formData, "telefono"),
    clave: texto(formData, "clave"),
    confirmar: texto(formData, "confirmar"),
  };

  // Siempre se vuelve a validar en el servidor: las validaciones del navegador se pueden saltar.
  const errores = validarRegistro(datos);
  if (Object.keys(errores).length > 0) return { errores };

  if (!supabaseConfigurado()) return { mensaje: MENSAJE_SIN_CONFIGURAR };

  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.auth.signUp({
    email: datos.email.trim().toLowerCase(),
    password: datos.clave,
    options: {
      data: { nombre: normalizarNombre(datos.nombre), telefono: soloDigitosTelefono(datos.telefono) },
      emailRedirectTo: `${await urlDelSitio()}/auth/callback`,
    },
  });

  if (error) {
    if (error.code === "user_already_exists" || error.code === "email_exists") {
      return { errores: { email: "Este correo ya está registrado. Inicia sesión." } };
    }
    return { mensaje: traducirErrorAuth(error) };
  }

  // Con la confirmación de correo activada, Supabase no da error si el correo ya existe:
  // devuelve un usuario sin identidades.
  if (data.user && data.user.identities?.length === 0) {
    return { errores: { email: "Este correo ya está registrado. Inicia sesión." } };
  }

  if (data.session) redirect("/panel");
  return { requiereConfirmacion: true };
}

export async function iniciarSesion(formData: FormData): Promise<ResultadoAuth> {
  const datos = { email: texto(formData, "email"), clave: texto(formData, "clave") };

  const errores = validarLogin(datos);
  if (Object.keys(errores).length > 0) return { errores };

  if (!supabaseConfigurado()) return { mensaje: MENSAJE_SIN_CONFIGURAR };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({
    email: datos.email.trim().toLowerCase(),
    password: datos.clave,
  });

  if (error) return { mensaje: traducirErrorAuth(error) };

  redirect("/panel");
}

/**
 * Paso 1 de recuperar la contraseña: envía el enlace al correo.
 * La respuesta es la misma exista o no la cuenta, para no revelar qué correos están registrados.
 */
export async function solicitarRecuperacion(formData: FormData): Promise<ResultadoAuth> {
  const datos = { email: texto(formData, "email") };

  const errores = validarRecuperacion(datos);
  if (Object.keys(errores).length > 0) return { errores };

  if (!supabaseConfigurado()) return { mensaje: MENSAJE_SIN_CONFIGURAR };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.resetPasswordForEmail(datos.email.trim().toLowerCase(), {
    redirectTo: `${await urlDelSitio()}/auth/callback?siguiente=/restablecer`,
  });

  if (error) {
    // Este límite es por conexión (no por correo), así que avisarlo no delata si la cuenta existe.
    if (error.code === "over_request_rate_limit") return { mensaje: traducirErrorAuth(error) };
    // Cualquier otro fallo se guarda en el registro del servidor (sin el correo) y se responde igual.
    console.error("No se pudo enviar el correo de recuperación:", error.code ?? error.message);
  }

  return { enlaceEnviado: true };
}

/** Paso 2: guarda la nueva contraseña. Solo funciona con la sesión temporal que crea el enlace del correo. */
export async function restablecerClave(formData: FormData): Promise<ResultadoAuth> {
  const datos = { clave: texto(formData, "clave"), confirmar: texto(formData, "confirmar") };

  // Siempre se vuelve a validar en el servidor, con las mismas reglas del registro.
  const errores = validarNuevaClave(datos);
  if (Object.keys(errores).length > 0) return { errores };

  if (!supabaseConfigurado()) return { mensaje: MENSAJE_SIN_CONFIGURAR };

  const supabase = await crearClienteServidor();
  const { data: sesion } = await supabase.auth.getUser();
  if (!sesion.user) return { mensaje: "El enlace venció. Pide uno nuevo." };

  const { error } = await supabase.auth.updateUser({ password: datos.clave });
  if (error) return { mensaje: traducirErrorAuth(error) };

  // Por seguridad, cierra las demás sesiones que siguieran abiertas con la contraseña anterior.
  await supabase.auth.signOut({ scope: "others" });

  redirect("/panel");
}

export async function cerrarSesion(): Promise<void> {
  if (supabaseConfigurado()) {
    const supabase = await crearClienteServidor();
    await supabase.auth.signOut();
  }
  redirect("/");
}
