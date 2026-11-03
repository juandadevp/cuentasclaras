"use client";

import { useState, useTransition } from "react";
import { quitarPresupuesto } from "@/app/panel/presupuesto/actions";

interface Props {
  id: string;
  /** Nombre de la categoría, para el nombre accesible del botón. */
  categoria: string;
}

/** Botón «Quitar» de un límite: muestra el error si no se pudo quitar. */
export function BotonQuitarPresupuesto({ id, categoria }: Props) {
  const [mensaje, setMensaje] = useState<string>();
  const [pendiente, iniciarTransicion] = useTransition();

  function quitar() {
    iniciarTransicion(async () => {
      const r = await quitarPresupuesto(id);
      setMensaje(r.ok ? undefined : r.mensaje);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={quitar}
        disabled={pendiente}
        aria-label={`Quitar el límite de ${categoria}`}
        className="rounded-lg px-3 py-1.5 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/20 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pendiente ? "Quitando…" : "Quitar"}
      </button>
      {mensaje ? (
        <p role="alert" className="basis-full text-sm text-rose-700">
          {mensaje}
        </p>
      ) : null}
    </>
  );
}
