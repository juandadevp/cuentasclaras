import { describe, expect, it } from "vitest";
import { parsearPrecio } from "@/lib/precios/parsear-precio";
import { parsearMonto } from "@/lib/validaciones-gasto";

describe("parsearPrecio", () => {
  it.each([
    ["$ 4.590", 4590],
    ["COP 12.900", 12_900],
    ["4590", 4590],
    ["12,900", 12_900],
    ["$1.234.567", 1_234_567],
    ["$4.590,50", 4591],
  ])("entiende %s", (texto, esperado) => {
    expect(parsearPrecio(texto)).toBe(esperado);
  });

  it("redondea los números que ya vienen como número", () => {
    expect(parsearPrecio(4590.4)).toBe(4590);
  });

  it.each([[""], [null], [undefined], ["gratis"], ["0"], [0], [-5]])("devuelve null para %s", (valor) => {
    expect(parsearPrecio(valor as string | number | null | undefined)).toBeNull();
  });
});

describe("parsearMonto", () => {
  it("quita puntos, comas, espacios y el signo de pesos", () => {
    expect(parsearMonto("12.500")).toBe(12_500);
    expect(parsearMonto("$ 12 500")).toBe(12_500);
  });

  it("devuelve null si no es un número entero", () => {
    expect(parsearMonto("abc")).toBeNull();
    expect(parsearMonto("")).toBeNull();
  });
});
