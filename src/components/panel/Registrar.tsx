import Link from "next/link";
import { connection } from "next/server";
import { FormularioGasto } from "@/components/panel/FormularioGasto";
import { TablaGastos } from "@/components/panel/TablaGastos";
import { Tarjeta, TituloPagina } from "@/components/panel/TituloPagina";
import { formatearMoneda } from "@/lib/format";
import { etiquetaCategoria, hoyIso } from "@/lib/gastos";
import { rubros, type Rubro } from "@/lib/precios/rubros";
import { ultimosGastos } from "@/lib/gastos-servidor";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Gasto } from "@/types/gasto";

/** Datos de la compra que llega desde "Recomendar compras". */
export interface CompraRecomendada {
  producto: string;
  precio: number;
  tienda?: string;
  enlace?: string;
  imagen?: string;
  tipo?: Rubro;
}

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{etiqueta}</dt>
      <dd className="mt-1 font-semibold text-foreground">{children}</dd>
    </div>
  );
}

export async function Registrar({
  prellenado,
  compra,
}: {
  prellenado?: { descripcion?: string; monto?: string; categoria?: string; tienda?: string };
  compra?: CompraRecomendada;
}) {
  // Siempre dinámico: depende de la sesión y de la fecha de hoy.
  await connection();
  const hoy = hoyIso();
  let recientes: Gasto[] = [];
  let falloLaConsulta = false;

  if (supabaseConfigurado()) {
    const supabase = await crearClienteServidor();
    const r = await ultimosGastos(supabase, 5);
    recientes = r.gastos;
    falloLaConsulta = Boolean(r.error);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <TituloPagina titulo="Registrar gasto" subtitulo="Anota un gasto nuevo en segundos." />

      {falloLaConsulta && (
        <p role="alert" className="mb-6 rounded-xl bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Falta crear la tabla de gastos. Ejecuta la migración <strong>gastos</strong> en el SQL Editor de Supabase (carpeta{" "}
          <code>supabase/migrations</code>).
        </p>
      )}

      {compra && (
        <section className="mb-6 rounded-2xl border border-brand-300 bg-brand-100/50 p-6 shadow-sm" aria-label="Resumen de la compra">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-700">Revisa la compra antes de registrarla</p>
          <div className="mt-4 flex flex-col gap-5 sm:flex-row">
            {compra.imagen ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={compra.imagen} alt="" referrerPolicy="no-referrer" className="size-28 shrink-0 rounded-xl bg-white object-contain" />
            ) : (
              <span className="grid size-28 shrink-0 place-items-center rounded-xl bg-white text-neutral-400" aria-hidden>
                <svg viewBox="0 0 24 24" className="size-10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 7h15l-1.5 8h-12z" />
                  <path d="M6 7 5 3H2" />
                  <circle cx="9" cy="19" r="1.5" />
                  <circle cx="18" cy="19" r="1.5" />
                </svg>
              </span>
            )}
            <dl className="grid flex-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Producto</dt>
                <dd className="mt-1 text-lg font-bold text-foreground">{compra.producto}</dd>
              </div>
              <Dato etiqueta="Precio">{formatearMoneda(compra.precio)}</Dato>
              <Dato etiqueta="Tienda">{compra.tienda ?? "—"}</Dato>
              <Dato etiqueta="Tipo de producto">{compra.tipo ? rubros[compra.tipo].etiqueta : "Sin detectar"}</Dato>
              <Dato etiqueta="Categoría del gasto">
                {prellenado?.categoria ? (
                  <span className="rounded-full bg-brand-800 px-3 py-1 text-sm text-white">{etiquetaCategoria(prellenado.categoria)}</span>
                ) : (
                  "Elígela en el formulario"
                )}
              </Dato>
              <Dato etiqueta="Fecha">Hoy</Dato>
              {compra.enlace && (
                <Dato etiqueta="Oferta">
                  <a href={compra.enlace} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:underline">
                    Ver en la tienda ↗
                  </a>
                </Dato>
              )}
            </dl>
          </div>
          <p className="mt-4 text-sm text-brand-800/80">Todo se llenó solo en el formulario de abajo. Revisa los datos, cámbialos si hace falta y pulsa “Guardar gasto”.</p>
        </section>
      )}

      <Tarjeta titulo={compra ? "Confirma y registra el gasto" : "Nuevo gasto"}>
        <FormularioGasto hoy={hoy} valoresIniciales={prellenado} categoriaAutomatica={Boolean(compra?.tipo)} />
      </Tarjeta>

      <Tarjeta
        className="mt-6"
        titulo="Tus últimos gastos"
        acciones={
          <Link href="/panel/gastos" className="text-sm font-bold text-brand-700 hover:underline">
            Ver todos →
          </Link>
        }
      >
        <TablaGastos gastos={recientes} vacio="Todavía no has registrado gastos. El primero aparecerá aquí." />
      </Tarjeta>
    </div>
  );
}
