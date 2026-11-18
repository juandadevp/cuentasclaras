import { codigoDeExportacion, gastosACsv, nombreArchivoCsv } from "@/lib/exportar-csv";
import { hoyIso, leerFiltros, rangoDelMes } from "@/lib/gastos";
import { mensajeDeErrorGasto } from "@/lib/gastos-errores";
import { gastosFiltrados } from "@/lib/gastos-servidor";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { obtenerUsuario } from "@/lib/supabase/usuario";

const SIN_CACHE = { "Cache-Control": "no-store" };

function texto(mensaje: string, status: number) {
  return new Response(mensaje, { status, headers: { "Content-Type": "text/plain; charset=utf-8", ...SIN_CACHE } });
}

/** Descarga en CSV los gastos que la persona está viendo (mismo mes, búsqueda y categoría). */
export async function GET(request: Request) {
  const usuario = await obtenerUsuario();
  if (codigoDeExportacion({ haySesion: Boolean(usuario), hayError: false, recortado: false }) === 401 || !usuario) {
    return texto("Tu sesión expiró. Inicia sesión de nuevo.", 401);
  }

  const filtros = leerFiltros(Object.fromEntries(new URL(request.url).searchParams));
  const { todos, q, categoria } = filtros;
  const rango = rangoDelMes(todos ? undefined : filtros.mes, hoyIso());

  if (!supabaseConfigurado()) return texto("La base de datos no está configurada.", 500);
  const supabase = await crearClienteServidor();
  const r = await gastosFiltrados(supabase, todos ? "2000-01-01" : rango.inicio, todos ? "2100-01-01" : rango.fin, {
    q: q || undefined,
    categoria,
  });

  const codigo = codigoDeExportacion({ haySesion: true, hayError: Boolean(r.error), recortado: r.recortado });
  if (codigo === 500 && r.error) return texto(mensajeDeErrorGasto(r.error), 500);
  if (codigo === 422) return texto("Hay más de 5.000 gastos. Elige un mes o filtra para exportar.", 422);

  return new Response(gastosACsv(r.gastos), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nombreArchivoCsv(todos ? "todos" : rango.mes)}"`,
      ...SIN_CACHE,
    },
  });
}
