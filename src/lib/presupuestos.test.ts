import { describe, expect, it } from "vitest";
import { progresoPresupuesto, ultimoMesPermitido, validarPresupuesto } from "@/lib/presupuestos";

describe("progresoPresupuesto", () => {
  it("va bien por debajo del 80 %", () => {
    expect(progresoPresupuesto(100_000, 500_000)).toEqual({ porcentaje: 20, restante: 400_000, estado: "bien" });
  });

  it("está cerca a partir del 80 %", () => {
    expect(progresoPresupuesto(400_000, 500_000)).toEqual({ porcentaje: 80, restante: 100_000, estado: "cerca" });
  });

  it("gastar exactamente el límite sigue siendo «cerca», no «excedido»", () => {
    expect(progresoPresupuesto(500_000, 500_000)).toEqual({ porcentaje: 100, restante: 0, estado: "cerca" });
  });

  it("se excede al pasar el límite y el restante es negativo", () => {
    expect(progresoPresupuesto(550_000, 500_000)).toEqual({ porcentaje: 110, restante: -50_000, estado: "excedido" });
  });
});

describe("ultimoMesPermitido", () => {
  it("es el mes siguiente al actual", () => {
    expect(ultimoMesPermitido("2026-11-15")).toBe("2026-12");
  });

  it("pasa al año siguiente en diciembre", () => {
    expect(ultimoMesPermitido("2026-12-31")).toBe("2027-01");
  });
});

describe("validarPresupuesto", () => {
  const hoy = "2026-11-03";
  const bueno = { categoria: "alimentacion", monto: "500.000", mes: "2026-11" };

  it("acepta un presupuesto correcto", () => {
    expect(validarPresupuesto(bueno, hoy)).toEqual({});
  });

  it("acepta el mes siguiente, que es el último permitido", () => {
    expect(validarPresupuesto({ ...bueno, mes: "2026-12" }, hoy)).toEqual({});
  });

  it("rechaza una categoría que no existe", () => {
    expect(validarPresupuesto({ ...bueno, categoria: "xx" }, hoy).categoria).toBe("Elige una categoría.");
  });

  it("pide el monto si está vacío", () => {
    expect(validarPresupuesto({ ...bueno, monto: "" }, hoy).monto).toBe("Ingresa el límite del mes.");
  });

  it("rechaza texto en el monto", () => {
    expect(validarPresupuesto({ ...bueno, monto: "abc" }, hoy).monto).toBe("El límite solo puede tener números.");
  });

  it("rechaza un monto de cero", () => {
    expect(validarPresupuesto({ ...bueno, monto: "0" }, hoy).monto).toBe("El límite debe ser mayor que cero.");
  });

  it("rechaza un monto demasiado grande", () => {
    expect(validarPresupuesto({ ...bueno, monto: "1.000.000.000" }, hoy).monto).toBe("El límite es demasiado grande.");
  });

  it("rechaza un mes con formato inválido", () => {
    expect(validarPresupuesto({ ...bueno, mes: "2026-13" }, hoy).mes).toBe("Mes no válido.");
  });

  it("no deja planear más allá del mes siguiente", () => {
    expect(validarPresupuesto({ ...bueno, mes: "2027-05" }, hoy).mes).toBe("Solo puedes planear hasta el mes siguiente.");
  });
});
