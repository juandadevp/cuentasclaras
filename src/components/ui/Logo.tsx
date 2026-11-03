import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

/** Logo con el nombre del sitio, enlazado a la portada. No se cambian los colores del logo. */
export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30">
      <Image src="/logo.svg" alt="" width={32} height={38} unoptimized />
      <span className="text-lg font-extrabold tracking-tight text-foreground">{siteConfig.nombre}</span>
    </Link>
  );
}
