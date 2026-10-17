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
        <Link href="/" className="flex items-center gap-2.5 text-xl font-extrabold text-white">
          <Image src="/logo.svg" alt="" width={30} height={35} priority />
          {siteConfig.nombre}
        </Link>

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
