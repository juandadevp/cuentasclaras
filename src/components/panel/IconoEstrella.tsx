/** Estrella de favoritos: rellena cuando el producto está guardado. */
export function IconoEstrella({ llena }: { llena: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill={llena ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
      <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
    </svg>
  );
}
