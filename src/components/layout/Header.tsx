import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { AccionesSesion } from "@/components/layout/AccionesSesion";
import { NavegacionCentral } from "@/components/layout/NavegacionCentral";
import { siteConfig } from "@/config/site";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-neutral-800">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-20">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 text-xl font-extrabold text-white">
            <Image src="/logo.svg" alt="" width={30} height={35} priority />
            {siteConfig.nombre}
          </Link>
          <span className="hidden h-8 w-px bg-white/20 sm:block" aria-hidden />
          <Image
            src="/fet.png"
            alt="Fundación Escuela Tecnológica de Neiva Jesús Oviedo Pérez"
            width={290}
            height={140}
            priority
            className="hidden h-11 w-auto rounded-md bg-white px-1.5 py-0.5 sm:block"
          />
        </div>

        <Suspense fallback={<div className="hidden h-6 w-72 md:block" aria-hidden />}>
          <NavegacionCentral />
        </Suspense>

        <div className="flex min-h-10 items-center gap-2 sm:gap-3">
          {/* La sesión se lee en el servidor al momento de la petición, por eso va dentro de Suspense. */}
          <Suspense fallback={<div className="h-10 w-10" aria-hidden />}>
            <AccionesSesion />
          </Suspense>
        </div>
      </nav>
    </header>
  );
}
