import { describe, expect, it } from "vitest";
import { mensajeDeErrorGasto } from "@/lib/gastos-errores";

describe("mensajeDeErrorGasto", () => {
  it.each(["42P01", "PGRST205"])("pide ejecutar la migración cuando falta la tabla (%s)", (code) => {
    expect(mensajeDeErrorGasto({ code })).toBe(
      "Falta crear la tabla de gastos. Ejecuta la migración «gastos» en el SQL Editor de Supabase.",
    );
  });

  it("pide actualizar la base de datos cuando falta una columna", () => {
    expect(mensajeDeErrorGasto({ code: "PGRST204" })).toContain("Falta actualizar la base de datos");
  });

  it("explica que los datos no cumplen las reglas", () => {
    expect(mensajeDeErrorGasto({ code: "23514" })).toContain("no cumplen las reglas");
  });

  it("avisa cuando no hay permiso", () => {
    expect(mensajeDeErrorGasto({ code: "42501" })).toContain("No tienes permiso");
  });

  it("no muestra el texto crudo del error en los casos desconocidos", () => {
    const mensaje = mensajeDeErrorGasto({ code: "XX999", message: 'duplicate key value violates "secreto"' });
    expect(mensaje).toBe("No pudimos completar la operación con tus gastos. Inténtalo de nuevo.");
    expect(mensaje).not.toContain("secreto");
  });
});
