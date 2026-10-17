"use client";

import { useEffect, useRef, useState } from "react";
import { cerrarSesion } from "@/app/auth/actions";

interface Props {
  nombre: string;
  email: string;
}

/** Ícono de perfil que reemplaza al botón "Iniciar sesión" cuando hay una sesión activa. */
export function MenuPerfil({ nombre, email }: Props) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => {
      if (!contenedor.current?.contains(e.target as Node)) setAbierto(false);
    };
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto]);

  return (
    <div ref={contenedor} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-label={`Perfil de ${nombre}`}
        className="relative grid size-10 place-items-center rounded-full bg-white text-neutral-800 ring-2 ring-transparent transition hover:ring-brand-300 focus-visible:outline-none focus-visible:ring-brand-300"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
        </svg>
        {/* Punto verde: sesión activa */}
        <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-neutral-800 bg-brand-500" aria-hidden />
      </button>

      {abierto && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-3 w-64 rounded-xl border border-border bg-surface p-2 shadow-xl"
        >
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-bold text-foreground">{nombre}</p>
            <p className="truncate text-sm text-muted">{email}</p>
          </div>
          <div className="my-1 h-px bg-border" />
          <form action={cerrarSesion}>
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-foreground transition-colors hover:bg-neutral-100"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="m16 17 5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
              Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
