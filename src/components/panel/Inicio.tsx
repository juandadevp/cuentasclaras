import Link from "next/link";
import { BarrasMeses } from "@/components/panel/BarrasMeses";
import { DonaCategorias } from "@/components/panel/DonaCategorias";
import { TablaGastos } from "@/components/panel/TablaGastos";
import { Tarjeta, TituloPagina } from "@/components/panel/TituloPagina";
import { formatearMoneda } from "@/lib/format";
import { etiquetaCategoria, hoyIso, nombreDelMes, rangoDelMes, totalPorCategoria, variacion } from "@/lib/gastos";
import { gastosEntre, totalesPorMes, ultimosGastos } from "@/lib/gastos-servidor";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { obtenerUsuario } from "@/lib/supabase/usuario";
import { totalGastos } from "@/lib/utils";
import type { Gasto } from "@/types/gasto";

function Dato({ etiqueta, valor, detalle }: { etiqueta: string; valor: string; detalle?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <p className="text-sm font-semibold text-muted">{etiqueta}</p>
      <p className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">{valor}</p>
      {detalle && <div className="mt-2 text-sm text-muted">{detalle}</div>}
    </div>
  );
}

const botonBase =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-[15px] font-bold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30";

/** Pantalla de inicio de cada usuario: accesos rápidos, gráficos del mes y últimos gastos. */
export async function Inicio() {
  const usuario = await obtenerUsuario();
  const hoy = hoyIso();
  const { mes, inicio, fin } = rangoDelMes(undefined, hoy);

  let delMes: Gasto[] = [];
  let recientes: Gasto[] = [];
  let meses: { mes: string; total: number }[] = [];
  let falloLaConsulta = false;

  if (supabaseConfigurado()) {
    const supabase = await crearClienteServidor();
    const [m, r, t] = await Promise.all([
      gastosEntre(supabase, inicio, fin),
      ultimosGastos(supabase, 8),
      totalesPorMes(supabase, mes, 6),
    ]);
    delMes = m.gastos;
    recientes = r.gastos;
    meses = t.meses;
    falloLaConsulta = Boolean(m.error);
  }

  const total = totalGastos(delMes);
  const porCategoria = totalPorCategoria(delMes);
  const mayor = porCategoria[0];
  const anterior = meses.length >= 2 ? meses[meses.length - 2].total : 0;
  const cambio = variacion(total, anterior);

  return (
    <div className="mx-auto max-w-7xl">
      <TituloPagina titulo={`Hola, ${(usuario?.nombre ?? "").split(" ")[0]}`} subtitulo={`Así van tus cuentas en ${nombreDelMes(mes).toLowerCase()}.`} />

      {falloLaConsulta && (
        <p role="alert" className="mb-6 rounded-xl bg-amber-50 px-5 py-4 text-sm text-amber-900">
          No pudimos cargar tus gastos. Si es la primera vez, ejecuta la migración <strong>gastos</strong> en el SQL Editor de Supabase
          (carpeta <code>supabase/migrations</code>).
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/panel/gastos" className={`${botonBase} bg-brand-700 text-white`}>
          Buscar gastos
        </Link>
        <Link href="/panel/gastos?mes=todos" className={`${botonBase} bg-brand-500 text-white`}>
          Mostrar todo
        </Link>
        <Link href="/panel/registrar" className={`${botonBase} bg-accent text-amber-950`}>
          + Nuevo gasto
        </Link>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
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
        <Dato etiqueta="Gastos registrados" valor={String(delMes.length)} detalle={delMes.length === 1 ? "movimiento este mes" : "movimientos este mes"} />
        <Dato
          etiqueta="Donde más gastas"
          valor={mayor ? etiquetaCategoria(mayor.categoria) : "—"}
          detalle={mayor ? `${formatearMoneda(mayor.total)} este mes` : "Aún no hay datos"}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Tarjeta titulo="Gastos por categoría">
          <DonaCategorias datos={porCategoria} total={total} />
        </Tarjeta>
        <Tarjeta titulo="Últimos 6 meses">
          <BarrasMeses meses={meses.length ? meses : [{ mes, total: 0 }]} actual={mes} />
        </Tarjeta>
      </div>

      <Tarjeta
        className="mt-6"
        titulo="Últimos gastos"
        acciones={
          <Link href="/panel/gastos" className="text-sm font-bold text-brand-700 hover:underline">
            Ver todos →
          </Link>
        }
      >
        <TablaGastos gastos={recientes} vacio="Registra tu primer gasto con el botón “Nuevo gasto”." />
      </Tarjeta>
    </div>
  );
}
