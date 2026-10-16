import type { InputHTMLAttributes, ReactNode } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string;
  /** Mensaje de error; si existe, el campo se marca como inválido. */
  error?: string;
  /** Texto de ayuda debajo del campo (se oculta si hay error). */
  ayuda?: string;
  /** Contenido debajo del campo, alineado a la derecha, p. ej. un enlace. */
  pie?: ReactNode;
  /** Contenido dentro del campo, a la derecha (p. ej. un botón). */
  derecha?: ReactNode;
}

export function Campo({ etiqueta, error, ayuda, pie, derecha, id, className = "", ...props }: Props) {
  const campoId = id ?? props.name;
  const mensajeId = `${campoId}-mensaje`;
  const colorBorde = error
    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/15"
    : "border-border focus:border-brand-500 focus:ring-brand-500/15";

  return (
    <div>
      <label htmlFor={campoId} className="mb-1.5 block text-sm font-semibold text-foreground">
        {etiqueta}
      </label>
      <div className="relative">
        <input
          id={campoId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || ayuda ? mensajeId : undefined}
          className={`w-full rounded-[10px] border bg-surface px-3.5 py-3 text-[15px] text-foreground outline-none transition placeholder:text-neutral-400 focus:ring-4 ${colorBorde} ${derecha ? "pr-12" : ""} ${className}`}
          {...props}
        />
        {derecha && <div className="absolute inset-y-0 right-2 flex items-center">{derecha}</div>}
      </div>
      {error ? (
        <p id={mensajeId} role="alert" className="mt-1.5 text-sm text-rose-600">
          {error}
        </p>
      ) : (
        ayuda && (
          <p id={mensajeId} className="mt-1.5 text-sm text-muted">
            {ayuda}
          </p>
        )
      )}
      {pie && <div className="mt-2 text-right">{pie}</div>}
    </div>
  );
}
