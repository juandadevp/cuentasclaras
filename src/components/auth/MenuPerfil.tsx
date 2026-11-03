"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cerrarSesion } from "@/app/auth/actions";

interface Props {
  nombre: string;
  email: string;
  /** true cuando el botón va sobre el menú oscuro del sitio. */
  oscuro?: boolean;
}

const iconoPerfil = (
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
  </>
);

const iconoPortal = (
  <>
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </>
);

const iconoSalir = (
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </>
);

/** Menú de perfil: muestra el nombre y el correo, y permite cerrar la sesión. */
export function MenuPerfil({ nombre, email, oscuro = false }: Props) {
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
        className={`flex items-center gap-3 rounded-full py-1 pl-1 pr-3 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 ${
          oscuro ? "hover:bg-white/10" : "hover:bg-neutral-100"
        }`}
      >
        <span className={`relative grid size-10 place-items-center rounded-full ${oscuro ? "bg-menta text-brand-800" : "bg-brand-800 text-brand-50"}`}>
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            {iconoPerfil}
          </svg>
          {/* Punto verde: sesión activa */}
          <span className={`absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 bg-brand-500 ${oscuro ? "border-neutral-800" : "border-white"}`} aria-hidden />
        </span>
        <span className="hidden text-left sm:block">
          <span className={`block max-w-40 truncate text-sm font-bold leading-tight ${oscuro ? "text-white" : "text-foreground"}`}>{nombre}</span>
          <span className={`block text-xs ${oscuro ? "text-neutral-400" : "text-muted"}`}>Mi cuenta</span>
        </span>
      </button>

      {abierto ? (
        <div role="menu" className="absolute right-0 top-full z-50 mt-3 w-64 rounded-xl border border-border bg-surface p-2 shadow-xl">
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-bold text-foreground">{nombre}</p>
            <p className="truncate text-sm text-muted">{email}</p>
          </div>
          <div className="my-1 h-px bg-border" />
          <Link
            href="/panel"
            role="menuitem"
            onClick={() => setAbierto(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-foreground transition-colors hover:bg-neutral-100"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {iconoPortal}
            </svg>
            Mi portal
          </Link>
          <form action={cerrarSesion}>
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-foreground transition-colors hover:bg-neutral-100"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                {iconoSalir}
              </svg>
              Cerrar sesión
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
