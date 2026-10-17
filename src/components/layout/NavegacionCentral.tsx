import Link from "next/link";
import { enlacesPrincipales } from "@/config/site";
import { obtenerUsuario } from "@/lib/supabase/usuario";

/** Enlaces del centro del menú: de la portada (invitado) o el acceso a su panel (con sesión). */
export async function NavegacionCentral() {
  const usuario = await obtenerUsuario();
  const enlaces = usuario ? [{ href: "/panel", etiqueta: "Mi panel" }] : enlacesPrincipales;

  return (
    <ul className="hidden gap-8 text-[15px] font-medium text-neutral-400 md:flex">
      {enlaces.map((e) => (
        <li key={e.href}>
          <Link href={e.href} className="transition-colors hover:text-white">
            {e.etiqueta}
          </Link>
        </li>
      ))}
    </ul>
  );
}
