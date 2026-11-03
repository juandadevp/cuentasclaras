"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import { fijarPresupuesto } from "@/app/panel/presupuesto/actions";
import { Campo } from "@/components/ui/Campo";
import { Selector } from "@/components/ui/Selector";
import { categorias } from "@/config/site";
import { validarPresupuesto, type ResultadoPresupuesto } from "@/lib/presupuestos";
import { formatearMontoEscrito } from "@/lib/validaciones-gasto";

interface Props {
  /** Mes en formato yyyy-mm. */
  mes: string;
  /** Fecha de hoy (yyyy-mm-dd) calculada en el servidor. */
  hoy: string;
  /** Si se pasa, el formulario edita el límite de esa categoría. */
  categoriaInicial?: string;
  montoInicial?: number;
}

/**
 * Formulario para fijar el límite de una categoría. Los valores iniciales solo se leen al montarse: quien lo use
 * debe darle una `key` que cambie con el mes, la categoría y el monto, para que se reinicie.
 */
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
      if (!r.ok) return;
      setCategoria("");
      setMonto("");
      setIntentoEnvio(false);
      // Quita ?categoria=... de la dirección para salir del modo edición.
      router.push(`/panel/presupuesto?mes=${mes}`);
    });
  }

  const errorGeneral = resultado.mensaje ?? resultado.errores?.mes ?? (intentoEnvio ? errores.mes : undefined);

  return (
    <form onSubmit={enviar} noValidate className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-start">
      <Selector
        etiqueta="Categoría"
        name="categoria"
        placeholder="Elige una categoría"
        value={categoria}
        onChange={(e) => {
          setCategoria(e.target.value);
          setResultado({});
        }}
        error={error("categoria")}
      >
        {categorias.map((c) => (
          <option key={c.valor} value={c.valor} className="text-foreground">
            {c.etiqueta}
          </option>
        ))}
      </Selector>

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

      {errorGeneral ? (
        <p role="alert" className="rounded-[10px] bg-rose-50 px-4 py-3 text-sm text-rose-700 md:col-span-3">
          {errorGeneral}
        </p>
      ) : null}
    </form>
  );
}
