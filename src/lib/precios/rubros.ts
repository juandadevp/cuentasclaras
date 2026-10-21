import type { Categoria } from "@/types/gasto";
import { franquicias, perteneceAFranquicia, type Franquicia, type IdFranquicia } from "./franquicias";

export type Rubro =
  | "medicamentos"
  | "cuidado_personal"
  | "alimentos"
  | "aseo_hogar"
  | "bebes"
  | "tecnologia"
  | "electrodomesticos"
  | "ferreteria"
  | "muebles"
  | "deportes"
  | "libros_papeleria"
  | "moda"
  | "juguetes"
  | "mascotas"
  | "vehiculos";

interface ConfigRubro {
  etiqueta: string;
  /** Categoría de gasto en la que se registraría una compra de este tipo. */
  categoriaGasto: Categoria;
  /** Qué tiendas venden este tipo de producto. */
  tiendas: IdFranquicia[];
  ejemplos: string[];
}

const supermercados: IdFranquicia[] = ["exito", "carulla", "jumbo", "metro", "olimpica", "d1", "ara", "pricesmart", "makro", "alkosto"];
const farmacias: IdFranquicia[] = ["farmatodo", "cruzVerde", "locatel", "laRebaja", "colsubsidio", "cafam", "olimpica"];

/** El orden también es la prioridad cuando dos tipos empatan. */
export const rubros: Record<Rubro, ConfigRubro> = {
  medicamentos: {
    etiqueta: "Medicamentos y salud",
    categoriaGasto: "salud",
    tiendas: farmacias,
    ejemplos: ["acetaminofén", "ibuprofeno", "vitamina c", "tensiómetro"],
  },
  cuidado_personal: {
    etiqueta: "Cuidado personal y belleza",
    categoriaGasto: "salud",
    tiendas: [...farmacias, "exito", "carulla", "jumbo", "olimpica", "d1", "ara", "falabella", "mercadoLibre"],
    ejemplos: ["shampoo", "crema dental", "desodorante", "protector solar"],
  },
  alimentos: {
    etiqueta: "Alimentos y mercado",
    categoriaGasto: "alimentacion",
    tiendas: supermercados,
    ejemplos: ["leche", "arroz", "aceite", "huevos"],
  },
  aseo_hogar: {
    etiqueta: "Aseo y limpieza del hogar",
    categoriaGasto: "vivienda",
    tiendas: [...supermercados, "homecenter", "easy", "mercadoLibre"],
    ejemplos: ["detergente", "cloro", "suavizante", "bolsas de basura"],
  },
  bebes: {
    etiqueta: "Bebés y maternidad",
    categoriaGasto: "bebes",
    tiendas: [...farmacias, "exito", "carulla", "jumbo", "olimpica", "d1", "falabella", "alkosto", "mercadoLibre"],
    ejemplos: ["pañales", "fórmula infantil", "biberón", "toallitas húmedas"],
  },
  tecnologia: {
    etiqueta: "Tecnología y electrónica",
    categoriaGasto: "tecnologia",
    tiendas: ["alkosto", "ktronix", "falabella", "exito", "jumbo", "mercadoLibre", "amazon", "samsung", "claro", "movistar", "tigo"],
    ejemplos: ["celular", "audífonos", "portátil", "televisor"],
  },
  electrodomesticos: {
    etiqueta: "Electrodomésticos",
    categoriaGasto: "vivienda",
    tiendas: ["alkosto", "falabella", "exito", "jumbo", "homecenter", "easy", "mercadoLibre", "amazon"],
    ejemplos: ["nevera", "lavadora", "licuadora", "microondas"],
  },
  ferreteria: {
    etiqueta: "Ferretería y construcción",
    categoriaGasto: "vivienda",
    tiendas: ["homecenter", "easy", "alkosto", "falabella", "mercadoLibre", "exito"],
    ejemplos: ["taladro", "pintura", "bombillo led", "candado"],
  },
  muebles: {
    etiqueta: "Muebles y decoración",
    categoriaGasto: "vivienda",
    tiendas: ["falabella", "homecenter", "alkosto", "easy", "exito", "mercadoLibre", "tugo", "jamar"],
    ejemplos: ["colchón", "escritorio", "sofá", "silla"],
  },
  deportes: {
    etiqueta: "Deportes y aire libre",
    categoriaGasto: "ocio",
    tiendas: ["decathlon", "falabella", "alkosto", "exito", "mercadoLibre", "amazon"],
    ejemplos: ["balón de fútbol", "bicicleta", "pesas", "carpa"],
  },
  libros_papeleria: {
    etiqueta: "Libros y papelería",
    categoriaGasto: "educacion",
    tiendas: ["panamericana", "falabella", "mercadoLibre", "amazon", "exito", "alkosto"],
    ejemplos: ["libro", "cuaderno", "resma de papel", "calculadora"],
  },
  moda: {
    etiqueta: "Ropa y calzado",
    categoriaGasto: "ropa",
    tiendas: ["falabella", "exito", "decathlon", "mercadoLibre", "arturoCalle", "studioF", "hm", "zara", "amazon"],
    ejemplos: ["tenis", "camiseta", "jean", "chaqueta"],
  },
  juguetes: {
    etiqueta: "Juguetes y juegos",
    categoriaGasto: "ocio",
    tiendas: ["falabella", "exito", "alkosto", "jumbo", "mercadoLibre", "amazon", "panamericana"],
    ejemplos: ["lego", "muñeca", "rompecabezas", "juego de mesa"],
  },
  mascotas: {
    etiqueta: "Mascotas",
    categoriaGasto: "mascotas",
    tiendas: ["exito", "jumbo", "carulla", "olimpica", "alkosto", "mercadoLibre", "falabella"],
    ejemplos: ["concentrado para perro", "arena para gato", "collar", "pecera"],
  },
  vehiculos: {
    etiqueta: "Vehículos y moto",
    categoriaGasto: "transporte",
    tiendas: ["mercadoLibre", "alkosto", "auteco", "falabella", "exito"],
    ejemplos: ["casco moto", "llanta", "aceite de motor", "batería"],
  },
};

export const listaRubros = Object.keys(rubros) as Rubro[];
export const esRubro = (v: string): v is Rubro => (listaRubros as string[]).includes(v);

export function tiendasDelRubro(rubro: Rubro): Franquicia[] {
  return rubros[rubro].tiendas.map((id) => franquicias[id]);
}

export function tiendaRelevante(tienda: string, rubro: Rubro): boolean {
  return tiendasDelRubro(rubro).some((f) => perteneceAFranquicia(tienda, f));
}
