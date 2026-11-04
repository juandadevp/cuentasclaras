const iconoCarrito = (
  <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 7h15l-1.5 8h-12z" />
    <path d="M6 7 5 3H2" />
    <circle cx="9" cy="19" r="1.5" />
    <circle cx="18" cy="19" r="1.5" />
  </svg>
);

/** Foto del producto, o un carrito si no tiene. Las fotos vienen de muchas tiendas: se piden sin enviar el `Referer`. */
export function ImagenProducto({ src }: { src?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" className="size-20 shrink-0 rounded-lg bg-white object-contain" />;
  }
  return (
    <span className="grid size-20 shrink-0 place-items-center rounded-lg bg-neutral-100 text-neutral-400" aria-hidden>
      {iconoCarrito}
    </span>
  );
}
