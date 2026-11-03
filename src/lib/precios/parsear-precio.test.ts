import { describe, expect, it } from "vitest";
import { parsearPrecio } from "@/lib/precios/parsear-precio";

describe("parsearPrecio", () => {
  it.each([
    ["$ 4.590", 4590],
    ["$4.590", 4590],
    ["COP 12.900", 12_900],
    ["4590", 4590],
    ["12,900", 12_900],
    ["$1.234.567", 1_234_567],
    ["1,234,567", 1_234_567],
    ["$4.590,50", 4591],
    ["$4.590,40", 4590],
    ["1.234.567,89", 1_234_568],
    ["1,234.50", 1235],
    ["12,90", 13],
    ["4.59", 5],
    ["  $ 899  ", 899],
    ["Desde $ 4.590", 4590],
  ])("entiende %j como %d", (texto, esperado) => {
    expect(parsearPrecio(texto)).toBe(esperado);
  });

  it("toma solo el primer número cuando hay varios", () => {
    expect(parsearPrecio("$4.590 + envío 5.000")).toBe(4590);
    expect(parsearPrecio("Precio: 12.900. Oferta")).toBe(12_900);
  });

  it("redondea los números que ya vienen como número", () => {
    expect(parsearPrecio(4590.4)).toBe(4590);
    expect(parsearPrecio(4590.6)).toBe(4591);
    expect(parsearPrecio(12_900)).toBe(12_900);
  });

  it.each([[""], ["   "], [null], [undefined], ["gratis"], ["$"], ["0"], ["$ 0"], [0], [-5], [Number.NaN], [Number.POSITIVE_INFINITY], ["-5"], ["- 4.590"], ["1e3"], ["2E5"]])(
    "devuelve null para %j",
    (valor) => {
      expect(parsearPrecio(valor as string | number | null | undefined)).toBeNull();
    },
  );
});
