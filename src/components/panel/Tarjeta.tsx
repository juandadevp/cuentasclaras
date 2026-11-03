import type { ReactNode } from "react";

interface Props {
  titulo?: ReactNode;
  /** Contenido a la derecha del título, p. ej. un enlace «Ver todos». */
  acciones?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Caja con borde y sombra suave que agrupa un bloque del panel. */
export function Tarjeta({ titulo, acciones, className = "", children }: Props) {
  return (
    <section className={`min-w-0 rounded-2xl border border-border bg-surface p-6 shadow-sm ${className}`}>
      {titulo || acciones ? (
        <div className="mb-5 flex items-center justify-between gap-3">
          {titulo ? <h2 className="text-lg font-bold text-foreground">{titulo}</h2> : null}
          {acciones}
        </div>
      ) : null}
      {children}
    </section>
  );
}
