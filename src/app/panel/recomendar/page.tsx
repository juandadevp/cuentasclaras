import type { Metadata } from "next";
import { buscarPrecios } from "@/app/panel/recomendar/actions";
import { RecomendarCompras } from "@/components/panel/RecomendarCompras";
import { TituloPagina } from "@/components/panel/TituloPagina";

export const metadata: Metadata = { title: "Recomendar compras" };

// No lee datos de la sesión ni la fecha: el layout del panel ya exige sesión y la búsqueda ocurre al pulsar el botón.
export default function RecomendarPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <TituloPagina titulo="Recomendar compras" subtitulo="Busca un producto y compara sus precios en las tiendas." />
      <RecomendarCompras buscar={buscarPrecios} />
    </div>
  );
}
