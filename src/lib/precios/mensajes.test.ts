import { describe, expect, it } from "vitest";
import { mensajeDeErrorProveedor } from "@/lib/precios/mensajes";
import { codigoDeError, ErrorProveedor } from "@/lib/precios/tipos";

describe("mensajeDeErrorProveedor", () => {
  it.each([
    ["clave", "La clave del servicio de precios no es válida. Revisa SERPAPI_API_KEY."],
    ["limite", "Se alcanzó el límite de búsquedas del servicio de precios. Inténtalo más tarde."],
    ["red", "No pudimos conectarnos al servicio de precios. Inténtalo de nuevo en un momento."],
    ["respuesta", "El servicio de precios respondió algo inesperado. Inténtalo de nuevo."],
  ] as const)("da un mensaje en español para %s", (codigo, mensaje) => {
    expect(mensajeDeErrorProveedor(codigo)).toBe(mensaje);
  });
});

describe("codigoDeError", () => {
  it("lee el código de un ErrorProveedor", () => {
    expect(codigoDeError(new ErrorProveedor("limite"))).toBe("limite");
  });

  it("recupera el código aunque el error haya perdido su clase", () => {
    expect(codigoDeError(new Error(new ErrorProveedor("clave").message))).toBe("clave");
    expect(codigoDeError(new Error("proveedor:red:sin conexión"))).toBe("red");
  });

  it("cualquier otro error cuenta como «respuesta»", () => {
    expect(codigoDeError(new Error("algo raro"))).toBe("respuesta");
    expect(codigoDeError("texto suelto")).toBe("respuesta");
    expect(codigoDeError(undefined)).toBe("respuesta");
  });

  it("el mensaje de un ErrorProveedor lleva el código y el detalle", () => {
    expect(new ErrorProveedor("respuesta", "Estado 500").message).toBe("proveedor:respuesta:Estado 500");
    expect(new ErrorProveedor("red").message).toBe("proveedor:red");
    expect(new ErrorProveedor("red").name).toBe("ErrorProveedor");
  });
});
