import Link from "next/link";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { BarrasMeses } from "@/components/panel/BarrasMeses";
import { DonaCategorias } from "@/components/panel/DonaCategorias";
import { Tarjeta } from "@/components/panel/Tarjeta";
import { TituloPagina } from "@/components/panel/TituloPagina";
import { formatearMoneda } from "@/lib/format";
import { etiquetaCategoria, hoyIso, nombreDelMes, resumirInicio } from "@/lib/gastos";
import { obtenerUsuario } from "@/lib/supabase/usuario";
import type { Gasto } from "@/types/gasto";

function Dato({ etiqueta, valor, detalle }: { etiqueta: string; valor: string; detalle?: ReactNode }) {
  return (
    <div className="min-w-0 rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <p className="text-sm font-semibold text-muted">{etiqueta}</p>
      <p className="mt-2 truncate text-3xl font-extrabold tracking-tight text-foreground">{valor}</p>
      {detalle ? <div className="mt-2 text-sm text-muted">{detalle}</div> : null}
    </div>
  );
}

const botonBase =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-[15px] font-bold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30";

// Hasta que exista el módulo de gastos no hay de dónde leerlos: el inicio funciona vacío.
const gastos: Gasto[] = [];

/** Pantalla de inicio del panel: saludo, accesos rápidos, resumen del mes y gráficos. */
export async function Inicio() {
  // La fecha de hoy y la sesión cambian en cada petición: nada de esto puede prerenderizarse.
  await connection();
  const usuario = await obtenerUsuario();
  const resumen = resumirInicio(gastos, hoyIso());
  const { mayor, variacion } = resumen;

  return (
    <div className="mx-auto max-w-7xl">
      <TituloPagina
        titulo={`Hola, ${(usuario?.nombre ?? "").split(" ")[0]}`}
        subtitulo={`Así van tus cuentas en ${nombreDelMes(resumen.mes).toLowerCase()}.`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/panel/gastos" className={`${botonBase} bg-brand-700 text-white`}>
          Buscar gastos
        </Link>
        <Link href="/panel/gastos?mes=todos" className={`${botonBase} bg-brand-500 text-white`}>
          Mostrar todo
        </Link>
        <Link href="/panel/registrar" className={`${botonBase} bg-accent text-brand-800`}>
          + Nuevo gasto
        </Link>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <Dato
          etiqueta="Total del mes"
          valor={formatearMoneda(resumen.total)}
          detalle={
            variacion === null ? (
              "Sin datos del mes anterior"
            ) : (
              <span className="font-semibold text-foreground">
                {variacion > 0 ? "▲" : variacion < 0 ? "▼" : "="} {Math.abs(variacion)}% vs. mes anterior
              </span>
            )
          }
        />
        <Dato
          etiqueta="Gastos registrados"
          valor={String(resumen.cantidad)}
          detalle={resumen.cantidad === 1 ? "movimiento este mes" : "movimientos este mes"}
        />
        <Dato
          etiqueta="Donde más gastas"
          valor={mayor ? etiquetaCategoria(mayor.categoria) : "—"}
          detalle={mayor ? `${formatearMoneda(mayor.total)} este mes` : "Aún no hay datos"}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Tarjeta titulo="Gastos por categoría">
          <DonaCategorias datos={resumen.porCategoria} total={resumen.total} />
        </Tarjeta>
        <Tarjeta titulo="Últimos 6 meses">
          <BarrasMeses meses={resumen.meses} actual={resumen.mes} />
        </Tarjeta>
      </div>
    </div>
  );
}
