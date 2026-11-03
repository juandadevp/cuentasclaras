import Link from "next/link";

/** Parte derecha del menú para una persona sin sesión. Cuando exista la autenticación, aquí se muestra el menú de perfil. */
export function AccionesSesion() {
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
        Crear cuenta<span className="hidden sm:inline"> gratis</span>
      </Link>
    </>
  );
}
