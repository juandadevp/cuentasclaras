import { describe, expect, it } from "vitest";
import {
  mesDePresupuesto,
  ordenarPorUso,
  progresoPresupuesto,
  resumirPresupuestos,
  ultimoMesPermitido,
  validarPresupuesto,
  type Presupuesto,
} from "@/lib/presupuestos";
import type { Categoria } from "@/types/gasto";

describe("progresoPresupuesto", () => {
  it("va bien sin gastos", () => {
    expect(progresoPresupuesto(0, 500_000)).toEqual({ porcentaje: 0, restante: 500_000, estado: "bien" });
  });

  it("va bien por debajo del 80 %", () => {
    expect(progresoPresupuesto(100_000, 500_000)).toEqual({ porcentaje: 20, restante: 400_000, estado: "bien" });
    expect(progresoPresupuesto(395_000, 500_000)).toEqual({ porcentaje: 79, restante: 105_000, estado: "bien" });
  });

  it("79,6 % sigue siendo «bien» y se muestra como 79 %", () => {
    expect(progresoPresupuesto(398_000, 500_000)).toEqual({ porcentaje: 79, restante: 102_000, estado: "bien" });
  });

  it("está cerca desde justo el 80 %", () => {
    expect(progresoPresupuesto(400_000, 500_000)).toEqual({ porcentaje: 80, restante: 100_000, estado: "cerca" });
    expect(progresoPresupuesto(495_000, 500_000)).toEqual({ porcentaje: 99, restante: 5_000, estado: "cerca" });
  });

  it("gastar exactamente el límite sigue siendo «cerca», no «excedido»", () => {
    expect(progresoPresupuesto(500_000, 500_000)).toEqual({ porcentaje: 100, restante: 0, estado: "cerca" });
  });

  it("se excede al pasar el límite aunque sea por un peso, y nunca se muestra menos de 101 %", () => {
    expect(progresoPresupuesto(500_001, 500_000)).toEqual({ porcentaje: 101, restante: -1, estado: "excedido" });
  });

  it("se excede y el restante es negativo", () => {
    expect(progresoPresupuesto(550_000, 500_000)).toEqual({ porcentaje: 110, restante: -50_000, estado: "excedido" });
  });

  it("calcula el porcentaje exacto con números que fallan en decimales", () => {
    // 0,29 * 100 da 28,999… en decimales; con enteros debe dar 29.
    expect(progresoPresupuesto(29, 100).porcentaje).toBe(29);
    expect(progresoPresupuesto(7, 100).porcentaje).toBe(7);
  });

  it("con un límite de cero no divide por cero", () => {
    expect(progresoPresupuesto(100, 0)).toEqual({ porcentaje: 0, restante: -100, estado: "bien" });
  });
});

describe("ultimoMesPermitido", () => {
  it("es el mes siguiente al actual", () => {
    expect(ultimoMesPermitido("2026-11-15")).toBe("2026-12");
  });

  it("pasa al año siguiente en diciembre", () => {
    expect(ultimoMesPermitido("2026-12-31")).toBe("2027-01");
  });

  it("de enero va a febrero", () => {
    expect(ultimoMesPermitido("2026-01-01")).toBe("2026-02");
  });

  it("completa el cero de los meses de un dígito", () => {
    expect(ultimoMesPermitido("2026-08-10")).toBe("2026-09");
  });
});

describe("validarPresupuesto", () => {
  const hoy = "2026-11-03";
  const bueno = { categoria: "alimentacion", monto: "500.000", mes: "2026-11" };
  const con = (cambios: Partial<typeof bueno>) => validarPresupuesto({ ...bueno, ...cambios }, hoy);

  it("acepta un presupuesto correcto", () => {
    expect(validarPresupuesto(bueno, hoy)).toEqual({});
  });

  it("rechaza una categoría que no existe o vacía", () => {
    expect(con({ categoria: "xx" }).categoria).toBe("Elige una categoría.");
    expect(con({ categoria: "" }).categoria).toBe("Elige una categoría.");
  });

  it.each(["vivienda", "bebes", "otros"])("acepta la categoría %s", (categoria) => {
    expect(con({ categoria }).categoria).toBeUndefined();
  });

  it("pide el límite si está vacío", () => {
    expect(con({ monto: "" }).monto).toBe("Ingresa el límite del mes.");
  });

  it("rechaza texto y decimales en el límite", () => {
    expect(con({ monto: "abc" }).monto).toBe("El límite solo puede tener números.");
    expect(con({ monto: "12,50" }).monto).toBe("El límite solo puede tener números.");
  });

  it("rechaza 0 y acepta 1", () => {
    expect(con({ monto: "0" }).monto).toBe("El límite debe ser mayor que cero.");
    expect(con({ monto: "1" }).monto).toBeUndefined();
  });

  it("acepta 999.999.999 y rechaza 1.000.000.000", () => {
    expect(con({ monto: "999.999.999" }).monto).toBeUndefined();
    expect(con({ monto: "1.000.000.000" }).monto).toBe("El límite es demasiado grande.");
  });

  it("acepta el mes siguiente, que es el último permitido", () => {
    expect(con({ mes: "2026-12" }).mes).toBeUndefined();
  });

  it("no deja planear más allá del mes siguiente", () => {
    expect(con({ mes: "2027-01" }).mes).toBe("Solo puedes planear hasta el mes siguiente.");
    expect(con({ mes: "2027-05" }).mes).toBe("Solo puedes planear hasta el mes siguiente.");
  });

  it("deja planear el 1 de enero cuando hoy es diciembre", () => {
    expect(validarPresupuesto({ ...bueno, mes: "2027-01" }, "2026-12-20").mes).toBeUndefined();
    expect(validarPresupuesto({ ...bueno, mes: "2027-02" }, "2026-12-20").mes).toBe("Solo puedes planear hasta el mes siguiente.");
  });

  it("acepta meses pasados desde enero de 2000 y rechaza antes", () => {
    expect(con({ mes: "2000-01" }).mes).toBeUndefined();
    expect(con({ mes: "1999-12" }).mes).toBe("Mes no válido.");
  });

  it.each(["", "2026-13", "2026-00", "2026-1", "26-11", "noviembre", "2026-11-01"])("rechaza el mes %j", (mes) => {
    expect(con({ mes }).mes).toBe("Mes no válido.");
  });

  it("devuelve un error por cada campo malo", () => {
    expect(Object.keys(validarPresupuesto({ categoria: "", monto: "", mes: "" }, hoy)).sort()).toEqual(["categoria", "mes", "monto"]);
  });
});

describe("mesDePresupuesto", () => {
  const hoy = "2026-11-03";

  it("usa el mes pedido si es válido", () => {
    expect(mesDePresupuesto("2026-05", hoy)).toBe("2026-05");
  });

  it("acepta el mes siguiente, el último permitido", () => {
    expect(mesDePresupuesto("2026-12", hoy)).toBe("2026-12");
  });

  it("vuelve al mes de hoy si piden uno más allá del mes siguiente", () => {
    expect(mesDePresupuesto("2027-01", hoy)).toBe("2026-11");
  });

  it("vuelve al mes de hoy si piden uno anterior a enero de 2000", () => {
    expect(mesDePresupuesto("1999-12", hoy)).toBe("2026-11");
  });

  it.each([undefined, "", "basura", "2026-13", "2026-5"])("vuelve al mes de hoy con %j", (pedido) => {
    expect(mesDePresupuesto(pedido, hoy)).toBe("2026-11");
  });
});

describe("ordenarPorUso y resumirPresupuestos", () => {
  const limite = (id: string, categoria: Categoria, monto: number): Presupuesto => ({ id, categoria, monto });
  const lista = [limite("1", "ocio", 100), limite("2", "salud", 1000), limite("3", "ropa", 500)];
  const gastado = new Map<Categoria, number>([
    ["ocio", 20],
    ["salud", 900],
    ["ropa", 600],
    ["mascotas", 5000], // sin límite: no cuenta en el resumen
  ]);

  it("ordena del que está más cerca de pasarse al que menos", () => {
    expect(ordenarPorUso(lista, gastado).map((p) => p.categoria)).toEqual(["ropa", "salud", "ocio"]);
  });

  it("no modifica la lista original", () => {
    const copia = structuredClone(lista);
    ordenarPorUso(lista, gastado);
    expect(lista).toEqual(copia);
  });

  it("una categoría sin gastos queda al final", () => {
    expect(ordenarPorUso([...lista, limite("4", "otros", 100)], gastado).at(-1)?.categoria).toBe("otros");
  });

  it("resume solo lo gastado en las categorías con límite", () => {
    expect(resumirPresupuestos(lista, gastado)).toEqual({ presupuestado: 1600, gastado: 1520, restante: 80 });
  });

  it("el restante es negativo si en total se pasó", () => {
    expect(resumirPresupuestos([limite("1", "ocio", 100)], new Map([["ocio", 150]])).restante).toBe(-50);
  });

  it("sin límites todo es cero", () => {
    expect(resumirPresupuestos([], gastado)).toEqual({ presupuestado: 0, gastado: 0, restante: 0 });
  });
});
