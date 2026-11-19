import { describe, expect, it } from "vitest";
import {
  anioDeResumen,
  mesesDelAnio,
  resumirAnio,
} from "./resumen-anual";
import type { Categoria, Gasto } from "@/types/gasto";

let contador = 0;
const gasto = (categoria: Categoria, monto: number, fecha: string): Gasto => ({
  id: String(++contador),
  descripcion: "prueba",
  monto,
  categoria,
  fecha,
});

const HOY = "2026-03-15";

describe("anioDeResumen (CA-1)", () => {
  it("usa el año pedido si es válido", () => {
    expect(anioDeResumen("2025", HOY)).toBe(2025);
  });

  it("2000 es el borde inferior permitido", () => {
    expect(anioDeResumen("2000", HOY)).toBe(2000);
  });

  it("1999 queda por debajo del límite y usa el año de hoy", () => {
    expect(anioDeResumen("1999", HOY)).toBe(2026);
  });

  it("el año de hoy es el borde superior permitido", () => {
    expect(anioDeResumen("2026", HOY)).toBe(2026);
  });

  it("un año futuro usa el año de hoy", () => {
    expect(anioDeResumen("2027", HOY)).toBe(2026);
    expect(anioDeResumen("3000", HOY)).toBe(2026);
  });

  it("el límite superior sigue al año de hoy que se le pasa", () => {
    expect(anioDeResumen("2029", "2030-01-01")).toBe(2029);
    expect(anioDeResumen("2030", "2030-01-01")).toBe(2030);
    expect(anioDeResumen("2031", "2030-01-01")).toBe(2030);
  });

  it("texto, vacío o ausente usa el año de hoy", () => {
    expect(anioDeResumen("abc", HOY)).toBe(2026);
    expect(anioDeResumen("", HOY)).toBe(2026);
    expect(anioDeResumen(undefined, HOY)).toBe(2026);
  });

  it("exige exactamente cuatro cifras", () => {
    expect(anioDeResumen("202", HOY)).toBe(2026);
    expect(anioDeResumen("20255", HOY)).toBe(2026);
  });

  it("no acepta espacios, signos ni decimales", () => {
    expect(anioDeResumen(" 2025", HOY)).toBe(2026);
    expect(anioDeResumen("2025 ", HOY)).toBe(2026);
    expect(anioDeResumen("-2025", HOY)).toBe(2026);
    expect(anioDeResumen("2025.5", HOY)).toBe(2026);
    expect(anioDeResumen("2e03", HOY)).toBe(2026);
  });
});

describe("mesesDelAnio (CA-2)", () => {
  it("devuelve los doce meses de enero a diciembre con formato AAAA-MM", () => {
    expect(mesesDelAnio(2025)).toEqual([
      "2025-01",
      "2025-02",
      "2025-03",
      "2025-04",
      "2025-05",
      "2025-06",
      "2025-07",
      "2025-08",
      "2025-09",
      "2025-10",
      "2025-11",
      "2025-12",
    ]);
  });

  it("usa el año que se le pide", () => {
    const meses = mesesDelAnio(2000);
    expect(meses).toHaveLength(12);
    expect(meses[0]).toBe("2000-01");
    expect(meses[11]).toBe("2000-12");
  });
});

describe("resumirAnio", () => {
  const gastos2025 = [
    gasto("vivienda", 1000, "2025-01-10"),
    gasto("alimentacion", 500, "2025-01-31"),
    gasto("transporte", 300, "2025-03-05"),
    gasto("ocio", 200, "2025-12-31"),
  ];

  describe("meses (CA-3)", () => {
    it("trae siempre doce meses de enero a diciembre", () => {
      const r = resumirAnio(gastos2025, 2025);
      expect(r.anio).toBe(2025);
      expect(r.meses.map((m) => m.mes)).toEqual(mesesDelAnio(2025));
    });

    it("suma por mes y deja en 0 los meses sin gastos", () => {
      const r = resumirAnio(gastos2025, 2025);
      expect(r.meses.map((m) => m.total)).toEqual([
        1500, 0, 300, 0, 0, 0, 0, 0, 0, 0, 0, 200,
      ]);
    });

    it("ignora los gastos de otros años", () => {
      const r = resumirAnio(
        [
          ...gastos2025,
          gasto("vivienda", 9999, "2024-12-31"),
          gasto("vivienda", 7777, "2026-01-01"),
        ],
        2025,
      );
      expect(r.total).toBe(2000);
      expect(r.cantidad).toBe(4);
      expect(r.meses[0].total).toBe(1500);
      expect(r.meses[11].total).toBe(200);
      expect(r.categorias.map((c) => c.categoria)).toEqual([
        "vivienda",
        "alimentacion",
        "transporte",
        "ocio",
      ]);
    });

    it("no depende del orden de la lista", () => {
      const r = resumirAnio([...gastos2025].reverse(), 2025);
      expect(r.meses.map((m) => m.total)).toEqual([
        1500, 0, 300, 0, 0, 0, 0, 0, 0, 0, 0, 200,
      ]);
    });
  });

  describe("total, cantidad y promedio (CA-4)", () => {
    it("suma los montos y cuenta los gastos", () => {
      const r = resumirAnio(gastos2025, 2025);
      expect(r.total).toBe(2000);
      expect(r.cantidad).toBe(4);
    });

    it("el promedio es el total entre 12 redondeado al peso (2000/12 = 166,67 → 167)", () => {
      expect(resumirAnio(gastos2025, 2025).promedioMensual).toBe(167);
    });

    it("el promedio exacto no se altera (1200/12 = 100)", () => {
      const r = resumirAnio([gasto("otros", 1200, "2025-06-01")], 2025);
      expect(r.promedioMensual).toBe(100);
    });

    it("redondea hacia arriba justo en la mitad (6/12 = 0,5 → 1)", () => {
      const r = resumirAnio([gasto("otros", 6, "2025-06-01")], 2025);
      expect(r.promedioMensual).toBe(1);
    });

    it("redondea hacia abajo por debajo de la mitad (5/12 = 0,42 → 0)", () => {
      const r = resumirAnio([gasto("otros", 5, "2025-06-01")], 2025);
      expect(r.promedioMensual).toBe(0);
    });

    it("divide siempre entre 12 aunque solo haya un mes con gastos", () => {
      const r = resumirAnio([gasto("otros", 12000, "2025-02-10")], 2025);
      expect(r.promedioMensual).toBe(1000);
    });
  });

  describe("categorías (CA-5)", () => {
    it("solo salen las categorías con gastos, de mayor a menor total, con su porcentaje", () => {
      const r = resumirAnio(gastos2025, 2025);
      expect(r.categorias).toEqual([
        { categoria: "vivienda", total: 1000, porcentaje: 50 },
        { categoria: "alimentacion", total: 500, porcentaje: 25 },
        { categoria: "transporte", total: 300, porcentaje: 15 },
        { categoria: "ocio", total: 200, porcentaje: 10 },
      ]);
    });

    it("suma varios gastos de la misma categoría", () => {
      const r = resumirAnio(
        [
          gasto("salud", 100, "2025-02-01"),
          gasto("salud", 250, "2025-07-01"),
          gasto("ropa", 50, "2025-08-01"),
        ],
        2025,
      );
      expect(r.categorias).toEqual([
        { categoria: "salud", total: 350, porcentaje: 88 },
        { categoria: "ropa", total: 50, porcentaje: 13 },
      ]);
    });

    it("ordena por total aunque el orden de entrada sea el contrario", () => {
      const r = resumirAnio(
        [gasto("ocio", 10, "2025-01-01"), gasto("salud", 90, "2025-01-02")],
        2025,
      );
      expect(r.categorias.map((c) => c.categoria)).toEqual(["salud", "ocio"]);
    });

    it("si empatan, desempata por nombre de categoría", () => {
      const r = resumirAnio(
        [
          gasto("salud", 100, "2025-01-01"),
          gasto("ocio", 100, "2025-01-02"),
          gasto("alimentacion", 100, "2025-01-03"),
        ],
        2025,
      );
      expect(r.categorias.map((c) => c.categoria)).toEqual([
        "alimentacion",
        "ocio",
        "salud",
      ]);
    });

    it("el porcentaje es un entero redondeado (1/3 → 33 %, 2/3 → 67 %)", () => {
      const r = resumirAnio(
        [gasto("ocio", 2, "2025-01-01"), gasto("salud", 1, "2025-01-02")],
        2025,
      );
      expect(r.categorias).toEqual([
        { categoria: "ocio", total: 2, porcentaje: 67 },
        { categoria: "salud", total: 1, porcentaje: 33 },
      ]);
    });

    it("redondea hacia arriba justo en la mitad (0,5 % → 1 %, 99,5 % → 100 %)", () => {
      const r = resumirAnio(
        [gasto("ocio", 1, "2025-01-01"), gasto("salud", 199, "2025-01-02")],
        2025,
      );
      expect(r.categorias).toEqual([
        { categoria: "salud", total: 199, porcentaje: 100 },
        { categoria: "ocio", total: 1, porcentaje: 1 },
      ]);
    });

    it("una sola categoría es el 100 %", () => {
      const r = resumirAnio([gasto("mascotas", 40, "2025-05-05")], 2025);
      expect(r.categorias).toEqual([
        { categoria: "mascotas", total: 40, porcentaje: 100 },
      ]);
    });

    it("no cuenta categorías cuyos gastos son de otro año", () => {
      const r = resumirAnio(
        [gasto("ocio", 10, "2025-01-01"), gasto("salud", 90, "2024-01-01")],
        2025,
      );
      expect(r.categorias).toEqual([
        { categoria: "ocio", total: 10, porcentaje: 100 },
      ]);
    });
  });

  describe("mes de mayor gasto (CA-6)", () => {
    it("es el mes con el total más alto", () => {
      expect(resumirAnio(gastos2025, 2025).mesMayor).toBe("2025-01");
    });

    it("suma los gastos del mes antes de comparar", () => {
      const r = resumirAnio(
        [
          gasto("ocio", 60, "2025-04-01"),
          gasto("ocio", 60, "2025-04-20"),
          gasto("ocio", 100, "2025-09-10"),
        ],
        2025,
      );
      expect(r.mesMayor).toBe("2025-04");
    });

    it("si empatan, es el primero del año", () => {
      const r = resumirAnio(
        [
          gasto("ocio", 100, "2025-11-01"),
          gasto("ocio", 100, "2025-02-01"),
          gasto("ocio", 50, "2025-01-01"),
        ],
        2025,
      );
      expect(r.mesMayor).toBe("2025-02");
    });

    it("es nulo si el año no tiene gastos", () => {
      expect(resumirAnio([], 2025).mesMayor).toBeNull();
    });
  });

  describe("año sin gastos (CA-7)", () => {
    it("todo queda en 0, sin categorías y sin mes mayor", () => {
      const r = resumirAnio([], 2025);
      expect(r.anio).toBe(2025);
      expect(r.total).toBe(0);
      expect(r.cantidad).toBe(0);
      expect(r.promedioMensual).toBe(0);
      expect(r.categorias).toEqual([]);
      expect(r.mesMayor).toBeNull();
      expect(r.meses).toHaveLength(12);
      expect(r.meses.every((m) => m.total === 0)).toBe(true);
      expect(r.meses.map((m) => m.mes)).toEqual(mesesDelAnio(2025));
    });

    it("con gastos solo de otros años también queda vacío", () => {
      const r = resumirAnio(
        [gasto("ocio", 500, "2024-06-01"), gasto("salud", 800, "2026-06-01")],
        2025,
      );
      expect(r.total).toBe(0);
      expect(r.cantidad).toBe(0);
      expect(r.categorias).toEqual([]);
      expect(r.mesMayor).toBeNull();
      expect(r.meses.every((m) => m.total === 0)).toBe(true);
    });
  });

  describe("borde de año (CA-8)", () => {
    const frontera = [
      gasto("ocio", 300, "2025-12-31"),
      gasto("salud", 700, "2026-01-01"),
    ];

    it("el 31 de diciembre cuenta en su año y no en el siguiente", () => {
      const r = resumirAnio(frontera, 2025);
      expect(r.total).toBe(300);
      expect(r.cantidad).toBe(1);
      expect(r.meses[11]).toEqual({ mes: "2025-12", total: 300 });
      expect(r.meses[0].total).toBe(0);
    });

    it("el 1 de enero cuenta en el año nuevo y no en el anterior", () => {
      const r = resumirAnio(frontera, 2026);
      expect(r.total).toBe(700);
      expect(r.cantidad).toBe(1);
      expect(r.meses[0]).toEqual({ mes: "2026-01", total: 700 });
      expect(r.meses[11].total).toBe(0);
    });
  });

  it("no modifica la lista de gastos que recibe", () => {
    const entrada = [
      gasto("ocio", 5, "2025-12-01"),
      gasto("vivienda", 50, "2025-01-01"),
      gasto("salud", 20, "2024-05-05"),
    ];
    const copia = structuredClone(entrada);
    resumirAnio(entrada, 2025);
    expect(entrada).toEqual(copia);
  });
});
