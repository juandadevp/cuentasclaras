import { describe, expect, it } from "vitest";
import { DESTINOS_PERMITIDOS, elegirDestino, rutaSiFallaElEnlace } from "@/lib/auth-destinos";

describe("elegirDestino", () => {
  it("deja pasar los destinos de la lista", () => {
    expect(elegirDestino("/panel")).toBe("/panel");
    expect(elegirDestino("/restablecer")).toBe("/restablecer");
  });

  it("usa el panel cuando no se pide nada", () => {
    expect(elegirDestino(null)).toBe("/panel");
    expect(elegirDestino(undefined)).toBe("/panel");
    expect(elegirDestino("")).toBe("/panel");
  });

  it.each([
    "https://malo.com",
    "http://malo.com/panel",
    "//malo.com",
    "///malo.com",
    "/\\malo.com",
    "/panel/../x",
    "/panel/",
    "/panel?x=1",
    "/panel#a",
    "/PANEL",
    "/restablecer/",
    "/restablecer?x=1",
    " /panel",
    "/panel ",
    "/login",
    "/registro",
    "javascript:alert(1)",
    "%2F%2Fmalo.com",
    "/%2Fmalo.com",
    "panel",
  ])("no se deja llevar por %j y usa el panel", (pedido) => {
    expect(elegirDestino(pedido)).toBe("/panel");
  });

  it("la lista cerrada tiene solo /panel y /restablecer", () => {
    expect([...DESTINOS_PERMITIDOS]).toEqual(["/panel", "/restablecer"]);
  });
});

describe("rutaSiFallaElEnlace", () => {
  it("lleva a pedir un enlace nuevo si falla el de recuperación", () => {
    expect(rutaSiFallaElEnlace("/restablecer")).toBe("/recuperar?error=enlace");
  });

  it("lleva al login si falla cualquier otro enlace", () => {
    expect(rutaSiFallaElEnlace("/panel")).toBe("/login");
  });
});
