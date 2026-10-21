import { etiquetaCategoria, nombreDelMes, totalPorCategoria } from "@/lib/gastos";
import type { Categoria, Gasto } from "@/types/gasto";

export interface FilaMes {
  mes: string;
  total: number;
  /** Mes que aún no termina: su total todavía puede crecer. */
  enCurso: boolean;
  /** Lo que se gastó de menos (+) o de más (−) frente al mes anterior; null si no hay base. */
  ahorro: number | null;
}

/** Compara cada mes con el anterior. Un mes con total 0 se toma como "sin datos". */
export function filasDeAhorro(meses: { mes: string; total: number }[], mesActual: string): FilaMes[] {
  return meses.map((m, i) => {
    const previo = i > 0 ? meses[i - 1].total : 0;
    return { ...m, enCurso: m.mes === mesActual, ahorro: previo > 0 && m.total > 0 ? previo - m.total : null };
  });
}

export interface CambioCategoria {
  categoria: Categoria;
  actual: number;
  anterior: number;
}

export function cambiosPorCategoria(actual: Gasto[], anterior: Gasto[]): CambioCategoria[] {
  const a = new Map(totalPorCategoria(actual).map((x) => [x.categoria, x.total]));
  const p = new Map(totalPorCategoria(anterior).map((x) => [x.categoria, x.total]));
  return [...new Set([...a.keys(), ...p.keys()])].map((categoria) => ({
    categoria,
    actual: a.get(categoria) ?? 0,
    anterior: p.get(categoria) ?? 0,
  }));
}

/** Datos que se resumen para la IA: solo cifras y nombres de categoría, nunca texto escrito por el usuario. */
export interface ResumenAhorro {
  mesActual: string;
  filas: FilaMes[];
  categorias: CambioCategoria[];
}

export function textoParaIA(r: ResumenAhorro): string {
  const filas = r.filas.map((f) => `- ${nombreDelMes(f.mes)}${f.enCurso ? " (mes en curso, incompleto)" : ""}: gastó ${Math.round(f.total)} COP`).join("\n");
  const cats = r.categorias
    .map((c) => `- ${etiquetaCategoria(c.categoria)}: este mes ${Math.round(c.actual)} COP, mes anterior ${Math.round(c.anterior)} COP`)
    .join("\n");
  return `Gasto total por mes (pesos colombianos):\n${filas}\n\nGasto por categoría (mes en curso vs. mes anterior):\n${cats || "- sin datos"}`;
}

/** Consejos calculados sin IA, para cuando no hay clave de Gemini o el servicio falla. */
export function consejosPorReglas(r: ResumenAhorro): string[] {
  const moneda = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
  const consejos: string[] = [];
  const completos = r.filas.filter((f) => !f.enCurso && f.ahorro !== null);
  const ultimo = completos[completos.length - 1];
  if (ultimo && ultimo.ahorro !== null) {
    consejos.push(
      ultimo.ahorro >= 0
        ? `En ${nombreDelMes(ultimo.mes)} gastaste ${moneda(ultimo.ahorro)} menos que el mes anterior. Buen trabajo, mantén ese ritmo.`
        : `En ${nombreDelMes(ultimo.mes)} gastaste ${moneda(-ultimo.ahorro)} más que el mes anterior. Revisa en qué categorías creció.`,
    );
  }
  const sube = r.categorias.filter((c) => c.anterior > 0 && c.actual > c.anterior).sort((a, b) => b.actual - b.anterior - (a.actual - a.anterior))[0];
  if (sube) {
    consejos.push(`${etiquetaCategoria(sube.categoria)} ya va en ${moneda(sube.actual)} este mes, más que los ${moneda(sube.anterior)} del mes pasado. Es un buen lugar para recortar.`);
  }
  const mayor = [...r.categorias].sort((a, b) => b.actual - a.actual)[0];
  if (mayor && mayor.actual > 0) {
    consejos.push(`Tu mayor gasto del mes es ${etiquetaCategoria(mayor.categoria)} (${moneda(mayor.actual)}). Usa «Recomendar compras» para comparar precios antes de comprar.`);
  }
  if (consejos.length === 0) consejos.push("Registra tus gastos durante el mes y aquí verás cuánto ahorras frente al mes anterior.");
  return consejos;
}
