import { describe, expect, it } from "vitest";
import { categorias } from "@/config/site";
import { franquicias } from "@/lib/precios/franquicias";
import { esRubro, listaRubros, rubros, tiendaRelevante, tiendasDelRubro } from "@/lib/precios/rubros";

describe("rubros", () => {
  it("hay exactamente 15 tipos de producto", () => {
    expect(listaRubros).toHaveLength(15);
    expect([...listaRubros].sort()).toEqual(
      [
        "medicamentos", "cuidado_personal", "alimentos", "aseo_hogar", "bebes", "tecnologia", "electrodomesticos", "ferreteria",
        "muebles", "deportes", "libros_papeleria", "moda", "juguetes", "mascotas", "vehiculos",
      ].sort(),
    );
  });

  it.each(listaRubros)("%s apunta a una categoría de gasto que existe", (rubro) => {
    expect(categorias.map((c) => c.valor)).toContain(rubros[rubro].categoriaGasto);
  });

  it.each(listaRubros)("%s tiene etiqueta, ejemplos y tiendas del catálogo", (rubro) => {
    const config = rubros[rubro];
    expect(config.etiqueta.length).toBeGreaterThan(2);
    expect(config.ejemplos.length).toBeGreaterThanOrEqual(3);
    expect(config.tiendas.length).toBeGreaterThanOrEqual(3);
    for (const id of config.tiendas) expect(franquicias).toHaveProperty(id);
  });

  it("no repite tiendas dentro de un mismo tipo", () => {
    for (const rubro of listaRubros) expect(new Set(rubros[rubro].tiendas).size).toBe(rubros[rubro].tiendas.length);
  });

  it("usa varias categorías de gasto distintas", () => {
    expect(new Set(listaRubros.map((r) => rubros[r].categoriaGasto)).size).toBeGreaterThanOrEqual(8);
  });

  it("esRubro reconoce solo los tipos válidos", () => {
    expect(esRubro("alimentos")).toBe(true);
    expect(esRubro("vehiculos")).toBe(true);
    expect(esRubro("")).toBe(false);
    expect(esRubro("comida")).toBe(false);
    expect(esRubro("toString")).toBe(false);
  });

  it("tiendasDelRubro devuelve las franquicias del tipo", () => {
    expect(tiendasDelRubro("medicamentos").map((f) => f.nombre)).toContain("Farmatodo");
  });

  it("tiendaRelevante dice si la tienda vende ese tipo de producto", () => {
    expect(tiendaRelevante("Farmatodo", "medicamentos")).toBe(true);
    expect(tiendaRelevante("Cruz Verde Colombia", "medicamentos")).toBe(true);
    expect(tiendaRelevante("Homecenter", "medicamentos")).toBe(false);
    expect(tiendaRelevante("Alkosto", "tecnologia")).toBe(true);
    expect(tiendaRelevante("Tienda desconocida", "tecnologia")).toBe(false);
  });
});
