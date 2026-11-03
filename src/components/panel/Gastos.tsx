import Link from "next/link";
import { connection } from "next/server";
import { AvisoPanel } from "@/components/panel/AvisoPanel";
import { GastosPorCategoria } from "@/components/panel/GastosPorCategoria";
import { Tarjeta } from "@/components/panel/Tarjeta";
import { TituloPagina } from "@/components/panel/TituloPagina";
import { Selector } from "@/components/ui/Selector";
import { categorias } from "@/config/site";
import { mensajeDeErrorGasto } from "@/lib/gastos-errores";
import { hoyIso, nombreDelMes, rangoDelMes, totalGastos, type FiltrosGastos } from "@/lib/gastos";
import { gastosFiltrados } from "@/lib/gastos-servidor";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Gasto } from "@/types/gasto";

const boton =
  "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30";
const claseCampo =
  "rounded-xl border border-border bg-surface px-4 py-3 text-[15px] outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15";

/** Lista completa de gastos con buscador, filtro por categoría y navegación por mes. */
export async function Gastos({ filtros }: { filtros: FiltrosGastos }) {
  // Siempre dinámico: depende de la sesión y de la fecha de hoy.
  await connection();
  const hoy = hoyIso();
  const { todos, q, categoria } = filtros;
  const rango = rangoDelMes(todos ? undefined : filtros.mes, hoy);

  let gastos: Gasto[] = [];
  let aviso: string | undefined;
  let recortado = false;
  if (supabaseConfigurado()) {
    const supabase = await crearClienteServidor();
    const r = await gastosFiltrados(supabase, todos ? "2000-01-01" : rango.inicio, todos ? "2100-01-01" : rango.fin, {
      q: q || undefined,
      categoria,
    });
    gastos = r.gastos;
    recortado = r.recortado;
    if (r.error) aviso = mensajeDeErrorGasto(r.error);
  }

  const esMesActual = rango.mes === hoy.slice(0, 7);
  const enlaceMes = (mes: string) => {
    const p = new URLSearchParams({ mes });
    if (q) p.set("q", q);
    if (categoria) p.set("categoria", categoria);
    return `/panel/gastos?${p.toString()}`;
  };
  const hayFiltros = Boolean(q || categoria);
  const etiquetaCategoria = categorias.find((c) => c.valor === categoria)?.etiqueta;

  return (
    <div className="mx-auto max-w-7xl">
      <TituloPagina titulo="Mis gastos" subtitulo={todos ? "Todos tus gastos registrados." : `Gastos de ${nombreDelMes(rango.mes).toLowerCase()}.`}>
        {todos ? null : (
          <nav aria-label="Cambiar de mes" className="flex items-center gap-1 self-start rounded-xl border border-border bg-white p-1 sm:self-auto">
            <Link href={enlaceMes(rango.anterior)} aria-label="Mes anterior" className="rounded-lg px-3 py-2 text-foreground transition-colors hover:bg-neutral-100">
              ←
            </Link>
            <span className="min-w-36 px-2 text-center text-sm font-bold text-foreground">{nombreDelMes(rango.mes)}</span>
            {esMesActual ? (
              <span aria-hidden className="rounded-lg px-3 py-2 text-neutral-300">
                →
              </span>
            ) : (
              <Link href={enlaceMes(rango.siguiente)} aria-label="Mes siguiente" className="rounded-lg px-3 py-2 text-foreground transition-colors hover:bg-neutral-100">
                →
              </Link>
            )}
          </nav>
        )}
      </TituloPagina>

      {aviso ? <AvisoPanel>{aviso}</AvisoPanel> : null}
      {recortado ? (
        <AvisoPanel>Hay muchos gastos y solo mostramos los 5.000 más recientes. Usa el buscador o elige un mes para ver el resto.</AvisoPanel>
      ) : null}

      <Tarjeta className="mb-6">
        <form action="/panel/gastos" method="get" className="grid gap-3 md:grid-cols-[1fr_14rem_auto_auto_auto]">
          <input type="hidden" name="mes" value={todos ? "todos" : rango.mes} />
          <div>
            <label className="sr-only" htmlFor="q">
              Buscar por concepto
            </label>
            <input id="q" name="q" defaultValue={q} placeholder="Buscar por concepto…" maxLength={80} className={`w-full placeholder:text-neutral-400 ${claseCampo}`} />
          </div>
          <Selector etiqueta="Categoría" etiquetaOculta name="categoria" defaultValue={categoria ?? ""} className="rounded-xl px-4">
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.valor} value={c.valor}>
                {c.etiqueta}
              </option>
            ))}
          </Selector>
          <button type="submit" className={`${boton} bg-brand-700 text-white`}>
            Buscar
          </button>
          <Link href="/panel/gastos?mes=todos" className={`${boton} bg-brand-500 text-white`}>
            Mostrar todo
          </Link>
          <Link href="/panel/registrar" className={`${boton} bg-accent text-brand-800`}>
            + Nuevo gasto
          </Link>
        </form>
        {hayFiltros ? (
          <p className="mt-3 text-sm text-muted">
            Filtrando
            {q ? (
              <>
                {" "}por “<strong className="text-foreground">{q}</strong>”
              </>
            ) : null}
            {etiquetaCategoria ? (
              <>
                {" "}en <strong className="text-foreground">{etiquetaCategoria}</strong>
              </>
            ) : null}
            .{" "}
            <Link href={todos ? "/panel/gastos?mes=todos" : `/panel/gastos?mes=${rango.mes}`} className="font-bold text-brand-700 hover:underline">
              Quitar filtros
            </Link>
          </p>
        ) : null}
      </Tarjeta>

      <GastosPorCategoria
        gastos={gastos}
        total={totalGastos(gastos)}
        vacio={hayFiltros ? "Ningún gasto coincide con tu búsqueda." : "Registra un gasto y aparecerá aquí."}
      />
    </div>
  );
}
