"use client";

import Link from "next/link";
import { useMemo, useState, useTransition, type FormEvent } from "react";
import { buscarPrecios } from "@/app/panel/recomendar/actions";
import { categorias } from "@/config/site";
import { formatearMoneda } from "@/lib/format";
import { franquiciasPorCategoria } from "@/lib/precios/franquicias";
import type { Oferta, ResultadoBusqueda } from "@/lib/precios/tipos";
import type { Categoria } from "@/types/gasto";

const ejemplos: Record<Categoria | "todas", string[]> = {
  todas: ["leche", "arroz", "detergente", "acetaminofén"],
  alimentacion: ["leche", "arroz", "aceite", "huevos"],
  vivienda: ["taladro", "pintura", "bombillo led", "colchón"],
  transporte: ["casco moto", "llanta", "aceite motor", "cadena moto"],
  servicios: ["router wifi", "audífonos", "cargador", "plan datos"],
  ocio: ["balón de fútbol", "libro", "videojuego", "bicicleta"],
  salud: ["acetaminofén", "vitamina c", "protector solar", "tensiómetro"],
  otros: ["mochila", "termo", "linterna", "candado"],
};

/** Convierte una oferta en un enlace al formulario de gastos con los datos ya llenos. */
function enlaceRegistrar(o: Oferta, categoria: string) {
  const p = new URLSearchParams({ descripcion: o.titulo.slice(0, 80), monto: String(o.precio) });
  if (categoria) p.set("categoria", categoria);
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

export function RecomendarCompras() {
  const [consulta, setConsulta] = useState("");
  const [categoria, setCategoria] = useState<Categoria | "">("");
  const [resultado, setResultado] = useState<ResultadoBusqueda | null>(null);
  const [buscado, setBuscado] = useState("");
  const [tienda, setTienda] = useState<string | null>(null);
  const [orden, setOrden] = useState<"asc" | "desc">("asc");
  const [pendiente, iniciarTransicion] = useTransition();

  function buscar(texto: string, cat: Categoria | "") {
    const limpio = texto.trim();
    if (!limpio) return;
    setTienda(null);
    iniciarTransicion(async () => {
      const r = await buscarPrecios(limpio, cat);
      setBuscado(limpio);
      setResultado(r);
    });
  }

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    buscar(consulta, categoria);
  }

  const tiendas = useMemo(() => [...new Set((resultado?.ofertas ?? []).map((o) => o.tienda))], [resultado]);
  const visibles = useMemo(() => {
    const lista = (resultado?.ofertas ?? []).filter((o) => !tienda || o.tienda === tienda);
    return [...lista].sort((a, b) => (orden === "asc" ? a.precio - b.precio : b.precio - a.precio));
  }, [resultado, tienda, orden]);
  const barata = resultado?.ofertas[0];
  const relacionadas = categoria ? franquiciasPorCategoria[categoria].map((f) => f.nombre) : [];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <form onSubmit={enviar} className="grid gap-3 md:grid-cols-[1fr_15rem_auto]">
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
              placeholder="¿Qué quieres comprar? Ej. leche deslactosada 1 litro"
              className="w-full rounded-xl border border-border bg-surface py-3.5 pl-12 pr-4 text-[15px] outline-none transition placeholder:text-neutral-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
            />
          </div>
          <div>
            <label htmlFor="categoria" className="sr-only">
              Categoría
            </label>
            <select
              id="categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as Categoria | "")}
              className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-[15px] outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((c) => (
                <option key={c.valor} value={c.valor}>
                  {c.etiqueta}
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
          {ejemplos[categoria || "todas"].map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => {
                setConsulta(e);
                buscar(e, categoria);
              }}
              className="rounded-full bg-brand-100 px-3 py-1 font-semibold text-brand-700 transition-colors hover:bg-brand-300/60"
            >
              {e}
            </button>
          ))}
        </div>

        {relacionadas.length > 0 && (
          <p className="mt-4 text-sm text-muted">
            Tiendas relacionadas con <strong className="text-foreground">{categorias.find((c) => c.valor === categoria)?.etiqueta}</strong>:{" "}
            {relacionadas.join(", ")}.
          </p>
        )}
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

            {resultado.ofertas.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center">
                <p className="font-semibold text-foreground">No encontramos “{buscado}”{categoria ? " en las tiendas de esa categoría" : ""}</p>
                <p className="mt-1 text-sm text-muted">
                  {categoria ? "Prueba con “Todas las categorías” o con otro nombre más general." : "Prueba con otro nombre o una palabra más general."}
                </p>
              </div>
            ) : (
              <>
                {barata && (
                  <div className="flex flex-col gap-2 rounded-2xl bg-menta px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-brand-800">
                      El precio más bajo de “{buscado}” es{" "}
                      <strong className="text-2xl font-extrabold text-foreground">{formatearMoneda(barata.precio)}</strong> en{" "}
                      <strong>{barata.tienda}</strong>.
                    </p>
                    <p className="text-sm text-brand-800/75">
                      {resultado.ofertas.length} ofertas · {tiendas.length} {tiendas.length === 1 ? "tienda" : "tiendas"} · actualizado{" "}
                      {haceCuanto(resultado.actualizado)}
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por tienda">
                    <button
                      type="button"
                      onClick={() => setTienda(null)}
                      aria-pressed={tienda === null}
                      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${tienda === null ? "bg-brand-800 text-white" : "bg-white text-foreground ring-1 ring-border hover:bg-neutral-50"}`}
                    >
                      Todas
                    </button>
                    {tiendas.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTienda(t === tienda ? null : t)}
                        aria-pressed={tienda === t}
                        className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${tienda === t ? "bg-brand-800 text-white" : "bg-white text-foreground ring-1 ring-border hover:bg-neutral-50"}`}
                      >
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
                  {visibles.map((o, i) => {
                    const esMejor = o === barata;
                    return (
                      <li
                        key={`${o.tienda}-${o.titulo}-${i}`}
                        className={`flex flex-col rounded-2xl border bg-surface p-5 shadow-sm ${esMejor ? "border-brand-500 ring-2 ring-brand-500/20" : "border-border"}`}
                      >
                        <div className="flex items-start gap-4">
                          {o.imagen ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={o.imagen} alt="" loading="lazy" referrerPolicy="no-referrer" className="size-20 shrink-0 rounded-lg bg-white object-contain" />
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
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-bold text-foreground">{o.tienda}</span>
                              {esMejor && <span className="rounded-full bg-brand-800 px-2.5 py-0.5 text-xs font-bold text-white">Mejor precio</span>}
                            </div>
                            <p className="mt-2 line-clamp-2 text-sm font-semibold text-foreground">{o.titulo}</p>
                          </div>
                        </div>

                        <p className="mt-4 text-2xl font-extrabold tracking-tight text-foreground">{formatearMoneda(o.precio)}</p>
                        {o.detalle && <p className="mt-1 text-xs text-muted">{o.detalle}</p>}

                        <div className="mt-4 flex flex-wrap gap-2 pt-1">
                          <a
                            href={o.enlace ?? enlaceBusqueda(o, buscado)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-brand-800 px-4 py-2 text-sm font-bold text-brand-50 transition-colors hover:bg-brand-700"
                          >
                            {o.enlace ? "Ver en tienda ↗" : `Buscar en ${o.tienda} ↗`}
                          </a>
                          <Link
                            href={enlaceRegistrar(o, categoria)}
                            className="rounded-lg bg-accent/25 px-4 py-2 text-sm font-bold text-amber-900 transition-colors hover:bg-accent/50"
                          >
                            Registrar gasto
                          </Link>
                        </div>
                      </li>
                    );
                  })}
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
            <p className="mt-1 text-sm text-muted">Elige una categoría para ver solo las tiendas relacionadas con ella.</p>
          </div>
        )}
      </div>
    </div>
  );
}
