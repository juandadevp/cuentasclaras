import { describe, expect, it } from "vitest";
import { categorias } from "@/config/site";
import { dominioDe, enlaceBusquedaTienda, enlaceRegistrar, leerParametrosRegistro, soloHttps, type ParametrosPagina } from "./compra";
import { listaRubros, rubros } from "./rubros";
import type { Oferta } from "./tipos";

const oferta: Oferta = {
  titulo: "Audífonos Bluetooth JBL 510",
  tienda: "Alkosto",
  precio: 129900,
  enlace: "https://www.alkosto.com/audifonos-jbl",
};

/** Convierte el enlace armado en los parámetros que recibiría la página de registrar. */
function paramsDe(enlace: string): ParametrosPagina {
  return Object.fromEntries(new URL(enlace, "https://sitio.test").searchParams.entries());
}

describe("soloHttps", () => {
  it("acepta una dirección https", () => {
    expect(soloHttps("https://www.alkosto.com/a?b=1")).toBe("https://www.alkosto.com/a?b=1");
  });

  it.each(["http://alkosto.com", "javascript:alert(1)", "data:text/html,hola", "//alkosto.com", "alkosto.com", "", "no es url", "ftp://x.com/a"])(
    "rechaza «%s»",
    (valor) => {
      expect(soloHttps(valor)).toBeUndefined();
    },
  );

  it("rechaza undefined", () => {
    expect(soloHttps(undefined)).toBeUndefined();
  });

  it("rechaza direcciones con usuario y clave", () => {
    expect(soloHttps("https://usuario:clave@sitio.com")).toBeUndefined();
  });

  it("acepta 600 caracteres y rechaza 601", () => {
    const base = "https://sitio.com/";
    expect(soloHttps(base + "a".repeat(600 - base.length))).toBeDefined();
    expect(soloHttps(base + "a".repeat(601 - base.length))).toBeUndefined();
  });
});

describe("dominioDe", () => {
  it("quita www y deja solo el dominio", () => {
    expect(dominioDe("https://www.alkosto.com/x?y=1")).toBe("alkosto.com");
    expect(dominioDe("https://tienda.exito.com/p")).toBe("tienda.exito.com");
  });

  it("con una dirección inválida devuelve texto vacío", () => {
    expect(dominioDe("no es url")).toBe("");
  });
});

describe("enlaceRegistrar", () => {
  it("lleva a registrar gasto con los datos de la compra", () => {
    const enlace = enlaceRegistrar(oferta, "tecnologia", "https://img.test/a.jpg");
    expect(enlace.startsWith("/panel/registrar?")).toBe(true);
    expect(paramsDe(enlace)).toEqual({
      origen: "recomendar",
      descripcion: "Audífonos Bluetooth JBL 510",
      monto: "129900",
      tienda: "Alkosto",
      categoria: "tecnologia",
      tipo: "tecnologia",
      enlace: "https://www.alkosto.com/audifonos-jbl",
      imagen: "https://img.test/a.jpg",
    });
  });

  it("sin tipo detectado no pone categoría ni tipo", () => {
    const p = paramsDe(enlaceRegistrar(oferta, null));
    expect(p.categoria).toBeUndefined();
    expect(p.tipo).toBeUndefined();
  });

  it("sin enlace ni imagen no los incluye", () => {
    const p = paramsDe(enlaceRegistrar({ ...oferta, enlace: undefined }, "tecnologia"));
    expect(p.enlace).toBeUndefined();
    expect(p.imagen).toBeUndefined();
  });

  it("descarta enlaces e imágenes que no son https", () => {
    const p = paramsDe(enlaceRegistrar({ ...oferta, enlace: "javascript:alert(1)" }, "tecnologia", "http://img.test/a.jpg"));
    expect(p.enlace).toBeUndefined();
    expect(p.imagen).toBeUndefined();
  });

  it("codifica & # y espacios del título sin romper los demás datos", () => {
    const p = paramsDe(enlaceRegistrar({ ...oferta, titulo: "Pan & Café #1  con   espacios" }, null));
    expect(p.descripcion).toBe("Pan & Café #1 con espacios");
    expect(p.monto).toBe("129900");
  });

  it("recorta un título de 200 caracteres a 80", () => {
    expect(paramsDe(enlaceRegistrar({ ...oferta, titulo: "a".repeat(200) }, null)).descripcion).toHaveLength(80);
  });

  it("redondea el precio a pesos enteros", () => {
    expect(paramsDe(enlaceRegistrar({ ...oferta, precio: 4590.6 }, null)).monto).toBe("4591");
  });

  it.each(listaRubros)("para el tipo «%s» propone la categoría que le corresponde", (rubro) => {
    const p = paramsDe(enlaceRegistrar(oferta, rubro));
    expect(p.categoria).toBe(rubros[rubro].categoriaGasto);
    expect(categorias.some((c) => c.valor === p.categoria)).toBe(true);
  });
});

describe("enlaceBusquedaTienda", () => {
  it("busca el producto en esa tienda en Google Shopping Colombia", () => {
    const url = new URL(enlaceBusquedaTienda(oferta, "audífonos"));
    expect(url.origin).toBe("https://www.google.com.co");
    expect(url.searchParams.get("q")).toBe("audífonos Alkosto");
    expect(url.searchParams.get("tbm")).toBe("shop");
  });
});

describe("leerParametrosRegistro", () => {
  it("sin parámetros no hay nada que rellenar", () => {
    expect(leerParametrosRegistro({})).toEqual({ valoresIniciales: {} });
  });

  it("lo que arma enlaceRegistrar se lee igual (ida y vuelta)", () => {
    const { valoresIniciales, compra } = leerParametrosRegistro(paramsDe(enlaceRegistrar(oferta, "tecnologia", "https://img.test/a.jpg")));
    expect(valoresIniciales).toEqual({
      descripcion: "Audífonos Bluetooth JBL 510",
      monto: "129.900",
      categoria: "tecnologia",
      tienda: "Alkosto",
    });
    expect(compra).toEqual({
      producto: "Audífonos Bluetooth JBL 510",
      precio: 129900,
      tienda: "Alkosto",
      enlace: "https://www.alkosto.com/audifonos-jbl",
      imagen: "https://img.test/a.jpg",
      tipo: "tecnologia",
      categoria: "tecnologia",
    });
  });

  it("sin origen «recomendar» solo rellena el formulario", () => {
    const r = leerParametrosRegistro({ descripcion: "Café", monto: "5000" });
    expect(r.valoresIniciales).toEqual({ descripcion: "Café", monto: "5.000" });
    expect(r.compra).toBeUndefined();
  });

  it("con origen pero sin monto no hay resumen de compra", () => {
    const r = leerParametrosRegistro({ origen: "recomendar", descripcion: "Café" });
    expect(r.compra).toBeUndefined();
  });

  it("con origen pero sin descripción no hay resumen de compra", () => {
    expect(leerParametrosRegistro({ origen: "recomendar", monto: "5000" }).compra).toBeUndefined();
  });

  it("ignora una categoría que no está en la lista", () => {
    expect(leerParametrosRegistro({ categoria: "hack" }).valoresIniciales.categoria).toBeUndefined();
  });

  it("ignora un tipo de producto desconocido", () => {
    const r = leerParametrosRegistro({ origen: "recomendar", descripcion: "Café", monto: "5000", tipo: "cualquiera" });
    expect(r.compra?.tipo).toBeUndefined();
  });

  it.each(["abc", "", "-5", "0", "1e3", "12,5x"])("ignora un monto inválido «%s»", (monto) => {
    expect(leerParametrosRegistro({ monto }).valoresIniciales.monto).toBeUndefined();
  });

  it("acepta un monto con separador de miles", () => {
    expect(leerParametrosRegistro({ monto: "$ 25.000" }).valoresIniciales.monto).toBe("25.000");
  });

  it("ignora un monto por encima del máximo (no lo recorta)", () => {
    expect(leerParametrosRegistro({ monto: "9999999999" }).valoresIniciales.monto).toBeUndefined();
    expect(leerParametrosRegistro({ monto: "999999999" }).valoresIniciales.monto).toBe("999.999.999");
  });

  it("recorta la descripción y la tienda a 80 caracteres", () => {
    const r = leerParametrosRegistro({ descripcion: "a".repeat(500), tienda: "b".repeat(500) });
    expect(r.valoresIniciales.descripcion).toHaveLength(80);
    expect(r.valoresIniciales.tienda).toHaveLength(80);
  });

  it("limpia los espacios de la descripción", () => {
    expect(leerParametrosRegistro({ descripcion: "  Pan   tajado " }).valoresIniciales.descripcion).toBe("Pan tajado");
  });

  it("descarta enlaces e imágenes peligrosos o que no son https", () => {
    const r = leerParametrosRegistro({
      origen: "recomendar",
      descripcion: "Café",
      monto: "5000",
      enlace: "javascript:alert(1)",
      imagen: "http://img.test/a.jpg",
    });
    expect(r.compra?.enlace).toBeUndefined();
    expect(r.compra?.imagen).toBeUndefined();
  });

  it("ignora los valores repetidos (llegan como lista)", () => {
    const r = leerParametrosRegistro({ descripcion: ["a", "b"], monto: ["1", "2"], tienda: ["x", "y"] });
    expect(r.valoresIniciales).toEqual({});
  });
});
