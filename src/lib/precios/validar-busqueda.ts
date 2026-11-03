export type ValidacionBusqueda = { texto: string; error?: undefined } | { texto?: undefined; error: string };

export const BUSQUEDA_MINIMA = 2;
export const BUSQUEDA_MAXIMA = 80;

/** Limpia lo que escribió la persona (sin caracteres de control, espacios colapsados) y revisa su largo. */
export function validarBusqueda(valor: unknown): ValidacionBusqueda {
  const texto = [...String(valor ?? "")]
    .map((c) => (c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127 ? " " : c))
    .join("")
    .trim()
    .replace(/\s+/g, " ");

  if (texto.length < BUSQUEDA_MINIMA) return { error: "Escribe al menos 2 letras del producto." };
  if (texto.length > BUSQUEDA_MAXIMA) return { error: "La búsqueda es demasiado larga (máximo 80 caracteres)." };
  return { texto };
}
