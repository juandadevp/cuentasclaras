interface Props {
  /** true cuando la contraseña se está mostrando. */
  visible: boolean;
  onClick: () => void;
}

/**
 * Botón para mostrar u ocultar una contraseña.
 * Contraseña oculta (botón "Ver"): ojo abierto. Contraseña visible (botón "Ocultar"): ojo cerrado.
 */
export function BotonOjo({ visible, onClick }: Props) {
  const texto = visible ? "Ocultar contraseña" : "Mostrar contraseña";
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md p-1.5 text-muted transition-colors hover:text-brand-700"
      aria-label={texto}
      title={texto}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {visible ? (
          <>
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
            <path d="m1 1 22 22" />
          </>
        ) : (
          <>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </>
        )}
      </svg>
    </button>
  );
}
