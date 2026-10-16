import type { InputHTMLAttributes, ReactNode } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string;
  /** Contenido a la derecha de la etiqueta, p. ej. un enlace. */
  extra?: ReactNode;
  /** Contenido dentro del campo, a la derecha (p. ej. un botón). */
  derecha?: ReactNode;
}

export function Campo({ etiqueta, extra, derecha, id, className = "", ...props }: Props) {
  const campoId = id ?? props.name;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={campoId} className="text-sm font-semibold text-foreground">
          {etiqueta}
        </label>
        {extra}
      </div>
      <div className="relative">
        <input
          id={campoId}
          className={`w-full rounded-[10px] border border-border bg-surface px-3.5 py-3 text-[15px] text-foreground outline-none transition placeholder:text-neutral-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 ${derecha ? "pr-12" : ""} ${className}`}
          {...props}
        />
        {derecha && <div className="absolute inset-y-0 right-2 flex items-center">{derecha}</div>}
      </div>
    </div>
  );
}
