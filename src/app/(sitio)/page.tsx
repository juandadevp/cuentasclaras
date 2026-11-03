import type { Metadata } from "next";
import { ComoFunciona } from "@/components/home/ComoFunciona";
import { Diferenciales } from "@/components/home/Diferenciales";
import { Funciones } from "@/components/home/Funciones";
import { LlamadoFinal } from "@/components/home/LlamadoFinal";
import { Hero } from "@/components/layout/Hero";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: { absolute: siteConfig.nombre },
  description: "Registra tus gastos, mira a dónde se va tu dinero y mantente dentro de tu presupuesto cada mes.",
};

export default function Home() {
  return (
    <>
      <Hero />
      <Funciones />
      <ComoFunciona />
      <Diferenciales />
      <LlamadoFinal />
    </>
  );
}
