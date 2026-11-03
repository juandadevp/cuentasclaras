import { describe, expect, it } from "vitest";
import { validarBusqueda } from "@/lib/precios/validar-busqueda";

describe("validarBusqueda", () => {
  it("acepta una búsqueda normal", () => {
    expect(validarBusqueda("leche entera")).toEqual({ texto: "leche entera" });
  });

  it("rechaza 1 carácter y acepta 2", () => {
    expect(validarBusqueda("a")).toEqual({ error: "Escribe al menos 2 letras del producto." });
    expect(validarBusqueda("tv")).toEqual({ texto: "tv" });
  });

  it("acepta 80 caracteres y rechaza 81", () => {
    expect(validarBusqueda("a".repeat(80))).toEqual({ texto: "a".repeat(80) });
    expect(validarBusqueda("a".repeat(81))).toEqual({ error: "La búsqueda es demasiado larga (máximo 80 caracteres)." });
  });

  it("quita espacios sobrantes", () => {
    expect(validarBusqueda("   pañales    etapa   3  ")).toEqual({ texto: "pañales etapa 3" });
  });

  it("cambia los caracteres de control por espacios", () => {
    expect(validarBusqueda("leche\u0000\n\tentera\u007f")).toEqual({ texto: "leche entera" });
  });

  it("solo espacios o solo caracteres de control cuenta como vacío", () => {
    expect(validarBusqueda("    ").error).toBe("Escribe al menos 2 letras del producto.");
    expect(validarBusqueda("\u0001\u0002\u0003").error).toBe("Escribe al menos 2 letras del producto.");
  });

  it.each([[null], [undefined], [12], [{}]])("no se rompe con %j", (valor) => {
    expect(validarBusqueda(valor).error ?? validarBusqueda(valor).texto).toBeDefined();
  });

  it("no cuenta el largo antes de limpiar los espacios", () => {
    expect(validarBusqueda(`${"a ".repeat(40)}`).texto).toBe("a ".repeat(39) + "a");
  });
});
