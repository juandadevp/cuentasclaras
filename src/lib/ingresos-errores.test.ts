import { describe, expect, it } from "vitest";
import { mensajeDeErrorIngreso } from "@/lib/ingresos-errores";

const CRUDO = 'relation "ingresos" secreto interno';

describe("mensajeDeErrorIngreso", () => {
  it.each(["42P01", "PGRST205"])("pide ejecutar la migración «ingresos» cuando falta la tabla (%s)", (code) => {
    const mensaje = mensajeDeErrorIngreso({ code });
    expect(mensaje).toContain("ingresos");
    expect(mensaje).toContain("migración");
  });

  it("explica que los datos no cumplen las reglas (23514)", () => {
    expect(mensajeDeErrorIngreso({ code: "23514" })).toContain("reglas");
  });

  it("avisa de permiso o sesión (42501)", () => {
    expect(mensajeDeErrorIngreso({ code: "42501" })).toMatch(/permiso|sesión/i);
  });

  it("un código desconocido da un mensaje genérico no vacío", () => {
    expect(mensajeDeErrorIngreso({ code: "XX999" }).trim()).not.toBe("");
  });

  it("un error vacío da un mensaje genérico no vacío", () => {
    expect(mensajeDeErrorIngreso({}).trim()).not.toBe("");
  });

  it.each(["42P01", "PGRST205", "23514", "42501", "XX999", undefined])(
    "nunca muestra el message crudo (código %s)",
    (code) => {
      const mensaje = mensajeDeErrorIngreso({ code, message: CRUDO });
      expect(mensaje.trim()).not.toBe("");
      expect(mensaje).not.toContain("secreto");
      expect(mensaje).not.toContain("interno");
    },
  );
});
