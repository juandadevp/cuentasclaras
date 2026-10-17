"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ChangeEvent, type FocusEvent, type FormEvent } from "react";
import { actualizarGasto, crearGasto, type ResultadoGasto } from "@/app/panel/actions";
import { categorias } from "@/config/site";
import { Campo } from "@/components/ui/Campo";
import { formatearMontoEscrito, validarGasto, type DatosGasto } from "@/lib/validaciones-gasto";
import type { Gasto } from "@/types/gasto";

const campos: (keyof DatosGasto)[] = ["descripcion", "monto", "categoria", "fecha"];

interface Props {
  hoy: string;
  /** Si se pasa, el formulario edita ese gasto en lugar de crear uno nuevo. */
  gasto?: Gasto;
}

export function FormularioGasto({ hoy, gasto }: Props) {
  const router = useRouter();
  const vacio: DatosGasto = { descripcion: "", monto: "", categoria: "", fecha: hoy };
  const inicial: DatosGasto = gasto
    ? {
        descripcion: gasto.descripcion,
        monto: formatearMontoEscrito(String(Math.round(gasto.monto))),
        categoria: gasto.categoria,
        fecha: gasto.fecha,
      }
    : vacio;
  const [datos, setDatos] = useState<DatosGasto>(inicial);
  const [tocados, setTocados] = useState<Partial<Record<keyof DatosGasto, boolean>>>({});
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [resultado, setResultado] = useState<ResultadoGasto>({});
  const [guardado, setGuardado] = useState(false);
  const [pendiente, iniciarTransicion] = useTransition();

  const errores = validarGasto(datos, hoy);
  const error = (c: keyof DatosGasto) =>
    resultado.errores?.[c] ?? (tocados[c] || intentoEnvio ? errores[c] : undefined);

  function cambiar(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setDatos((d) => ({ ...d, [name]: name === "monto" ? formatearMontoEscrito(value) : value }));
    setResultado({});
    setGuardado(false);
  }

  function salir(e: FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    setTocados((t) => ({ ...t, [e.target.name]: true }));
  }

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIntentoEnvio(true);
    const primero = campos.find((c) => errores[c]);
    if (primero) {
      (e.currentTarget.elements.namedItem(primero) as HTMLElement | null)?.focus();
      return;
    }
    const formData = new FormData();
    campos.forEach((c) => formData.set(c, datos[c]));
    iniciarTransicion(async () => {
      const r = gasto ? await actualizarGasto(gasto.id, formData) : await crearGasto(formData);
      setResultado(r);
      if (r.ok && gasto) {
        router.push("/panel/gastos");
        return;
      }
      if (r.ok) {
        setDatos(vacio);
        setTocados({});
        setIntentoEnvio(false);
        setGuardado(true);
      }
    });
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <Campo
        etiqueta="¿En qué gastaste?"
        name="descripcion"
        placeholder="Ej. Supermercado"
        maxLength={80}
        value={datos.descripcion}
        onChange={cambiar}
        onBlur={salir}
        error={error("descripcion")}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo
          etiqueta="Valor (COP)"
          name="monto"
          inputMode="numeric"
          placeholder="25.000"
          value={datos.monto}
          onChange={cambiar}
          onBlur={salir}
          error={error("monto")}
        />
        <Campo
          etiqueta="Fecha"
          name="fecha"
          type="date"
          max={hoy}
          value={datos.fecha}
          onChange={cambiar}
          onBlur={salir}
          error={error("fecha")}
        />
      </div>

      <div>
        <label htmlFor="categoria" className="mb-1.5 block text-sm font-semibold text-foreground">
          Categoría
        </label>
        <select
          id="categoria"
          name="categoria"
          value={datos.categoria}
          onChange={cambiar}
          onBlur={salir}
          aria-invalid={error("categoria") ? true : undefined}
          className={`w-full rounded-[10px] border bg-surface px-3.5 py-3 text-[15px] outline-none transition focus:ring-4 ${
            error("categoria")
              ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/15"
              : "border-border focus:border-brand-500 focus:ring-brand-500/15"
          } ${datos.categoria ? "text-foreground" : "text-neutral-400"}`}
        >
          <option value="" disabled>
            Elige una categoría
          </option>
          {categorias.map((c) => (
            <option key={c.valor} value={c.valor} className="text-foreground">
              {c.etiqueta}
            </option>
          ))}
        </select>
        {error("categoria") && (
          <p role="alert" className="mt-1.5 text-sm text-rose-600">
            {error("categoria")}
          </p>
        )}
      </div>

      {resultado.mensaje && (
        <p role="alert" className="rounded-[10px] bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {resultado.mensaje}
        </p>
      )}
      {guardado && (
        <p role="status" className="rounded-[10px] bg-brand-100 px-4 py-3 text-sm font-medium text-brand-800">
          ¡Gasto guardado!
        </p>
      )}

      <button
        type="submit"
        disabled={pendiente}
        className="w-full rounded-[10px] bg-brand-800 px-5 py-3 text-[15px] font-semibold text-brand-50 transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pendiente ? "Guardando…" : gasto ? "Guardar cambios" : "+ Guardar gasto"}
      </button>
    </form>
  );
}
