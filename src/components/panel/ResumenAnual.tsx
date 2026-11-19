import Link from "next/link";
import { connection } from "next/server";
import { AvisoPanel } from "@/components/panel/AvisoPanel";
import { DonaCategorias } from "@/components/panel/DonaCategorias";
import { Tarjeta } from "@/components/panel/Tarjeta";
import { TituloPagina } from "@/components/panel/TituloPagina";
import { formatearMoneda } from "@/lib/format";
import { coloresCategoria, etiquetaCategoria, hoyIso, mesCorto, nombreDelMes } from "@/lib/gastos";
import { mensajeDeErrorGasto } from "@/lib/gastos-errores";
import { gastosEntre } from "@/lib/gastos-servidor";
import { ANIO_MINIMO, anioDeResumen, resumirAnio } from "@/lib/resumen-anual";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Gasto } from "@/types/gasto";

interface Props {
  anio?: string;
}

/** Resumen de un año de gastos: cifras clave, total por mes y desglose por categoría. */
export async function ResumenAnual({ anio: anioParam }: Props) {
  // Siempre dinámico: depende de la sesión y de la fecha de hoy.
  await connection();
  const hoy = hoyIso();
  const anio = anioDeResumen(anioParam, hoy);
  const anioActual = Number(hoy.slice(0, 4));

  let gastos: Gasto[] = [];
  let recortado = false;
  const avisos: string[] = [];
  if (supabaseConfigurado()) {
    const supabase = await crearClienteServidor();
    // El fin de `gastosEntre` no se incluye: se pide hasta el 1 de enero siguiente.
    const r = await gastosEntre(supabase, `${anio}-01-01`, `${anio + 1}-01-01`);
    gastos = r.gastos;
    recortado = r.recortado;
    if (r.error) avisos.push(mensajeDeErrorGasto(r.error));
  }

  const resumen = resumirAnio(gastos, anio);
  const maximoMes = Math.max(...resumen.meses.map((m) => m.total));
  const enlaceAnio = (a: number) => `/panel/resumen-anual?anio=${a}`;
  const flecha = "rounded-lg px-3 py-2 text-foreground transition-colors hover:bg-neutral-100";
  const flechaInactiva = "rounded-lg px-3 py-2 text-neutral-300";

  return (
    <div className="mx-auto max-w-7xl">
      <TituloPagina titulo="Resumen anual" subtitulo={`Cómo se movieron tus gastos durante ${anio}.`}>
        <nav aria-label="Cambiar de año" className="flex items-center gap-1 self-start rounded-xl border border-border bg-white p-1 sm:self-auto">
          {anio <= ANIO_MINIMO ? (
            <span aria-hidden className={flechaInactiva}>
              ←
            </span>
          ) : (
            <Link href={enlaceAnio(anio - 1)} aria-label="Año anterior" className={flecha}>
              ←
            </Link>
          )}
          <span className="min-w-20 px-2 text-center text-sm font-bold text-foreground">{anio}</span>
          {anio >= anioActual ? (
            <span aria-hidden className={flechaInactiva}>
              →
            </span>
          ) : (
            <Link href={enlaceAnio(anio + 1)} aria-label="Año siguiente" className={flecha}>
              →
            </Link>
          )}
        </nav>
      </TituloPagina>

      {avisos.map((aviso) => (
        <AvisoPanel key={aviso}>{aviso}</AvisoPanel>
      ))}
      {recortado ? (
        <AvisoPanel>Tienes 5.000 o más gastos en {anio}: este resumen está incompleto.</AvisoPanel>
      ) : null}

      {avisos.length > 0 ? null : resumen.cantidad === 0 ? (
        <Tarjeta>
          <div className="px-4 py-10 text-center">
            <p className="font-semibold text-foreground">No tienes gastos en {anio}</p>
            <p className="mt-1 text-sm text-muted">Cuando registres gastos de este año, aquí verás el resumen mes a mes.</p>
          </div>
        </Tarjeta>
      ) : (
        <>
          <Tarjeta className="mb-6">
            <dl className="grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Total del año</dt>
                <dd className="text-2xl font-extrabold text-foreground">{formatearMoneda(resumen.total)}</dd>
                <dd className="text-sm text-muted">{resumen.cantidad} gastos</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Promedio mensual</dt>
                <dd className="text-2xl font-extrabold text-foreground">{formatearMoneda(resumen.promedioMensual)}</dd>
                <dd className="text-sm text-muted">El total dividido entre 12 meses.</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Mes de mayor gasto</dt>
                <dd className="text-2xl font-extrabold text-foreground">{resumen.mesMayor ? nombreDelMes(resumen.mesMayor) : "—"}</dd>
                {resumen.mesMayor ? (
                  <dd className="text-sm text-muted">{formatearMoneda(maximoMes)}</dd>
                ) : null}
              </div>
            </dl>
          </Tarjeta>

          <div className="grid gap-6 lg:grid-cols-2">
            <Tarjeta titulo="Gasto por mes">
              <ul className="space-y-3">
                {resumen.meses.map((m) => (
                  <li key={m.mes}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="font-semibold text-foreground">
                        <span aria-hidden>{mesCorto(m.mes)}</span>
                        <span className="sr-only">{nombreDelMes(m.mes)}</span>
                      </span>
                      <span className="font-bold text-foreground">{formatearMoneda(m.total)}</span>
                    </div>
                    <div aria-hidden className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{ width: maximoMes > 0 ? `${Math.round((m.total / maximoMes) * 100)}%` : "0%" }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </Tarjeta>

            <Tarjeta titulo="Gasto por categoría">
              <DonaCategorias datos={resumen.categorias.map((c) => ({ categoria: c.categoria, total: c.total }))} total={resumen.total} />
              <ul className="mt-6 divide-y divide-border">
                {resumen.categorias.map((c) => (
                  <li key={c.categoria} className="flex items-center gap-3 py-2.5 text-sm">
                    <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ backgroundColor: coloresCategoria[c.categoria] }} />
                    <span className="min-w-0 flex-1 truncate font-semibold text-foreground">{etiquetaCategoria(c.categoria)}</span>
                    <span className="text-muted">{formatearMoneda(c.total)}</span>
                    <span className="w-12 text-right font-bold text-foreground">{c.porcentaje} %</span>
                  </li>
                ))}
              </ul>
            </Tarjeta>
          </div>
        </>
      )}
    </div>
  );
}
