import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ImagenDeFondo } from "@/components/ui/ImagenDeFondo";
import { Header } from "@/components/layout/Header";
import { siteConfig } from "@/config/site";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: siteConfig.nombre,
  description: siteConfig.descripcion,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <section className="relative h-[calc(50vh-4.5rem)] bg-menta">
          <ImagenDeFondo src="/ilustracion.png" ajuste="contain" claseImagen="scale-[1.3]" />
        </section>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
