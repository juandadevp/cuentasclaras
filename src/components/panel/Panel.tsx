import Link from "next/link";
import { redirect } from "next/navigation";
import { FormularioGasto } from "@/components/panel/FormularioGasto";
import { GastosPorCategoria } from "@/components/panel/GastosPorCategoria";
import { ListaGastos } from "@/components/panel/ListaGastos";
import { formatearMoneda } from "@/lib/format";
import { etiquetaCategoria, hoyIso, nombreDelMes, rangoDelMes, totalPorCategoria, variacion } from "@/lib/gastos";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { obtenerUsuario } from "@/lib/supabase/usuario";
import { totalGastos } from "@/lib/utils";
import type { Categoria, Gasto } from "@/types/gasto";

interface FilaGasto {
  id: string;
  descripcion: string;
  monto: number | string;
  categoria: Categoria;
  fecha: string;
}

function Tarjeta({ titulo, children, className = "" }: { titulo: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-border bg-surface p-6 shadow-sm ${className}`}>
      <h2 className="text-lg font-bold text-foreground">{titulo}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Dato({ etiqueta, valor, detalle }: { etiqueta: string; valor: string; detalle?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <p className="text-sm font-semibold text-muted">{etiqueta}</p>
      <p className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">{valor}</p>
      {detalle && <div className="mt-2 text-sm text-muted">{detalle}</div>}
    </div>
  );
}

export async function Panel({ mesParam }: { mesParam?: string }) {
  const usuario = await obtenerUsuario();
  if (!usuario) redirect("/login");

  const hoy = hoyIso();
  const { mes, inicio, fin, anterior, siguiente } = rangoDelMes(mesParam, hoy);
  const esMesActual = mes === hoy.slice(0, 7);
  const { inicio: inicioAnterior, fin: finAnterior } = rangoDelMes(anterior, hoy);

  let gastos: Gasto[] = [];
  let totalAnterior = 0;
  let falloLaConsulta = false;

  if (supabaseConfigurado()) {
    const supabase = await crearClienteServidor();
    const [actual, previo] = await Promise.all([
      supabase
        .from("gastos")
        .select("id, descripcion, monto, categoria, fecha")
        .gte("fecha", inicio)
        .lt("fecha", fin)
        .order("fecha", { ascending: false })
        .order("creado_en", { ascending: false }),
      supabase.from("gastos").select("monto").gte("fecha", inicioAnterior).lt("fecha", finAnterior),
    ]);
    if (actual.error) falloLaConsulta = true;
    gastos = ((actual.data ?? []) as FilaGasto[]).map((g) => ({ ...g, monto: Number(g.monto) }));
    totalAnterior = (previo.data ?? []).reduce((acc, g) => acc + Number(g.monto), 0);
  }

  const total = totalGastos(gastos);
  const porCategoria = totalPorCategoria(gastos);
  const mayor = porCategoria[0];
  const cambio = variacion(total, totalAnterior);
  const primerNombre = usuario.nombre.split(" ")[0];

  return (
    <div className="bg-neutral-50">
      <section className="bg-menta">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-end sm:justify-between lg:px-20">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-brand-700">Tu panel</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Hola, {primerNombre}</h1>
            <p className="mt-1 text-brand-800/75">Así van tus cuentas en {nombreDelMes(mes).toLowerCase()}.</p>
          </div>

          <nav aria-label="Cambiar de mes" className="flex items-center gap-1 self-start rounded-xl bg-white/70 p-1 sm:self-auto">
            <Link href={`/panel?mes=${anterior}`} aria-label="Mes anterior" className="rounded-lg px-3 py-2 text-foreground transition-colors hover:bg-white">
              ←
            </Link>
            <span className="min-w-36 px-2 text-center text-sm font-bold text-foreground">{nombreDelMes(mes)}</span>
            {esMesActual ? (
              <span aria-hidden className="rounded-lg px-3 py-2 text-neutral-300">
                →
              </span>
            ) : (
              <Link href={`/panel?mes=${siguiente}`} aria-label="Mes siguiente" className="rounded-lg px-3 py-2 text-foreground transition-colors hover:bg-white">
                →
              </Link>
            )}
          </nav>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-6 px-6 py-8 lg:px-20">
        {falloLaConsulta && (
          <p role="alert" className="rounded-xl bg-amber-50 px-5 py-4 text-sm text-amber-900">
            No pudimos cargar tus gastos. Si es la primera vez, ejecuta la migración <strong>gastos</strong> en el SQL Editor de
            Supabase (carpeta <code>supabase/migrations</code>).
          </p>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <Dato
            etiqueta="Total del mes"
            valor={formatearMoneda(total)}
            detalle={
              cambio === null ? (
                "Sin datos del mes anterior"
              ) : (
                <span className={cambio > 0 ? "font-semibold text-rose-600" : "font-semibold text-brand-700"}>
                  {cambio > 0 ? "▲" : "▼"} {Math.abs(cambio)}% vs. mes anterior
                </span>
              )
            }
          />
          <Dato etiqueta="Gastos registrados" valor={String(gastos.length)} detalle={gastos.length === 1 ? "movimiento este mes" : "movimientos este mes"} />
          <Dato
            etiqueta="Donde más gastas"
            valor={mayor ? etiquetaCategoria(mayor.categoria) : "—"}
            detalle={mayor ? `${formatearMoneda(mayor.total)} este mes` : "Aún no hay datos"}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
          <Tarjeta titulo="Agregar gasto">
            <FormularioGasto hoy={hoy} />
          </Tarjeta>
          <Tarjeta titulo="Gastos por categoría">
            <GastosPorCategoria datos={porCategoria} total={total} />
          </Tarjeta>
        </div>

        <Tarjeta titulo={`Gastos de ${nombreDelMes(mes).toLowerCase()}`}>
          <ListaGastos gastos={gastos} />
        </Tarjeta>
      </div>
    </div>
  );
}
