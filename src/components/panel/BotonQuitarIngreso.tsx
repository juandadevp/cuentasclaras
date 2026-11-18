"use client";

import { useRef, useState, useTransition } from "react";
import { eliminarIngreso } from "@/app/panel/ingresos/actions";

interface Props {
  id: string;
  /** Descripción del ingreso, para el nombre accesible del botón y la confirmación. */
  descripcion: string;
}

/** Botón «Quitar» de un ingreso: pide confirmación y muestra el error si no se pudo quitar. */
export function BotonQuitarIngreso({ id, descripcion }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [mensaje, setMensaje] = useState<string>();
  const [pendiente, iniciarTransicion] = useTransition();

  function confirmar() {
    iniciarTransicion(async () => {
      const r = await eliminarIngreso(id);
      if (r.ok) dialogo.current?.close();
      else setMensaje(r.mensaje);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialogo.current?.showModal()}
        aria-label={`Quitar el ingreso ${descripcion}`}
        className="rounded-lg px-3 py-1.5 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/20"
      >
        Quitar
      </button>

      <dialog
        ref={dialogo}
        onClose={() => setMensaje(undefined)}
        aria-labelledby={`quitar-ingreso-${id}`}
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-border bg-surface p-6 text-foreground shadow-xl backdrop:bg-black/40"
      >
        <h2 id={`quitar-ingreso-${id}`} className="text-lg font-bold">
          ¿Quitar este ingreso?
        </h2>
        <p className="mt-2 break-words text-muted">
          Vas a quitar “<strong className="text-foreground">{descripcion}</strong>”. Esta acción no se puede deshacer.
        </p>
        {mensaje ? (
          <p role="alert" className="mt-3 rounded-[10px] bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {mensaje}
          </p>
        ) : null}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => dialogo.current?.close()}
            className="rounded-[10px] border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmar}
            disabled={pendiente}
            className="rounded-[10px] bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/30 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pendiente ? "Quitando…" : "Sí, quitar"}
          </button>
        </div>
      </dialog>
    </>
  );
}
