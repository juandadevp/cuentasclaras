import Image from "next/image";

interface Props {
  src: string;
  /** Capa de color encima de la imagen, p. ej. "bg-manzana/55". */
  capa?: string;
  className?: string;
}

/**
 * Imagen que se ajusta al tamaño del contenedor que la envuelve
 * (el padre debe ser `relative` y tener alto definido).
 * Cubre todo el espacio recortando lo que sobre, sin deformarse.
 */
export function ImagenDeFondo({ src, capa, className = "" }: Props) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <Image
        src={src}
        alt=""
        fill
        sizes="100vw"
        quality={90}
        priority
        className="size-full object-cover object-center"
      />
      {capa && <div className={`absolute inset-0 ${capa}`} />}
    </div>
  );
}
