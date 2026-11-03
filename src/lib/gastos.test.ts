import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { categorias } from "@/config/site";
import {
  coloresBase,
  coloresCategoria,
  fechaIso,
  mezclar,
  resumirInicio,
  totalesPorMes,
  totalGastos,
  totalPorCategoria,
  ultimosMeses,
  variacion,
} from "@/lib/gastos";
import type { Categoria, Gasto } from "@/types/gasto";

let contador = 0;
const gasto = (categoria: Categoria, monto: number, fecha: string): Gasto => ({
  id: String(++contador),
  descripcion: "prueba",
  monto,
  categoria,
  fecha,
});

describe("variacion", () => {
  it("calcula cuánto subió", () => {
    expect(variacion(150, 100)).toBe(50);
  });

  it("calcula cuánto bajó", () => {
    expect(variacion(50, 100)).toBe(-50);
  });

  it("da 0 cuando no cambia", () => {
    expect(variacion(100, 100)).toBe(0);
  });

  it("redondea al entero más cercano", () => {
    expect(variacion(4, 3)).toBe(33);
    expect(variacion(5, 3)).toBe(67);
  });

  it("devuelve null si el mes anterior no tiene gastos", () => {
    expect(variacion(100, 0)).toBeNull();
  });

  it("devuelve null si la base de comparación es negativa", () => {
    expect(variacion(100, -5)).toBeNull();
  });
});

describe("totalGastos", () => {
  it("es 0 sin gastos", () => {
    expect(totalGastos([])).toBe(0);
  });

  it("suma todos los montos", () => {
    expect(totalGastos([gasto("ocio", 1000, "2026-11-01"), gasto("salud", 2500, "2026-11-02")])).toBe(3500);
  });
});

describe("totalPorCategoria", () => {
  it("devuelve una lista vacía sin gastos", () => {
    expect(totalPorCategoria([])).toEqual([]);
  });

  it("suma los gastos de la misma categoría", () => {
    const lista = [gasto("ocio", 1000, "2026-11-01"), gasto("ocio", 500, "2026-11-02")];
    expect(totalPorCategoria(lista)).toEqual([{ categoria: "ocio", total: 1500 }]);
  });

  it("ordena de la categoría con más gasto a la que menos", () => {
    const lista = [gasto("ocio", 100, "2026-11-01"), gasto("salud", 900, "2026-11-01"), gasto("ropa", 400, "2026-11-01")];
    expect(totalPorCategoria(lista).map((c) => c.categoria)).toEqual(["salud", "ropa", "ocio"]);
  });

  it("no modifica la lista original", () => {
    const lista = [gasto("ocio", 100, "2026-11-01"), gasto("salud", 900, "2026-11-01")];
    const copia = structuredClone(lista);
    totalPorCategoria(lista);
    expect(lista).toEqual(copia);
  });
});

describe("ultimosMeses", () => {
  it("devuelve los 6 meses terminando en el indicado", () => {
    expect(ultimosMeses("2026-11", 6)).toEqual(["2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"]);
  });

  it("cruza el cambio de año", () => {
    expect(ultimosMeses("2026-02", 6)).toEqual(["2025-09", "2025-10", "2025-11", "2025-12", "2026-01", "2026-02"]);
  });

  it("devuelve solo el mes indicado si se pide uno", () => {
    expect(ultimosMeses("2026-01", 1)).toEqual(["2026-01"]);
  });

  it("termina en diciembre sin pasarse de año", () => {
    expect(ultimosMeses("2026-12", 2)).toEqual(["2026-11", "2026-12"]);
  });
});

describe("totalesPorMes", () => {
  const meses = ["2026-09", "2026-10", "2026-11"];

  it("deja en 0 los meses sin gastos", () => {
    expect(totalesPorMes([], meses)).toEqual([
      { mes: "2026-09", total: 0 },
      { mes: "2026-10", total: 0 },
      { mes: "2026-11", total: 0 },
    ]);
  });

  it("suma los gastos de cada mes", () => {
    const lista = [gasto("ocio", 100, "2026-10-03"), gasto("salud", 200, "2026-10-28"), gasto("ropa", 50, "2026-11-01")];
    expect(totalesPorMes(lista, meses).map((m) => m.total)).toEqual([0, 300, 50]);
  });

  it("ignora los gastos de meses fuera de la lista", () => {
    expect(totalesPorMes([gasto("ocio", 999, "2026-01-15")], meses).map((m) => m.total)).toEqual([0, 0, 0]);
  });
});

describe("fechaIso", () => {
  it("usa la fecha de Colombia, que va 5 horas atrás de UTC", () => {
    expect(fechaIso(new Date("2026-11-03T03:00:00Z"))).toBe("2026-11-02");
  });

  it("cambia de día justo a la medianoche de Colombia", () => {
    expect(fechaIso(new Date("2026-11-03T04:59:59Z"))).toBe("2026-11-02");
    expect(fechaIso(new Date("2026-11-03T05:00:00Z"))).toBe("2026-11-03");
  });
});

describe("resumirInicio", () => {
  it("funciona sin gastos", () => {
    const r = resumirInicio([], "2026-11-03");
    expect(r.mes).toBe("2026-11");
    expect(r.total).toBe(0);
    expect(r.cantidad).toBe(0);
    expect(r.porCategoria).toEqual([]);
    expect(r.mayor).toBeUndefined();
    expect(r.variacion).toBeNull();
    expect(r.meses).toHaveLength(6);
    expect(r.meses.every((m) => m.total === 0)).toBe(true);
  });

  it("resume el mes de hoy y lo compara con el anterior", () => {
    const lista = [
      gasto("alimentacion", 300, "2026-11-01"),
      gasto("alimentacion", 100, "2026-11-02"),
      gasto("ocio", 200, "2026-11-02"),
      gasto("ocio", 400, "2026-10-15"),
    ];
    const r = resumirInicio(lista, "2026-11-03");
    expect(r.total).toBe(600);
    expect(r.cantidad).toBe(3);
    expect(r.mayor).toEqual({ categoria: "alimentacion", total: 400 });
    expect(r.variacion).toBe(50);
    expect(r.meses[r.meses.length - 1]).toEqual({ mes: "2026-11", total: 600 });
  });
});

describe("mezclar", () => {
  it("con parte 0 deja el color igual", () => {
    expect(mezclar("#3f9a58", "#ffffff", 0)).toBe("#3f9a58");
  });

  it("con parte 1 llega al color de destino", () => {
    expect(mezclar("#3f9a58", "#ffffff", 1)).toBe("#ffffff");
    expect(mezclar("#3f9a58", "#000000", 1)).toBe("#000000");
  });

  it("aclara y oscurece a la mitad", () => {
    expect(mezclar("#000000", "#ffffff", 0.5)).toBe("#808080");
    expect(mezclar("#ffffff", "#000000", 0.5)).toBe("#808080");
  });
});

describe("coloresCategoria", () => {
  it("tiene un color para cada una de las 12 categorías", () => {
    expect(Object.keys(coloresCategoria).sort()).toEqual(categorias.map((c) => c.valor).sort());
  });

  it("no repite colores", () => {
    expect(new Set(Object.values(coloresCategoria)).size).toBe(12);
  });

  it("usa colores base que existen como tokens en globals.css", () => {
    const css = readFileSync("src/app/globals.css", "utf8").toLowerCase();
    for (const hex of Object.values(coloresBase)) expect(css).toContain(hex);
  });
});
