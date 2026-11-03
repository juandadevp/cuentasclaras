import type { ReactNode } from "react";

interface Props {
  titulo: string;
  subtitulo?: string;
  /** Contenido a la derecha del título (botones, selector de mes…). */
  children?: ReactNode;
}

/** Encabezado de cada pantalla del panel. Lleva el único `h1` de la página. */
export function TituloPagina({ titulo, subtitulo, children }: Props) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{titulo}</h1>
        {subtitulo ? <p className="mt-1 text-muted">{subtitulo}</p> : null}
      </div>
      {children}
    </div>
  );
}
