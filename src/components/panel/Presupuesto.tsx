import Link from "next/link";
import { connection } from "next/server";
import { AvisoPanel } from "@/components/panel/AvisoPanel";
import { BotonQuitarPresupuesto } from "@/components/panel/BotonQuitarPresupuesto";
import { FormularioPresupuesto } from "@/components/panel/FormularioPresupuesto";
import { Tarjeta } from "@/components/panel/Tarjeta";
import { TituloPagina } from "@/components/panel/TituloPagina";
import { formatearMoneda } from "@/lib/format";
import { coloresCategoria, etiquetaCategoria, hoyIso, nombreDelMes, rangoDelMes, totalPorCategoria } from "@/lib/gastos";
import { mensajeDeErrorGasto } from "@/lib/gastos-errores";
import { gastosEntre } from "@/lib/gastos-servidor";
import {
  MES_MINIMO,
  mesDePresupuesto,
  ordenarPorUso,
  progresoPresupuesto,
  resumirPresupuestos,
  ultimoMesPermitido,
  type EstadoPresupuesto,
  type Presupuesto as LimiteDelMes,
} from "@/lib/presupuestos";
import { mensajeDeErrorPresupuesto } from "@/lib/presupuestos-errores";
import { presupuestosDelMes } from "@/lib/presupuestos-servidor";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { esCategoria } from "@/lib/validaciones-gasto";
import type { Categoria } from "@/types/gasto";

interface Props {
  mes?: string;
  /** Categoría que se está editando (viene del botón «Editar»). */
  categoria?: string;
}

const estados: Record<EstadoPresupuesto, { texto: string; barra: string; etiqueta: string }> = {
  bien: { texto: "Vas bien", barra: "bg-brand-500", etiqueta: "bg-brand-100 text-brand-700" },
  cerca: { texto: "Cerca", barra: "bg-accent", etiqueta: "bg-accent/20 text-brand-800" },
  excedido: { texto: "Excedido", barra: "bg-rose-500", etiqueta: "bg-rose-50 text-rose-700" },
};

const botonSecundario =
  "rounded-lg px-3 py-1.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30";

function TarjetaLimite({ limite, gastado, mes }: { limite: LimiteDelMes; gastado: number; mes: string }) {
  const progreso = progresoPresupuesto(gastado, limite.monto);
  const estado = estados[progreso.estado];
  const etiqueta = etiquetaCategoria(limite.categoria);
  const ancho = Math.min(progreso.porcentaje, 100);

  return (
    <li className="min-w-0 rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex min-w-0 items-center gap-2 font-bold text-foreground">
          <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ backgroundColor: coloresCategoria[limite.categoria] }} />
          <span className="truncate">{etiqueta}</span>
        </p>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${estado.etiqueta}`}>{estado.texto}</span>
      </div>

      <p className="mt-3 text-sm text-muted">
        <strong className="text-xl font-extrabold text-foreground">{formatearMoneda(gastado)}</strong> de {formatearMoneda(limite.monto)} ·{" "}
        {progreso.porcentaje} %
      </p>

      <div
        role="progressbar"
        aria-label={`Gastado en ${etiqueta}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={ancho}
        aria-valuetext={`${progreso.porcentaje} % del límite. ${estado.texto}`}
        className="mt-2 h-3 overflow-hidden rounded-full bg-neutral-100"
      >
        <div className={`h-full rounded-full ${estado.barra}`} style={{ width: `${ancho}%` }} />
      </div>

      <p className="mt-2 text-sm text-muted">
        {progreso.restante >= 0 ? `Te quedan ${formatearMoneda(progreso.restante)}.` : `Te pasaste por ${formatearMoneda(-progreso.restante)}.`}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Link
          href={`/panel/presupuesto?mes=${mes}&categoria=${limite.categoria}`}
          className={`${botonSecundario} bg-brand-100 text-brand-700 hover:bg-brand-300/60`}
        >
          Editar
        </Link>
        <BotonQuitarPresupuesto id={limite.id} categoria={etiqueta} />
      </div>
    </li>
  );
}

/** Presupuestos del mes: límite por categoría frente a lo gastado. */
export async function Presupuesto({ mes: mesParam, categoria }: Props) {
  // Siempre dinámico: depende de la sesión y de la fecha de hoy.
  await connection();
  const hoy = hoyIso();
  const maximo = ultimoMesPermitido(hoy);
  const rango = rangoDelMes(mesDePresupuesto(mesParam, hoy), hoy);

  let limites: LimiteDelMes[] = [];
  let gastadoPorCategoria = new Map<Categoria, number>();
  const avisos: string[] = [];
  if (supabaseConfigurado()) {
    const supabase = await crearClienteServidor();
    const [p, g] = await Promise.all([presupuestosDelMes(supabase, rango.mes), gastosEntre(supabase, rango.inicio, rango.fin)]);
    limites = p.presupuestos;
    gastadoPorCategoria = new Map(totalPorCategoria(g.gastos).map((t) => [t.categoria, t.total]));
    if (p.error) avisos.push(mensajeDeErrorPresupuesto(p.error));
    if (g.error) avisos.push(mensajeDeErrorGasto(g.error));
  }

  const ordenados = ordenarPorUso(limites, gastadoPorCategoria);
  const resumen = resumirPresupuestos(limites, gastadoPorCategoria);
  const conLimite = new Set(limites.map((p) => p.categoria));
  const sinLimite = [...gastadoPorCategoria.entries()].filter(([c]) => !conLimite.has(c)).sort((a, b) => b[1] - a[1]);

  const elegida = esCategoria(categoria ?? "") ? categoria : undefined;
  const editado = elegida ? limites.find((p) => p.categoria === elegida) : undefined;
  const enlaceMes = (m: string) => `/panel/presupuesto?mes=${m}`;
  const esUltimoMes = rango.mes >= maximo;
  const esPrimerMes = rango.mes <= MES_MINIMO;
  const flecha = "rounded-lg px-3 py-2 text-foreground transition-colors hover:bg-neutral-100";
  const flechaInactiva = "rounded-lg px-3 py-2 text-neutral-300";

  return (
    <div className="mx-auto max-w-7xl">
      <TituloPagina titulo="Presupuesto" subtitulo={`Tus límites de ${nombreDelMes(rango.mes).toLowerCase()} frente a lo que llevas gastado.`}>
        <nav aria-label="Cambiar de mes" className="flex items-center gap-1 self-start rounded-xl border border-border bg-white p-1 sm:self-auto">
          {esPrimerMes ? (
            <span aria-hidden className={flechaInactiva}>
              ←
            </span>
          ) : (
            <Link href={enlaceMes(rango.anterior)} aria-label="Mes anterior" className={flecha}>
              ←
            </Link>
          )}
          <span className="min-w-36 px-2 text-center text-sm font-bold text-foreground">{nombreDelMes(rango.mes)}</span>
          {esUltimoMes ? (
            <span aria-hidden className={flechaInactiva}>
              →
            </span>
          ) : (
            <Link href={enlaceMes(rango.siguiente)} aria-label="Mes siguiente" className={flecha}>
              →
            </Link>
          )}
        </nav>
      </TituloPagina>

      {avisos.map((aviso) => (
        <AvisoPanel key={aviso}>{aviso}</AvisoPanel>
      ))}

      <Tarjeta titulo={editado ? `Editar el límite de ${etiquetaCategoria(editado.categoria)}` : "Fijar un límite"} className="mb-6">
        {/* La key reinicia el formulario al cambiar de mes o al pulsar «Editar». */}
        <FormularioPresupuesto
          key={`${rango.mes}-${elegida ?? "nuevo"}-${editado?.monto ?? 0}`}
          mes={rango.mes}
          hoy={hoy}
          categoriaInicial={elegida}
          montoInicial={editado?.monto}
        />
        {editado ? (
          <p className="mt-3 text-sm">
            <Link href={enlaceMes(rango.mes)} className="font-bold text-brand-700 hover:underline">
              Cancelar edición
            </Link>
          </p>
        ) : null}
        <p className="mt-3 text-xs text-muted">Si eliges una categoría que ya tiene límite este mes, se reemplaza por el nuevo valor.</p>
      </Tarjeta>

      {ordenados.length === 0 ? (
        <Tarjeta>
          <div className="px-4 py-10 text-center">
            <p className="font-semibold text-foreground">Aún no tienes límites en {nombreDelMes(rango.mes).toLowerCase()}</p>
            <p className="mt-1 text-sm text-muted">Elige una categoría y fija cuánto quieres gastar como máximo.</p>
          </div>
        </Tarjeta>
      ) : (
        <>
          <Tarjeta className="mb-6">
            <dl className="grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Presupuestado</dt>
                <dd className="text-2xl font-extrabold text-foreground">{formatearMoneda(resumen.presupuestado)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Gastado en esas categorías</dt>
                <dd className="text-2xl font-extrabold text-foreground">{formatearMoneda(resumen.gastado)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{resumen.restante >= 0 ? "Te queda" : "Te pasaste por"}</dt>
                <dd className={`text-2xl font-extrabold ${resumen.restante >= 0 ? "text-brand-700" : "text-rose-600"}`}>
                  {formatearMoneda(Math.abs(resumen.restante))}
                </dd>
              </div>
            </dl>
          </Tarjeta>

          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {ordenados.map((p) => (
              <TarjetaLimite key={p.id} limite={p} gastado={gastadoPorCategoria.get(p.categoria) ?? 0} mes={rango.mes} />
            ))}
          </ul>
        </>
      )}

      {sinLimite.length > 0 ? (
        <Tarjeta titulo="Categorías sin límite" className="mt-6">
          <ul className="divide-y divide-border">
            {sinLimite.map(([c, total]) => (
              <li key={c} className="flex items-center gap-3 py-3">
                <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ backgroundColor: coloresCategoria[c] }} />
                <p className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{etiquetaCategoria(c)}</p>
                <p className="shrink-0 text-sm font-bold text-foreground">{formatearMoneda(total)}</p>
                <Link
                  href={`/panel/presupuesto?mes=${rango.mes}&categoria=${c}`}
                  className={`${botonSecundario} shrink-0 bg-brand-100 text-brand-700 hover:bg-brand-300/60`}
                >
                  Fijar límite
                </Link>
              </li>
            ))}
          </ul>
        </Tarjeta>
      ) : null}
    </div>
  );
}
