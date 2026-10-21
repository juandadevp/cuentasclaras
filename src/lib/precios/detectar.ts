import { palabrasPorRubro } from "./diccionario";
import { listaRubros, type Rubro } from "./rubros";

/** Normaliza para comparar: minúsculas, sin tildes (conserva la ñ como n) y sin signos. */
function limpiar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Singular aproximado: "pañales" → "panal", "televisores" → "televisor". */
function singular(palabra: string): string {
  if (palabra.length <= 3) return palabra;
  if (palabra.endsWith("es") && palabra.length > 5) return palabra.slice(0, -2);
  if (palabra.endsWith("s")) return palabra.slice(0, -1);
  return palabra;
}

function distancia(a: string, b: string, maximo: number): number {
  if (Math.abs(a.length - b.length) > maximo) return maximo + 1;
  let anterior = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const actual = [i];
    let minimo = i;
    for (let j = 1; j <= b.length; j++) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1;
      actual[j] = Math.min(anterior[j] + 1, actual[j - 1] + 1, anterior[j - 1] + costo);
      minimo = Math.min(minimo, actual[j]);
    }
    if (minimo > maximo) return maximo + 1;
    anterior = actual;
  }
  return anterior[b.length];
}

interface Indice {
  frases: { rubro: Rubro; frase: string; peso: number }[];
  palabras: Map<string, Rubro[]>;
  largas: { palabra: string; rubro: Rubro }[];
}

/** Medidas y envases: acompañan al producto ("1 litro", "paquete") y no sirven para adivinar su tipo. */
const palabrasDeMedida = new Set(
  ["litro", "litros", "gramo", "gramos", "kilo", "kilos", "libra", "libras", "unidad", "unidades", "paquete", "caja", "bolsa", "frasco", "tarro", "botella", "lata", "docena", "pack", "combo", "tamano", "grande", "pequeno", "mediano", "negro", "blanco", "azul", "rojo", "verde", "barato", "oferta"].map(singular),
);

let indice: Indice | undefined;

function construirIndice(): Indice {
  const frases: Indice["frases"] = [];
  const palabras = new Map<string, Rubro[]>();
  const largas: Indice["largas"] = [];
  for (const rubro of listaRubros) {
    for (const original of palabrasPorRubro[rubro]) {
      const p = limpiar(original);
      if (!p) continue;
      if (p.includes(" ")) {
        frases.push({ rubro, frase: ` ${p} `, peso: 1 + p.split(" ").length * 1.5 });
      } else {
        const s = singular(p);
        palabras.set(s, [...(palabras.get(s) ?? []), rubro]);
        if (s.length >= 5 && !largas.some((l) => l.palabra === s && l.rubro === rubro)) largas.push({ palabra: s, rubro });
      }
    }
  }
  return { frases, palabras, largas };
}

export interface Deteccion {
  rubro: Rubro | null;
  /** Palabras del producto que permitieron reconocerlo. */
  coincidencias: string[];
}

/**
 * Adivina el tipo de producto con un diccionario de palabras y frases (sin IA).
 * Entiende plurales y errores de escritura leves ("acetamimofen" → medicamentos).
 */
export function detectarRubro(consulta: string): Deteccion {
  indice ??= construirIndice();
  const texto = limpiar(consulta);
  if (!texto) return { rubro: null, coincidencias: [] };

  const puntos = new Map<Rubro, number>();
  const motivos = new Map<Rubro, string[]>();
  const sumar = (rubro: Rubro, valor: number, motivo: string) => {
    puntos.set(rubro, (puntos.get(rubro) ?? 0) + valor);
    motivos.set(rubro, [...(motivos.get(rubro) ?? []), motivo]);
  };

  // 1) Frases de varias palabras ("casco moto", "crema dental"): pesan más.
  const envuelto = ` ${texto} `;
  for (const { rubro, frase, peso } of indice.frases) {
    if (envuelto.includes(frase)) sumar(rubro, peso, frase.trim());
  }

  // 2) Palabras sueltas: exactas, en singular o con una errata.
  for (const token of texto.split(" ")) {
    const t = singular(token);
    const exactos = indice.palabras.get(t);
    if (exactos) {
      for (const r of exactos) sumar(r, 1, token);
      continue;
    }
    if (t.length < 5 || palabrasDeMedida.has(t)) continue;
    const tolerancia = t.length >= 9 ? 2 : 1;
    for (const { palabra, rubro } of indice.largas) {
      // Las erratas casi nunca cambian la primera letra: así se evitan coincidencias absurdas.
      if (palabra[0] === t[0] && distancia(t, palabra, tolerancia) <= tolerancia) sumar(rubro, 0.8, token);
    }
  }

  let mejor: Rubro | null = null;
  let mejorPuntaje = 0;
  for (const rubro of listaRubros) {
    const p = puntos.get(rubro) ?? 0;
    if (p > mejorPuntaje) {
      mejor = rubro;
      mejorPuntaje = p;
    }
  }
  return mejor ? { rubro: mejor, coincidencias: [...new Set(motivos.get(mejor))] } : { rubro: null, coincidencias: [] };
}

