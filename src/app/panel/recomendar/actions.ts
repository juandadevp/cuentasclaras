"use server";

import { buscarOfertas } from "@/lib/precios/buscar";
import { esRubro } from "@/lib/precios/rubros";
import { codigoDeError, type ResultadoBusqueda } from "@/lib/precios/tipos";
import { MENSAJE_SIN_CONFIGURAR, supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";

const ultimaBusqueda = new Map<string, number>();
const INTERVALO_MS = 1500;

const fallo = (mensaje: string): ResultadoBusqueda => ({ ok: false, ofertas: [], modo: "real", actualizado: new Date().toISOString(), mensaje });

/** `rubro` vacío = detectar el tipo de producto automáticamente. */
export async function buscarPrecios(consulta: string, rubro: string): Promise<ResultadoBusqueda> {
  const texto = String(consulta ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .trim()
    .replace(/\s+/g, " ");
  if (texto.length < 2) return fallo("Escribe al menos 2 letras del producto.");
  if (texto.length > 80) return fallo("La búsqueda es demasiado larga (máximo 80 caracteres).");

  if (!supabaseConfigurado()) return fallo(MENSAJE_SIN_CONFIGURAR);
  const supabase = await crearClienteServidor();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return fallo("Tu sesión expiró. Inicia sesión de nuevo.");

  // Freno sencillo contra abusos: una búsqueda cada 1,5 s por usuario.
  const ahora = Date.now();
  if (ahora - (ultimaBusqueda.get(data.user.id) ?? 0) < INTERVALO_MS) return fallo("Vas muy rápido. Espera un momento e inténtalo de nuevo.");
  ultimaBusqueda.set(data.user.id, ahora);

  try {
    return await buscarOfertas(texto, esRubro(rubro) ? rubro : undefined);
  } catch (e) {
    const codigo = codigoDeError(e);
    const mensajes = {
      clave: "La clave del servicio de precios no es válida. Revisa SERPAPI_API_KEY.",
      limite: "Se alcanzó el límite de búsquedas del servicio de precios. Inténtalo más tarde.",
      red: "No pudimos conectarnos al servicio de precios. Inténtalo de nuevo en un momento.",
      respuesta: "El servicio de precios respondió algo inesperado. Inténtalo de nuevo.",
    } as const;
    return fallo(mensajes[codigo]);
  }
}
