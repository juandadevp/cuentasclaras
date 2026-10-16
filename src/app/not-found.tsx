import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[calc(100vh-4.5rem)] flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-7xl font-extrabold tracking-tight text-brand-700">404</p>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground">
        Esta página aún no existe
      </h1>
      <p className="mt-2 max-w-md text-muted">
        Puede que el enlace esté mal escrito o que la sección todavía esté en construcción.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-[10px] bg-brand-800 px-6 py-3 text-[15px] font-semibold text-brand-50 transition-colors hover:bg-brand-700"
      >
        Volver al inicio
      </Link>
    </section>
  );
}
