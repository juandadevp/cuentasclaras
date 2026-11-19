"use client";

import { useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import { fijarMetaAhorro } from "@/app/panel/ahorro/actions";
import { Campo } from "@/components/ui/Campo";
import { validarMeta, type ResultadoMeta } from "@/lib/metas-ahorro";
import { formatearMontoEscrito } from "@/lib/validaciones-gasto";

interface Props {
  /** Mes en formato yyyy-mm. */
  mes: string;
  /** Fecha de hoy (yyyy-mm-dd) calculada en el servidor. */
  hoy: string;
  /** Monto de la meta actual, si ya hay una. Solo se lee al montarse: da una `key` que cambie con el monto. */
  montoInicial?: number;
}

/** Formulario para fijar o cambiar la meta de ahorro del mes. */
export function FormularioMetaAhorro({ mes, hoy, montoInicial }: Props) {
  const editando = montoInicial !== undefined;
  const [monto, setMonto] = useState(editando ? formatearMontoEscrito(String(Math.round(montoInicial))) : "");
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [resultado, setResultado] = useState<ResultadoMeta>({});
  const [pendiente, iniciarTransicion] = useTransition();

  const errores = validarMeta({ monto, mes }, hoy);
  const errorMonto = resultado.errores?.monto ?? (intentoEnvio ? errores.monto : undefined);

  function cambiarMonto(e: ChangeEvent<HTMLInputElement>) {
    setMonto(formatearMontoEscrito(e.target.value));
    setResultado({});
  }

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIntentoEnvio(true);
    if (errores.monto || errores.mes) return;

    const formData = new FormData();
    formData.set("monto", monto);
    formData.set("mes", mes);
    iniciarTransicion(async () => {
      const r = await fijarMetaAhorro(formData);
      setResultado(r);
      if (r.ok) setIntentoEnvio(false);
    });
  }

  const errorGeneral = resultado.mensaje ?? resultado.errores?.mes ?? (intentoEnvio ? errores.mes : undefined);

  return (
    <form onSubmit={enviar} noValidate className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
      <input type="hidden" name="mes" value={mes} />
      <Campo
        etiqueta="Meta de ahorro del mes (COP)"
        name="monto"
        inputMode="numeric"
        placeholder="500.000"
        value={monto}
        onChange={cambiarMonto}
        error={errorMonto}
      />

      <button
        type="submit"
        disabled={pendiente}
        className="rounded-[10px] bg-brand-800 px-5 py-3 text-[15px] font-semibold text-brand-50 transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-70 md:mt-[1.65rem]"
      >
        {pendiente ? "Guardando…" : editando ? "Cambiar meta" : "Fijar meta"}
      </button>

      {errorGeneral ? (
        <p role="alert" className="rounded-[10px] bg-rose-50 px-4 py-3 text-sm text-rose-700 md:col-span-2">
          {errorGeneral}
        </p>
      ) : null}
    </form>
  );
}
