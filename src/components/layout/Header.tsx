import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Header() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold">
          {siteConfig.nombre}
        </Link>
        <Link href="/gastos" className="text-sm text-zinc-600 hover:underline dark:text-zinc-300">
          Gastos
        </Link>
      </nav>
    </header>
  );
}
