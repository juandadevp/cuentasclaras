import { describe, expect, it, vi } from "vitest";
import { consultarSerpApi, urlDelServicio } from "@/lib/precios/serpapi";
import { codigoDeError } from "@/lib/precios/tipos";

// Nunca se llama a la API real: todas las pruebas usan un fetch falso.
const respuesta = (cuerpo: unknown, estado = 200) =>
  ({ ok: estado >= 200 && estado < 300, status: estado, json: async () => cuerpo }) as unknown as Response;

const falso = (r: Response) => vi.fn(async () => r) as unknown as typeof fetch & ReturnType<typeof vi.fn>;
const conCodigo = async (promesa: Promise<unknown>) => codigoDeError(await promesa.catch((e) => e));

const bueno = { shopping_results: [{ title: "Leche", source: "Éxito", price: "$ 4.590" }] };

describe("urlDelServicio", () => {
  it("sin valor o vacío usa SerpApi", () => {
    expect(urlDelServicio(undefined)).toBe("https://serpapi.com/search.json");
    expect(urlDelServicio("")).toBe("https://serpapi.com/search.json");
    expect(urlDelServicio("   ")).toBe("https://serpapi.com/search.json");
  });

  it("acepta https y http solo en el propio equipo", () => {
    expect(urlDelServicio("https://pruebas.midominio.com/search")).toBe("https://pruebas.midominio.com/search");
    expect(urlDelServicio("http://localhost:4000/search")).toBe("http://localhost:4000/search");
    expect(urlDelServicio("http://127.0.0.1:4000/search")).toBe("http://127.0.0.1:4000/search");
  });

  it.each(["http://pruebas.midominio.com/search", "ftp://localhost/x", "javascript:alert(1)", "no es una url", "//localhost/x"])(
    "rechaza %j",
    (valor) => {
      expect(urlDelServicio(valor)).toBeNull();
    },
  );
});

describe("consultarSerpApi", () => {
  it("devuelve las ofertas de una respuesta correcta", async () => {
    const ofertas = await consultarSerpApi("leche", "clave", { fetch: falso(respuesta(bueno)), url: "" });
    expect(ofertas).toEqual([expect.objectContaining({ titulo: "Leche", tienda: "Éxito", precio: 4590 })]);
  });

  it("pide Google Shopping de Colombia en español y manda la clave", async () => {
    const fetchFalso = falso(respuesta(bueno));
    await consultarSerpApi("leche entera", "mi-clave", { fetch: fetchFalso, url: "" });
    const [direccion, opciones] = fetchFalso.mock.calls[0] as unknown as [URL, RequestInit];
    expect(direccion.origin + direccion.pathname).toBe("https://serpapi.com/search.json");
    expect(Object.fromEntries(direccion.searchParams)).toEqual({
      engine: "google_shopping",
      q: "leche entera",
      gl: "co",
      hl: "es",
      google_domain: "google.com.co",
      location: "Colombia",
      api_key: "mi-clave",
    });
    expect(opciones.cache).toBe("no-store");
    expect(opciones.signal).toBeInstanceOf(AbortSignal);
  });

  it("usa la dirección de pruebas cuando se indica", async () => {
    const fetchFalso = falso(respuesta(bueno));
    await consultarSerpApi("leche", "clave", { fetch: fetchFalso, url: "http://localhost:4000/search" });
    expect((fetchFalso.mock.calls[0] as unknown as [URL])[0].origin).toBe("http://localhost:4000");
  });

  it("con una dirección no válida no envía la clave a ningún sitio", async () => {
    const fetchFalso = falso(respuesta(bueno));
    expect(await conCodigo(consultarSerpApi("leche", "clave", { fetch: fetchFalso, url: "http://malo.com/search" }))).toBe("respuesta");
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  it.each([
    [401, "clave"],
    [403, "clave"],
    [429, "limite"],
    [500, "respuesta"],
    [404, "respuesta"],
  ] as const)("el estado %d se convierte en el error «%s»", async (estado, codigo) => {
    expect(await conCodigo(consultarSerpApi("leche", "clave", { fetch: falso(respuesta({}, estado)), url: "" }))).toBe(codigo);
  });

  it("un fallo de red es «red»", async () => {
    const roto = vi.fn(async () => {
      throw new TypeError("fetch failed");
    }) as unknown as typeof fetch;
    expect(await conCodigo(consultarSerpApi("leche", "clave", { fetch: roto, url: "" }))).toBe("red");
  });

  it("pasarse del tiempo máximo es «red»", async () => {
    const lento = vi.fn(async () => {
      throw new DOMException("Tiempo agotado", "TimeoutError");
    }) as unknown as typeof fetch;
    expect(await conCodigo(consultarSerpApi("leche", "clave", { fetch: lento, url: "", tiempoMaximoMs: 5 }))).toBe("red");
  });

  it("una respuesta que no es JSON es «respuesta»", async () => {
    const malo = { ok: true, status: 200, json: async () => Promise.reject(new SyntaxError("x")) } as unknown as Response;
    expect(await conCodigo(consultarSerpApi("leche", "clave", { fetch: falso(malo), url: "" }))).toBe("respuesta");
  });

  it.each([
    ["Invalid API key. Your API key should be here: https://serpapi.com/manage-api-key", "clave"],
    ["Your account has run out of searches.", "limite"],
    ["Rate limit exceeded", "limite"],
    ["Algo raro pasó", "respuesta"],
  ] as const)("el error del proveedor %j es «%s»", async (error, codigo) => {
    expect(await conCodigo(consultarSerpApi("leche", "clave", { fetch: falso(respuesta({ error })), url: "" }))).toBe(codigo);
  });

  it("«Google hasn't returned any results» no es un fallo: devuelve una lista vacía", async () => {
    const r = respuesta({ error: "Google hasn't returned any results for this query." });
    expect(await consultarSerpApi("xyzqwerty", "clave", { fetch: falso(r), url: "" })).toEqual([]);
  });

  it("el mensaje del error no incluye la clave ni la dirección", async () => {
    const error = await consultarSerpApi("leche", "clave-secreta", { fetch: falso(respuesta({}, 500)), url: "" }).catch((e) => e);
    expect(String(error.message)).not.toContain("clave-secreta");
    expect(String(error.message)).not.toContain("serpapi.com");
  });
});
