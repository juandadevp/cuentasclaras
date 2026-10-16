import Image from "next/image";

interface Props {
  src: string;
  /** Capa de color encima de la imagen, p. ej. "bg-manzana/55". */
  capa?: string;
  className?: string;
  /** "cover" llena y recorta; "contain" muestra la imagen completa. */
  ajuste?: "cover" | "contain";
  /** Clases extra para la imagen, p. ej. "scale-150" para ampliarla. */
  claseImagen?: string;
}

/**
 * Imagen que se ajusta al tamaño del contenedor que la envuelve
 * (el padre debe ser `relative` y tener alto definido).
 * Cubre todo el espacio recortando lo que sobre, sin deformarse.
 */
export function ImagenDeFondo({ src, capa, className = "", ajuste = "cover", claseImagen = "" }: Props) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <Image
        src={src}
        alt=""
        fill
        sizes="100vw"
        priority
        unoptimized={/\.(gif|png)$/.test(src)}
        className={`size-full ${ajuste === "cover" ? "object-cover" : "object-contain"} ${claseImagen}`}
      />
      {capa && <div className={`absolute inset-0 ${capa}`} />}
    </div>
  );
}
