"use client";

import Link from "next/link";
import { useMemo, useState, useTransition, type FormEvent } from "react";
import { buscarPrecios } from "@/app/panel/recomendar/actions";
import { formatearMoneda } from "@/lib/format";
import { agruparProductos, type Producto } from "@/lib/precios/agrupar";
import { listaRubros, rubros, type Rubro } from "@/lib/precios/rubros";
import type { Oferta, ResultadoBusqueda } from "@/lib/precios/tipos";

const ejemplosGenerales = ["acetaminofén", "leche", "audífonos", "detergente", "taladro", "pañales"];

/** Convierte una oferta en un enlace al formulario de gastos con los datos ya llenos. */
function enlaceRegistrar(o: Oferta, rubro: Rubro | null | undefined) {
  const p = new URLSearchParams({ descripcion: o.titulo.slice(0, 80), monto: String(o.precio) });
  if (rubro) p.set("categoria", rubros[rubro].categoriaGasto);
  return `/panel/registrar?${p.toString()}`;
}

/** Búsqueda en Google Shopping de este producto en esa tienda: sirve cuando la oferta no trae un enlace directo. */
function enlaceBusqueda(o: Oferta, producto: string) {
  const p = new URLSearchParams({ tbm: "shop", q: `${producto} ${o.tienda}`, gl: "co", hl: "es" });
  return `https://www.google.com.co/search?${p.toString()}`;
}

function haceCuanto(iso: string) {
  const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  return s < 60 ? "hace unos segundos" : `hace ${Math.round(s / 60)} min`;
}

const chip = (activo: boolean) =>
  `rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${activo ? "bg-brand-800 text-white" : "bg-white text-foreground ring-1 ring-border hover:bg-neutral-50"}`;

function FilaTienda({ oferta, buscado, rubro, mejor, ajena }: { oferta: Oferta; buscado: string; rubro: Rubro | null | undefined; mejor: boolean; ajena: boolean }) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-foreground">
          {oferta.tienda}
          {ajena && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900">Otro tipo de tienda</span>}
        </p>
        {oferta.detalle && <p className="truncate text-xs text-muted">{oferta.detalle}</p>}
      </div>
      <p className={`shrink-0 text-base font-extrabold ${mejor ? "text-brand-700" : "text-foreground"}`}>{formatearMoneda(oferta.precio)}</p>
      <a
        href={oferta.enlace ?? enlaceBusqueda(oferta, buscado)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={oferta.enlace ? `Ver en ${oferta.tienda}` : `Buscar en ${oferta.tienda}`}
        title={oferta.enlace ? "Ver en tienda" : "Buscar en la tienda"}
        className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-800 text-brand-50 transition-colors hover:bg-brand-700"
      >
        <span aria-hidden>↗</span>
      </a>
      <Link
        href={enlaceRegistrar(oferta, rubro)}
        aria-label={`Registrar gasto de ${formatearMoneda(oferta.precio)}`}
        title="Registrar como gasto"
        className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent/25 text-base font-bold text-amber-900 transition-colors hover:bg-accent/50"
      >
        +
      </Link>
    </li>
  );
}

/** Un producto, con su precio "desde" y el precio en cada tienda. */
function TarjetaProducto({ producto, barata, buscado, rubro, marcarAjenas }: { producto: Producto; barata: Oferta | undefined; buscado: string; rubro: Rubro | null | undefined; marcarAjenas: boolean }) {
  const [primeras, otras] = [producto.ofertas.slice(0, 3), producto.ofertas.slice(3)];
  const esMejor = barata ? producto.ofertas.includes(barata) : false;
  const fila = (o: Oferta, i: number) => (
    <FilaTienda key={`${o.tienda}-${i}`} oferta={o} buscado={buscado} rubro={rubro} mejor={o.precio === producto.minimo} ajena={marcarAjenas && o.relevante === false} />
  );

  return (
    <li className={`flex flex-col rounded-2xl border bg-surface p-5 shadow-sm ${esMejor ? "border-brand-500 ring-2 ring-brand-500/20" : "border-border"}`}>
      <div className="flex items-start gap-4">
        {producto.imagen ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={producto.imagen} alt="" loading="lazy" referrerPolicy="no-referrer" className="size-20 shrink-0 rounded-lg bg-white object-contain" />
        ) : (
          <span className="grid size-20 shrink-0 place-items-center rounded-lg bg-neutral-100 text-neutral-400" aria-hidden>
            <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 7h15l-1.5 8h-12z" />
              <path d="M6 7 5 3H2" />
              <circle cx="9" cy="19" r="1.5" />
              <circle cx="18" cy="19" r="1.5" />
            </svg>
          </span>
        )}
        <div className="min-w-0">
          {esMejor && <span className="mb-1.5 inline-block rounded-full bg-brand-800 px-2.5 py-0.5 text-xs font-bold text-white">Mejor precio</span>}
          <p className="line-clamp-3 text-sm font-semibold text-foreground">{producto.titulo}</p>
        </div>
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">Desde</p>
      <p className="text-2xl font-extrabold tracking-tight text-foreground">
        {formatearMoneda(producto.minimo)}
        {producto.maximo > producto.minimo && <span className="ml-2 text-sm font-semibold text-muted">hasta {formatearMoneda(producto.maximo)}</span>}
      </p>
      <p className="text-xs text-muted">
        en {producto.ofertas.length} {producto.ofertas.length === 1 ? "tienda" : "tiendas"}
      </p>

      <ul className="mt-3 divide-y divide-border border-t border-border">{primeras.map(fila)}</ul>
      {otras.length > 0 && (
        <details className="group border-t border-border">
          <summary className="cursor-pointer list-none py-2.5 text-sm font-bold text-brand-700 hover:underline">
            <span className="group-open:hidden">Ver las otras {otras.length} {otras.length === 1 ? "tienda" : "tiendas"}</span>
            <span className="hidden group-open:inline">Ocultar</span>
          </summary>
          <ul className="divide-y divide-border">{otras.map((o, i) => fila(o, i + 3))}</ul>
        </details>
      )}
    </li>
  );
}

export function RecomendarCompras() {
  const [consulta, setConsulta] = useState("");
  const [rubro, setRubro] = useState<Rubro | "">("");
  const [resultado, setResultado] = useState<ResultadoBusqueda | null>(null);
  const [buscado, setBuscado] = useState("");
  const [tienda, setTienda] = useState<string | null>(null);
  const [verOtras, setVerOtras] = useState(false);
  const [orden, setOrden] = useState<"asc" | "desc">("asc");
  const [pendiente, iniciarTransicion] = useTransition();

  function buscar(texto: string, tipo: Rubro | "") {
    const limpio = texto.trim();
    if (!limpio) return;
    setTienda(null);
    setVerOtras(false);
    iniciarTransicion(async () => {
      const r = await buscarPrecios(limpio, tipo);
      setBuscado(limpio);
      setResultado(r);
    });
  }

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    buscar(consulta, rubro);
  }

  const detectado = resultado?.rubro ?? null;
  const todas = useMemo(() => resultado?.ofertas ?? [], [resultado]);
  const propias = useMemo(() => todas.filter((o) => o.relevante !== false), [todas]);
  const ajenas = todas.length - propias.length;
  const base = verOtras || !detectado ? todas : propias;

  const tiendas = useMemo(() => [...new Set(base.map((o) => o.tienda))], [base]);
  const productos = useMemo(() => {
    const ofertasVisibles = base.filter((o) => !tienda || o.tienda === tienda);
    const lista = agruparProductos(ofertasVisibles);
    return lista.sort((a, b) => (orden === "asc" ? a.minimo - b.minimo : b.minimo - a.minimo));
  }, [base, tienda, orden]);
  const barata = useMemo(() => base.reduce<Oferta | undefined>((m, o) => (!m || o.precio < m.precio ? o : m), undefined), [base]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <form onSubmit={enviar} className="grid gap-3 md:grid-cols-[1fr_16rem_auto]">
          <div className="relative">
            <label htmlFor="producto" className="sr-only">
              Producto a buscar
            </label>
            <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              id="producto"
              value={consulta}
              onChange={(e) => setConsulta(e.target.value)}
              maxLength={80}
              placeholder="¿Qué quieres comprar? Ej. acetaminofén 500 mg"
              className="w-full rounded-xl border border-border bg-surface py-3.5 pl-12 pr-4 text-[15px] outline-none transition placeholder:text-neutral-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
            />
          </div>
          <div>
            <label htmlFor="rubro" className="sr-only">
              Tipo de producto
            </label>
            <select
              id="rubro"
              value={rubro}
              onChange={(e) => setRubro(e.target.value as Rubro | "")}
              className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-[15px] outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
            >
              <option value="">Detectar tipo solo</option>
              {listaRubros.map((r) => (
                <option key={r} value={r}>
                  {rubros[r].etiqueta}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={pendiente || consulta.trim().length < 2}
            className="rounded-xl bg-brand-800 px-6 py-3.5 text-[15px] font-bold text-brand-50 transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pendiente ? "Buscando…" : "Buscar precios"}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">Prueba con:</span>
          {(rubro ? rubros[rubro].ejemplos : ejemplosGenerales).map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => {
                setConsulta(e);
                buscar(e, rubro);
              }}
              className="rounded-full bg-brand-100 px-3 py-1 font-semibold text-brand-700 transition-colors hover:bg-brand-300/60"
            >
              {e}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">
          Detectamos el tipo de producto y te mostramos solo las tiendas donde se vende: farmacias para medicamentos, supermercados para alimentos, tiendas de tecnología para electrónicos…
        </p>
      </section>

      <div aria-live="polite">
        {pendiente && (
          <div className="rounded-2xl border border-border bg-surface p-10 text-center shadow-sm">
            <div className="mx-auto size-9 animate-spin rounded-full border-4 border-brand-100 border-t-brand-700" aria-hidden />
            <p className="mt-4 font-semibold text-foreground">Consultando precios en las tiendas…</p>
          </div>
        )}

        {!pendiente && resultado && !resultado.ok && (
          <p role="alert" className="rounded-xl bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {resultado.mensaje}
          </p>
        )}

        {!pendiente && resultado?.ok && (
          <div className="space-y-5">
            {resultado.modo === "demo" && (
              <p className="rounded-xl bg-amber-50 px-5 py-4 text-sm text-amber-900">
                <strong>Modo demostración:</strong> estos precios son de <strong>ejemplo</strong>, no son reales. Para ver precios reales
                configura <code>SERPAPI_API_KEY</code> en <code>.env.local</code> (ver el README).
              </p>
            )}

            {detectado ? (
              <div className="rounded-xl border border-brand-300 bg-brand-100/60 px-5 py-4 text-sm text-brand-800">
                <p>
                  {resultado.automatico ? "Detectamos que " : "Buscando como "}
                  <strong>“{buscado}”</strong>
                  {resultado.automatico ? " es de tipo " : " de tipo "}
                  <strong>{rubros[detectado].etiqueta}</strong>.{" "}
                  {verOtras ? "Mostrando todas las tiendas." : <>Solo mostramos tiendas donde se vende: {resultado.tiendasDelTipo?.join(", ")}.</>}
                </p>
                {ajenas > 0 && (
                  <button type="button" onClick={() => { setVerOtras((v) => !v); setTienda(null); }} className="mt-2 font-bold underline underline-offset-2 hover:text-brand-700">
                    {verOtras ? "Volver a solo las tiendas del tipo" : `Ver también otras tiendas (${ajenas})`}
                  </button>
                )}
              </div>
            ) : (
              <p className="rounded-xl bg-neutral-100 px-5 py-4 text-sm text-foreground">
                No reconocimos qué tipo de producto es “<strong>{buscado}</strong>”, así que mostramos todas las tiendas. Para afinar la búsqueda, elige el tipo en la lista de arriba.
              </p>
            )}

            {propias.length === 0 && detectado && !verOtras && ajenas > 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-10 text-center">
                <p className="font-semibold text-foreground">No encontramos “{buscado}” en {rubros[detectado].etiqueta.toLowerCase()}</p>
                <p className="mt-1 text-sm text-muted">Hay {ajenas} {ajenas === 1 ? "oferta" : "ofertas"} en otras tiendas. Usa “Ver también otras tiendas” para verlas.</p>
              </div>
            ) : todas.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center">
                <p className="font-semibold text-foreground">No encontramos “{buscado}”</p>
                <p className="mt-1 text-sm text-muted">Prueba con otro nombre o una palabra más general.</p>
              </div>
            ) : (
              <>
                {barata && (
                  <div className="flex flex-col gap-2 rounded-2xl bg-menta px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-brand-800">
                      El precio más bajo para “{buscado}” es{" "}
                      <strong className="text-2xl font-extrabold text-foreground">{formatearMoneda(barata.precio)}</strong> en{" "}
                      <strong>{barata.tienda}</strong>
                      <span className="text-brand-800/80"> ({barata.titulo})</span>.
                    </p>
                    <p className="text-sm text-brand-800/75">
                      {productos.length} {productos.length === 1 ? "producto" : "productos"} · {tiendas.length} {tiendas.length === 1 ? "tienda" : "tiendas"} · actualizado {haceCuanto(resultado.actualizado)}
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por tienda">
                    <button type="button" onClick={() => setTienda(null)} aria-pressed={tienda === null} className={chip(tienda === null)}>
                      Todas
                    </button>
                    {tiendas.map((t) => (
                      <button key={t} type="button" onClick={() => setTienda(t === tienda ? null : t)} aria-pressed={tienda === t} className={chip(tienda === t)}>
                        {t}
                      </button>
                    ))}
                  </div>
                  <label className="flex items-center gap-2 text-sm text-muted">
                    Ordenar:
                    <select
                      value={orden}
                      onChange={(e) => setOrden(e.target.value as "asc" | "desc")}
                      className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold text-foreground outline-none focus:border-brand-500"
                    >
                      <option value="asc">Menor precio</option>
                      <option value="desc">Mayor precio</option>
                    </select>
                  </label>
                </div>

                <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {productos.map((p) => (
                    <TarjetaProducto
                      key={p.clave}
                      producto={p}
                      barata={barata}
                      buscado={buscado}
                      rubro={detectado}
                      marcarAjenas={Boolean(detectado)}
                    />
                  ))}
                </ul>

                <p className="text-xs text-muted">
                  Los precios vienen de los buscadores de compras y pueden cambiar o variar según tu ciudad. Confírmalos en la tienda antes de comprar.
                </p>
              </>
            )}
          </div>
        )}

        {!pendiente && !resultado && (
          <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center">
            <p className="font-semibold text-foreground">Escribe un producto y compara precios entre tiendas</p>
            <p className="mt-1 text-sm text-muted">Por ejemplo “acetaminofén” te mostrará farmacias; “audífonos”, tiendas de tecnología.</p>
          </div>
        )}
      </div>
    </div>
  );
}
