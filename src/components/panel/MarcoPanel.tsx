"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { MenuPerfil } from "@/components/auth/MenuPerfil";
import { siteConfig } from "@/config/site";

interface Enlace {
  href?: string;
  etiqueta: string;
  icono: ReactNode;
  proximamente?: boolean;
}

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
        href: "/panel/gastos",
        etiqueta: "Mis gastos",
        icono: (
          <>
            <path d="M8 6h13M8 12h13M8 18h13" />
            <path d="M3 6h.01M3 12h.01M3 18h.01" />
          </>
        ),
      },
    ],
  },
  {
    titulo: "Próximamente",
    enlaces: [
      {
        etiqueta: "Presupuesto",
        proximamente: true,
        icono: (
          <>
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="12" cy="12" r="1" />
          </>
        ),
      },
    ],
  },
];

const nombresRuta: Record<string, string> = {
  panel: "Panel",
  registrar: "Registrar gasto",
  gastos: "Mis gastos",
  editar: "Editar",
};

function Icono({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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
  // En escritorio la barra lateral se ve y "abierto" la oculta; en móvil está oculta y "abierto" la muestra.
  const [abierto, setAbierto] = useState(false);
  const ruta = usePathname();

  const migas = ruta
    .split("/")
    .filter(Boolean)
    .filter((segmento) => segmento in nombresRuta);

  const esActivo = (href: string) => (href === "/panel" ? ruta === "/panel" : ruta === href || ruta.startsWith(`${href}/`));

  return (
    <div className="min-h-screen bg-neutral-100">
      {abierto && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setAbierto(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-neutral-800 text-white transition-transform duration-200 ${
          abierto ? "translate-x-0 lg:-translate-x-full" : "-translate-x-full lg:translate-x-0"
        }`}
        aria-label="Navegación del panel"
      >
        <Link href="/panel" className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5 text-lg font-extrabold">
          <Image src="/logo.svg" alt="" width={26} height={30} />
          {siteConfig.nombre}
        </Link>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {secciones.map((seccion) => (
            <div key={seccion.titulo}>
              <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-widest text-neutral-500">{seccion.titulo}</p>
              <ul className="space-y-1">
                {seccion.enlaces.map((e) => {
                  const base = "flex items-center gap-3 rounded-lg border-l-4 px-3 py-2.5 text-[15px] font-medium transition-colors";
                  if (e.proximamente || !e.href) {
                    return (
                      <li key={e.etiqueta}>
                        <span className={`${base} cursor-not-allowed border-transparent text-neutral-500`}>
                          <Icono>{e.icono}</Icono>
                          {e.etiqueta}
                        </span>
                      </li>
                    );
                  }
                  const activo = esActivo(e.href);
                  return (
                    <li key={e.href}>
                      <Link
                        href={e.href}
                        onClick={() => setAbierto(false)}
                        aria-current={activo ? "page" : undefined}
                        className={`${base} ${
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

        <div className="border-t border-white/10 px-5 py-4 text-xs text-neutral-500">© Cuentas Claras</div>
      </aside>

      <div className={`flex min-h-screen flex-col transition-[margin] duration-200 ${abierto ? "lg:ml-0" : "lg:ml-64"}`}>
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-white px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <button
              type="button"
              onClick={() => setAbierto((v) => !v)}
              aria-label="Mostrar u ocultar el menú"
              className="grid size-10 shrink-0 place-items-center rounded-lg text-foreground transition-colors hover:bg-neutral-100"
            >
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <nav aria-label="Ruta" className="flex min-w-0 items-center gap-2 truncate text-sm text-muted">
              {migas.map((segmento, i) => (
                <span key={segmento} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden>/</span>}
                  <span className={i === migas.length - 1 ? "font-bold text-foreground" : ""}>{nombresRuta[segmento]}</span>
                </span>
              ))}
            </nav>
          </div>

          <MenuPerfil nombre={nombre} email={email} variante="claro" />
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:py-8">{children}</main>

        <footer className="border-t border-border bg-white px-6 py-4 text-sm text-muted">
          Cuentas Claras · Tus gastos, por fin claros.
        </footer>
      </div>
    </div>
  );
}
