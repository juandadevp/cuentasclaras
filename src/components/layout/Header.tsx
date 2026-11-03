import Link from "next/link";
import { AccionesSesion } from "@/components/layout/AccionesSesion";
import { Marca } from "@/components/layout/Marca";
import { enlacesPrincipales } from "@/config/site";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-neutral-800">
      <nav aria-label="Principal" className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-4 sm:px-6 lg:px-20">
        <Marca priority />

        <ul className="hidden gap-8 text-[15px] font-medium text-neutral-400 md:flex">
          {enlacesPrincipales.map((e) => (
            <li key={e.href}>
              <Link href={e.href} className="transition-colors hover:text-white">
                {e.etiqueta}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1 sm:gap-3">
          <AccionesSesion />
        </div>
      </nav>
    </header>
  );
}
