import { describe, expect, it } from "vitest";
import { progresoMeta, validarMeta } from "@/lib/metas-ahorro";

const HOY = "2026-11-18";

function esMensaje(texto: unknown) {
  expect(typeof texto).toBe("string");
  expect((texto as string).trim().length).toBeGreaterThan(0);
}

describe("validarMeta: datos válidos (CA-1)", () => {
  it("no devuelve errores con monto y mes válidos", () => {
    expect(validarMeta({ monto: "500000", mes: "2026-11" }, HOY)).toEqual({});
  });

  it("entiende «$ 500.000» y «500.000» como montos válidos", () => {
    expect(validarMeta({ monto: "$ 500.000", mes: "2026-11" }, HOY)).toEqual({});
    expect(validarMeta({ monto: "500.000", mes: "2026-12" }, HOY)).toEqual({});
  });

  it("999.999.999 es un monto válido (justo en el borde)", () => {
    expect(validarMeta({ monto: "999.999.999", mes: "2026-11" }, HOY)).toEqual({});
  });
});

describe("validarMeta: monto (CA-2)", () => {
  it.each([
    ["vacío", ""],
    ["solo espacios", "   "],
    ["texto", "mucho"],
    ["cero", "0"],
    ["negativo", "-5000"],
    ["mayor que el máximo", "1.000.000.000"],
  ])("rechaza un monto %s", (_nombre, monto) => {
    const errores = validarMeta({ monto, mes: "2026-11" }, HOY);
    expect(errores).toHaveProperty("monto");
    esMensaje(errores.monto);
    expect(errores).not.toHaveProperty("mes");
  });
});

describe("validarMeta: mes (CA-3)", () => {
  it.each([
    ["el mes actual", "2026-11"],
    ["el mes siguiente", "2026-12"],
    ["el primer mes permitido, 2000-01", "2000-01"],
  ])("acepta %s", (_nombre, mes) => {
    const errores = validarMeta({ monto: "100000", mes }, HOY);
    expect(errores).not.toHaveProperty("mes");
    expect(errores).toEqual({});
  });

  it.each([
    ["mes 13", "2026-13"],
    ["mes 00", "2026-00"],
    ["texto", "noviembre"],
    ["vacío", ""],
    ["anterior a 2000-01", "1999-12"],
    ["dos meses adelante", "2027-01"],
    ["un año adelante", "2027-11"],
  ])("rechaza un mes inválido: %s", (_nombre, mes) => {
    const errores = validarMeta({ monto: "100000", mes }, HOY);
    expect(errores).toHaveProperty("mes");
    esMensaje(errores.mes);
    expect(errores).not.toHaveProperty("monto");
  });

  it("en diciembre el mes siguiente es enero del año próximo", () => {
    const hoyDiciembre = "2026-12-15";
    expect(validarMeta({ monto: "100000", mes: "2027-01" }, hoyDiciembre)).toEqual({});
    expect(validarMeta({ monto: "100000", mes: "2027-02" }, hoyDiciembre)).toHaveProperty("mes");
  });
});

describe("validarMeta: varios errores a la vez", () => {
  it("reporta monto y mes inválidos juntos, cada uno con su clave", () => {
    const errores = validarMeta({ monto: "0", mes: "2026-13" }, HOY);
    expect(errores).toHaveProperty("monto");
    expect(errores).toHaveProperty("mes");
    esMensaje(errores.monto);
    esMensaje(errores.mes);
  });
});

describe("progresoMeta: sin meta o sin ingresos (CA-4, CA-5)", () => {
  it("sin meta no hay porcentaje ni diferencia, aunque haya ahorro", () => {
    expect(progresoMeta(100_000, null)).toEqual({ estado: "sin-meta", porcentaje: null, diferencia: null });
  });

  it("sin meta tiene prioridad sobre sin ingresos", () => {
    expect(progresoMeta(null, null)).toEqual({ estado: "sin-meta", porcentaje: null, diferencia: null });
  });

  it("con meta pero sin ahorro conocido el estado es «sin-ingresos» y no se inventa un porcentaje", () => {
    expect(progresoMeta(null, 500_000)).toEqual({ estado: "sin-ingresos", porcentaje: null, diferencia: null });
  });
});

describe("progresoMeta: por debajo (CA-6)", () => {
  it("ahorro 0 es «por-debajo», 0 % y falta toda la meta", () => {
    expect(progresoMeta(0, 500_000)).toEqual({ estado: "por-debajo", porcentaje: 0, diferencia: 500_000 });
  });

  it("ahorro negativo da 0 % (nunca negativo) y falta meta más el déficit", () => {
    expect(progresoMeta(-50_000, 500_000)).toEqual({ estado: "por-debajo", porcentaje: 0, diferencia: 550_000 });
  });

  it("a la mitad de la meta es 50 %", () => {
    expect(progresoMeta(250_000, 500_000)).toEqual({ estado: "por-debajo", porcentaje: 50, diferencia: 250_000 });
  });

  it("99,99 de 100 se muestra como 99 %, nunca 100 %, y falta 0,01", () => {
    expect(progresoMeta(99.99, 100)).toEqual({ estado: "por-debajo", porcentaje: 99, diferencia: 0.01 });
  });

  it("meta pequeña con decimales: 0,1 de 0,3 es 33 % y falta 0,2", () => {
    expect(progresoMeta(0.1, 0.3)).toEqual({ estado: "por-debajo", porcentaje: 33, diferencia: 0.2 });
  });
});

describe("progresoMeta: alcanzada (CA-7)", () => {
  it("ahorro exactamente igual a la meta es «alcanzada», 100 % y nada por faltar", () => {
    expect(progresoMeta(500_000, 500_000)).toEqual({ estado: "alcanzada", porcentaje: 100, diferencia: 0 });
  });
});

describe("progresoMeta: superada (CA-8)", () => {
  it("100,01 de 100 es «superada» y se muestra 101 %, nunca 100 %", () => {
    expect(progresoMeta(100.01, 100)).toEqual({ estado: "superada", porcentaje: 101, diferencia: 0.01 });
  });

  it("250 de 100 es 250 % y se superó por 150", () => {
    expect(progresoMeta(250, 100)).toEqual({ estado: "superada", porcentaje: 250, diferencia: 150 });
  });

  it("750.000 de 500.000 es 150 % y se superó por 250.000", () => {
    expect(progresoMeta(750_000, 500_000)).toEqual({ estado: "superada", porcentaje: 150, diferencia: 250_000 });
  });

  it("meta pequeña con decimales: 0,3 de 0,1 es 300 % y se superó por 0,2", () => {
    expect(progresoMeta(0.3, 0.1)).toEqual({ estado: "superada", porcentaje: 300, diferencia: 0.2 });
  });
});
