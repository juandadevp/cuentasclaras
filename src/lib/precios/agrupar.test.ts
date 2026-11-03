import { describe, expect, it } from "vitest";
import { agruparProductos } from "@/lib/precios/agrupar";
import type { Oferta } from "@/lib/precios/tipos";

const oferta = (titulo: string, tienda: string, precio: number, extra: Partial<Oferta> = {}): Oferta => ({ titulo, tienda, precio, ...extra });

describe("agruparProductos", () => {
  it("devuelve una lista vacía sin ofertas", () => {
    expect(agruparProductos([])).toEqual([]);
  });

  it("junta en una sola tarjeta las ofertas con el mismo identificador del buscador", () => {
    const productos = agruparProductos([
      oferta("Leche Alpina 1 L", "Éxito", 4800, { idProducto: "1" }),
      oferta("Leche Alpina entera litro", "Jumbo", 4500, { idProducto: "1" }),
      oferta("Leche Alpina 1 L", "Olímpica", 5000, { idProducto: "1" }),
    ]);
    expect(productos).toHaveLength(1);
    expect(productos[0].ofertas.map((o) => o.tienda)).toEqual(["Jumbo", "Éxito", "Olímpica"]);
    expect(productos[0].minimo).toBe(4500);
    expect(productos[0].maximo).toBe(5000);
    expect(productos[0].clave).toBe("id:1");
  });

  it("sin identificador agrupa por título idéntico, sin importar tildes, mayúsculas ni signos", () => {
    const productos = agruparProductos([
      oferta("Pañales Huggies  Etapa 3", "Éxito", 50_000),
      oferta("PANALES huggies etapa 3!", "Farmatodo", 48_000),
    ]);
    expect(productos).toHaveLength(1);
    expect(productos[0].minimo).toBe(48_000);
  });

  it("no mezcla presentaciones distintas del mismo producto", () => {
    const productos = agruparProductos([
      oferta("Leche Alpina 1 L", "Éxito", 4800),
      oferta("Leche Alpina 3 L", "Éxito", 13_500),
      oferta("Leche Alpina 1 L", "Jumbo", 4700),
    ]);
    expect(productos).toHaveLength(2);
    expect(productos.map((p) => p.ofertas.length).sort()).toEqual([1, 2]);
  });

  it("no mezcla productos con identificadores distintos aunque el título sea igual", () => {
    const productos = agruparProductos([
      oferta("Arroz Diana", "Éxito", 5000, { idProducto: "a" }),
      oferta("Arroz Diana", "Jumbo", 5200, { idProducto: "b" }),
    ]);
    expect(productos).toHaveLength(2);
  });

  it("ordena los productos del más barato al más caro según su precio mínimo", () => {
    const productos = agruparProductos([
      oferta("Televisor 50", "Alkosto", 1_800_000),
      oferta("Televisor 32", "Alkosto", 700_000),
      oferta("Televisor 32", "Éxito", 650_000),
    ]);
    expect(productos.map((p) => p.minimo)).toEqual([650_000, 1_800_000]);
  });

  it("toma la imagen de la primera oferta que la tenga y el título de la más barata", () => {
    const [producto] = agruparProductos([
      oferta("Café Sello Rojo 500 g", "Éxito", 15_000, { idProducto: "9" }),
      oferta("Café Sello Rojo 500g", "Jumbo", 14_000, { idProducto: "9", imagen: "https://img.com/a.png" }),
    ]);
    expect(producto.imagen).toBe("https://img.com/a.png");
    expect(producto.titulo).toBe("Café Sello Rojo 500g");
  });

  it("un producto con una sola oferta tiene el mismo mínimo y máximo", () => {
    const [producto] = agruparProductos([oferta("Cuaderno", "Panamericana", 6000)]);
    expect(producto.minimo).toBe(6000);
    expect(producto.maximo).toBe(6000);
    expect(producto.imagen).toBeUndefined();
  });

  it("no modifica la lista original", () => {
    const original = [oferta("A", "Éxito", 200), oferta("A", "Jumbo", 100)];
    const copia = structuredClone(original);
    agruparProductos(original);
    expect(original).toEqual(copia);
  });
});
