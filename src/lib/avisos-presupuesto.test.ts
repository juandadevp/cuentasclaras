import { describe, expect, it } from "vitest";
import { avisosDePresupuesto, descripcionDeAviso, enlaceAPresupuesto, type AvisoPresupuesto } from "@/lib/avisos-presupuesto";
import { formatearMoneda } from "@/lib/format";
import { etiquetaCategoria } from "@/lib/gastos";
import type { Presupuesto } from "@/lib/presupuestos";
import type { Categoria } from "@/types/gasto";

const limite = (categoria: Categoria, monto: number): Presupuesto => ({ id: `id-${categoria}`, categoria, monto });
const gastos = (...pares: [Categoria, number][]) => new Map<Categoria, number>(pares);

describe("avisosDePresupuesto: umbrales (CA-1, CA-2, CA-3, CA-4)", () => {
  it("por debajo del 80 % no hay aviso (79 %)", () => {
    expect(avisosDePresupuesto([limite("ocio", 100)], gastos(["ocio", 79]))).toEqual([]);
  });

  it("79,6 % (398.000 de 500.000) sigue sin aviso", () => {
    expect(avisosDePresupuesto([limite("alimentacion", 500_000)], gastos(["alimentacion", 398_000]))).toEqual([]);
  });

  it("exactamente el 80 % genera un aviso «cerca»", () => {
    expect(avisosDePresupuesto([limite("alimentacion", 500_000)], gastos(["alimentacion", 400_000]))).toEqual([
      { categoria: "alimentacion", gastado: 400_000, limite: 500_000, porcentaje: 80, restante: 100_000, estado: "cerca" },
    ]);
  });

  it("exactamente el 100 % sigue siendo «cerca», no «excedido»", () => {
    expect(avisosDePresupuesto([limite("ocio", 500_000)], gastos(["ocio", 500_000]))).toEqual([
      { categoria: "ocio", gastado: 500_000, limite: 500_000, porcentaje: 100, restante: 0, estado: "cerca" },
    ]);
  });

  it("un peso por encima del límite es «excedido» con 101 %", () => {
    expect(avisosDePresupuesto([limite("ocio", 500_000)], gastos(["ocio", 500_001]))).toEqual([
      { categoria: "ocio", gastado: 500_001, limite: 500_000, porcentaje: 101, restante: -1, estado: "excedido" },
    ]);
  });

  it("110 % es «excedido» y el restante es negativo", () => {
    expect(avisosDePresupuesto([limite("salud", 500_000)], gastos(["salud", 550_000]))).toEqual([
      { categoria: "salud", gastado: 550_000, limite: 500_000, porcentaje: 110, restante: -50_000, estado: "excedido" },
    ]);
  });
});

describe("avisosDePresupuesto: categorías y datos faltantes (CA-6, CA-7)", () => {
  it("una categoría sin límite no genera aviso aunque gaste mucho", () => {
    expect(avisosDePresupuesto([limite("ocio", 1000)], gastos(["mascotas", 9_000_000], ["ocio", 10]))).toEqual([]);
  });

  it("sin límites devuelve una lista vacía", () => {
    expect(avisosDePresupuesto([], gastos(["ocio", 5000]))).toEqual([]);
  });

  it("un límite sin gastos en el mapa cuenta como 0 gastado y no genera aviso", () => {
    expect(avisosDePresupuesto([limite("ropa", 1000)], gastos(["ocio", 5000]))).toEqual([]);
  });

  it("con el mapa de gastos vacío no hay avisos", () => {
    expect(avisosDePresupuesto([limite("ropa", 1000), limite("salud", 200)], new Map())).toEqual([]);
  });

  it("con varias categorías solo avisa las que llegaron al 80 %", () => {
    const avisos = avisosDePresupuesto(
      [limite("ocio", 1000), limite("ropa", 1000), limite("salud", 1000)],
      gastos(["ocio", 100], ["ropa", 800], ["salud", 1300], ["mascotas", 99_999]),
    );
    expect(avisos.map((a) => [a.categoria, a.estado])).toEqual([
      ["salud", "excedido"],
      ["ropa", "cerca"],
    ]);
  });
});

describe("avisosDePresupuesto: orden (CA-5)", () => {
  it("primero los excedidos, luego los cercanos, y mayor porcentaje primero en cada grupo", () => {
    const avisos = avisosDePresupuesto(
      [limite("alimentacion", 1000), limite("salud", 1000), limite("vivienda", 1000), limite("ocio", 1000), limite("ropa", 1000)],
      gastos(["alimentacion", 800], ["salud", 900], ["vivienda", 1000], ["ocio", 1200], ["ropa", 1500]),
    );
    // excedidos: ropa 150 %, ocio 120 %; cercanos: vivienda 100 %, salud 90 %, alimentacion 80 %.
    expect(avisos.map((a) => a.categoria)).toEqual(["ropa", "ocio", "vivienda", "salud", "alimentacion"]);
  });

  it("un cercano al 100 % va después de un excedido al 101 %, aunque llegue primero en la lista", () => {
    const avisos = avisosDePresupuesto([limite("bebes", 1000), limite("otros", 1000)], gastos(["bebes", 1000], ["otros", 1010]));
    expect(avisos.map((a) => a.categoria)).toEqual(["otros", "bebes"]);
  });

  it("si empatan en estado y porcentaje, desempata por categoría en orden alfabético", () => {
    const avisos = avisosDePresupuesto(
      [limite("ocio", 1000), limite("otros", 1000), limite("mascotas", 1000), limite("bebes", 1000), limite("ropa", 1000)],
      gastos(["ocio", 1200], ["otros", 850], ["mascotas", 1200], ["bebes", 850], ["ropa", 1000]),
    );
    // excedidos 120 %: mascotas, ocio; cercano 100 %: ropa; cercanos 85 %: bebes, otros.
    expect(avisos.map((a) => a.categoria)).toEqual(["mascotas", "ocio", "ropa", "bebes", "otros"]);
  });

  it("no modifica la lista de presupuestos recibida", () => {
    const lista = [limite("ocio", 1000), limite("ropa", 1000)];
    const copia = structuredClone(lista);
    avisosDePresupuesto(lista, gastos(["ocio", 900], ["ropa", 1500]));
    expect(lista).toEqual(copia);
  });
});

describe("descripcionDeAviso (CA-4, CA-8)", () => {
  const excedido: AvisoPresupuesto = {
    categoria: "alimentacion",
    gastado: 550_000,
    limite: 500_000,
    porcentaje: 110,
    restante: -50_000,
    estado: "excedido",
  };
  const cerca: AvisoPresupuesto = {
    categoria: "ocio",
    gastado: 400_000,
    limite: 500_000,
    porcentaje: 80,
    restante: 100_000,
    estado: "cerca",
  };

  it("un aviso excedido dice categoría, estado en palabras, gastado, límite, porcentaje y cuánto se pasó", () => {
    const texto = descripcionDeAviso(excedido);
    expect(texto).toContain(etiquetaCategoria("alimentacion"));
    expect(texto).toContain("Excedido");
    expect(texto).toContain(formatearMoneda(550_000));
    expect(texto).toContain(formatearMoneda(500_000));
    expect(texto).toContain("110");
    expect(texto).toContain(`Te pasaste por ${formatearMoneda(50_000)}`);
    expect(texto).not.toContain("Te quedan");
  });

  it("un aviso cercano dice categoría, estado en palabras, gastado, límite, porcentaje y cuánto queda", () => {
    const texto = descripcionDeAviso(cerca);
    expect(texto).toContain(etiquetaCategoria("ocio"));
    expect(texto).toContain("Cerca del límite");
    expect(texto).toContain(formatearMoneda(400_000));
    expect(texto).toContain(formatearMoneda(500_000));
    expect(texto).toContain("80");
    expect(texto).toContain(`Te quedan ${formatearMoneda(100_000)}`);
    expect(texto).not.toContain("Te pasaste");
  });

  it("gastar exactamente el límite dice «Te quedan» con cero, no «Te pasaste»", () => {
    const texto = descripcionDeAviso({ ...cerca, gastado: 500_000, porcentaje: 100, restante: 0 });
    expect(texto).toContain("Cerca del límite");
    expect(texto).toContain(`Te quedan ${formatearMoneda(0)}`);
    expect(texto).not.toContain("Te pasaste");
  });
});

describe("enlaceAPresupuesto (CA-8)", () => {
  it("lleva a Presupuesto con el mes y la categoría", () => {
    expect(enlaceAPresupuesto("2026-11", "alimentacion")).toBe("/panel/presupuesto?mes=2026-11&categoria=alimentacion");
  });

  it("usa el mes y la categoría que se le pasan", () => {
    expect(enlaceAPresupuesto("2027-01", "bebes")).toBe("/panel/presupuesto?mes=2027-01&categoria=bebes");
  });
});
