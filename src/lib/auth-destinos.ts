/** A dónde puede llevar el enlace del correo. Solo rutas de esta lista: nunca una dirección que venga en la URL. */
export const DESTINOS_PERMITIDOS = ["/panel", "/restablecer"] as const;

export type DestinoPermitido = (typeof DESTINOS_PERMITIDOS)[number];

/** El destino pedido en la URL, solo si es idéntico a uno de la lista; si no, el panel. */
export function elegirDestino(pedido: string | null | undefined): DestinoPermitido {
  return DESTINOS_PERMITIDOS.find((d) => d === pedido) ?? "/panel";
}

/** A dónde ir cuando el enlace venció, ya se usó o se abrió en otro navegador. */
export function rutaSiFallaElEnlace(destino: DestinoPermitido): string {
  return destino === "/restablecer" ? "/recuperar?error=enlace" : "/login";
}
