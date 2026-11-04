import { describe, expect, it } from "vitest";
import type { Producto } from "@/lib/precios/agrupar";
import {
  aplicarCambioFavorito,
  enlaceBuscarPrecios,
  leerBusquedaInicial,
  limpiarProducto,
  mensajeDeErrorFavoritos,
  productoAFavorito,
  recortarClave,
  resumirOfertas,
} from "./favoritos";

const oferta = (n: number) => ({ tienda: `Tienda ${n}`, precio: 1000 + n, enlace: `https://tienda${n}.com/p`, detalle: "envío gratis" });

const valido = {
  clave: "id:123",
  titulo: "Leche Alpina 1 L",
  imagen: "https://img.test/a.jpg",
  tipo: "alimentos",
  ofertas: [oferta(1), oferta(2)],
};

describe("limpiarProducto", () => {
  it("acepta un producto correcto", () => {
    expect(limpiarProducto(valido)).toEqual(valido);
  });

  it.each([null, undefined, 5, "texto", [], true])("rechaza algo que no es un objeto (%j)", (entrada) => {
    expect(limpiarProducto(entrada)).toBeNull();
  });

  it("rechaza si falta la clave, el título o las ofertas", () => {
    expect(limpiarProducto({ ...valido, clave: "" })).toBeNull();
    expect(limpiarProducto({ ...valido, clave: 5 })).toBeNull();
    expect(limpiarProducto({ ...valido, titulo: "   " })).toBeNull();
    expect(limpiarProducto({ ...valido, ofertas: undefined })).toBeNull();
    expect(limpiarProducto({ ...valido, ofertas: "no" })).toBeNull();
  });

  it("rechaza un producto sin ninguna oferta válida", () => {
    expect(limpiarProducto({ ...valido, ofertas: [] })).toBeNull();
    expect(limpiarProducto({ ...valido, ofertas: [{ tienda: "A", precio: 0 }] })).toBeNull();
  });

  it.each([
    ["precio 0", { tienda: "A", precio: 0 }],
    ["precio negativo", { tienda: "A", precio: -5 }],
    ["precio NaN", { tienda: "A", precio: NaN }],
    ["precio infinito", { tienda: "A", precio: Infinity }],
    ["precio en texto", { tienda: "A", precio: "1000" }],
    ["precio por encima del máximo", { tienda: "A", precio: 1_000_000_000 }],
    ["tienda vacía", { tienda: "  ", precio: 1000 }],
    ["tienda que no es texto", { tienda: 7, precio: 1000 }],
    ["oferta nula", null],
    ["oferta que no es objeto", "x"],
  ])("descarta una oferta con %s y conserva las buenas", (_nombre, mala) => {
    const r = limpiarProducto({ ...valido, ofertas: [mala, oferta(1)] });
    expect(r?.ofertas).toEqual([oferta(1)]);
  });

  it("acepta el precio máximo y redondea los decimales", () => {
    const r = limpiarProducto({ ...valido, ofertas: [{ tienda: "A", precio: 999_999_999 }, { tienda: "B", precio: 4590.6 }] });
    expect(r?.ofertas.map((o) => o.precio)).toEqual([999_999_999, 4591]);
  });

  it("guarda hasta 30 ofertas y, si hay más, las primeras", () => {
    const treinta = Array.from({ length: 30 }, (_, i) => oferta(i));
    expect(limpiarProducto({ ...valido, ofertas: treinta })?.ofertas).toHaveLength(30);

    const treintaYUna = Array.from({ length: 31 }, (_, i) => oferta(i));
    const r = limpiarProducto({ ...valido, ofertas: treintaYUna });
    expect(r?.ofertas).toHaveLength(30);
    expect(r?.ofertas[29].tienda).toBe("Tienda 29");
  });

  it("no cuenta las ofertas descartadas dentro del límite de 30", () => {
    const mezcla = [...Array.from({ length: 5 }, () => ({ tienda: "", precio: 1 })), ...Array.from({ length: 30 }, (_, i) => oferta(i))];
    expect(limpiarProducto({ ...valido, ofertas: mezcla })?.ofertas).toHaveLength(30);
  });

  it("descarta enlaces e imágenes que no son https", () => {
    const r = limpiarProducto({
      ...valido,
      imagen: "http://img.test/a.jpg",
      ofertas: [{ tienda: "A", precio: 1000, enlace: "javascript:alert(1)" }],
    });
    expect(r?.imagen).toBeUndefined();
    expect(r?.ofertas[0].enlace).toBeUndefined();
  });

  it("descarta una imagen de más de 600 caracteres", () => {
    expect(limpiarProducto({ ...valido, imagen: "https://img.test/" + "a".repeat(600) })?.imagen).toBeUndefined();
  });

  it("recorta el título a 200 caracteres y la clave con recortarClave", () => {
    const r = limpiarProducto({ ...valido, titulo: "t".repeat(300), clave: "c".repeat(300) });
    expect(r?.titulo).toHaveLength(200);
    expect(r?.clave).toBe(recortarClave("c".repeat(300)));
    expect(r?.clave).toHaveLength(200);
  });

  it("limpia caracteres de control y espacios de más", () => {
    const r = limpiarProducto({ ...valido, titulo: "  Leche\u0000   Alpina\n 1 L ", ofertas: [{ tienda: "Éxito\t\u0007S.A.", precio: 1000, detalle: "a\u0000b" }] });
    expect(r?.titulo).toBe("Leche Alpina 1 L");
    expect(r?.ofertas[0].tienda).toBe("Éxito S.A.");
    expect(r?.ofertas[0].detalle).toBe("a b");
  });

  it("recorta la tienda a 80, el detalle a 120 y el tipo a 40", () => {
    const r = limpiarProducto({ ...valido, tipo: "x".repeat(100), ofertas: [{ tienda: "t".repeat(200), precio: 1000, detalle: "d".repeat(500) }] });
    expect(r?.ofertas[0].tienda).toHaveLength(80);
    expect(r?.ofertas[0].detalle).toHaveLength(120);
    expect(r?.tipo).toHaveLength(40);
  });

  it("no deja pasar campos que no existen en el producto", () => {
    const r = limpiarProducto({ ...valido, user_id: "otro", id: "x" }) as unknown as Record<string, unknown>;
    expect(r.user_id).toBeUndefined();
    expect(r.id).toBeUndefined();
  });
});

describe("productoAFavorito", () => {
  const producto: Producto = {
    clave: "id:9",
    titulo: "Audífonos JBL",
    imagen: "https://img.test/j.jpg",
    ofertas: Array.from({ length: 35 }, (_, i) => ({ titulo: "Audífonos JBL", tienda: `T${i}`, precio: 1000 + i, enlace: `https://t${i}.com` })),
    minimo: 1000,
    maximo: 1034,
  };

  it("arma lo que se envía a guardar", () => {
    const r = productoAFavorito(producto, "tecnologia");
    expect(r).toMatchObject({ clave: "id:9", titulo: "Audífonos JBL", imagen: "https://img.test/j.jpg", tipo: "tecnologia" });
  });

  it("conserva las 30 ofertas más baratas", () => {
    const r = productoAFavorito(producto, null);
    expect(r.ofertas).toHaveLength(30);
    expect(r.ofertas[0].precio).toBe(1000);
    expect(r.ofertas[29].precio).toBe(1029);
  });

  it("sin tipo detectado no lleva tipo", () => {
    expect(productoAFavorito(producto, null).tipo).toBeUndefined();
  });

  it("lo que arma pasa la limpieza sin perder nada", () => {
    const r = productoAFavorito(producto, "tecnologia");
    expect(limpiarProducto(r)?.ofertas).toHaveLength(30);
  });

  it("recorta una clave demasiado larga igual que el servidor", () => {
    expect(productoAFavorito({ ...producto, clave: "titulo:" + "a".repeat(400) }, null).clave).toBe(recortarClave("titulo:" + "a".repeat(400)));
  });
});

describe("aplicarCambioFavorito", () => {
  it("agrega una clave", () => {
    expect([...aplicarCambioFavorito(new Set(["a"]), { clave: "b", activo: true })]).toEqual(["a", "b"]);
  });

  it("quita una clave", () => {
    expect([...aplicarCambioFavorito(new Set(["a", "b"]), { clave: "a", activo: false })]).toEqual(["b"]);
  });

  it("agregar una que ya estaba o quitar una que no estaba no cambia nada", () => {
    expect([...aplicarCambioFavorito(new Set(["a"]), { clave: "a", activo: true })]).toEqual(["a"]);
    expect([...aplicarCambioFavorito(new Set(["a"]), { clave: "z", activo: false })]).toEqual(["a"]);
  });

  it("no modifica el conjunto original", () => {
    const original = new Set(["a"]);
    aplicarCambioFavorito(original, { clave: "b", activo: true });
    expect([...original]).toEqual(["a"]);
  });
});

describe("resumirOfertas", () => {
  const ofertas = [{ tienda: "B", precio: 300 }, { tienda: "A", precio: 100 }, { tienda: "C", precio: 200 }];

  it("ordena de menor a mayor y da el mínimo y el máximo", () => {
    const r = resumirOfertas(ofertas);
    expect(r.ordenadas.map((o) => o.tienda)).toEqual(["A", "C", "B"]);
    expect(r.minimo).toBe(100);
    expect(r.maximo).toBe(300);
  });

  it("con una sola oferta el mínimo y el máximo son iguales", () => {
    const r = resumirOfertas([{ tienda: "A", precio: 500 }]);
    expect([r.minimo, r.maximo]).toEqual([500, 500]);
  });

  it("con una lista vacía devuelve ceros", () => {
    expect(resumirOfertas([])).toEqual({ ordenadas: [], minimo: 0, maximo: 0 });
  });

  it("no modifica la lista original", () => {
    resumirOfertas(ofertas);
    expect(ofertas.map((o) => o.tienda)).toEqual(["B", "A", "C"]);
  });
});

describe("enlaceBuscarPrecios y leerBusquedaInicial", () => {
  const paramsDe = (enlace: string) => Object.fromEntries(new URL(enlace, "https://sitio.test").searchParams.entries());

  it("lleva a «Recomendar compras» con el producto y el tipo", () => {
    const enlace = enlaceBuscarPrecios({ titulo: "Leche Alpina 1 L", tipo: "alimentos" });
    expect(enlace.startsWith("/panel/recomendar?")).toBe(true);
    expect(paramsDe(enlace)).toEqual({ q: "Leche Alpina 1 L", tipo: "alimentos" });
  });

  it("sin tipo, o con un tipo desconocido, no lo incluye", () => {
    expect(paramsDe(enlaceBuscarPrecios({ titulo: "Algo" })).tipo).toBeUndefined();
    expect(paramsDe(enlaceBuscarPrecios({ titulo: "Algo", tipo: "zzz" })).tipo).toBeUndefined();
  });

  it("ida y vuelta con tildes, & y #", () => {
    const titulo = "Café & Té #1 — edición ñandú";
    expect(leerBusquedaInicial(paramsDe(enlaceBuscarPrecios({ titulo, tipo: "alimentos" })))).toEqual({ consulta: titulo, tipo: "alimentos" });
  });

  it("recorta un título largo a 80 caracteres", () => {
    expect(leerBusquedaInicial(paramsDe(enlaceBuscarPrecios({ titulo: "a".repeat(200) }))).consulta).toHaveLength(80);
  });

  it("sin parámetros devuelve una búsqueda vacía", () => {
    expect(leerBusquedaInicial({})).toEqual({ consulta: "", tipo: "" });
  });

  it("limpia espacios y caracteres de control de la consulta", () => {
    expect(leerBusquedaInicial({ q: "  pan \u0000  tajado\n " }).consulta).toBe("pan tajado");
  });

  it("ignora un tipo que no está en la lista", () => {
    expect(leerBusquedaInicial({ q: "pan", tipo: "hack" }).tipo).toBe("");
  });

  it("ignora los valores repetidos (llegan como lista)", () => {
    expect(leerBusquedaInicial({ q: ["a", "b"], tipo: ["alimentos", "moda"] })).toEqual({ consulta: "", tipo: "" });
  });
});

describe("mensajeDeErrorFavoritos", () => {
  it.each(["42P01", "PGRST205"])("avisa que falta la tabla con el código %s", (code) => {
    expect(mensajeDeErrorFavoritos({ code })).toBe(
      "Falta crear la tabla de favoritos. Ejecuta la migración «favoritos» en el SQL Editor de Supabase.",
    );
  });

  it("avisa que falta actualizar la base de datos", () => {
    expect(mensajeDeErrorFavoritos({ code: "PGRST204" })).toBe(
      "Falta actualizar la base de datos. Ejecuta la migración «favoritos» en el SQL Editor de Supabase.",
    );
  });

  it("explica una restricción que no se cumple y la falta de permiso", () => {
    expect(mensajeDeErrorFavoritos({ code: "23514" })).toBe("No pudimos guardar este producto: los datos no cumplen las reglas.");
    expect(mensajeDeErrorFavoritos({ code: "42501" })).toBe("No tienes permiso para hacer esto. Inicia sesión de nuevo.");
  });

  it("usa un mensaje general con un código desconocido o sin código", () => {
    const general = "No pudimos actualizar tus favoritos. Inténtalo de nuevo.";
    expect(mensajeDeErrorFavoritos({ code: "XX000" })).toBe(general);
    expect(mensajeDeErrorFavoritos({})).toBe(general);
  });

  it("nunca muestra el texto crudo del error", () => {
    expect(mensajeDeErrorFavoritos({ code: "XX000", message: "secreto interno" })).not.toContain("secreto");
  });
});
