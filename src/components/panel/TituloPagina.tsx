import type { ReactNode } from "react";

interface Props {
  titulo: string;
  subtitulo?: string;
  /** Contenido a la derecha del título (botones, selector de mes…). */
  children?: ReactNode;
}

export function TituloPagina({ titulo, subtitulo, children }: Props) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{titulo}</h1>
        {subtitulo && <p className="mt-1 text-muted">{subtitulo}</p>}
      </div>
      {children}
    </div>
  );
}

export function Tarjeta({ titulo, acciones, children, className = "" }: { titulo?: string; acciones?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-border bg-surface p-6 shadow-sm ${className}`}>
      {(titulo || acciones) && (
        <div className="mb-5 flex items-center justify-between gap-3">
          {titulo && <h2 className="text-lg font-bold text-foreground">{titulo}</h2>}
          {acciones}
        </div>
      )}
      {children}
    </section>
  );
}
