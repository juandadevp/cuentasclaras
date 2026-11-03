import { Suspense } from "react";
import { AccionesSesion } from "@/components/layout/AccionesSesion";
import { Marca } from "@/components/layout/Marca";
import { NavegacionCentral } from "@/components/layout/NavegacionCentral";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-neutral-800">
      <nav aria-label="Principal" className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-4 sm:px-6 lg:px-20">
        <Marca priority />

        {/* La sesión se lee en el servidor en cada petición, por eso va dentro de Suspense con un marcador del mismo tamaño. */}
        <Suspense fallback={<div className="hidden h-6 w-72 md:block" aria-hidden />}>
          <NavegacionCentral />
        </Suspense>

        <div className="flex min-h-10 items-center gap-1 sm:gap-3">
          <Suspense fallback={<div className="h-10 w-36 sm:w-72" aria-hidden />}>
            <AccionesSesion />
          </Suspense>
        </div>
      </nav>
    </header>
  );
}
