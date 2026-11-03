import { requisitosClave } from "@/lib/validaciones";

/** Lista de requisitos de la contraseña: se marca cada uno a medida que se cumple. */
export function RequisitosClave({ clave }: { clave: string }) {
  return (
    <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5" aria-label="Requisitos de la contraseña">
      {requisitosClave.map((r) => {
        const ok = r.cumple(clave);
        return (
          <li key={r.id} className={`flex items-center gap-1.5 text-xs ${ok ? "font-medium text-brand-700" : "text-muted"}`}>
            <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {ok ? <path d="m5 12 5 5 9-10" /> : <circle cx="12" cy="12" r="8" />}
            </svg>
            {r.texto}
          </li>
        );
      })}
    </ul>
  );
}
