"use client";

import { useState, useTransition } from "react";
import { quitarMetaAhorro } from "@/app/panel/ahorro/actions";

/** Botón «Quitar meta»: muestra el error si no se pudo quitar. */
export function BotonQuitarMetaAhorro({ id }: { id: string }) {
  const [mensaje, setMensaje] = useState<string>();
  const [pendiente, iniciarTransicion] = useTransition();

  function quitar() {
    iniciarTransicion(async () => {
      const r = await quitarMetaAhorro(id);
      setMensaje(r.ok ? undefined : r.mensaje);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={quitar}
        disabled={pendiente}
        aria-label="Quitar la meta de ahorro"
        className="rounded-lg px-3 py-1.5 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/20 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pendiente ? "Quitando…" : "Quitar meta"}
      </button>
      {mensaje ? (
        <p role="alert" className="basis-full text-sm text-rose-700">
          {mensaje}
        </p>
      ) : null}
    </>
  );
}
