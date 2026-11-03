import Link from "next/link";
import { enlacesPrincipales } from "@/config/site";
import { obtenerUsuario } from "@/lib/supabase/usuario";

const enlacesConSesion = [{ href: "/panel", etiqueta: "Mi portal" }];

/** Enlaces del centro del menú: los de la portada (sin sesión) o el acceso al portal (con sesión). */
export async function NavegacionCentral() {
  const usuario = await obtenerUsuario();
  const enlaces = usuario ? enlacesConSesion : enlacesPrincipales;

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
