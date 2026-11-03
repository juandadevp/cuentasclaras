import { describe, expect, it } from "vitest";
import {
  soloDigitosTelefono,
  validarClave,
  validarConfirmacion,
  validarEmail,
  validarLogin,
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

  it("rechaza 7 caracteres y acepta 8", () => {
    expect(validarClave("Abcde12")).toBe("La contraseña necesita: mínimo 8 caracteres.");
    expect(validarClave("Abcdef12")).toBeUndefined();
  });

  it("rechaza una contraseña sin mayúscula", () => {
    expect(validarClave("abcdef12")).toBe("La contraseña necesita: una letra mayúscula.");
  });

  it("rechaza una contraseña sin minúscula", () => {
    expect(validarClave("ABCDEF12")).toBe("La contraseña necesita: una letra minúscula.");
  });

  it("rechaza una contraseña sin número", () => {
    expect(validarClave("Abcdefgh")).toBe("La contraseña necesita: un número.");
  });

  it("rechaza espacios", () => {
    expect(validarClave("Abc def12")).toBe("La contraseña no puede tener espacios.");
  });

  it("acepta 64 caracteres y rechaza 65", () => {
    expect(validarClave("Aa1" + "x".repeat(61))).toBeUndefined();
    expect(validarClave("Aa1" + "x".repeat(62))).toBe("La contraseña es demasiado larga (máximo 64).");
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

describe("validarTelefono", () => {
  it.each(["3001234567", "300 123 4567", "+57 300 123 4567", "573001234567", "(300) 123-4567"])(
    "acepta el celular %s",
    (valor) => {
      expect(validarTelefono(valor)).toBeUndefined();
    },
  );

  it("pide el celular si está vacío", () => {
    expect(validarTelefono("  ")).toBe("Ingresa tu número de celular.");
  });

  it("rechaza 9 y 11 dígitos", () => {
    expect(validarTelefono("300123456")).toBe("El celular debe tener 10 dígitos.");
    expect(validarTelefono("30012345678")).toBe("El celular debe tener 10 dígitos.");
  });

  it("rechaza un celular que no empieza por 3", () => {
    expect(validarTelefono("2001234567")).toBe("El celular debe empezar por 3.");
  });

  it("rechaza letras", () => {
    expect(validarTelefono("300abc4567")).toBe("El teléfono solo puede tener números.");
  });
});

describe("soloDigitosTelefono", () => {
  it("deja solo los dígitos y quita el prefijo 57", () => {
    expect(soloDigitosTelefono("+57 (300) 123-4567")).toBe("3001234567");
    expect(soloDigitosTelefono("300 123 4567")).toBe("3001234567");
  });
});

describe("validarNombre", () => {
  it("acepta nombre y apellido con tildes", () => {
    expect(validarNombre("Ana María Pérez")).toBeUndefined();
  });

  it("pide el nombre si está vacío", () => {
    expect(validarNombre("   ")).toBe("Ingresa tu nombre completo.");
  });

  it("rechaza números", () => {
    expect(validarNombre("Ana 123")).toBe("Usa solo letras y espacios.");
  });

  it("exige nombre y apellido", () => {
    expect(validarNombre("Ana")).toBe("Escribe tu nombre y tu apellido.");
  });

  it("acepta 80 caracteres y rechaza 81", () => {
    expect(validarNombre(`Ana ${"a".repeat(76)}`)).toBeUndefined();
    expect(validarNombre(`Ana ${"a".repeat(77)}`)).toBe("El nombre es demasiado largo (máximo 80).");
  });
});

describe("validarEmail", () => {
  it("acepta un correo válido", () => {
    expect(validarEmail("ana@correo.com")).toBeUndefined();
  });

  it("pide el correo si está vacío", () => {
    expect(validarEmail("")).toBe("Ingresa tu correo electrónico.");
  });

  it.each(["ana", "ana@", "ana@correo", "ana@correo.c", "ana perez@correo.com"])("rechaza %s", (valor) => {
    expect(validarEmail(valor)).toBe("Ingresa un correo válido, por ejemplo nombre@correo.com.");
  });
});

describe("validarRegistro", () => {
  const valido = {
    nombre: "Ana Pérez",
    email: "ana@correo.com",
    telefono: "3001234567",
    clave: "Abcdef12",
    confirmar: "Abcdef12",
  };

  it("no devuelve errores con datos correctos", () => {
    expect(validarRegistro(valido)).toEqual({});
  });

  it("devuelve solo los campos con error", () => {
    expect(validarRegistro({ ...valido, telefono: "2001234567", confirmar: "otra" })).toEqual({
      telefono: "El celular debe empezar por 3.",
      confirmar: "Las contraseñas no coinciden.",
    });
  });
});

describe("validarLogin", () => {
  it("no devuelve errores con correo y contraseña", () => {
    expect(validarLogin({ email: "ana@correo.com", clave: "x" })).toEqual({});
  });

  it("pide la contraseña sin exigir sus reglas", () => {
    expect(validarLogin({ email: "ana@correo.com", clave: "" })).toEqual({ clave: "Ingresa tu contraseña." });
  });

  it("valida el correo", () => {
    expect(validarLogin({ email: "ana", clave: "x" })).toEqual({
      email: "Ingresa un correo válido, por ejemplo nombre@correo.com.",
    });
  });
});

describe("validarRecuperacion", () => {
  it("acepta un correo válido", () => {
    expect(validarRecuperacion({ email: "ana@correo.com" })).toEqual({});
  });

  it("pide el correo si está vacío", () => {
    expect(validarRecuperacion({ email: "  " })).toEqual({ email: "Ingresa tu correo electrónico." });
  });

  it.each(["ana", "ana@", "ana@correo", "ana perez@correo.com"])("rechaza el correo %j", (email) => {
    expect(validarRecuperacion({ email })).toEqual({ email: "Ingresa un correo válido, por ejemplo nombre@correo.com." });
  });
});

describe("validarNuevaClave", () => {
  it("acepta una contraseña válida y confirmada", () => {
    expect(validarNuevaClave({ clave: "Abcdef12", confirmar: "Abcdef12" })).toEqual({});
  });

  it.each([
    ["", "Crea una contraseña."],
    ["Abcde12", "La contraseña necesita: mínimo 8 caracteres."],
    ["abcdef12", "La contraseña necesita: una letra mayúscula."],
    ["ABCDEF12", "La contraseña necesita: una letra minúscula."],
    ["Abcdefgh", "La contraseña necesita: un número."],
    ["Abc def12", "La contraseña no puede tener espacios."],
    ["Aa1" + "x".repeat(62), "La contraseña es demasiado larga (máximo 64)."],
  ])("rechaza la contraseña %j", (clave, mensaje) => {
    expect(validarNuevaClave({ clave, confirmar: clave }).clave).toBe(mensaje);
  });

  it("acepta 64 caracteres", () => {
    const clave = "Aa1" + "x".repeat(61);
    expect(validarNuevaClave({ clave, confirmar: clave })).toEqual({});
  });

  it("pide confirmar si la confirmación está vacía", () => {
    expect(validarNuevaClave({ clave: "Abcdef12", confirmar: "" })).toEqual({ confirmar: "Confirma tu contraseña." });
  });

  it("avisa si las contraseñas no coinciden", () => {
    expect(validarNuevaClave({ clave: "Abcdef12", confirmar: "Abcdef13" })).toEqual({ confirmar: "Las contraseñas no coinciden." });
  });

  it("devuelve solo los campos con error", () => {
    expect(Object.keys(validarNuevaClave({ clave: "abc", confirmar: "abc" }))).toEqual(["clave"]);
  });

  it("sigue exactamente las mismas reglas de contraseña que el registro", () => {
    const claves = ["", "Ab1", "Abcde12", "abcdef12", "ABCDEF12", "Abcdefgh", "Abc def12", "Abcdef12", "Aa1" + "x".repeat(61), "Aa1" + "x".repeat(62), "Ñandú2026", "ÁÉÍÓÚ1aaa"];
    for (const clave of claves) {
      const registro = validarRegistro({ nombre: "Ana Pérez", email: "ana@correo.com", telefono: "3001234567", clave, confirmar: clave });
      expect(validarNuevaClave({ clave, confirmar: clave }).clave).toBe(registro.clave);
    }
  });
});
