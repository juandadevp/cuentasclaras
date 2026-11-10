import Link from "next/link";
import { connection } from "next/server";
import { AvisoPanel } from "@/components/panel/AvisoPanel";
import { Tarjeta } from "@/components/panel/Tarjeta";
import { TituloPagina } from "@/components/panel/TituloPagina";
import { ahorroContraPresupuesto, cambiosPorCategoria, categoriasQueBajaron, filasDeAhorro, type FilaAhorro } from "@/lib/ahorro";
import { formatearMoneda } from "@/lib/format";
import { coloresCategoria, etiquetaCategoria, hoyIso, nombreDelMes, rangoDelMes, totalesPorMes, ultimosMeses } from "@/lib/gastos";
import { mensajeDeErrorGasto } from "@/lib/gastos-errores";
import { gastosEntre } from "@/lib/gastos-servidor";
import type { Presupuesto } from "@/lib/presupuestos";
import { mensajeDeErrorPresupuesto } from "@/lib/presupuestos-errores";
import { presupuestosDelMes } from "@/lib/presupuestos-servidor";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Gasto } from "@/types/gasto";

const MESES_A_COMPARAR = 6;

function ResultadoDelMes({ ahorro }: { ahorro: FilaAhorro["ahorro"] }) {
  if (ahorro === null) return <span className="text-xs text-muted">Sin mes anterior para comparar</span>;
  if (ahorro > 0) return <span className="text-sm font-bold text-brand-700">▼ Ahorraste {formatearMoneda(ahorro)}</span>;
  if (ahorro < 0) return <span className="text-sm font-bold text-rose-600">▲ {formatearMoneda(-ahorro)} más</span>;
  return <span className="text-sm font-bold text-muted">= Igual que el mes anterior</span>;
}

/** Mi ahorro: cada mes frente al anterior, por categoría, y lo que sobró de los límites del presupuesto. */
export async function Ahorro() {
  // Siempre dinámico: depende de la sesión y de la fecha de hoy.
  await connection();
  const hoy = hoyIso();
  const rango = rangoDelMes(undefined, hoy);
  const meses = ultimosMeses(rango.mes, MESES_A_COMPARAR);

  let gastos: Gasto[] = [];
  let limites: Presupuesto[] = [];
  let recortado = false;
  const avisos: string[] = [];
  if (supabaseConfigurado()) {
    const supabase = await crearClienteServidor();
    const [g, p] = await Promise.all([gastosEntre(supabase, `${meses[0]}-01`, rango.fin), presupuestosDelMes(supabase, rango.mes)]);
    gastos = g.gastos;
    limites = p.presupuestos;
    recortado = g.recortado;
    if (g.error) avisos.push(mensajeDeErrorGasto(g.error));
    if (p.error) avisos.push(mensajeDeErrorPresupuesto(p.error));
  }

  // Todo sale de una sola consulta de gastos: se separan por mes aquí.
  const delMes = gastos.filter((g) => g.fecha.startsWith(rango.mes));
  const delAnterior = gastos.filter((g) => g.fecha.startsWith(rango.anterior));
  const filas = filasDeAhorro(totalesPorMes(gastos, meses), rango.mes).reverse();
  const cambios = cambiosPorCategoria(delMes, delAnterior);
  const bajaron = categoriasQueBajaron(cambios);
  const contraPresupuesto = ahorroContraPresupuesto(limites, delMes);

  return (
    <div className="mx-auto max-w-7xl">
      <TituloPagina titulo="Mi ahorro" subtitulo="Compara cada mes con el anterior y mira cuánto has ahorrado." />

      {avisos.map((aviso) => (
        <AvisoPanel key={aviso}>{aviso}</AvisoPanel>
      ))}
      {recortado ? (
        <AvisoPanel>Hay muchos gastos y solo contamos los 5.000 más recientes, así que algunos meses pueden salir incompletos.</AvisoPanel>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta titulo="Ahorro mes a mes">
          {filas.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="font-semibold text-foreground">Aún no hay gastos para comparar</p>
              <p className="mt-1 text-sm text-muted">Registra tus gastos y aquí verás si cada mes gastas más o menos que el anterior.</p>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-border">
                {filas.map((f) => (
                  <li key={f.mes} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 font-bold text-foreground">
                        {nombreDelMes(f.mes)}
                        {f.enCurso ? <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-700">en curso</span> : null}
                      </p>
                      <p className="text-sm text-muted">Gastaste {formatearMoneda(f.total)}</p>
                    </div>
                    <ResultadoDelMes ahorro={f.ahorro} />
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-muted">
                «Ahorro» es lo que gastaste de menos frente al mes anterior. El mes en curso todavía está incompleto.
              </p>
            </>
          )}
        </Tarjeta>

        <Tarjeta titulo="Categorías: este mes vs. el anterior">
          {cambios.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="font-semibold text-foreground">Sin gastos en {nombreDelMes(rango.mes).toLowerCase()} ni en el mes anterior</p>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-border">
                {cambios.map((c) => (
                  <li key={c.categoria} className="flex items-center gap-3 py-3">
                    <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ backgroundColor: coloresCategoria[c.categoria] }} />
                    <p className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{etiquetaCategoria(c.categoria)}</p>
                    <p className="shrink-0 text-sm text-muted">
                      <strong className="text-foreground">{formatearMoneda(c.actual)}</strong> · antes {formatearMoneda(c.anterior)}
                    </p>
                  </li>
                ))}
              </ul>
              {bajaron.length > 0 ? (
                <p className="mt-4 text-sm text-muted">
                  Vas gastando menos en{" "}
                  <strong className="text-foreground">{bajaron.map((c) => etiquetaCategoria(c.categoria).toLowerCase()).join(", ")}</strong>.
                </p>
              ) : null}
            </>
          )}
        </Tarjeta>
      </div>

      <Tarjeta
        titulo="Frente a tu presupuesto"
        className="mt-6"
        acciones={
          <Link href="/panel/presupuesto" className="text-sm font-bold text-brand-700 hover:underline">
            Ir a Presupuesto
          </Link>
        }
      >
        {limites.length === 0 ? (
          <p className="text-sm text-muted">
            Aún no tienes límites en {nombreDelMes(rango.mes).toLowerCase()}. Fíjalos en «Presupuesto» y aquí verás cuánto te sobra.
          </p>
        ) : (
          <>
            <dl className="grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Presupuestado</dt>
                <dd className="text-2xl font-extrabold text-foreground">{formatearMoneda(contraPresupuesto.presupuestado)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Gastado en esas categorías</dt>
                <dd className="text-2xl font-extrabold text-foreground">{formatearMoneda(contraPresupuesto.gastado)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {contraPresupuesto.restante >= 0 ? "Te sobra" : "Te pasaste por"}
                </dt>
                <dd className={`text-2xl font-extrabold ${contraPresupuesto.restante >= 0 ? "text-brand-700" : "text-rose-600"}`}>
                  {formatearMoneda(Math.abs(contraPresupuesto.restante))}
                </dd>
              </div>
            </dl>
            {contraPresupuesto.excedidas.length > 0 ? (
              <p className="mt-4 text-sm text-muted">
                Te pasaste en{" "}
                {contraPresupuesto.excedidas.map((e, i) => (
                  <span key={e.categoria}>
                    {i > 0 ? ", " : ""}
                    <strong className="text-foreground">{etiquetaCategoria(e.categoria).toLowerCase()}</strong> (por {formatearMoneda(e.exceso)})
                  </span>
                ))}
                .
              </p>
            ) : null}
          </>
        )}
      </Tarjeta>

      <p className="mt-6 text-xs text-muted">Mi ahorro compara tus gastos entre meses; no incluye tus ingresos.</p>
    </div>
  );
}
