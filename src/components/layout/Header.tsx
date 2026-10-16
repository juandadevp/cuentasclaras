import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

const enlaces = [
  { href: "/#funciones", etiqueta: "Funciones" },
  { href: "/#como-funciona", etiqueta: "Cómo funciona" },
  { href: "/#precios", etiqueta: "Precios" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-20">
        <Link href="/" className="flex items-center gap-2.5 text-xl font-extrabold text-foreground">
          <Image src="/logo.svg" alt="" width={30} height={35} priority />
          {siteConfig.nombre}
        </Link>

        <ul className="hidden gap-8 text-[15px] font-medium text-muted md:flex">
          {enlaces.map((e) => (
            <li key={e.href}>
              <Link href={e.href} className="transition-colors hover:text-brand-700">
                {e.etiqueta}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="rounded-[10px] px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-border/50 sm:px-5"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            className="rounded-[10px] bg-brand-900 px-3 py-2.5 text-sm font-semibold text-brand-50 transition-colors hover:bg-brand-700 sm:px-5 dark:bg-brand-300 dark:text-brand-900 dark:hover:bg-brand-100"
          >
            Crear cuenta gratis
          </Link>
        </div>
      </nav>
    </header>
  );
}
