import Link from "next/link";
import type { ReactNode } from "react";

interface Props {
  etiqueta: string;
  titulo: string;
  subtitulo?: string;
  /** Muestra el enlace "Volver al portal". */
  volver?: boolean;
  /** Contenido a la derecha (p. ej. el selector de mes). */
  children?: ReactNode;
}

export function EncabezadoPanel({ etiqueta, titulo, subtitulo, volver, children }: Props) {
  return (
    <section className="bg-menta">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-end sm:justify-between lg:px-20">
        <div>
          {volver && (
            <Link href="/panel" className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
              ← Volver al portal
            </Link>
          )}
          <p className="text-sm font-bold uppercase tracking-widest text-brand-700">{etiqueta}</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{titulo}</h1>
          {subtitulo && <p className="mt-1 text-brand-800/75">{subtitulo}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}
