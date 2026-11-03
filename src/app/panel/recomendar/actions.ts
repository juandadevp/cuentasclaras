"use server";

import { puedeIntentar } from "@/lib/limite-frecuencia";
import { buscarOfertas, hayClaveConfigurada } from "@/lib/precios/buscar";
import { mensajeDeErrorProveedor } from "@/lib/precios/mensajes";
import { esRubro } from "@/lib/precios/rubros";
import { codigoDeError, type ResultadoBusqueda } from "@/lib/precios/tipos";
import { validarBusqueda } from "@/lib/precios/validar-busqueda";
import { MENSAJE_SIN_CONFIGURAR, supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";

const INTERVALO_MS = 1500;
/** Última búsqueda de cada persona (por su id): freno sencillo contra abusos y gasto de cuota. */
const ultimasBusquedas = new Map<string, number>();

const fallo = (mensaje: string): ResultadoBusqueda => ({
  ok: false,
  ofertas: [],
  modo: hayClaveConfigurada() ? "real" : "demo",
  actualizado: new Date().toISOString(),
  mensaje,
});

/** Busca precios de un producto. `rubro` vacío o desconocido = detectar el tipo de producto automáticamente. */
export async function buscarPrecios(consulta: string, rubro: string): Promise<ResultadoBusqueda> {
  // Siempre se valida en el servidor: las validaciones del navegador se pueden saltar.
  const busqueda = validarBusqueda(consulta);
  if (busqueda.error !== undefined) return fallo(busqueda.error);

  if (!supabaseConfigurado()) return fallo(MENSAJE_SIN_CONFIGURAR);
  const supabase = await crearClienteServidor();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return fallo("Tu sesión expiró. Inicia sesión de nuevo.");

  // Una búsqueda cada 1,5 s por persona.
  if (!puedeIntentar(ultimasBusquedas, data.user.id, Date.now(), INTERVALO_MS)) {
    return fallo("Vas muy rápido. Espera un momento e inténtalo de nuevo.");
  }

  try {
    return await buscarOfertas(busqueda.texto, esRubro(String(rubro ?? "")) ? (rubro as Parameters<typeof buscarOfertas>[1]) : undefined);
  } catch (e) {
    return fallo(mensajeDeErrorProveedor(codigoDeError(e)));
  }
}
