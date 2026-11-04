"use client";

import { useState, useTransition } from "react";
import { quitarFavorito } from "@/app/panel/favoritos/actions";
import { IconoEstrella } from "@/components/panel/IconoEstrella";

/** Estrella para quitar un producto de favoritos: muestra el error si no se pudo quitar. */
export function BotonQuitarFavorito({ clave, titulo }: { clave: string; titulo: string }) {
  const [mensaje, setMensaje] = useState<string>();
  const [pendiente, iniciarTransicion] = useTransition();

  function quitar() {
    iniciarTransicion(async () => {
      const r = await quitarFavorito(clave);
      setMensaje(r.ok ? undefined : r.mensaje);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={quitar}
        disabled={pendiente}
        aria-label={`Quitar ${titulo} de favoritos`}
        title="Quitar de favoritos"
        className="grid size-9 shrink-0 place-items-center rounded-full bg-accent/30 text-accent transition-colors hover:bg-neutral-100 hover:text-neutral-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <IconoEstrella llena />
      </button>
      {mensaje ? (
        <p role="alert" className="basis-full text-xs text-rose-700">
          {mensaje}
        </p>
      ) : null}
    </>
  );
}
