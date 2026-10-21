/**
 * Convierte un precio escrito en texto a número de pesos.
 * Entiende los formatos habituales en Colombia y en las APIs:
 * "$ 4.590", "$4.590,50", "COP 12.900", "4590", "12,900", "4.59".
 * Devuelve null si no se puede interpretar o no es positivo.
 */
export function parsearPrecio(texto: string | number | null | undefined): number | null {
  if (typeof texto === "number") return Number.isFinite(texto) && texto > 0 ? Math.round(texto) : null;
  if (!texto) return null;

  const limpio = texto.replace(/[^\d.,]/g, "");
  if (!/\d/.test(limpio)) return null;

  const ultimoPunto = limpio.lastIndexOf(".");
  const ultimaComa = limpio.lastIndexOf(",");
  let normalizado: string;

  if (ultimoPunto !== -1 && ultimaComa !== -1) {
    // Ambos separadores: el último es el decimal y el otro separa miles.
    const decimal = ultimoPunto > ultimaComa ? "." : ",";
    const miles = decimal === "." ? "," : ".";
    normalizado = limpio.split(miles).join("").replace(decimal, ".");
  } else if (ultimaComa !== -1) {
    // Solo comas: decimal si hay 1-2 dígitos al final y una sola coma; si no, miles.
    const unaSola = limpio.indexOf(",") === ultimaComa;
    normalizado = unaSola && /,\d{1,2}$/.test(limpio) ? limpio.replace(",", ".") : limpio.split(",").join("");
  } else if (ultimoPunto !== -1) {
    // Solo puntos: miles si el último grupo tiene 3 dígitos (o hay varios puntos); si no, decimal.
    const varios = limpio.indexOf(".") !== ultimoPunto;
    normalizado = varios || /\.\d{3}$/.test(limpio) ? limpio.split(".").join("") : limpio;
  } else {
    normalizado = limpio;
  }

  const valor = Number(normalizado);
  return Number.isFinite(valor) && valor > 0 ? Math.round(valor) : null;
}
