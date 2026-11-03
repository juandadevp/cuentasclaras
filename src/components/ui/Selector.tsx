import type { SelectHTMLAttributes } from "react";

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  etiqueta: string;
  /** Mensaje de error; si existe, la lista se marca como inválida. */
  error?: string;
  /** Texto de la opción vacía (p. ej. «Elige una categoría»). */
  placeholder?: string;
  /** Oculta la etiqueta a la vista pero la deja para lectores de pantalla. */
  etiquetaOculta?: boolean;
}

/** Lista desplegable con etiqueta y mensaje de error accesible. Las opciones van como hijos. */
export function Selector({ etiqueta, error, placeholder, etiquetaOculta, id, className = "", children, value, ...props }: Props) {
  const campoId = id ?? props.name;
  const mensajeId = `${campoId}-mensaje`;
  const colorBorde = error
    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/15"
    : "border-border focus:border-brand-500 focus:ring-brand-500/15";
  const sinElegir = value === "";

  return (
    <div>
      <label htmlFor={campoId} className={etiquetaOculta ? "sr-only" : "mb-1.5 block text-sm font-semibold text-foreground"}>
        {etiqueta}
      </label>
      <select
        id={campoId}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? mensajeId : undefined}
        className={`w-full rounded-[10px] border bg-surface px-3.5 py-3 text-[15px] outline-none transition focus:ring-4 ${colorBorde} ${
          sinElegir ? "text-neutral-400" : "text-foreground"
        } ${className}`}
        {...props}
      >
        {placeholder !== undefined ? (
          <option value="" disabled={value !== undefined}>
            {placeholder}
          </option>
        ) : null}
        {children}
      </select>
      {error ? (
        <p id={mensajeId} role="alert" className="mt-1.5 text-sm text-rose-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
