import type { Metadata } from "next";
import { RecomendarCompras } from "@/components/panel/RecomendarCompras";
import { TituloPagina } from "@/components/panel/TituloPagina";

export const metadata: Metadata = { title: "Recomendar compras" };

export default function RecomendarPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <TituloPagina titulo="Recomendar compras" subtitulo="Busca un producto y compara sus precios en las tiendas." />
      <RecomendarCompras />
    </div>
  );
}
