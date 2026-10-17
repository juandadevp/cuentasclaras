import Link from "next/link";
import { connection } from "next/server";
import { TablaGastos } from "@/components/panel/TablaGastos";
import { Tarjeta, TituloPagina } from "@/components/panel/TituloPagina";
import { categorias } from "@/config/site";
import { formatearMoneda } from "@/lib/format";
import { hoyIso, nombreDelMes, rangoDelMes } from "@/lib/gastos";
import { gastosFiltrados } from "@/lib/gastos-servidor";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { totalGastos } from "@/lib/utils";
import type { Gasto } from "@/types/gasto";

interface Props {
  mes?: string;
  q?: string;
  categoria?: string;
}

const boton =
  "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30";

/** Lista completa de gastos con buscador, filtro por categoría y navegación por mes. */
export async function Gastos({ mes: mesParam, q, categoria }: Props) {
  // Siempre dinámico: depende de la sesión y de la fecha de hoy.
  await connection();
  const hoy = hoyIso();
  const todos = mesParam === "todos";
  const rango = rangoDelMes(todos ? undefined : mesParam, hoy);
  const busqueda = (q ?? "").trim().slice(0, 80);
  const categoriaValida = categorias.some((c) => c.valor === categoria) ? categoria : undefined;

  let gastos: Gasto[] = [];
  let falloLaConsulta = false;
  if (supabaseConfigurado()) {
    const supabase = await crearClienteServidor();
    const r = await gastosFiltrados(supabase, todos ? "2000-01-01" : rango.inicio, todos ? "2100-01-01" : rango.fin, {
      q: busqueda || undefined,
      categoria: categoriaValida,
    });
    gastos = r.gastos;
    falloLaConsulta = Boolean(r.error);
  }

  const esMesActual = rango.mes === hoy.slice(0, 7);
  const parametros = (mes: string) => {
    const p = new URLSearchParams({ mes });
    if (busqueda) p.set("q", busqueda);
    if (categoriaValida) p.set("categoria", categoriaValida);
    return `/panel/gastos?${p.toString()}`;
  };
  const hayFiltros = Boolean(busqueda || categoriaValida);

  return (
    <div className="mx-auto max-w-7xl">
      <TituloPagina titulo="Mis gastos" subtitulo={todos ? "Todos tus gastos registrados." : `Gastos de ${nombreDelMes(rango.mes).toLowerCase()}.`}>
        {!todos && (
          <nav aria-label="Cambiar de mes" className="flex items-center gap-1 self-start rounded-xl border border-border bg-white p-1 sm:self-auto">
            <Link href={parametros(rango.anterior)} aria-label="Mes anterior" className="rounded-lg px-3 py-2 text-foreground transition-colors hover:bg-neutral-100">
              ←
            </Link>
            <span className="min-w-36 px-2 text-center text-sm font-bold text-foreground">{nombreDelMes(rango.mes)}</span>
            {esMesActual ? (
              <span aria-hidden className="rounded-lg px-3 py-2 text-neutral-300">
                →
              </span>
            ) : (
              <Link href={parametros(rango.siguiente)} aria-label="Mes siguiente" className="rounded-lg px-3 py-2 text-foreground transition-colors hover:bg-neutral-100">
                →
              </Link>
            )}
          </nav>
        )}
      </TituloPagina>

      {falloLaConsulta && (
        <p role="alert" className="mb-6 rounded-xl bg-amber-50 px-5 py-4 text-sm text-amber-900">
          No pudimos cargar tus gastos. Si es la primera vez, ejecuta la migración <strong>gastos</strong> en Supabase.
        </p>
      )}

      <Tarjeta className="mb-6">
        <form action="/panel/gastos" method="get" className="grid gap-3 md:grid-cols-[1fr_14rem_auto_auto_auto]">
          {todos && <input type="hidden" name="mes" value="todos" />}
          {!todos && <input type="hidden" name="mes" value={rango.mes} />}
          <label className="sr-only" htmlFor="q">
            Buscar por concepto
          </label>
          <input
            id="q"
            name="q"
            defaultValue={busqueda}
            placeholder="Buscar por concepto…"
            maxLength={80}
            className="rounded-xl border border-border bg-surface px-4 py-3 text-[15px] outline-none transition placeholder:text-neutral-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
          />
          <label className="sr-only" htmlFor="categoria">
            Categoría
          </label>
          <select
            id="categoria"
            name="categoria"
            defaultValue={categoriaValida ?? ""}
            className="rounded-xl border border-border bg-surface px-4 py-3 text-[15px] outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.valor} value={c.valor}>
                {c.etiqueta}
              </option>
            ))}
          </select>
          <button type="submit" className={`${boton} bg-brand-700 text-white`}>
            Buscar
          </button>
          <Link href="/panel/gastos?mes=todos" className={`${boton} bg-brand-500 text-white`}>
            Mostrar todo
          </Link>
          <Link href="/panel/registrar" className={`${boton} bg-accent text-amber-950`}>
            + Nuevo gasto
          </Link>
        </form>
        {hayFiltros && (
          <p className="mt-3 text-sm text-muted">
            Filtrando{busqueda && <> por “<strong className="text-foreground">{busqueda}</strong>”</>}
            {categoriaValida && <> en <strong className="text-foreground">{categorias.find((c) => c.valor === categoriaValida)?.etiqueta}</strong></>}.{" "}
            <Link href={todos ? "/panel/gastos?mes=todos" : `/panel/gastos?mes=${rango.mes}`} className="font-bold text-brand-700 hover:underline">
              Quitar filtros
            </Link>
          </p>
        )}
      </Tarjeta>

      <Tarjeta
        titulo={`${gastos.length} ${gastos.length === 1 ? "gasto" : "gastos"}`}
        acciones={<p className="text-sm text-muted">Total: <strong className="text-lg text-foreground">{formatearMoneda(totalGastos(gastos))}</strong></p>}
      >
        <TablaGastos gastos={gastos} vacio={hayFiltros ? "Ningún gasto coincide con tu búsqueda." : "Registra un gasto y aparecerá aquí."} />
      </Tarjeta>
    </div>
  );
}
