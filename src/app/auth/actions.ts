"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { ResultadoAuth } from "@/lib/auth-tipos";
import { MENSAJE_SIN_CONFIGURAR, supabaseConfigurado } from "@/lib/supabase/config";
import { traducirErrorAuth } from "@/lib/supabase/errores";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { normalizarNombre, soloDigitosTelefono, validarLogin, validarRegistro } from "@/lib/validaciones";

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

  if (data.session) redirect("/");
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

  redirect("/");
}

export async function cerrarSesion(): Promise<void> {
  if (supabaseConfigurado()) {
    const supabase = await crearClienteServidor();
    await supabase.auth.signOut();
  }
  redirect("/");
}
