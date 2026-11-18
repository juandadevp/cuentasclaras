import { describe, expect, it } from "vitest";
import {
  calcularAhorroReal,
  etiquetaTipoIngreso,
  resumirIngresos,
  validarIngreso,
} from "@/lib/ingresos";
import type { Ingreso } from "@/types/ingreso";

const HOY = "2026-11-18";

const validos = {
  descripcion: "Salario de noviembre",
  tipo: "salario",
  monto: "$ 1.500.000",
  fecha: "2026-11-10",
};

function con(cambios: Partial<typeof validos>) {
  return validarIngreso({ ...validos, ...cambios }, HOY);
}

function ingreso(id: string, tipo: Ingreso["tipo"], monto: number): Ingreso {
  return { id, descripcion: "Ingreso " + id, tipo, monto, fecha: "2026-11-05" };
}

describe("validarIngreso", () => {
  it("CA-1: datos válidos no producen errores", () => {
    expect(validarIngreso(validos, HOY)).toEqual({});
  });

  describe("descripción (CA-2)", () => {
    it("1 carácter es inválido", () => {
      const e = con({ descripcion: "a" });
      expect(e).toHaveProperty("descripcion");
      expect(e.descripcion).toBeTruthy();
    });

    it("2 caracteres es válido", () => {
      expect(con({ descripcion: "ab" })).not.toHaveProperty("descripcion");
    });

    it("80 caracteres es válido", () => {
      expect(con({ descripcion: "a".repeat(80) })).not.toHaveProperty("descripcion");
    });

    it("81 caracteres es inválido", () => {
      expect(con({ descripcion: "a".repeat(81) })).toHaveProperty("descripcion");
    });

    it("solo espacios es inválido", () => {
      expect(con({ descripcion: "     " })).toHaveProperty("descripcion");
    });

    it("los espacios de los extremos no cuentan: ' a ' es inválido", () => {
      expect(con({ descripcion: "   a   " })).toHaveProperty("descripcion");
    });

    it("80 caracteres con espacios en los extremos es válido", () => {
      expect(con({ descripcion: "  " + "a".repeat(80) + "  " })).not.toHaveProperty("descripcion");
    });

    it("los espacios repetidos se colapsan: 'a    b' cuenta como 3 y es válido", () => {
      expect(con({ descripcion: "a    b" })).not.toHaveProperty("descripcion");
    });

    it("espacios repetidos que al colapsar bajan de 81 a 80 son válidos", () => {
      // En crudo: 39 + 5 + 40 = 84 caracteres; colapsado: 39 + 1 + 40 = 80.
      const texto = "a".repeat(39) + "     " + "a".repeat(40);
      expect(con({ descripcion: texto })).not.toHaveProperty("descripcion");
    });
  });

  describe("monto (CA-3)", () => {
    it.each(["", "   ", "abc", "0", "-5", "-1.500.000", "1.000.000.000"])(
      "monto %j es inválido",
      (monto) => {
        const e = con({ monto });
        expect(e).toHaveProperty("monto");
        expect(e.monto).toBeTruthy();
      },
    );

    it.each(["$ 1.500.000", "1.500.000", "12,500", "999.999.999", "1"])(
      "monto %j es válido",
      (monto) => {
        expect(con({ monto })).not.toHaveProperty("monto");
      },
    );
  });

  describe("tipo (CA-4)", () => {
    it.each(["salario", "ventas", "honorarios", "otros"])("%s es válido", (tipo) => {
      expect(con({ tipo })).not.toHaveProperty("tipo");
    });

    it.each(["", "regalo", "Salario", "SALARIO"])("%j es inválido", (tipo) => {
      const e = con({ tipo });
      expect(e).toHaveProperty("tipo");
      expect(e.tipo).toBeTruthy();
    });
  });

  describe("fecha (CA-5)", () => {
    it("hoy es válida", () => {
      expect(con({ fecha: HOY })).not.toHaveProperty("fecha");
    });

    it("mañana es inválida", () => {
      const e = con({ fecha: "2026-11-19" });
      expect(e).toHaveProperty("fecha");
      expect(e.fecha).toBeTruthy();
    });

    it("2000-01-01 es válida", () => {
      expect(con({ fecha: "2000-01-01" })).not.toHaveProperty("fecha");
    });

    it("1999-12-31 es inválida", () => {
      expect(con({ fecha: "1999-12-31" })).toHaveProperty("fecha");
    });

    it("2026-02-30 no existe", () => {
      expect(con({ fecha: "2026-02-30" })).toHaveProperty("fecha");
    });

    it("2026-02-29 no existe (2026 no es bisiesto)", () => {
      expect(con({ fecha: "2026-02-29" })).toHaveProperty("fecha");
    });

    it("2024-02-29 existe (2024 es bisiesto)", () => {
      expect(con({ fecha: "2024-02-29" })).not.toHaveProperty("fecha");
    });

    it.each(["18/11/2026", "", "2026-1-5", "ayer"])("formato %j es inválido", (fecha) => {
      expect(con({ fecha })).toHaveProperty("fecha");
    });
  });

  it("cada campo inválido aparece y los válidos no", () => {
    const e = validarIngreso({ descripcion: "a", tipo: "x", monto: "0", fecha: "2026-02-30" }, HOY);
    expect(Object.keys(e).sort()).toEqual(["descripcion", "fecha", "monto", "tipo"]);
  });

  it("un solo campo inválido deja los demás sin error", () => {
    const e = con({ monto: "-1" });
    expect(Object.keys(e)).toEqual(["monto"]);
  });
});

describe("resumirIngresos", () => {
  it("lista vacía devuelve ceros y sin desglose", () => {
    expect(resumirIngresos([])).toEqual({ total: 0, cantidad: 0, porTipo: [] });
  });

  it("CA-6: suma los montos y cuenta los ingresos", () => {
    const r = resumirIngresos([
      ingreso("1", "salario", 1000000),
      ingreso("2", "ventas", 250000),
      ingreso("3", "salario", 500000),
    ]);
    expect(r.total).toBe(1750000);
    expect(r.cantidad).toBe(3);
  });

  it("CA-6: el desglose va de mayor a menor y solo incluye tipos con ingresos", () => {
    const r = resumirIngresos([
      ingreso("1", "ventas", 250000),
      ingreso("2", "salario", 1000000),
      ingreso("3", "ventas", 100000),
      ingreso("4", "otros", 400000),
    ]);
    expect(r.porTipo).toEqual([
      { tipo: "salario", total: 1000000 },
      { tipo: "otros", total: 400000 },
      { tipo: "ventas", total: 350000 },
    ]);
  });

  it("si empatan en total, se ordenan por tipo ascendente", () => {
    const r = resumirIngresos([
      ingreso("1", "ventas", 100),
      ingreso("2", "honorarios", 100),
      ingreso("3", "otros", 100),
      ingreso("4", "salario", 500),
    ]);
    expect(r.porTipo).toEqual([
      { tipo: "salario", total: 500 },
      { tipo: "honorarios", total: 100 },
      { tipo: "otros", total: 100 },
      { tipo: "ventas", total: 100 },
    ]);
  });

  it("no muta la lista de entrada", () => {
    const lista = [ingreso("1", "ventas", 10), ingreso("2", "salario", 20)];
    const copia = structuredClone(lista);
    resumirIngresos(lista);
    expect(lista).toEqual(copia);
  });
});

describe("calcularAhorroReal", () => {
  it("CA-7: sobra cuando entra más de lo que se gasta", () => {
    expect(calcularAhorroReal(3000000, 2000000, 2)).toEqual({ estado: "sobra", ahorro: 1000000 });
  });

  it("CA-7: falta cuando se gastó más de lo que entró (ahorro negativo)", () => {
    expect(calcularAhorroReal(1000000, 1500000, 1)).toEqual({ estado: "falta", ahorro: -500000 });
  });

  it("CA-7: justo cuando ingresos y gastos son iguales", () => {
    expect(calcularAhorroReal(800000, 800000, 1)).toEqual({ estado: "justo", ahorro: 0 });
  });

  it("CA-8: sin ingresos no se inventa un valor, aunque haya gastos", () => {
    expect(calcularAhorroReal(0, 500000, 0)).toEqual({ estado: "sin-ingresos", ahorro: null });
  });

  it("CA-8: sin ingresos y sin gastos también es «sin-ingresos»", () => {
    expect(calcularAhorroReal(0, 0, 0)).toEqual({ estado: "sin-ingresos", ahorro: null });
  });

  it("con ingresos pero sin gastos sobra todo", () => {
    expect(calcularAhorroReal(250000, 0, 1)).toEqual({ estado: "sobra", ahorro: 250000 });
  });

  it("redondea a 2 decimales: 0,3 - 0,2 es 0,1", () => {
    expect(calcularAhorroReal(0.3, 0.2, 1)).toEqual({ estado: "sobra", ahorro: 0.1 });
  });

  it("redondea el resultado negativo: 0,1 - 0,3 es -0,2", () => {
    expect(calcularAhorroReal(0.1, 0.3, 1)).toEqual({ estado: "falta", ahorro: -0.2 });
  });

  it("una diferencia de ruido decimal cuenta como justo: 0,1 + 0,2 contra 0,3", () => {
    expect(calcularAhorroReal(0.1 + 0.2, 0.3, 1)).toEqual({ estado: "justo", ahorro: 0 });
  });
});

describe("etiquetaTipoIngreso", () => {
  it.each([
    ["salario", "Salario"],
    ["ventas", "Ventas"],
    ["honorarios", "Honorarios"],
    ["otros", "Otros"],
  ])("%s se muestra como %s", (valor, etiqueta) => {
    expect(etiquetaTipoIngreso(valor)).toBe(etiqueta);
  });

  it("un valor desconocido se devuelve igual", () => {
    expect(etiquetaTipoIngreso("regalo")).toBe("regalo");
  });
});
