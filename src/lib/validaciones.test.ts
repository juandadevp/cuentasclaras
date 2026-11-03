import { describe, expect, it } from "vitest";
import {
  validarClave,
  validarConfirmacion,
  validarEmail,
  validarNombre,
  validarNuevaClave,
  validarRecuperacion,
  validarRegistro,
  validarTelefono,
} from "@/lib/validaciones";

describe("validarClave", () => {
  it("acepta una contraseña que cumple todas las reglas", () => {
    expect(validarClave("Abcdef12")).toBeUndefined();
  });

  it("pide la contraseña si está vacía", () => {
    expect(validarClave("")).toBe("Crea una contraseña.");
  });

  it("exige mínimo 8 caracteres", () => {
    expect(validarClave("Ab1")).toBe("La contraseña necesita: mínimo 8 caracteres.");
  });

  it("exige una mayúscula", () => {
    expect(validarClave("abcdef12")).toBe("La contraseña necesita: una letra mayúscula.");
  });

  it("exige una minúscula", () => {
    expect(validarClave("ABCDEF12")).toBe("La contraseña necesita: una letra minúscula.");
  });

  it("exige un número", () => {
    expect(validarClave("Abcdefgh")).toBe("La contraseña necesita: un número.");
  });

  it("rechaza espacios", () => {
    expect(validarClave("Abc def12")).toBe("La contraseña no puede tener espacios.");
  });

  it("rechaza contraseñas de más de 64 caracteres", () => {
    expect(validarClave("Aa1" + "x".repeat(70))).toBe("La contraseña es demasiado larga (máximo 64).");
  });
});

describe("validarConfirmacion", () => {
  it("acepta cuando coinciden", () => {
    expect(validarConfirmacion("Abcdef12", "Abcdef12")).toBeUndefined();
  });

  it("pide confirmar si está vacía", () => {
    expect(validarConfirmacion("Abcdef12", "")).toBe("Confirma tu contraseña.");
  });

  it("avisa si no coinciden", () => {
    expect(validarConfirmacion("Abcdef12", "Abcdef13")).toBe("Las contraseñas no coinciden.");
  });
});

describe("validarEmail", () => {
  it("acepta un correo válido", () => {
    expect(validarEmail("ana@correo.com")).toBeUndefined();
  });

  it("pide el correo si está vacío", () => {
    expect(validarEmail("   ")).toBe("Ingresa tu correo electrónico.");
  });

  it("rechaza un correo sin formato", () => {
    expect(validarEmail("hola")).toBe("Ingresa un correo válido, por ejemplo nombre@correo.com.");
  });
});

describe("validarTelefono", () => {
  it("acepta un celular colombiano con espacios", () => {
    expect(validarTelefono("300 123 4567")).toBeUndefined();
  });

  it("acepta el prefijo +57", () => {
    expect(validarTelefono("+57 300 1234567")).toBeUndefined();
  });

  it("exige 10 dígitos", () => {
    expect(validarTelefono("300123")).toBe("El celular debe tener 10 dígitos.");
  });

  it("exige que empiece por 3", () => {
    expect(validarTelefono("2001234567")).toBe("El celular debe empezar por 3.");
  });

  it("rechaza letras", () => {
    expect(validarTelefono("300abc4567")).toBe("El teléfono solo puede tener números.");
  });
});

describe("validarNombre", () => {
  it("acepta nombre y apellido", () => {
    expect(validarNombre("Ana Pérez")).toBeUndefined();
  });

  it("pide nombre y apellido", () => {
    expect(validarNombre("Ana")).toBe("Escribe tu nombre y tu apellido.");
  });

  it("rechaza números", () => {
    expect(validarNombre("Ana3 Pérez")).toBe("Usa solo letras y espacios.");
  });
});

describe("validarRegistro", () => {
  it("no devuelve errores con datos correctos", () => {
    const errores = validarRegistro({
      nombre: "Ana Pérez",
      email: "ana@correo.com",
      telefono: "3001234567",
      clave: "Abcdef12",
      confirmar: "Abcdef12",
    });
    expect(errores).toEqual({});
  });

  it("devuelve un error por cada campo malo", () => {
    const errores = validarRegistro({ nombre: "", email: "x", telefono: "1", clave: "a", confirmar: "b" });
    expect(Object.keys(errores).sort()).toEqual(["clave", "confirmar", "email", "nombre", "telefono"]);
  });
});

describe("recuperar contraseña", () => {
  it("validarRecuperacion solo revisa el correo", () => {
    expect(validarRecuperacion({ email: "ana@correo.com" })).toEqual({});
    expect(validarRecuperacion({ email: "hola" })).toHaveProperty("email");
  });

  it("validarNuevaClave usa las mismas reglas del registro", () => {
    expect(validarNuevaClave({ clave: "Abcdef12", confirmar: "Abcdef12" })).toEqual({});
    expect(validarNuevaClave({ clave: "abc", confirmar: "abc" })).toHaveProperty("clave");
    expect(validarNuevaClave({ clave: "Abcdef12", confirmar: "otra" })).toHaveProperty("confirmar");
  });
});
