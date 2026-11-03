"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { MenuPerfil } from "@/components/auth/MenuPerfil";
import { siteConfig } from "@/config/site";

interface Enlace {
  href: string;
  etiqueta: string;
  icono: ReactNode;
}

// Para sumar una pantalla: agrega su enlace aquí (o una sección nueva como «Gastos») y su nombre en `nombresRuta`.
const secciones: { titulo: string; enlaces: Enlace[] }[] = [
  {
    titulo: "Principal",
    enlaces: [
      {
        href: "/panel",
        etiqueta: "Inicio",
        icono: (
          <>
            <path d="m3 11 9-8 9 8" />
            <path d="M5 10v10h14V10" />
          </>
        ),
      },
    ],
  },
  {
    titulo: "Gastos",
    enlaces: [
      {
        href: "/panel/registrar",
        etiqueta: "Registrar gasto",
        icono: (
          <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v8M8 12h8" />
          </>
        ),
      },
      {
        href: "/panel/recomendar",
        etiqueta: "Recomendar compras",
        icono: (
          <>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </>
        ),
      },
      {
        href: "/panel/gastos",
        etiqueta: "Mis gastos",
        icono: (
          <>
            <path d="M8 6h13M8 12h13M8 18h13" />
            <path d="M3 6h.01M3 12h.01M3 18h.01" />
          </>
        ),
      },
      {
        href: "/panel/presupuesto",
        etiqueta: "Presupuesto",
        icono: (
          <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3v9h9" />
          </>
        ),
      },
    ],
  },
];

/** Nombre de cada tramo de la ruta en las migas de pan. */
const nombresRuta: Record<string, string> = {
  panel: "Panel",
  registrar: "Registrar gasto",
  recomendar: "Recomendar compras",
  gastos: "Mis gastos",
  presupuesto: "Presupuesto",
  editar: "Editar",
};

const iconoMenu = <path d="M4 6h16M4 12h16M4 18h16" />;

function Icono({ children, className = "size-5 shrink-0" }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  );
}

interface Props {
  nombre: string;
  email: string;
  children: ReactNode;
}

/** Estructura del área privada: barra lateral, barra superior con migas de pan y contenido. */
export function MarcoPanel({ nombre, email, children }: Props) {
  // En escritorio la barra lateral se ve y `abierto` la oculta; en celular está oculta y `abierto` la muestra.
  const [abierto, setAbierto] = useState(false);
  const ruta = usePathname();

  const migas = ruta
    .split("/")
    .filter(Boolean)
    .filter((segmento) => segmento in nombresRuta);

  const esActivo = (href: string) => (href === "/panel" ? ruta === "/panel" : ruta === href || ruta.startsWith(`${href}/`));

  return (
    <div className="min-h-screen bg-white">
      {abierto ? (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setAbierto(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      ) : null}

      {/* `invisible` en el estado cerrado evita que el teclado llegue a enlaces que no se ven. */}
      <aside
        id="menu-panel"
        aria-label="Navegación del panel"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-neutral-800 text-white transition-[transform,visibility] duration-200 ${
          abierto ? "translate-x-0 lg:invisible lg:-translate-x-full" : "invisible -translate-x-full lg:visible lg:translate-x-0"
        }`}
      >
        <Link href="/panel" className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5 text-lg font-extrabold">
          <Image src="/logo.svg" alt="" width={26} height={30} />
          {siteConfig.nombre}
        </Link>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {secciones.map((seccion) => (
            <div key={seccion.titulo}>
              <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-widest text-neutral-400">{seccion.titulo}</p>
              <ul className="space-y-1">
                {seccion.enlaces.map((e) => {
                  const activo = esActivo(e.href);
                  return (
                    <li key={e.href}>
                      <Link
                        href={e.href}
                        onClick={() => setAbierto(false)}
                        aria-current={activo ? "page" : undefined}
                        className={`flex items-center gap-3 rounded-lg border-l-4 px-3 py-2.5 text-[15px] font-medium transition-colors ${
                          activo
                            ? "border-brand-500 bg-white/10 text-white"
                            : "border-transparent text-neutral-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <Icono>{e.icono}</Icono>
                        {e.etiqueta}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 px-5 py-4 text-xs text-neutral-400">© {siteConfig.nombre}</div>
      </aside>

      <div className={`flex min-h-screen min-w-0 flex-col transition-[margin] duration-200 ${abierto ? "lg:ml-0" : "lg:ml-64"}`}>
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-white px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <button
              type="button"
              onClick={() => setAbierto((v) => !v)}
              aria-label="Mostrar u ocultar el menú"
              aria-expanded={abierto}
              aria-controls="menu-panel"
              className="grid size-10 shrink-0 place-items-center rounded-lg text-foreground transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
            >
              <Icono className="size-6">{iconoMenu}</Icono>
            </button>
            <nav aria-label="Ruta" className="flex min-w-0 items-center gap-2 truncate text-sm text-muted">
              {migas.map((segmento, i) => (
                <span key={segmento} className="flex items-center gap-2">
                  {i > 0 ? <span aria-hidden>/</span> : null}
                  <span className={i === migas.length - 1 ? "font-bold text-foreground" : ""}>{nombresRuta[segmento]}</span>
                </span>
              ))}
            </nav>
          </div>

          <MenuPerfil nombre={nombre} email={email} />
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:py-8">{children}</main>

        <footer className="border-t border-border bg-white px-6 py-4 text-sm text-muted">
          {siteConfig.nombre} · Tus gastos, por fin claros.
        </footer>
      </div>
    </div>
  );
}
