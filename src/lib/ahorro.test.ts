import { describe, expect, it } from "vitest";
import { ahorroContraPresupuesto, categoriasQueBajaron, cambiosPorCategoria, filasDeAhorro } from "@/lib/ahorro";
import type { Presupuesto } from "@/lib/presupuestos";
import type { Categoria, Gasto } from "@/types/gasto";

let contador = 0;
const gasto = (categoria: Categoria, monto: number, fecha = "2026-10-10"): Gasto => ({
  id: String(++contador),
  descripcion: "prueba",
  categoria,
  monto,
  fecha,
});
const limite = (categoria: Categoria, monto: number): Presupuesto => ({ id: String(++contador), categoria, monto });

describe("filasDeAhorro", () => {
  const meses = [
    { mes: "2026-06", total: 0 },
    { mes: "2026-07", total: 0 },
    { mes: "2026-08", total: 500_000 },
    { mes: "2026-09", total: 400_000 },
    { mes: "2026-10", total: 450_000 },
  ];

  it("descarta los meses vacíos del principio", () => {
    expect(filasDeAhorro(meses, "2026-10").map((f) => f.mes)).toEqual(["2026-08", "2026-09", "2026-10"]);
  });

  it("el primer mes con gastos no tiene con qué compararse", () => {
    expect(filasDeAhorro(meses, "2026-10")[0].ahorro).toBeNull();
  });

  it("ahorro positivo si gastó menos que el mes anterior y negativo si gastó más", () => {
    const filas = filasDeAhorro(meses, "2026-10");
    expect(filas[1].ahorro).toBe(100_000);
    expect(filas[2].ahorro).toBe(-50_000);
  });

  it("marca solo el mes actual como en curso", () => {
    expect(filasDeAhorro(meses, "2026-10").map((f) => f.enCurso)).toEqual([false, false, true]);
  });

  it("no compara con un mes anterior sin gastos ni con un mes sin gastos", () => {
    const huecos = [
      { mes: "2026-08", total: 300_000 },
      { mes: "2026-09", total: 0 },
      { mes: "2026-10", total: 200_000 },
    ];
    const filas = filasDeAhorro(huecos, "2026-10");
    expect(filas.map((f) => f.ahorro)).toEqual([null, null, null]);
  });

  it("gastar lo mismo da un ahorro de cero, no null", () => {
    const iguales = [
      { mes: "2026-09", total: 100_000 },
      { mes: "2026-10", total: 100_000 },
    ];
    expect(filasDeAhorro(iguales, "2026-10")[1].ahorro).toBe(0);
  });

  it("sin ningún gasto no hay filas", () => {
    expect(filasDeAhorro([{ mes: "2026-10", total: 0 }], "2026-10")).toEqual([]);
    expect(filasDeAhorro([], "2026-10")).toEqual([]);
  });

  it("funciona al cruzar el cambio de año", () => {
    const anio = [
      { mes: "2026-12", total: 600_000 },
      { mes: "2027-01", total: 350_000 },
    ];
    expect(filasDeAhorro(anio, "2027-01")[1]).toEqual({ mes: "2027-01", total: 350_000, enCurso: true, ahorro: 250_000 });
  });
});

describe("cambiosPorCategoria", () => {
  it("une las categorías de los dos meses y usa 0 si falta alguna", () => {
    const actual = [gasto("alimentacion", 200_000), gasto("ocio", 50_000)];
    const anterior = [gasto("alimentacion", 300_000), gasto("transporte", 80_000)];
    expect(cambiosPorCategoria(actual, anterior)).toEqual([
      { categoria: "alimentacion", actual: 200_000, anterior: 300_000 },
      { categoria: "ocio", actual: 50_000, anterior: 0 },
      { categoria: "transporte", actual: 0, anterior: 80_000 },
    ]);
  });

  it("suma varios gastos de la misma categoría", () => {
    const actual = [gasto("salud", 10_000), gasto("salud", 15_000)];
    expect(cambiosPorCategoria(actual, [])).toEqual([{ categoria: "salud", actual: 25_000, anterior: 0 }]);
  });

  it("sin gastos en ninguno de los dos meses devuelve una lista vacía", () => {
    expect(cambiosPorCategoria([], [])).toEqual([]);
  });

  it("no modifica las listas que recibe", () => {
    const actual = [gasto("ocio", 5_000), gasto("salud", 9_000)];
    const copia = structuredClone(actual);
    cambiosPorCategoria(actual, []);
    expect(actual).toEqual(copia);
  });
});

describe("categoriasQueBajaron", () => {
  it("lista solo las que bajaron, de la mayor reducción a la menor", () => {
    const cambios = cambiosPorCategoria(
      [gasto("alimentacion", 200_000), gasto("ocio", 90_000), gasto("salud", 10_000)],
      [gasto("alimentacion", 300_000), gasto("ocio", 100_000), gasto("transporte", 50_000), gasto("salud", 10_000)],
    );
    expect(categoriasQueBajaron(cambios)).toEqual([
      { categoria: "alimentacion", actual: 200_000, anterior: 300_000, reduccion: 100_000 },
      { categoria: "transporte", actual: 0, anterior: 50_000, reduccion: 50_000 },
      { categoria: "ocio", actual: 90_000, anterior: 100_000, reduccion: 10_000 },
    ]);
  });

  it("si no bajó ninguna devuelve una lista vacía", () => {
    expect(categoriasQueBajaron(cambiosPorCategoria([gasto("ocio", 10_000)], [gasto("ocio", 10_000)]))).toEqual([]);
  });
});

describe("ahorroContraPresupuesto", () => {
  it("sin límites todo queda en cero", () => {
    expect(ahorroContraPresupuesto([], [gasto("ocio", 10_000)])).toEqual({ presupuestado: 0, gastado: 0, restante: 0, excedidas: [] });
  });

  it("calcula cuánto sobra de los límites e ignora las categorías sin límite", () => {
    const resultado = ahorroContraPresupuesto(
      [limite("alimentacion", 500_000), limite("ocio", 100_000)],
      [gasto("alimentacion", 300_000), gasto("ocio", 40_000), gasto("transporte", 999_000)],
    );
    expect(resultado).toEqual({ presupuestado: 600_000, gastado: 340_000, restante: 260_000, excedidas: [] });
  });

  it("gastar exactamente el límite no cuenta como excedido", () => {
    const resultado = ahorroContraPresupuesto([limite("ocio", 100_000)], [gasto("ocio", 100_000)]);
    expect(resultado.excedidas).toEqual([]);
    expect(resultado.restante).toBe(0);
  });

  it("lista las categorías que se pasaron, de mayor a menor exceso, y el restante total puede ser negativo", () => {
    const resultado = ahorroContraPresupuesto(
      [limite("alimentacion", 100_000), limite("ocio", 100_000), limite("salud", 100_000)],
      [gasto("alimentacion", 130_000), gasto("ocio", 180_000), gasto("salud", 20_000)],
    );
    expect(resultado.excedidas).toEqual([
      { categoria: "ocio", exceso: 80_000 },
      { categoria: "alimentacion", exceso: 30_000 },
    ]);
    // Límites: 300.000. Gastado en esas categorías: 330.000.
    expect(resultado.restante).toBe(-30_000);
  });

  it("un límite sin gastos cuenta completo como lo que sobra", () => {
    expect(ahorroContraPresupuesto([limite("mascotas", 70_000)], []).restante).toBe(70_000);
  });
});
