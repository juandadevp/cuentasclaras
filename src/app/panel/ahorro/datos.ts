import { cambiosPorCategoria, filasDeAhorro, type ResumenAhorro } from "@/lib/ahorro";
import { hoyIso, rangoDelMes } from "@/lib/gastos";
import { gastosEntre, totalesPorMes } from "@/lib/gastos-servidor";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";

/** Resumen del usuario con sesión: últimos 6 meses y categorías del mes en curso vs. el anterior. */
export async function cargarResumenAhorro(): Promise<{ resumen: ResumenAhorro; error: boolean }> {
  const { mes, inicio, fin, anterior } = rangoDelMes(undefined, hoyIso());
  const vacio: ResumenAhorro = { mesActual: mes, filas: [], categorias: [] };
  if (!supabaseConfigurado()) return { resumen: vacio, error: false };

  const supabase = await crearClienteServidor();
  const [t, actual, previo] = await Promise.all([
    totalesPorMes(supabase, mes, 6),
    gastosEntre(supabase, inicio, fin),
    gastosEntre(supabase, `${anterior}-01`, inicio),
  ]);
  return {
    resumen: { mesActual: mes, filas: filasDeAhorro(t.meses, mes), categorias: cambiosPorCategoria(actual.gastos, previo.gastos) },
    error: Boolean(t.error || actual.error),
  };
}
