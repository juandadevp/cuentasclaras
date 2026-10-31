"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import { fijarPresupuesto, type ResultadoPresupuesto } from "@/app/panel/presupuesto/actions";
import { Campo } from "@/components/ui/Campo";
import { categorias } from "@/config/site";
import { validarPresupuesto } from "@/lib/presupuestos";
import { formatearMontoEscrito } from "@/lib/validaciones-gasto";

interface Props {
  /** Mes en formato yyyy-mm. */
  mes: string;
  hoy: string;
  /** Si se pasa, el formulario edita el límite de esa categoría. */
  categoriaInicial?: string;
  montoInicial?: number;
}

export function FormularioPresupuesto({ mes, hoy, categoriaInicial = "", montoInicial }: Props) {
  const router = useRouter();
  const editando = montoInicial !== undefined;
  const [categoria, setCategoria] = useState(categoriaInicial);
  const [monto, setMonto] = useState(editando ? formatearMontoEscrito(String(Math.round(montoInicial))) : "");
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [resultado, setResultado] = useState<ResultadoPresupuesto>({});
  const [pendiente, iniciarTransicion] = useTransition();

  const errores = validarPresupuesto({ categoria, monto, mes }, hoy);
  const error = (c: "categoria" | "monto") => resultado.errores?.[c] ?? (intentoEnvio ? errores[c] : undefined);

  function cambiarMonto(e: ChangeEvent<HTMLInputElement>) {
    setMonto(formatearMontoEscrito(e.target.value));
    setResultado({});
  }

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIntentoEnvio(true);
    if (errores.categoria || errores.monto || errores.mes) return;

    const formData = new FormData();
    formData.set("categoria", categoria);
    formData.set("monto", monto);
    formData.set("mes", mes);
    iniciarTransicion(async () => {
      const r = await fijarPresupuesto(formData);
      setResultado(r);
      if (r.ok) {
        setCategoria("");
        setMonto("");
        setIntentoEnvio(false);
        // Quita ?categoria=... de la dirección para salir del modo edición.
        router.push(`/panel/presupuesto?mes=${mes}`);
      }
    });
  }

  return (
    <form onSubmit={enviar} noValidate className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-start">
      <div>
        <label htmlFor="categoria" className="mb-1.5 block text-sm font-semibold text-foreground">
          Categoría
        </label>
        <select
          id="categoria"
          name="categoria"
          value={categoria}
          onChange={(e) => {
            setCategoria(e.target.value);
            setResultado({});
          }}
          aria-invalid={error("categoria") ? true : undefined}
          className={`w-full rounded-[10px] border bg-surface px-3.5 py-3 text-[15px] outline-none transition focus:ring-4 ${
            error("categoria")
              ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/15"
              : "border-border focus:border-brand-500 focus:ring-brand-500/15"
          } ${categoria ? "text-foreground" : "text-neutral-400"}`}
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

      <Campo
        etiqueta="Límite del mes (COP)"
        name="monto"
        inputMode="numeric"
        placeholder="500.000"
        value={monto}
        onChange={cambiarMonto}
        error={error("monto")}
      />

      <button
        type="submit"
        disabled={pendiente}
        className="rounded-[10px] bg-brand-800 px-5 py-3 text-[15px] font-semibold text-brand-50 transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-70 md:mt-[1.65rem]"
      >
        {pendiente ? "Guardando…" : editando ? "Guardar cambios" : "Fijar límite"}
      </button>

      {resultado.mensaje && (
        <p role="alert" className="rounded-[10px] bg-rose-50 px-4 py-3 text-sm text-rose-700 md:col-span-3">
          {resultado.mensaje}
        </p>
      )}
      {resultado.errores?.mes && (
        <p role="alert" className="rounded-[10px] bg-rose-50 px-4 py-3 text-sm text-rose-700 md:col-span-3">
          {resultado.errores.mes}
        </p>
      )}
    </form>
  );
}
