import { describe, expect, it } from "vitest";
import {
  formatearMontoEscrito,
  normalizarDescripcion,
  normalizarTienda,
  parsearMonto,
  validarGasto,
  type DatosGasto,
} from "@/lib/validaciones-gasto";

describe("parsearMonto", () => {
  it.each([
    ["25000", 25000],
    ["25.000", 25000],
    ["25,000", 25000],
    ["$ 25.000", 25000],
    ["$25 000", 25000],
    ["1.234.567", 1234567],
    ["  500  ", 500],
    ["007", 7],
    ["0", 0],
  ])("entiende %s como %d", (texto, esperado) => {
    expect(parsearMonto(texto)).toBe(esperado);
  });

  it.each(["", "   ", "abc", "12a", "12,50", "1.2", "1.23", "12.5000", "1..000", "-500", "1e3", "$"])(
    "rechaza %j",
    (texto) => {
      expect(parsearMonto(texto)).toBeNull();
    },
  );
});

describe("formatearMontoEscrito", () => {
  it.each([
    ["", ""],
    ["abc", ""],
    ["5", "5"],
    ["999", "999"],
    ["1000", "1.000"],
    ["25000", "25.000"],
    ["1234567", "1.234.567"],
    ["25.000", "25.000"],
    ["$ 25 000", "25.000"],
    ["000123", "123"],
    ["0", "0"],
  ])("convierte %j en %j", (texto, esperado) => {
    expect(formatearMontoEscrito(texto)).toBe(esperado);
  });

  it("limita a 9 dígitos", () => {
    expect(formatearMontoEscrito("12345678901")).toBe("123.456.789");
  });
});

describe("normalizarDescripcion y normalizarTienda", () => {
  it("quita espacios sobrantes", () => {
    expect(normalizarDescripcion("  pan   con  queso ")).toBe("pan con queso");
  });

  it("deja la tienda en null si está vacía", () => {
    expect(normalizarTienda("   ")).toBeNull();
  });

  it("limpia la tienda y la corta a 80 caracteres", () => {
    expect(normalizarTienda("  Alkosto   Centro ")).toBe("Alkosto Centro");
    expect(normalizarTienda("a".repeat(100))).toHaveLength(80);
  });
});

describe("validarGasto", () => {
  const hoy = "2026-11-03";
  const valido: DatosGasto = {
    descripcion: "Supermercado",
    monto: "25.000",
    categoria: "alimentacion",
    fecha: "2026-11-01",
    tienda: "",
  };
  const con = (cambios: Partial<DatosGasto>) => validarGasto({ ...valido, ...cambios }, hoy);

  it("no devuelve errores con datos correctos", () => {
    expect(validarGasto(valido, hoy)).toEqual({});
  });

  it("acepta una tienda de 80 caracteres y rechaza una de 81", () => {
    expect(con({ tienda: "a".repeat(80) }).tienda).toBeUndefined();
    expect(con({ tienda: "a".repeat(81) }).tienda).toBe("El nombre de la tienda es muy largo (máximo 80).");
  });

  describe("descripción", () => {
    it("pide la descripción si está vacía o solo tiene espacios", () => {
      expect(con({ descripcion: "   " }).descripcion).toBe("Escribe en qué gastaste.");
    });

    it("rechaza 1 carácter y acepta 2", () => {
      expect(con({ descripcion: "a" }).descripcion).toBe("La descripción es muy corta.");
      expect(con({ descripcion: "ab" }).descripcion).toBeUndefined();
    });

    it("acepta 80 caracteres y rechaza 81", () => {
      expect(con({ descripcion: "a".repeat(80) }).descripcion).toBeUndefined();
      expect(con({ descripcion: "a".repeat(81) }).descripcion).toBe("La descripción es muy larga (máximo 80).");
    });
  });

  describe("monto", () => {
    it("pide el valor si está vacío", () => {
      expect(con({ monto: "" }).monto).toBe("Ingresa el valor del gasto.");
    });

    it("rechaza texto y decimales", () => {
      expect(con({ monto: "mucho" }).monto).toBe("El valor solo puede tener números.");
      expect(con({ monto: "12,50" }).monto).toBe("El valor solo puede tener números.");
    });

    it("rechaza 0 y acepta 1", () => {
      expect(con({ monto: "0" }).monto).toBe("El valor debe ser mayor que cero.");
      expect(con({ monto: "1" }).monto).toBeUndefined();
    });

    it("acepta 999.999.999 y rechaza 1.000.000.000", () => {
      expect(con({ monto: "999.999.999" }).monto).toBeUndefined();
      expect(con({ monto: "1.000.000.000" }).monto).toBe("El valor es demasiado grande.");
    });
  });

  describe("categoría", () => {
    it("pide elegir una categoría", () => {
      expect(con({ categoria: "" }).categoria).toBe("Elige una categoría.");
    });

    it("rechaza una categoría que no está en la lista", () => {
      expect(con({ categoria: "inventada" }).categoria).toBe("Elige una categoría.");
    });

    it.each(["vivienda", "bebes", "otros"])("acepta %s", (categoria) => {
      expect(con({ categoria }).categoria).toBeUndefined();
    });
  });

  describe("fecha", () => {
    it("acepta hoy", () => {
      expect(con({ fecha: hoy }).fecha).toBeUndefined();
    });

    it("rechaza mañana", () => {
      expect(con({ fecha: "2026-11-04" }).fecha).toBe("La fecha no puede ser futura.");
    });

    it("acepta el 1 de enero de 2000 y rechaza el 31 de diciembre de 1999", () => {
      expect(con({ fecha: "2000-01-01" }).fecha).toBeUndefined();
      expect(con({ fecha: "1999-12-31" }).fecha).toBe("La fecha es demasiado antigua.");
    });

    it.each(["", "03/11/2026", "2026-2-3", "2026-02-30", "2026-13-01", "mañana"])("rechaza %j", (fecha) => {
      expect(con({ fecha }).fecha).toBe("Elige una fecha válida.");
    });

    it("acepta el 29 de febrero solo en año bisiesto", () => {
      expect(con({ fecha: "2024-02-29" }).fecha).toBeUndefined();
      expect(con({ fecha: "2025-02-29" }).fecha).toBe("Elige una fecha válida.");
    });
  });

  it("devuelve un error por cada campo malo", () => {
    expect(Object.keys(validarGasto({ descripcion: "", monto: "", categoria: "", fecha: "", tienda: "" }, hoy)).sort()).toEqual([
      "categoria",
      "descripcion",
      "fecha",
      "monto",
    ]);
  });
});
