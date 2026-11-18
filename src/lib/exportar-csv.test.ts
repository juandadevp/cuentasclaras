import { describe, expect, it } from "vitest";
import {
  codigoDeExportacion,
  enlaceExportarCsv,
  escaparCampoCsv,
  gastosACsv,
  nombreArchivoCsv,
} from "@/lib/exportar-csv";
import type { FiltrosGastos } from "@/lib/gastos";
import type { Gasto } from "@/types/gasto";

const BOM = "﻿";
const ENCABEZADO = "fecha,descripcion,categoria,tienda,monto";

function gasto(parcial: Partial<Gasto> = {}): Gasto {
  return {
    id: "1",
    descripcion: "Mercado",
    monto: 125000,
    categoria: "alimentacion",
    fecha: "2026-10-05",
    tienda: "Exito",
    ...parcial,
  };
}

describe("escaparCampoCsv", () => {
  it("deja igual un texto simple", () => {
    expect(escaparCampoCsv("Mercado")).toBe("Mercado");
  });

  it("un texto vacío sigue vacío", () => {
    expect(escaparCampoCsv("")).toBe("");
  });

  it("envuelve en comillas un texto con coma", () => {
    expect(escaparCampoCsv("a,b")).toBe('"a,b"');
  });

  it("un campo que es solo una coma va entre comillas", () => {
    expect(escaparCampoCsv(",")).toBe('","');
  });

  it("duplica las comillas internas y envuelve el campo", () => {
    expect(escaparCampoCsv('di "hola"')).toBe('"di ""hola"""');
  });

  it("comillas dobles seguidas se cuadruplican dentro de las comillas externas", () => {
    // entrada: "" (2 comillas) -> internas duplicadas: 4 -> envueltas: 6
    expect(escaparCampoCsv('""')).toBe('""""""');
  });

  it("envuelve en comillas un texto con salto de línea \\n", () => {
    expect(escaparCampoCsv("a\nb")).toBe('"a\nb"');
  });

  it("envuelve en comillas un texto con \\r\\n", () => {
    expect(escaparCampoCsv("a\r\nb")).toBe('"a\r\nb"');
  });

  it("envuelve en comillas un texto con retorno de carro \\r", () => {
    expect(escaparCampoCsv("a\rb")).toBe('"a\rb"');
  });

  it.each([
    ["=SUMA(A1)", "'=SUMA(A1)"],
    ["+1", "'+1"],
    ["-1", "'-1"],
    ["@usuario", "'@usuario"],
    ["\tdato", "'\tdato"],
  ])("antepone una comilla simple a %j (inyección de fórmulas)", (entrada, esperado) => {
    expect(escaparCampoCsv(entrada)).toBe(esperado);
  });

  it("un retorno de carro inicial lleva comilla simple y además se envuelve", () => {
    expect(escaparCampoCsv("\rx")).toBe('"\'\rx"');
  });

  it("primero antepone la comilla simple y luego envuelve si hay coma", () => {
    expect(escaparCampoCsv("=a,b")).toBe('"\'=a,b"');
  });

  it("no antepone comilla si el signo no está al inicio", () => {
    expect(escaparCampoCsv("a=b")).toBe("a=b");
    expect(escaparCampoCsv("pan-integral")).toBe("pan-integral");
  });
});

describe("gastosACsv", () => {
  it("una lista vacía trae solo BOM, encabezado y salto \\r\\n", () => {
    expect(gastosACsv([])).toBe(`${BOM}${ENCABEZADO}\r\n`);
  });

  it("empieza con la marca BOM de UTF-8", () => {
    expect(gastosACsv([gasto()]).startsWith(BOM)).toBe(true);
  });

  it("genera encabezado y una fila por gasto, cada línea terminada en \\r\\n", () => {
    const csv = gastosACsv([gasto()]);
    expect(csv).toBe(`${BOM}${ENCABEZADO}\r\n2026-10-05,Mercado,Alimentación,Exito,125000\r\n`);
  });

  it("respeta el orden recibido", () => {
    const csv = gastosACsv([
      gasto({ id: "2", descripcion: "Segundo", fecha: "2026-10-09", monto: 200 }),
      gasto({ id: "1", descripcion: "Primero", fecha: "2026-10-01", monto: 100 }),
    ]);
    expect(csv).toBe(
      `${BOM}${ENCABEZADO}\r\n` +
        "2026-10-09,Segundo,Alimentación,Exito,200\r\n" +
        "2026-10-01,Primero,Alimentación,Exito,100\r\n",
    );
  });

  it("usa la etiqueta en español de la categoría", () => {
    const csv = gastosACsv([gasto({ categoria: "alimentacion" })]);
    expect(csv).toContain(",Alimentación,");
    expect(csv).not.toContain(",alimentacion,");
  });

  it("monto con decimales usa punto y sin ceros ni miles", () => {
    const csv = gastosACsv([gasto({ monto: 12500.5 })]);
    expect(csv.endsWith(",12500.5\r\n")).toBe(true);
  });

  it("monto de 125000 sale sin separador de miles ni símbolo", () => {
    const csv = gastosACsv([gasto({ monto: 125000 })]);
    expect(csv.endsWith(",125000\r\n")).toBe(true);
  });

  it("tienda ausente deja la celda vacía", () => {
    const csv = gastosACsv([gasto({ tienda: undefined })]);
    expect(csv).toBe(`${BOM}${ENCABEZADO}\r\n2026-10-05,Mercado,Alimentación,,125000\r\n`);
  });

  it("escapa descripción y tienda con coma, comillas y fórmulas", () => {
    const csv = gastosACsv([
      gasto({ descripcion: 'Pan, "integral"', tienda: "=HYPERLINK(x)" }),
    ]);
    expect(csv).toBe(
      `${BOM}${ENCABEZADO}\r\n2026-10-05,"Pan, ""integral""",Alimentación,'=HYPERLINK(x),125000\r\n`,
    );
  });

  it("una descripción con salto de línea \\r\\n va entre comillas dentro de la misma celda", () => {
    const csv = gastosACsv([gasto({ descripcion: "a\r\nb" })]);
    expect(csv).toBe(`${BOM}${ENCABEZADO}\r\n2026-10-05,"a\r\nb",Alimentación,Exito,125000\r\n`);
  });
});

describe("nombreArchivoCsv", () => {
  it("un mes válido da gastos-AAAA-MM.csv", () => {
    expect(nombreArchivoCsv("2026-10")).toBe("gastos-2026-10.csv");
  });

  it("«todos» da gastos-todos.csv", () => {
    expect(nombreArchivoCsv("todos")).toBe("gastos-todos.csv");
  });

  it.each([
    [""],
    ["2026-13"],
    ["2026-1"],
    ["octubre"],
    ["../x\""],
    ["2026-10\r\nSet-Cookie: a=b"],
    ["2026-10.csv"],
  ])("el valor no válido %j cae en gastos-todos.csv", (valor) => {
    expect(nombreArchivoCsv(valor)).toBe("gastos-todos.csv");
  });
});

describe("enlaceExportarCsv", () => {
  const base: FiltrosGastos = { todos: false, mes: "2026-10", q: "" };

  it("sin búsqueda ni categoría solo lleva el mes", () => {
    expect(enlaceExportarCsv(base, "2026-10")).toBe("/panel/gastos/exportar?mes=2026-10");
  });

  it("agrega la búsqueda codificada con + para los espacios", () => {
    expect(enlaceExportarCsv({ ...base, q: "pan y leche" }, "2026-10")).toBe(
      "/panel/gastos/exportar?mes=2026-10&q=pan+y+leche",
    );
  });

  it("agrega la categoría después de la búsqueda", () => {
    expect(enlaceExportarCsv({ ...base, q: "pan", categoria: "alimentacion" }, "2026-10")).toBe(
      "/panel/gastos/exportar?mes=2026-10&q=pan&categoria=alimentacion",
    );
  });

  it("solo categoría, sin búsqueda", () => {
    expect(enlaceExportarCsv({ ...base, categoria: "ocio" }, "2026-10")).toBe(
      "/panel/gastos/exportar?mes=2026-10&categoria=ocio",
    );
  });

  it("con todos el mes es «todos» aunque se pase otro mes, y conserva q y categoría", () => {
    expect(
      enlaceExportarCsv({ todos: true, q: "café", categoria: "salud" }, "2026-10"),
    ).toBe("/panel/gastos/exportar?mes=todos&q=caf%C3%A9&categoria=salud");
  });

  it("codifica caracteres que podrían romper la URL", () => {
    expect(enlaceExportarCsv({ ...base, q: "a&b=c" }, "2026-10")).toBe(
      "/panel/gastos/exportar?mes=2026-10&q=a%26b%3Dc",
    );
  });
});

describe("codigoDeExportacion", () => {
  it("con sesión, sin error y sin recorte responde 200", () => {
    expect(codigoDeExportacion({ haySesion: true, hayError: false, recortado: false })).toBe(200);
  });

  it("sin sesión responde 401", () => {
    expect(codigoDeExportacion({ haySesion: false, hayError: false, recortado: false })).toBe(401);
  });

  it("un error de base de datos responde 500", () => {
    expect(codigoDeExportacion({ haySesion: true, hayError: true, recortado: false })).toBe(500);
  });

  it("una lista recortada por el tope responde 422", () => {
    expect(codigoDeExportacion({ haySesion: true, hayError: false, recortado: true })).toBe(422);
  });

  it("el error pesa más que el recorte (500 antes que 422)", () => {
    expect(codigoDeExportacion({ haySesion: true, hayError: true, recortado: true })).toBe(500);
  });

  it("sin sesión gana sobre cualquier otro estado (401 primero)", () => {
    expect(codigoDeExportacion({ haySesion: false, hayError: true, recortado: true })).toBe(401);
    expect(codigoDeExportacion({ haySesion: false, hayError: true, recortado: false })).toBe(401);
    expect(codigoDeExportacion({ haySesion: false, hayError: false, recortado: true })).toBe(401);
  });
});
