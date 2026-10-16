import Link from "next/link";
import { siteConfig } from "@/config/site";

const enlaces = [
  { href: "/#funciones", etiqueta: "Funciones" },
  { href: "/#como-funciona", etiqueta: "Cómo funciona" },
  { href: "/#precios", etiqueta: "Precios" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-20">
        <Link href="/" className="flex items-center gap-2.5 text-xl font-extrabold text-slate-900 dark:text-white">
          <span
            aria-hidden
            className="grid size-8 place-items-center rounded-[9px] bg-gradient-to-br from-sky-400 to-sky-700 text-base text-white"
          >
            $
          </span>
          {siteConfig.nombre}
        </Link>

        <ul className="hidden gap-8 text-[15px] font-medium text-slate-500 md:flex">
          {enlaces.map((e) => (
            <li key={e.href}>
              <Link href={e.href} className="transition-colors hover:text-slate-900 dark:hover:text-white">
                {e.etiqueta}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="rounded-[10px] px-3 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100 sm:px-5 dark:text-white dark:hover:bg-slate-800"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            className="rounded-[10px] bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700 sm:px-5 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Crear cuenta gratis
          </Link>
        </div>
      </nav>
    </header>
  );
}
