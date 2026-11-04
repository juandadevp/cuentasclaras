"use client";

import Link from "next/link";
import { useMemo, useOptimistic, useState, useTransition, type FormEvent } from "react";
import { AvisoPanel } from "@/components/panel/AvisoPanel";
import { TarjetaProducto } from "@/components/panel/TarjetaProducto";
import { aplicarCambioFavorito, productoAFavorito, recortarClave, type ResultadoFavorito } from "@/lib/favoritos";
import { formatearMoneda } from "@/lib/format";
import { agruparProductos, type Producto } from "@/lib/precios/agrupar";
import { listaRubros, rubros, type Rubro } from "@/lib/precios/rubros";
import type { ResultadoBusqueda } from "@/lib/precios/tipos";
import { BUSQUEDA_MAXIMA, BUSQUEDA_MINIMA } from "@/lib/precios/validar-busqueda";
import {
  contarAjenas,
  filtrarPorTienda,
  haceCuanto,
  ofertaMasBarata,
  ofertasVisibles,
  ordenarProductos,
  tiendasDe,
} from "@/lib/precios/vista";

const ejemplosGenerales = ["acetaminofén", "leche", "audífonos", "detergente", "taladro", "pañales"];
const MENSAJE_SIN_CONEXION = "No pudimos conectar con el servicio de precios. Revisa tu conexión e inténtalo de nuevo.";
const MENSAJE_FAVORITO_SIN_CONEXION = "No pudimos actualizar tus favoritos. Revisa tu conexión e inténtalo de nuevo.";

const chip = (activo: boolean) =>
  `rounded-full px-4 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 ${
    activo ? "bg-brand-800 text-white" : "bg-white text-foreground ring-1 ring-border hover:bg-neutral-50"
  }`;

const iconoLupa = (
  <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

interface Props {
  /** Busca los precios en el servidor (la acción `buscarPrecios`). */
  buscar: (consulta: string, rubro: string) => Promise<ResultadoBusqueda>;
  /** Guarda un producto en favoritos (la acción `guardarFavorito`). */
  guardar: (producto: unknown) => Promise<ResultadoFavorito>;
  /** Quita un producto de favoritos (la acción `quitarFavorito`). */
  quitar: (clave: string) => Promise<ResultadoFavorito>;
  /** Claves de los productos que la persona ya tiene en favoritos. */
  favoritosIniciales: string[];
  /** Aviso si no se pudieron leer los favoritos (por ejemplo, falta la migración). */
  avisoFavoritos?: string;
  /** Texto y tipo con los que arranca el buscador (por ejemplo, al llegar desde Favoritos). */
  consultaInicial?: string;
  tipoInicial?: Rubro | "";
}

/** Pantalla «Recomendar compras»: buscador, tipo de producto, resultados agrupados por producto y filtros. */
export function RecomendarCompras({ buscar, guardar, quitar, favoritosIniciales, avisoFavoritos, consultaInicial = "", tipoInicial = "" }: Props) {
  const [consulta, setConsulta] = useState(consultaInicial);
  const [rubro, setRubro] = useState<Rubro | "">(tipoInicial);
  const [resultado, setResultado] = useState<ResultadoBusqueda | null>(null);
  const [buscado, setBuscado] = useState("");
  const [recibidoEn, setRecibidoEn] = useState(0);
  const [tienda, setTienda] = useState<string | null>(null);
  const [verOtras, setVerOtras] = useState(false);
  const [orden, setOrden] = useState<"asc" | "desc">("asc");
  const [pendiente, iniciarTransicion] = useTransition();

  const detectado = resultado?.rubro ?? null;

  // Favoritos: la estrella cambia al instante (estado optimista) y vuelve sola a como estaba si el guardado falla.
  const clavesGuardadas = useMemo(() => new Set(favoritosIniciales), [favoritosIniciales]);
  const [favoritos, aplicarOptimista] = useOptimistic(clavesGuardadas, aplicarCambioFavorito);
  const [guardando, setGuardando] = useState<ReadonlySet<string>>(new Set());
  const [avisoFavorito, setAvisoFavorito] = useState("");
  const [, iniciarFavorito] = useTransition();

  function lanzarBusqueda(texto: string, tipo: Rubro | "") {
    const limpio = texto.trim();
    if (limpio.length < BUSQUEDA_MINIMA) return;
    setTienda(null);
    setVerOtras(false);
    iniciarTransicion(async () => {
      let r: ResultadoBusqueda;
      try {
        r = await buscar(limpio, tipo);
      } catch {
        r = { ok: false, ofertas: [], modo: "real", actualizado: new Date().toISOString(), mensaje: MENSAJE_SIN_CONEXION };
      }
      setBuscado(limpio);
      setResultado(r);
      setRecibidoEn(Date.now());
    });
  }

  function alternarFavorito(producto: Producto) {
    const clave = recortarClave(producto.clave);
    const activar = !favoritos.has(clave);
    setAvisoFavorito("");
    setGuardando((actual) => new Set(actual).add(clave));
    iniciarFavorito(async () => {
      aplicarOptimista({ clave, activo: activar });
      let r: ResultadoFavorito;
      try {
        r = activar ? await guardar(productoAFavorito(producto, detectado)) : await quitar(clave);
      } catch {
        r = { ok: false, mensaje: MENSAJE_FAVORITO_SIN_CONEXION };
      }
      if (!r.ok) setAvisoFavorito(r.mensaje ?? MENSAJE_FAVORITO_SIN_CONEXION);
      setGuardando((actual) => {
        const nuevo = new Set(actual);
        nuevo.delete(clave);
        return nuevo;
      });
    });
  }

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    lanzarBusqueda(consulta, rubro);
  }

  // Todo lo que se muestra se calcula a partir del resultado y de los filtros: no se guarda aparte.
  const todas = useMemo(() => resultado?.ofertas ?? [], [resultado]);
  const ajenas = useMemo(() => contarAjenas(todas), [todas]);
  const base = useMemo(() => ofertasVisibles(todas, { detectado, verOtras }), [todas, detectado, verOtras]);
  const tiendas = useMemo(() => tiendasDe(base), [base]);
  const productos = useMemo(() => ordenarProductos(agruparProductos(filtrarPorTienda(base, tienda)), orden), [base, tienda, orden]);
  const barata = useMemo(() => ofertaMasBarata(base), [base]);
  const propias = todas.length - ajenas;

  return (
    <div className="space-y-6">
      {avisoFavoritos ? <AvisoPanel>{avisoFavoritos}</AvisoPanel> : null}
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <form onSubmit={enviar} className="grid gap-3 md:grid-cols-[1fr_16rem_auto]">
          <div className="relative">
            <label htmlFor="producto" className="sr-only">
              Producto a buscar
            </label>
            {iconoLupa}
            <input
              id="producto"
              value={consulta}
              onChange={(e) => setConsulta(e.target.value)}
              maxLength={BUSQUEDA_MAXIMA}
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
              className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-[15px] text-foreground outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
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
            disabled={pendiente || consulta.trim().length < BUSQUEDA_MINIMA}
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
              disabled={pendiente}
              onClick={() => {
                setConsulta(e);
                lanzarBusqueda(e, rubro);
              }}
              className="rounded-full bg-brand-100 px-3 py-1 font-semibold text-brand-700 transition-colors hover:bg-brand-300/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {e}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">
          Detectamos el tipo de producto y te mostramos solo las tiendas donde se vende: farmacias para medicamentos, supermercados para
          alimentos, tiendas de tecnología para electrónicos… Si no acertamos, elige el tipo en la lista.
        </p>
      </section>

      <div aria-live="polite">
        {pendiente ? (
          <div aria-busy className="rounded-2xl border border-border bg-surface p-10 text-center shadow-sm">
            <div className="mx-auto size-9 animate-spin rounded-full border-4 border-brand-100 border-t-brand-700" aria-hidden />
            <p className="mt-4 font-semibold text-foreground">Consultando precios en las tiendas…</p>
          </div>
        ) : null}

        {!pendiente && resultado && !resultado.ok ? (
          <p role="alert" className="rounded-xl bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {resultado.mensaje}
          </p>
        ) : null}

        {!pendiente && resultado?.ok ? (
          <div className="space-y-5">
            {resultado.modo === "demo" ? (
              <p className="rounded-xl border border-accent bg-accent/20 px-5 py-4 text-sm text-brand-800">
                <strong>Modo demostración:</strong> estos precios son de <strong>ejemplo</strong>, no son reales. Para ver precios reales, el
                equipo debe configurar la clave del servicio de precios (<code>SERPAPI_API_KEY</code>).
              </p>
            ) : null}

            {avisoFavorito ? (
              <p role="alert" className="rounded-xl bg-rose-50 px-5 py-3 text-sm text-rose-700">
                {avisoFavorito}
              </p>
            ) : null}

            {detectado ? (
              <div className="rounded-xl border border-brand-300 bg-brand-100/60 px-5 py-4 text-sm text-brand-800">
                <p>
                  {resultado.automatico ? "Detectamos que " : "Buscando como "}
                  <strong>“{buscado}”</strong>
                  {resultado.automatico ? " es de tipo " : " de tipo "}
                  <strong>{rubros[detectado].etiqueta}</strong>.{" "}
                  {verOtras ? "Mostrando todas las tiendas." : <>Solo mostramos tiendas donde se vende: {resultado.tiendasDelTipo?.join(", ")}.</>}
                </p>
                {ajenas > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setVerOtras((v) => !v);
                      setTienda(null);
                    }}
                    className="mt-2 font-bold underline underline-offset-2 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
                  >
                    {verOtras ? "Volver a solo las tiendas del tipo" : `Ver también otras tiendas (${ajenas})`}
                  </button>
                ) : null}
              </div>
            ) : (
              <p className="rounded-xl bg-neutral-100 px-5 py-4 text-sm text-foreground">
                No reconocimos qué tipo de producto es “<strong>{buscado}</strong>”, así que mostramos todas las tiendas. Para afinar la búsqueda,
                elige el tipo en la lista de arriba.
              </p>
            )}

            {propias === 0 && detectado && !verOtras && ajenas > 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-10 text-center">
                <p className="font-semibold text-foreground">
                  No encontramos “{buscado}” en {rubros[detectado].etiqueta.toLowerCase()}
                </p>
                <p className="mt-1 text-sm text-muted">
                  Hay {ajenas} {ajenas === 1 ? "oferta" : "ofertas"} en otras tiendas. Usa “Ver también otras tiendas” para verlas.
                </p>
              </div>
            ) : todas.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center">
                <p className="font-semibold text-foreground">No encontramos “{buscado}”</p>
                <p className="mt-1 text-sm text-muted">Prueba con otro nombre o una palabra más general.</p>
              </div>
            ) : (
              <>
                {barata ? (
                  <div className="flex flex-col gap-2 rounded-2xl bg-menta px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="min-w-0 break-words text-brand-800">
                      El precio más bajo para “{buscado}” es{" "}
                      <strong className="text-2xl font-extrabold text-foreground">{formatearMoneda(barata.precio)}</strong> en{" "}
                      <strong>{barata.tienda}</strong>
                      <span className="text-brand-800/80"> ({barata.titulo})</span>.
                    </p>
                    <p className="shrink-0 text-sm text-brand-800/75">
                      {productos.length} {productos.length === 1 ? "producto" : "productos"} · {tiendas.length}{" "}
                      {tiendas.length === 1 ? "tienda" : "tiendas"} · actualizado {haceCuanto(resultado.actualizado, recibidoEn)}
                    </p>
                  </div>
                ) : null}

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
                  <label className="flex shrink-0 items-center gap-2 text-sm text-muted">
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
                      favorito={favoritos.has(recortarClave(p.clave))}
                      guardando={guardando.has(recortarClave(p.clave))}
                      onFavorito={() => alternarFavorito(p)}
                    />
                  ))}
                </ul>

                <p className="text-xs text-muted">
                  Toca la ★ de un producto para guardarlo en{" "}
                  <Link href="/panel/favoritos" className="font-bold text-brand-700 hover:underline">
                    Favoritos
                  </Link>
                  . Los precios vienen de los buscadores de compras y pueden cambiar o variar según tu ciudad. Confírmalos en la tienda antes de
                  comprar.
                </p>
              </>
            )}
          </div>
        ) : null}

        {!pendiente && !resultado ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center">
            <p className="font-semibold text-foreground">Escribe un producto y compara precios entre tiendas</p>
            <p className="mt-1 text-sm text-muted">Por ejemplo “acetaminofén” te mostrará farmacias; “audífonos”, tiendas de tecnología.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
