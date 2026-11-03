import { describe, expect, it } from "vitest";
import type { Producto } from "./agrupar";
import type { Oferta } from "./tipos";
import {
  contarAjenas,
  dividirTiendas,
  filtrarPorTienda,
  haceCuanto,
  ofertaMasBarata,
  ofertasVisibles,
  ordenarProductos,
  tiendasDe,
} from "./vista";

const oferta = (tienda: string, precio: number, relevante?: boolean): Oferta => ({ titulo: "Producto", tienda, precio, relevante });

const ofertas = [oferta("Farmatodo", 5000, true), oferta("Éxito", 4500, false), oferta("Cruz Verde", 5200, true), oferta("Farmatodo", 6000, true)];

describe("ofertasVisibles", () => {
  it("con tipo detectado muestra solo las tiendas donde se vende", () => {
    const r = ofertasVisibles(ofertas, { detectado: "medicamentos", verOtras: false });
    expect(r.map((o) => o.tienda)).toEqual(["Farmatodo", "Cruz Verde", "Farmatodo"]);
  });

  it("con «ver otras tiendas» muestra todas", () => {
    expect(ofertasVisibles(ofertas, { detectado: "medicamentos", verOtras: true })).toHaveLength(4);
  });

  it("sin tipo detectado muestra todas", () => {
    expect(ofertasVisibles(ofertas, { detectado: null, verOtras: false })).toHaveLength(4);
    expect(ofertasVisibles(ofertas, { detectado: undefined, verOtras: false })).toHaveLength(4);
  });

  it("una oferta sin marca de relevancia se considera de una tienda del tipo", () => {
    const r = ofertasVisibles([oferta("Tienda", 1000)], { detectado: "alimentos", verOtras: false });
    expect(r).toHaveLength(1);
  });

  it("no modifica la lista original", () => {
    const copia = [...ofertas];
    ofertasVisibles(ofertas, { detectado: "medicamentos", verOtras: false });
    expect(ofertas).toEqual(copia);
  });
});

describe("contarAjenas", () => {
  it("cuenta solo las ofertas marcadas como de otro tipo de tienda", () => {
    expect(contarAjenas(ofertas)).toBe(1);
    expect(contarAjenas([oferta("A", 1)])).toBe(0);
    expect(contarAjenas([])).toBe(0);
  });
});

describe("tiendasDe", () => {
  it("devuelve las tiendas sin repetir y en el orden en que aparecen", () => {
    expect(tiendasDe(ofertas)).toEqual(["Farmatodo", "Éxito", "Cruz Verde"]);
  });

  it("con una lista vacía devuelve una lista vacía", () => {
    expect(tiendasDe([])).toEqual([]);
  });
});

describe("filtrarPorTienda", () => {
  it("deja solo las ofertas de esa tienda", () => {
    expect(filtrarPorTienda(ofertas, "Farmatodo")).toHaveLength(2);
  });

  it("sin tienda elegida devuelve todas", () => {
    expect(filtrarPorTienda(ofertas, null)).toHaveLength(4);
  });

  it("una tienda que no está devuelve una lista vacía", () => {
    expect(filtrarPorTienda(ofertas, "Otra")).toEqual([]);
  });
});

describe("ofertaMasBarata", () => {
  it("devuelve la de menor precio", () => {
    expect(ofertaMasBarata(ofertas)?.tienda).toBe("Éxito");
  });

  it("con una lista vacía devuelve undefined", () => {
    expect(ofertaMasBarata([])).toBeUndefined();
  });

  it("si hay empate gana la primera", () => {
    expect(ofertaMasBarata([oferta("A", 1000), oferta("B", 1000)])?.tienda).toBe("A");
  });
});

describe("ordenarProductos", () => {
  const producto = (clave: string, minimo: number): Producto => ({ clave, titulo: clave, ofertas: [], minimo, maximo: minimo });
  const productos = [producto("b", 300), producto("a", 100), producto("c", 200)];

  it("ordena de menor a mayor precio", () => {
    expect(ordenarProductos(productos, "asc").map((p) => p.clave)).toEqual(["a", "c", "b"]);
  });

  it("ordena de mayor a menor precio", () => {
    expect(ordenarProductos(productos, "desc").map((p) => p.clave)).toEqual(["b", "c", "a"]);
  });

  it("no modifica la lista original", () => {
    ordenarProductos(productos, "asc");
    expect(productos.map((p) => p.clave)).toEqual(["b", "a", "c"]);
  });
});

describe("dividirTiendas", () => {
  const lista = (n: number) => Array.from({ length: n }, (_, i) => oferta(`T${i}`, 1000 + i));

  it.each([
    [0, 0, 0],
    [1, 1, 0],
    [3, 3, 0],
    [4, 3, 1],
    [10, 3, 7],
  ])("con %i tiendas: %i primeras y %i en el desplegable", (total, primeras, otras) => {
    const r = dividirTiendas(lista(total));
    expect(r.primeras).toHaveLength(primeras);
    expect(r.otras).toHaveLength(otras);
  });

  it("conserva el orden", () => {
    const r = dividirTiendas(lista(5));
    expect(r.primeras.map((o) => o.tienda)).toEqual(["T0", "T1", "T2"]);
    expect(r.otras.map((o) => o.tienda)).toEqual(["T3", "T4"]);
  });
});

describe("haceCuanto", () => {
  const base = new Date("2026-11-03T12:00:00Z").getTime();
  const hace = (segundos: number) => new Date(base - segundos * 1000).toISOString();

  it("dice «hace unos segundos» durante el primer minuto", () => {
    expect(haceCuanto(hace(0), base)).toBe("hace unos segundos");
    expect(haceCuanto(hace(59), base)).toBe("hace unos segundos");
  });

  it("pasado el minuto cuenta en minutos", () => {
    expect(haceCuanto(hace(60), base)).toBe("hace 1 min");
    expect(haceCuanto(hace(300), base)).toBe("hace 5 min");
  });

  it("si el reloj va adelantado no da un tiempo negativo", () => {
    expect(haceCuanto(hace(-120), base)).toBe("hace unos segundos");
  });

  it("con una fecha inválida no se rompe", () => {
    expect(haceCuanto("no es una fecha", base)).toBe("hace unos segundos");
  });
});
