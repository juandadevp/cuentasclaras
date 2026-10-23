import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { FormularioContacto } from "@/components/home/FormularioContacto";

export const metadata: Metadata = { title: "Contacto" };

function Icono({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  );
}

const motivos = [
  {
    titulo: "Consultas",
    texto: "Dudas sobre cómo usar la aplicación.",
    icono: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01" />
      </>
    ),
  },
  {
    titulo: "Problemas",
    texto: "Algo no funciona como debería.",
    icono: (
      <>
        <path d="M12 3 2.5 20h19z" />
        <path d="M12 10v4M12 17h.01" />
      </>
    ),
  },
  {
    titulo: "Sugerencias",
    texto: "Ideas para mejorar Cuentas Claras.",
    icono: (
      <>
        <path d="M9 18h6M10 21h4" />
        <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" />
      </>
    ),
  },
];

export default function ContactoPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-menta px-6 py-16 lg:px-20">
        <div aria-hidden className="absolute -right-24 -top-24 size-80 rounded-full bg-white/30" />
        <div aria-hidden className="absolute -bottom-32 right-40 size-72 rounded-full bg-brand-500/10" />
        <div className="relative mx-auto max-w-5xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-brand-800 sm:text-5xl">Contacto</h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-brand-800/75">
            ¿Dudas, sugerencias o algún problema con la app? Escríbenos y te respondemos lo antes posible.
          </p>
        </div>
      </section>

      <section className="bg-neutral-50 px-6 pb-20 lg:px-20">
        <div className="relative mx-auto -mt-8 grid max-w-5xl gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg shadow-black/5 sm:p-9">
            <h2 className="text-xl font-bold text-foreground">Envíanos un mensaje</h2>
            <p className="mb-7 mt-1 text-sm text-muted">Completa el formulario y te escribiremos al correo que indiques.</p>
            <FormularioContacto />
          </div>

          <aside className="space-y-6 lg:pt-8">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
              <h2 className="font-bold text-foreground">¿En qué podemos ayudarte?</h2>
              <ul className="mt-5 space-y-5">
                {motivos.map((m) => (
                  <li key={m.titulo} className="flex gap-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-menta text-brand-800">
                      <Icono>{m.icono}</Icono>
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">{m.titulo}</p>
                      <p className="text-sm text-muted">{m.texto}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-neutral-800 p-6 text-white shadow-sm">
              <h2 className="font-bold">¿Buscas una respuesta rápida?</h2>
              <p className="mt-2 text-sm leading-relaxed text-neutral-300">Revisa las preguntas frecuentes sobre registros, precios y consejos de ahorro.</p>
              <Link
                href="/ayuda"
                className="mt-5 inline-flex items-center gap-2 rounded-[10px] bg-white px-4 py-2.5 text-sm font-bold text-neutral-900 transition-colors hover:bg-menta"
              >
                Ir a ayuda <span aria-hidden>→</span>
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
