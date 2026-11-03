/**
 * Permite un intento por clave y ventana de tiempo. `registro` guarda la hora del último intento permitido de cada
 * clave; se limpia solo (entradas vencidas) y nunca pasa de `maximoEntradas`.
 */
export function puedeIntentar(
  registro: Map<string, number>,
  clave: string,
  ahora: number,
  ventanaMs: number,
  maximoEntradas = 1000,
): boolean {
  const ultimo = registro.get(clave);
  if (ultimo !== undefined && ahora - ultimo < ventanaMs) return false;

  if (registro.size >= maximoEntradas) {
    for (const [k, hora] of registro) if (ahora - hora >= ventanaMs) registro.delete(k);
    // Si todavía no hay lugar, se descarta lo más antiguo (el Map conserva el orden en que se agregó cada clave).
    while (registro.size >= maximoEntradas) registro.delete(registro.keys().next().value as string);
  }

  registro.delete(clave); // para que la clave quede al final del orden
  registro.set(clave, ahora);
  return true;
}
