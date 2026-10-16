import Image from "next/image";
import Link from "next/link";
import { enlacesPrincipales, siteConfig } from "@/config/site";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-neutral-800">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-20">
        <Link href="/" className="flex items-center gap-2.5 text-xl font-extrabold text-white">
          <Image src="/logo.svg" alt="" width={30} height={35} priority />
          {siteConfig.nombre}
        </Link>

        <ul className="hidden gap-8 text-[15px] font-medium text-neutral-400 md:flex">
          {enlacesPrincipales.map((e) => (
            <li key={e.href}>
              <Link href={e.href} className="transition-colors hover:text-white">
                {e.etiqueta}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="rounded-[10px] px-3 py-2.5 text-sm font-semibold text-white hover:bg-white/10 sm:px-5"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            className="rounded-[10px] bg-white px-3 py-2.5 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-200 sm:px-5"
          >
            Crear cuenta gratis
          </Link>
        </div>
      </nav>
    </header>
  );
}
