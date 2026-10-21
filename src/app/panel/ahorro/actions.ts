"use server";

import { cargarResumenAhorro } from "@/app/panel/ahorro/datos";
import { consejosPorReglas, textoParaIA } from "@/lib/ahorro";
import { geminiConfigurado, pedirConsejos } from "@/lib/gemini";
import { MENSAJE_SIN_CONFIGURAR, supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export interface ResultadoConsejos {
  ok: boolean;
  consejos: string[];
  /** "ia" = Gemini; "reglas" = cálculo sin IA. */
  fuente: "ia" | "reglas";
  mensaje?: string;
}

const ultimaConsulta = new Map<string, number>();
const INTERVALO_MS = 8000;

const fallo = (mensaje: string): ResultadoConsejos => ({ ok: false, consejos: [], fuente: "reglas", mensaje });

export async function generarConsejos(): Promise<ResultadoConsejos> {
  if (!supabaseConfigurado()) return fallo(MENSAJE_SIN_CONFIGURAR);
  const { data } = await (await crearClienteServidor()).auth.getUser();
  if (!data.user) return fallo("Tu sesión expiró. Inicia sesión de nuevo.");

  // Cada llamada a la IA cuesta: una cada 8 s por usuario.
  const ahora = Date.now();
  if (ahora - (ultimaConsulta.get(data.user.id) ?? 0) < INTERVALO_MS) return fallo("Vas muy rápido. Espera unos segundos e inténtalo de nuevo.");
  ultimaConsulta.set(data.user.id, ahora);

  const { resumen } = await cargarResumenAhorro();
  if (resumen.filas.every((f) => f.total === 0)) return fallo("Aún no tienes gastos registrados para analizar.");

  if (geminiConfigurado()) {
    try {
      return { ok: true, consejos: await pedirConsejos(textoParaIA(resumen)), fuente: "ia" };
    } catch {
      return { ok: true, consejos: consejosPorReglas(resumen), fuente: "reglas", mensaje: "La IA no respondió; te mostramos consejos calculados automáticamente." };
    }
  }
  return { ok: true, consejos: consejosPorReglas(resumen), fuente: "reglas" };
}
