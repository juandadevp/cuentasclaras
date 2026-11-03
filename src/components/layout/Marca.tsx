import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

/** Logo y nombre del sitio, enlazados a la portada. Se usa sobre fondo oscuro (menú y pie). */
export function Marca({ priority = false }: { priority?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-md text-xl font-extrabold text-white">
      <Image src="/logo.svg" alt="" width={30} height={35} priority={priority} />
      {siteConfig.nombre}
    </Link>
  );
}
