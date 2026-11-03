"use client";

import { useRef, useState, useTransition } from "react";
import { eliminarGasto } from "@/app/panel/actions";

interface Props {
  id: string;
  descripcion: string;
}

const iconoPapelera = (
  <>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="m19 6-1 14H6L5 6" />
  </>
);

/** Botón de papelera que pide confirmación (en un diálogo) antes de eliminar un gasto. */
export function ConfirmarEliminar({ id, descripcion }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [mensaje, setMensaje] = useState<string>();
  const [pendiente, iniciarTransicion] = useTransition();

  function confirmar() {
    iniciarTransicion(async () => {
      const r = await eliminarGasto(id);
      if (r.ok) dialogo.current?.close();
      else setMensaje(r.mensaje);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialogo.current?.showModal()}
        aria-label={`Eliminar ${descripcion}`}
        title="Eliminar"
        className="grid size-9 place-items-center rounded-lg bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/20"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          {iconoPapelera}
        </svg>
      </button>

      <dialog
        ref={dialogo}
        onClose={() => setMensaje(undefined)}
        aria-labelledby={`eliminar-${id}`}
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-border bg-surface p-6 text-foreground shadow-xl backdrop:bg-black/40"
      >
        <h2 id={`eliminar-${id}`} className="text-lg font-bold">
          ¿Eliminar este gasto?
        </h2>
        <p className="mt-2 break-words text-muted">
          Vas a eliminar “<strong className="text-foreground">{descripcion}</strong>”. Esta acción no se puede deshacer.
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
            {pendiente ? "Eliminando…" : "Sí, eliminar"}
          </button>
        </div>
      </dialog>
    </>
  );
}
