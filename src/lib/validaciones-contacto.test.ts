import { describe, expect, it } from "vitest";
import type { DatosContacto } from "@/lib/contacto-tipos";
import { asuntosContacto, esAsunto, normalizarContacto, validarContacto } from "@/lib/validaciones-contacto";

const valido: DatosContacto = {
  nombre: "Ana Pérez",
  correo: "ana@correo.com",
  asunto: "consulta",
  mensaje: "Hola, tengo una duda sobre el presupuesto.",
};

const con = (cambios: Partial<DatosContacto>): DatosContacto => ({ ...valido, ...cambios });

describe("validarContacto", () => {
  it("acepta unos datos correctos", () => {
    expect(validarContacto(valido)).toEqual({});
  });

  describe("nombre", () => {
    it("pide el nombre si está vacío o son solo espacios", () => {
      expect(validarContacto(con({ nombre: "" })).nombre).toBe("Ingresa tu nombre.");
      expect(validarContacto(con({ nombre: "   " })).nombre).toBe("Ingresa tu nombre.");
    });

    it("rechaza 2 caracteres y acepta 3", () => {
      expect(validarContacto(con({ nombre: "Al" })).nombre).toBe("El nombre debe tener al menos 3 caracteres.");
      expect(validarContacto(con({ nombre: "Ana" })).nombre).toBeUndefined();
    });

    it("acepta 80 caracteres y rechaza 81", () => {
      expect(validarContacto(con({ nombre: "a".repeat(80) })).nombre).toBeUndefined();
      expect(validarContacto(con({ nombre: "a".repeat(81) })).nombre).toBe("El nombre es demasiado largo (máximo 80).");
    });

    it("acepta un solo nombre, sin apellido", () => {
      expect(validarContacto(con({ nombre: "Camila" })).nombre).toBeUndefined();
    });

    it("rechaza números y símbolos", () => {
      expect(validarContacto(con({ nombre: "Ana 123" })).nombre).toBe("Usa solo letras y espacios.");
      expect(validarContacto(con({ nombre: "Ana <b>" })).nombre).toBe("Usa solo letras y espacios.");
    });

    it("acepta tildes, apóstrofos, puntos y guiones", () => {
      expect(validarContacto(con({ nombre: "María-José O'Brien Jr." })).nombre).toBeUndefined();
    });

    it("cuenta el largo sin espacios de más", () => {
      expect(validarContacto(con({ nombre: "     Al     " })).nombre).toBe("El nombre debe tener al menos 3 caracteres.");
      // Los espacios dobles se cuentan como uno: «A      l» queda como «A l» (3 caracteres).
      expect(validarContacto(con({ nombre: "A      l" })).nombre).toBeUndefined();
    });
  });

  describe("correo", () => {
    it("pide el correo si está vacío", () => {
      expect(validarContacto(con({ correo: "" })).correo).toBe("Ingresa tu correo electrónico.");
    });

    it("rechaza un correo sin arroba o sin dominio", () => {
      const mensaje = "Ingresa un correo válido, por ejemplo nombre@correo.com.";
      expect(validarContacto(con({ correo: "ana.correo.com" })).correo).toBe(mensaje);
      expect(validarContacto(con({ correo: "ana@" })).correo).toBe(mensaje);
      expect(validarContacto(con({ correo: "ana@correo" })).correo).toBe(mensaje);
    });

    it("acepta 120 caracteres y rechaza 121", () => {
      const resto = "@correo.com";
      expect(validarContacto(con({ correo: "a".repeat(120 - resto.length) + resto })).correo).toBeUndefined();
      expect(validarContacto(con({ correo: "a".repeat(121 - resto.length) + resto })).correo).toBeDefined();
    });

    it("acepta un correo con espacios alrededor", () => {
      expect(validarContacto(con({ correo: "  ana@correo.com " })).correo).toBeUndefined();
    });
  });

  describe("asunto", () => {
    it.each(["consulta", "problema", "sugerencia", "otro"])("acepta «%s»", (asunto) => {
      expect(validarContacto(con({ asunto })).asunto).toBeUndefined();
    });

    it.each(["", "x", "Consulta", "ventas"])("rechaza «%s»", (asunto) => {
      expect(validarContacto(con({ asunto })).asunto).toBe("Elige un asunto.");
    });
  });

  describe("mensaje", () => {
    it("rechaza 9 caracteres y acepta 10", () => {
      expect(validarContacto(con({ mensaje: "a".repeat(9) })).mensaje).toBe("Cuéntanos un poco más (mínimo 10 caracteres).");
      expect(validarContacto(con({ mensaje: "a".repeat(10) })).mensaje).toBeUndefined();
    });

    it("acepta 1000 caracteres y rechaza 1001", () => {
      expect(validarContacto(con({ mensaje: "a".repeat(1000) })).mensaje).toBeUndefined();
      expect(validarContacto(con({ mensaje: "a".repeat(1001) })).mensaje).toBe(
        "El mensaje es demasiado largo (máximo 1000 caracteres).",
      );
    });

    it("no cuenta los espacios del principio y del final", () => {
      expect(validarContacto(con({ mensaje: `   ${"a".repeat(9)}   ` })).mensaje).toBeDefined();
      expect(validarContacto(con({ mensaje: ` ${"a".repeat(1000)} ` })).mensaje).toBeUndefined();
    });

    it("rechaza un mensaje de puros espacios y saltos de línea", () => {
      expect(validarContacto(con({ mensaje: " \n \n      " })).mensaje).toBeDefined();
    });
  });

  it("devuelve todos los errores a la vez", () => {
    const errores = validarContacto({ nombre: "", correo: "", asunto: "", mensaje: "" });
    expect(Object.keys(errores).sort()).toEqual(["asunto", "correo", "mensaje", "nombre"]);
  });
});

describe("normalizarContacto", () => {
  it("recorta y colapsa los espacios del nombre", () => {
    expect(normalizarContacto(con({ nombre: "  Ana    María   Pérez " })).nombre).toBe("Ana María Pérez");
  });

  it("deja el correo en minúsculas y sin espacios", () => {
    expect(normalizarContacto(con({ correo: "  Ana@Correo.COM " })).correo).toBe("ana@correo.com");
  });

  it("recorta el mensaje pero conserva los saltos de línea", () => {
    expect(normalizarContacto(con({ mensaje: "  Hola\n\nGracias  " })).mensaje).toBe("Hola\n\nGracias");
  });

  it("quita el carácter nulo y otros de control", () => {
    const r = normalizarContacto({ nombre: "An\u0000a", correo: "a\u0007na@correo.com", asunto: "otro", mensaje: "Hola\u0000 mundo\u007F!!!" });
    expect(r.nombre).toBe("Ana");
    expect(r.correo).toBe("ana@correo.com");
    expect(r.mensaje).toBe("Hola mundo!!!");
  });

  it("no cambia el asunto", () => {
    expect(normalizarContacto(con({ asunto: "problema" })).asunto).toBe("problema");
  });
});

describe("esAsunto", () => {
  it("reconoce exactamente los asuntos de la lista", () => {
    for (const a of asuntosContacto) expect(esAsunto(a.valor)).toBe(true);
    expect(esAsunto("otros")).toBe(false);
    expect(esAsunto("")).toBe(false);
  });

  it("tiene los cuatro asuntos pedidos", () => {
    expect(asuntosContacto.map((a) => a.valor)).toEqual(["consulta", "problema", "sugerencia", "otro"]);
  });
});
