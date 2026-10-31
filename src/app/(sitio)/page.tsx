import { ComoFunciona } from "@/components/home/ComoFunciona";
import { Diferenciales } from "@/components/home/Diferenciales";
import { Funciones } from "@/components/home/Funciones";
import { LlamadoFinal } from "@/components/home/LlamadoFinal";
import { VistaPrevia } from "@/components/home/VistaPrevia";
import { Hero } from "@/components/layout/Hero";

export default function Home() {
  return (
    <>
      <Hero />
      <Funciones />
      <ComoFunciona />
      <Diferenciales />
      <VistaPrevia />
      <LlamadoFinal />
    </>
  );
}
