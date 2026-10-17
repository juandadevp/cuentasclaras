import Link from "next/link";
import { MenuPerfil } from "@/components/auth/MenuPerfil";
import { obtenerUsuario } from "@/lib/supabase/usuario";

/** Parte derecha del menú: botones de acceso (invitado) o ícono de perfil (con sesión). */
export async function AccionesSesion() {
  const usuario = await obtenerUsuario();

  if (usuario) return <MenuPerfil nombre={usuario.nombre} email={usuario.email} />;

  return (
    <>
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
    </>
  );
}
