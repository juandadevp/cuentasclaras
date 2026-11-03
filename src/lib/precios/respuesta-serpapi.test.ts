import { describe, expect, it } from "vitest";
import { ofertasDeRespuesta, soloHttps } from "@/lib/precios/respuesta-serpapi";

const completa = {
  title: "Leche Alpina 1 L",
  source: "Éxito",
  price: "$ 4.590",
  extracted_price: 4590,
  product_id: 123,
  link: "https://exito.com/leche",
  thumbnail: "https://img.com/leche.png",
  delivery: "Envío gratis",
  rating: 4.5,
  reviews: 120,
};

describe("ofertasDeRespuesta", () => {
  it("convierte un resultado completo", () => {
    expect(ofertasDeRespuesta({ shopping_results: [completa] })).toEqual([
      {
        titulo: "Leche Alpina 1 L",
        tienda: "Éxito",
        precio: 4590,
        idProducto: "123",
        enlace: "https://exito.com/leche",
        imagen: "https://img.com/leche.png",
        detalle: "Envío gratis · ★ 4.5 (120)",
      },
    ]);
  });

  it("sin resultados o respuesta vacía devuelve una lista vacía", () => {
    expect(ofertasDeRespuesta({})).toEqual([]);
    expect(ofertasDeRespuesta(null)).toEqual([]);
    expect(ofertasDeRespuesta(undefined)).toEqual([]);
    expect(ofertasDeRespuesta({ shopping_results: "no es una lista" as never })).toEqual([]);
  });

  it("usa extracted_price y, si no sirve, lee el texto del precio", () => {
    expect(ofertasDeRespuesta({ shopping_results: [{ ...completa, extracted_price: 4000, price: "$ 9.999" }] })[0].precio).toBe(4000);
    expect(ofertasDeRespuesta({ shopping_results: [{ ...completa, extracted_price: undefined, price: "$ 12.900" }] })[0].precio).toBe(12_900);
    expect(ofertasDeRespuesta({ shopping_results: [{ ...completa, extracted_price: 0, price: "$ 7.500" }] })[0].precio).toBe(7500);
  });

  it("descarta lo que no tenga título, tienda o precio válido", () => {
    const malos = [
      { ...completa, title: undefined },
      { ...completa, title: "  " },
      { ...completa, source: undefined },
      { ...completa, extracted_price: undefined, price: "gratis" },
      { ...completa, extracted_price: undefined, price: undefined },
      null,
    ];
    expect(ofertasDeRespuesta({ shopping_results: malos as never })).toEqual([]);
  });

  it("quita las ofertas repetidas", () => {
    expect(ofertasDeRespuesta({ shopping_results: [completa, { ...completa }] })).toHaveLength(1);
    expect(ofertasDeRespuesta({ shopping_results: [completa, { ...completa, source: "Jumbo" }] })).toHaveLength(2);
  });

  it("solo acepta enlaces e imágenes https://", () => {
    const [oferta] = ofertasDeRespuesta({
      shopping_results: [{ ...completa, link: "http://exito.com/x", product_link: "https://google.com/p", thumbnail: "javascript:alert(1)" }],
    });
    expect(oferta.enlace).toBe("https://google.com/p");
    expect(oferta.imagen).toBeUndefined();
  });

  it("sin calificación ni envío no inventa un detalle", () => {
    const [oferta] = ofertasDeRespuesta({ shopping_results: [{ ...completa, delivery: undefined, rating: undefined, reviews: undefined }] });
    expect(oferta.detalle).toBeUndefined();
  });
});

describe("soloHttps", () => {
  it("acepta https y rechaza lo demás", () => {
    expect(soloHttps("https://tienda.com/a")).toBe("https://tienda.com/a");
    expect(soloHttps("http://tienda.com/a")).toBeUndefined();
    expect(soloHttps("javascript:alert(1)")).toBeUndefined();
    expect(soloHttps("data:text/html,hola")).toBeUndefined();
    expect(soloHttps("//tienda.com/a")).toBeUndefined();
    expect(soloHttps("no es una url")).toBeUndefined();
    expect(soloHttps("")).toBeUndefined();
    expect(soloHttps(undefined)).toBeUndefined();
    expect(soloHttps(42)).toBeUndefined();
    expect(soloHttps(`https://tienda.com/${"a".repeat(2000)}`)).toBeUndefined();
  });
});
