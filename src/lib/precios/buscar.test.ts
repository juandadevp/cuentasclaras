import { beforeEach, describe, expect, it, vi } from "vitest";
import { buscarOfertas, hayClaveConfigurada, vaciarCacheDePrecios } from "@/lib/precios/buscar";
import { ErrorProveedor, type Oferta } from "@/lib/precios/tipos";

// Nunca se llama a la API real: el proveedor es una función falsa.
const oferta = (tienda: string, precio: number, titulo = "Acetaminofén 500 mg x100"): Oferta => ({ titulo, tienda, precio, idProducto: "p1" });
const proveedor = (ofertas: Oferta[] = [oferta("Cruz Verde", 20_000), oferta("Homecenter", 15_000), oferta("Farmatodo", 18_000)]) =>
  vi.fn(async () => ofertas);

beforeEach(() => vaciarCacheDePrecios());

describe("hayClaveConfigurada", () => {
  it("solo es true con una clave que no esté vacía", () => {
    expect(hayClaveConfigurada("abc")).toBe(true);
    expect(hayClaveConfigurada("")).toBe(false);
    expect(hayClaveConfigurada("   ")).toBe(false);
    expect(hayClaveConfigurada(undefined)).toBe(false);
  });
});

describe("buscarOfertas", () => {
  it("sin clave usa precios de ejemplo y no llama al proveedor", async () => {
    const consultar = proveedor();
    const r = await buscarOfertas("leche", undefined, { clave: "", consultar });
    expect(r.modo).toBe("demo");
    expect(r.ok).toBe(true);
    expect(r.ofertas.length).toBeGreaterThan(0);
    expect(r.ofertas.every((o) => o.detalle === "Precio de ejemplo")).toBe(true);
    expect(consultar).not.toHaveBeenCalled();
  });

  it("con clave consulta al proveedor y marca el modo real", async () => {
    const consultar = proveedor();
    const r = await buscarOfertas("acetaminofén", undefined, { clave: "abc", consultar });
    expect(r.modo).toBe("real");
    expect(consultar).toHaveBeenCalledWith("acetaminofén", "abc");
  });

  it("detecta el tipo de producto, marca las tiendas relevantes y ordena por precio", async () => {
    const r = await buscarOfertas("acetaminofén", undefined, { clave: "abc", consultar: proveedor() });
    expect(r.rubro).toBe("medicamentos");
    expect(r.automatico).toBe(true);
    expect(r.ofertas.map((o) => o.precio)).toEqual([15_000, 18_000, 20_000]);
    expect(r.ofertas.map((o) => [o.tienda, o.relevante])).toEqual([
      ["Homecenter", false],
      ["Farmatodo", true],
      ["Cruz Verde", true],
    ]);
    expect(r.tiendasDelTipo).toContain("Farmatodo");
  });

  it("respeta el tipo elegido por la persona", async () => {
    const r = await buscarOfertas("acetaminofén", "tecnologia", { clave: "abc", consultar: proveedor() });
    expect(r.rubro).toBe("tecnologia");
    expect(r.automatico).toBe(false);
  });

  it("si no reconoce el tipo, todas las ofertas cuentan como relevantes", async () => {
    const r = await buscarOfertas("cosa rara", undefined, { clave: "abc", consultar: proveedor() });
    expect(r.rubro).toBeNull();
    expect(r.ofertas.every((o) => o.relevante)).toBe(true);
    expect(r.tiendasDelTipo).toEqual([]);
  });

  it("la segunda búsqueda igual sale de la caché y no gasta otra consulta", async () => {
    const consultar = proveedor();
    await buscarOfertas("Leche  Entera", undefined, { clave: "abc", consultar });
    await buscarOfertas("leche entera", undefined, { clave: "abc", consultar });
    expect(consultar).toHaveBeenCalledTimes(1);
  });

  it("la caché vence a los 5 minutos", async () => {
    const consultar = proveedor();
    let ahora = 1_000_000;
    const dependencias = { clave: "abc", consultar, ahora: () => ahora };
    await buscarOfertas("leche", undefined, dependencias);
    ahora += 5 * 60_000 - 1;
    await buscarOfertas("leche", undefined, dependencias);
    expect(consultar).toHaveBeenCalledTimes(1);
    ahora += 2;
    await buscarOfertas("leche", undefined, dependencias);
    expect(consultar).toHaveBeenCalledTimes(2);
  });

  it("un error del proveedor no se guarda en la caché", async () => {
    const consultar = vi
      .fn<(consulta: string, clave: string) => Promise<Oferta[]>>()
      .mockRejectedValueOnce(new ErrorProveedor("limite"))
      .mockResolvedValueOnce([oferta("Éxito", 1000)]);
    await expect(buscarOfertas("leche", undefined, { clave: "abc", consultar })).rejects.toMatchObject({ codigo: "limite" });
    const r = await buscarOfertas("leche", undefined, { clave: "abc", consultar });
    expect(r.ofertas).toHaveLength(1);
    expect(consultar).toHaveBeenCalledTimes(2);
  });

  it("dos búsquedas iguales al mismo tiempo comparten una sola consulta", async () => {
    const consultar = vi.fn(async () => {
      await new Promise((resolver) => setTimeout(resolver, 10));
      return [oferta("Éxito", 1000)];
    });
    const [a, b] = await Promise.all([
      buscarOfertas("leche", undefined, { clave: "abc", consultar }),
      buscarOfertas("leche", undefined, { clave: "abc", consultar }),
    ]);
    expect(consultar).toHaveBeenCalledTimes(1);
    expect(a.ofertas).toEqual(b.ofertas);
  });

  it("búsquedas distintas hacen consultas distintas", async () => {
    const consultar = proveedor();
    await buscarOfertas("leche", undefined, { clave: "abc", consultar });
    await buscarOfertas("arroz", undefined, { clave: "abc", consultar });
    expect(consultar).toHaveBeenCalledTimes(2);
  });

  it("no mezcla las ofertas de la caché con las de otra búsqueda", async () => {
    const r1 = await buscarOfertas("leche", undefined, { clave: "abc", consultar: proveedor([oferta("Éxito", 1000, "Leche")]) });
    const r2 = await buscarOfertas("arroz", undefined, { clave: "abc", consultar: proveedor([oferta("Jumbo", 2000, "Arroz")]) });
    expect(r1.ofertas[0].titulo).toBe("Leche");
    expect(r2.ofertas[0].titulo).toBe("Arroz");
  });

  it("devuelve la fecha de la consulta en formato ISO", async () => {
    const r = await buscarOfertas("leche", undefined, { clave: "abc", consultar: proveedor(), ahora: () => Date.UTC(2026, 10, 3, 12) });
    expect(r.actualizado).toBe("2026-11-03T12:00:00.000Z");
  });
});
