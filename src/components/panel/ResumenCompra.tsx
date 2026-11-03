import { formatearMoneda } from "@/lib/format";
import { etiquetaCategoria } from "@/lib/gastos";
import { dominioDe, type CompraRecomendada } from "@/lib/precios/compra";
import { rubros } from "@/lib/precios/rubros";
import type { ReactNode } from "react";

function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{etiqueta}</dt>
      <dd className="mt-1 font-semibold text-foreground">{children}</dd>
    </div>
  );
}

const iconoCarrito = (
  <svg viewBox="0 0 24 24" className="size-10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 7h15l-1.5 8h-12z" />
    <path d="M6 7 5 3H2" />
    <circle cx="9" cy="19" r="1.5" />
    <circle cx="18" cy="19" r="1.5" />
  </svg>
);

/** Resumen de la compra que llega desde «Recomendar compras», para revisarla antes de registrarla. */
export function ResumenCompra({ compra }: { compra: CompraRecomendada }) {
  const dominio = compra.enlace ? dominioDe(compra.enlace) : "";

  return (
    <section className="mb-6 rounded-2xl border border-brand-300 bg-brand-100/50 p-6 shadow-sm" aria-label="Resumen de la compra">
      <p className="text-sm font-bold uppercase tracking-widest text-brand-700">Resumen de la compra</p>
      <p className="mt-1 text-sm text-brand-800/80">Revisa la compra antes de registrarla.</p>
      <div className="mt-4 flex flex-col gap-5 sm:flex-row">
        {compra.imagen ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={compra.imagen} alt="" referrerPolicy="no-referrer" className="size-28 shrink-0 rounded-xl bg-white object-contain" />
        ) : (
          <span className="grid size-28 shrink-0 place-items-center rounded-xl bg-white text-neutral-400" aria-hidden>
            {iconoCarrito}
          </span>
        )}
        <dl className="grid min-w-0 flex-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Producto</dt>
            <dd className="mt-1 break-words text-lg font-bold text-foreground">{compra.producto}</dd>
          </div>
          <Dato etiqueta="Precio">{formatearMoneda(compra.precio)}</Dato>
          <Dato etiqueta="Tienda">{compra.tienda ?? "—"}</Dato>
          <Dato etiqueta="Tipo de producto">{compra.tipo ? rubros[compra.tipo].etiqueta : "Sin detectar"}</Dato>
          <Dato etiqueta="Categoría del gasto">
            {compra.categoria ? (
              <span className="rounded-full bg-brand-800 px-3 py-1 text-sm text-white">{etiquetaCategoria(compra.categoria)}</span>
            ) : (
              "Elígela en el formulario"
            )}
          </Dato>
          <Dato etiqueta="Fecha">Hoy</Dato>
          {compra.enlace ? (
            <Dato etiqueta="Oferta">
              <a href={compra.enlace} target="_blank" rel="noopener noreferrer" className="break-all text-brand-700 hover:underline">
                Ver en {dominio || "la tienda"} ↗
              </a>
            </Dato>
          ) : null}
        </dl>
      </div>
      <p className="mt-4 text-sm text-brand-800/80">
        Todo se llenó solo en el formulario de abajo. Revisa los datos, cámbialos si hace falta y pulsa “Guardar gasto”.
      </p>
    </section>
  );
}
