const pasos = [
  { numero: "1", titulo: "Crea tu cuenta", texto: "Regístrate gratis con tu correo. Tu espacio es solo tuyo y nadie más ve tus datos." },
  { numero: "2", titulo: "Registra tus gastos", texto: "Anota en qué gastaste, cuánto y dónde. Si buscas el producto en el comparador, la compra se llena sola." },
  { numero: "3", titulo: "Entiende y ahorra", texto: "Mira tus gastos por categoría, compara tus meses y mira cuánto ahorras." },
];

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="scroll-mt-20 bg-white px-6 py-20 lg:px-20">
      <div className="mx-auto max-w-7xl text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-brand-500">Cómo funciona</p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Empieza en tres pasos</h2>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-muted">Sin hojas de cálculo ni configuraciones complicadas.</p>

        <ol className="relative mt-14 grid gap-10 text-left md:grid-cols-3">
          <div aria-hidden className="absolute left-[16%] right-[16%] top-7 hidden border-t-2 border-dashed border-brand-300 md:block" />
          {pasos.map((p) => (
            <li key={p.numero} className="relative text-center">
              <span className="relative mx-auto grid size-14 place-items-center rounded-full bg-brand-800 text-xl font-extrabold text-white ring-8 ring-white">
                {p.numero}
              </span>
              <h3 className="mt-5 text-xl font-bold text-foreground">{p.titulo}</h3>
              <p className="mx-auto mt-2 max-w-xs leading-relaxed text-muted">{p.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
