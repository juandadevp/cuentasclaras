import Link from "next/link";
import { connection } from "next/server";
import { AvisoPanel } from "@/components/panel/AvisoPanel";
import { BotonQuitarIngreso } from "@/components/panel/BotonQuitarIngreso";
import { FormularioIngreso } from "@/components/panel/FormularioIngreso";
import { Tarjeta } from "@/components/panel/Tarjeta";
import { TituloPagina } from "@/components/panel/TituloPagina";
import { formatearFecha, formatearMoneda } from "@/lib/format";
import { hoyIso, nombreDelMes, rangoDelMes } from "@/lib/gastos";
import { etiquetaTipoIngreso, resumirIngresos } from "@/lib/ingresos";
import { mensajeDeErrorIngreso } from "@/lib/ingresos-errores";
import { ingresosEntre } from "@/lib/ingresos-servidor";
import { MES_MINIMO } from "@/lib/presupuestos";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Ingreso } from "@/types/ingreso";

/** Mes (yyyy-mm) que se muestra: el pedido si es válido y no es futuro; si no, el mes actual. */
function mesDeIngresos(pedido: string | undefined, hoy: string): string {
  const actual = hoy.slice(0, 7);
  const valido = pedido !== undefined && /^\d{4}-(0[1-9]|1[0-2])$/.test(pedido) && pedido >= MES_MINIMO && pedido <= actual;
  return valido ? pedido : actual;
}

/** Ingresos de un mes: resumen, formulario para registrar y lista. */
export async function Ingresos({ mes: mesParam }: { mes?: string }) {
  // Siempre dinámico: depende de la sesión y de la fecha de hoy.
  await connection();
  const hoy = hoyIso();
  const rango = rangoDelMes(mesDeIngresos(mesParam, hoy), hoy);

  let ingresos: Ingreso[] = [];
  const avisos: string[] = [];
  if (supabaseConfigurado()) {
    const supabase = await crearClienteServidor();
    const r = await ingresosEntre(supabase, rango.inicio, rango.fin);
    ingresos = r.ingresos;
    if (r.error) avisos.push(mensajeDeErrorIngreso(r.error));
  }

  const resumen = resumirIngresos(ingresos);
  const enlaceMes = (m: string) => `/panel/ingresos?mes=${m}`;
  const esUltimoMes = rango.mes >= hoy.slice(0, 7);
  const esPrimerMes = rango.mes <= MES_MINIMO;
  const flecha = "rounded-lg px-3 py-2 text-foreground transition-colors hover:bg-neutral-100";
  const flechaInactiva = "rounded-lg px-3 py-2 text-neutral-300";

  return (
    <div className="mx-auto max-w-7xl">
      <TituloPagina titulo="Ingresos" subtitulo={`Lo que recibiste en ${nombreDelMes(rango.mes).toLowerCase()}.`}>
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

      <Tarjeta titulo="Registrar un ingreso" className="mb-6">
        <FormularioIngreso hoy={hoy} />
      </Tarjeta>

      {resumen.cantidad > 0 ? (
        <Tarjeta className="mb-6">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Total del mes</dt>
              <dd className="text-2xl font-extrabold text-brand-700">{formatearMoneda(resumen.total)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Ingresos registrados</dt>
              <dd className="text-2xl font-extrabold text-foreground">{resumen.cantidad}</dd>
            </div>
          </dl>
          <ul className="mt-4 flex flex-wrap gap-2">
            {resumen.porTipo.map((t) => (
              <li key={t.tipo} className="rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-800">
                {etiquetaTipoIngreso(t.tipo)}: {formatearMoneda(t.total)}
              </li>
            ))}
          </ul>
        </Tarjeta>
      ) : null}

      <Tarjeta titulo={`Ingresos de ${nombreDelMes(rango.mes).toLowerCase()}`}>
        {ingresos.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="font-semibold text-foreground">Aún no tienes ingresos en {nombreDelMes(rango.mes).toLowerCase()}</p>
            <p className="mt-1 text-sm text-muted">Registra tu salario o lo que recibas y verás tu ahorro real en «Mi ahorro».</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {ingresos.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">{i.descripcion}</p>
                  <p className="text-sm text-muted">
                    {formatearFecha(i.fecha)} · {etiquetaTipoIngreso(i.tipo)}
                  </p>
                </div>
                <p className="shrink-0 font-bold text-brand-700">{formatearMoneda(i.monto)}</p>
                <BotonQuitarIngreso id={i.id} descripcion={i.descripcion} />
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>
    </div>
  );
}
