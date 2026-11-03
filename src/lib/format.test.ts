import { describe, expect, it } from "vitest";
import { formatearFecha, formatearMoneda } from "./format";

// Intl separa el símbolo con un espacio de no separación; se normaliza para comparar.
const normalizar = (texto: string) => texto.replace(/\s/g, " ");

describe("formatearMoneda", () => {
  it("usa pesos colombianos sin decimales", () => {
    expect(normalizar(formatearMoneda(1500000))).toBe("$ 1.500.000");
  });

  it("redondea los centavos", () => {
    expect(normalizar(formatearMoneda(1999.6))).toBe("$ 2.000");
  });
});

describe("formatearFecha", () => {
  it("muestra día/mes/año sin desfasar el día", () => {
    expect(formatearFecha("2026-11-03")).toBe("3/11/2026");
  });

  it("no lanza error con una fecha inválida", () => {
    expect(() => formatearFecha("no-es-fecha")).not.toThrow();
  });
});
