import { describe, expect, it } from "vitest";
import { detectarRubro } from "@/lib/precios/detectar";
import { listaRubros, rubros, type Rubro } from "@/lib/precios/rubros";

const rubroDe = (consulta: string) => detectarRubro(consulta).rubro;

describe("detectarRubro", () => {
  it.each<[string, Rubro]>([
    ["acetaminofén", "medicamentos"],
    ["ibuprofeno 400", "medicamentos"],
    ["shampoo", "cuidado_personal"],
    ["crema dental", "cuidado_personal"],
    ["leche", "alimentos"],
    ["arroz diana", "alimentos"],
    ["detergente en polvo", "aseo_hogar"],
    ["pañales etapa 3", "bebes"],
    ["celular samsung", "tecnologia"],
    ["audífonos inalámbricos", "tecnologia"],
    ["nevera", "electrodomesticos"],
    ["taladro", "ferreteria"],
    ["colchón", "muebles"],
    ["balón de fútbol", "deportes"],
    ["cuaderno", "libros_papeleria"],
    ["tenis", "moda"],
    ["lego", "juguetes"],
    ["arena para gato", "mascotas"],
    ["casco moto", "vehiculos"],
  ])("reconoce %j como %s", (consulta, esperado) => {
    expect(rubroDe(consulta)).toBe(esperado);
  });

  describe("plurales", () => {
    it.each<[string, Rubro]>([
      ["pañales", "bebes"],
      ["televisores", "tecnologia"],
      ["lavadoras", "electrodomesticos"],
      ["audífonos", "tecnologia"],
      ["celulares", "tecnologia"],
      ["libros", "libros_papeleria"],
      ["huevos", "alimentos"],
      ["licuadoras", "electrodomesticos"],
      ["colchones", "muebles"],
    ])("%j → %s", (consulta, esperado) => {
      expect(rubroDe(consulta)).toBe(esperado);
    });
  });

  describe("errores de escritura", () => {
    it.each<[string, Rubro]>([
      ["acetamimofen", "medicamentos"],
      ["ibuprofeno", "medicamentos"],
      ["ibuprofen", "medicamentos"],
      ["refrigerdor", "electrodomesticos"],
      ["lavdora", "electrodomesticos"],
      ["televsor", "tecnologia"],
      ["detergnte", "aseo_hogar"],
      ["colchon", "muebles"],
      ["audifonos", "tecnologia"],
    ])("%j → %s", (consulta, esperado) => {
      expect(rubroDe(consulta)).toBe(esperado);
    });
  });

  it("ignora tildes y mayúsculas", () => {
    expect(rubroDe("ACETAMINOFÉN")).toBe("medicamentos");
    expect(rubroDe("Pañales")).toBe("bebes");
    expect(rubroDe("PAÑALES")).toBe("bebes");
  });

  it("las frases de varias palabras pesan más que una palabra suelta", () => {
    // «casco» solo podría ser ferretería (casco de seguridad); con «moto» es de vehículos.
    expect(rubroDe("casco moto")).toBe("vehiculos");
    expect(rubroDe("crema dental")).toBe("cuidado_personal");
    expect(rubroDe("arena para gato")).toBe("mascotas");
  });

  it("las medidas y los envases no cambian el tipo", () => {
    expect(rubroDe("leche 1 litro")).toBe("alimentos");
    expect(rubroDe("leche paquete grande")).toBe("alimentos");
  });

  it("devuelve las palabras que permitieron reconocer el producto", () => {
    const { rubro, coincidencias } = detectarRubro("leche entera");
    expect(rubro).toBe("alimentos");
    expect(coincidencias).toContain("leche");
  });

  it.each(["", "   ", "xyzqw", "asdfgh", "1234", "???"])("devuelve null para %j", (consulta) => {
    expect(detectarRubro(consulta)).toEqual({ rubro: null, coincidencias: [] });
  });

  it("no confunde palabras cortas distintas con una errata", () => {
    expect(rubroDe("mesa")).not.toBe("alimentos");
    expect(rubroDe("pan")).toBe("alimentos");
  });

  it("cada ejemplo de cada tipo de producto se detecta como ese tipo", () => {
    for (const rubro of listaRubros) {
      for (const ejemplo of rubros[rubro].ejemplos) {
        expect(`${ejemplo} → ${rubroDe(ejemplo)}`).toBe(`${ejemplo} → ${rubro}`);
      }
    }
  });
});
