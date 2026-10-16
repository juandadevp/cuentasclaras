import { cacheLife } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { enlacesCuenta, enlacesPrincipales, siteConfig } from "@/config/site";

/** El año se calcula en caché (se renueva a diario) para no bloquear el prerenderizado. */
async function Anio() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

function Columna({ titulo, enlaces }: { titulo: string; enlaces: { href: string; etiqueta: string }[] }) {
  return (
    <nav aria-label={titulo}>
      <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">{titulo}</h2>
      <ul className="mt-4 space-y-3">
        {enlaces.map((e) => (
          <li key={e.href}>
            <Link href={e.href} className="text-[15px] text-muted transition-colors hover:text-brand-700">
              {e.etiqueta}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-neutral-50">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-20">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2.5 text-xl font-extrabold text-foreground">
              <Image src="/logo.svg" alt="" width={30} height={35} />
              {siteConfig.nombre}
            </Link>
            <p className="mt-4 leading-relaxed text-muted">
              Registra tus gastos, entiende a dónde se va tu dinero y mantente dentro de tu presupuesto cada mes.
            </p>
          </div>

          <Columna titulo="Producto" enlaces={enlacesPrincipales} />
          <Columna titulo="Cuenta" enlaces={enlacesCuenta} />
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <Anio /> {siteConfig.nombre}. Todos los derechos reservados.
          </p>
          <p>Hecho para llevar tus cuentas claras.</p>
        </div>
      </div>
    </footer>
  );
}
