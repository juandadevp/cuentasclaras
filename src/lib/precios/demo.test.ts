import { describe, expect, it } from "vitest";
import { agruparProductos } from "@/lib/precios/agrupar";
import { ofertasDeEjemplo } from "@/lib/precios/demo";
import { tiendasDelRubro } from "@/lib/precios/rubros";

describe("ofertasDeEjemplo", () => {
  it("siempre devuelve las mismas ofertas para la misma búsqueda", () => {
    expect(ofertasDeEjemplo("leche", "alimentos")).toEqual(ofertasDeEjemplo("leche", "alimentos"));
  });

  it("cambia cuando cambia la búsqueda", () => {
    expect(ofertasDeEjemplo("leche", "alimentos")).not.toEqual(ofertasDeEjemplo("arroz", "alimentos"));
  });

  it("devuelve varias ofertas con precios positivos en múltiplos de 50", () => {
    const ofertas = ofertasDeEjemplo("detergente", "aseo_hogar");
    expect(ofertas.length).toBeGreaterThanOrEqual(8);
    for (const o of ofertas) {
      expect(o.precio).toBeGreaterThan(0);
      expect(o.precio % 50).toBe(0);
    }
  });

  it("deja claro en cada oferta que es un precio de ejemplo", () => {
    for (const o of ofertasDeEjemplo("celular", "tecnologia")) expect(o.detalle).toBe("Precio de ejemplo");
  });

  it("usa tiendas que venden ese tipo de producto (más alguna ajena)", () => {
    const propias = new Set(tiendasDelRubro("medicamentos").map((f) => f.nombre));
    const ofertas = ofertasDeEjemplo("acetaminofén", "medicamentos");
    const dePropias = ofertas.filter((o) => propias.has(o.tienda));
    expect(dePropias.length).toBeGreaterThan(ofertas.length / 2);
  });

  it("sin tipo detectado usa tiendas generales", () => {
    const tiendas = new Set(ofertasDeEjemplo("cosa rara", null).map((o) => o.tienda));
    expect([...tiendas].every((t) => ["Éxito", "Mercado Libre", "Falabella", "Alkosto"].includes(t))).toBe(true);
  });

  it("imita a un buscador: cada producto sale en varias tiendas y se agrupa", () => {
    const productos = agruparProductos(ofertasDeEjemplo("leche", "alimentos"));
    expect(productos.length).toBeGreaterThanOrEqual(4);
    expect(productos.some((p) => p.ofertas.length >= 2)).toBe(true);
  });

  it("no usa enlaces ni imágenes", () => {
    for (const o of ofertasDeEjemplo("leche", "alimentos")) {
      expect(o.enlace).toBeUndefined();
      expect(o.imagen).toBeUndefined();
    }
  });
});
