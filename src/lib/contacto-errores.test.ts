import { describe, expect, it } from "vitest";
import { mensajeDeErrorContacto } from "@/lib/contacto-errores";

describe("mensajeDeErrorContacto", () => {
  it.each(["42P01", "PGRST205"])("avisa que falta la tabla con el código %s", (code) => {
    expect(mensajeDeErrorContacto({ code })).toBe(
      "Falta crear la tabla de contacto. Ejecuta la migración «contacto» en el SQL Editor de Supabase.",
    );
  });

  it("avisa que falta actualizar la base de datos si falta una columna", () => {
    expect(mensajeDeErrorContacto({ code: "PGRST204" })).toBe(
      "Falta actualizar la base de datos. Ejecuta la migración «contacto» en el SQL Editor de Supabase.",
    );
  });

  it("explica que los datos no cumplen las reglas", () => {
    expect(mensajeDeErrorContacto({ code: "23514" })).toBe(
      "Los datos no cumplen las reglas de la base de datos. Revisa tu nombre, tu correo y tu mensaje.",
    );
  });

  it("responde con un mensaje general si no hay permiso", () => {
    expect(mensajeDeErrorContacto({ code: "42501" })).toBe("No pudimos enviar tu mensaje. Inténtalo más tarde.");
  });

  it("usa un mensaje general con un código desconocido o sin código", () => {
    const general = "No pudimos enviar tu mensaje. Inténtalo de nuevo en un momento.";
    expect(mensajeDeErrorContacto({ code: "XX000" })).toBe(general);
    expect(mensajeDeErrorContacto({})).toBe(general);
  });

  it("nunca muestra el texto crudo del error", () => {
    const texto = mensajeDeErrorContacto({ code: "XX000", message: 'duplicate key value violates "secreto"' });
    expect(texto).not.toContain("secreto");
  });
});
