import { describe, expect, it } from "vitest";
import { franquicias, normalizar, perteneceAFranquicia } from "@/lib/precios/franquicias";

describe("normalizar", () => {
  it("quita tildes, mayúsculas, espacios y signos", () => {
    expect(normalizar("Éxito S.A.")).toBe("exitos.a.");
    expect(normalizar("  Cruz  Verde ")).toBe("cruzverde");
  });
});

describe("perteneceAFranquicia", () => {
  it.each([
    ["Éxito", "exito"],
    ["Exito.com", "exito"],
    ["ÉXITO S.A.S", "exito"],
    ["Alkosto", "alkosto"],
    ["Alkosto Colombia", "alkosto"],
    ["Cruz Verde", "cruzVerde"],
    ["Mercado Libre Colombia", "mercadoLibre"],
    ["Farmatodo", "farmatodo"],
    ["Muebles Jamar", "jamar"],
    ["Tugó", "tugo"],
    ["Homecenter", "homecenter"],
    ["H&M", "hm"],
    ["Metro", "metro"],
    ["D1", "d1"],
    ["Ara", "ara"],
    ["Easy", "easy"],
  ] as const)("%s pertenece a la franquicia %s", (tienda, id) => {
    expect(perteneceAFranquicia(tienda, franquicias[id])).toBe(true);
  });

  it.each([
    ["Para ti", "ara"],
    ["Aramis", "ara"],
    ["Metrópolis", "metro"],
    ["Medio Metro Express", "metro"],
    ["Ladrillos D12", "d1"],
    ["Diseño fácil", "easy"],
    ["Tienda de barrio", "exito"],
    ["Farmatodo", "cruzVerde"],
    ["", "exito"],
  ] as const)("%j no pertenece a la franquicia %s", (tienda, id) => {
    expect(perteneceAFranquicia(tienda, franquicias[id])).toBe(false);
  });

  it("cada franquicia del catálogo se reconoce por su propio nombre", () => {
    for (const [id, franquicia] of Object.entries(franquicias)) {
      expect(perteneceAFranquicia(franquicia.nombre, franquicia), id).toBe(true);
    }
  });

  it("el catálogo cubre supermercados, farmacias, tecnología, hogar y moda", () => {
    const nombres = Object.values(franquicias).map((f) => f.nombre);
    expect(nombres).toEqual(expect.arrayContaining(["Éxito", "Farmatodo", "Alkosto", "Homecenter", "Zara"]));
    expect(nombres.length).toBeGreaterThanOrEqual(30);
  });
});
