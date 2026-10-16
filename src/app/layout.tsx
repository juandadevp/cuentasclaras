import type { Metadata } from "next";
import Image from "next/image";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
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
        <div className="relative flex flex-1 flex-col">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[calc(50vh-4.5rem)] overflow-hidden">
            <Image src="/fondo.jpg" alt="" fill sizes="100vw" priority className="object-cover" />
            <div className="absolute inset-0 bg-manzana/80" />
          </div>
          <main className="relative mx-auto w-full max-w-4xl flex-1 px-4 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
