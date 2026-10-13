import { Suspense } from "react";
import { connection } from "next/server";
import { Card } from "@/components/ui/Card";
import { ListaGastos } from "@/components/gastos/ListaGastos";
import { listarGastos } from "@/services/gastos";

async function Gastos() {
  await connection();
  return <ListaGastos gastos={await listarGastos()} />;
}

export default function GastosPage() {
  return (
    <Card titulo="Gastos del mes">
      <Suspense fallback={<p className="text-zinc-500">Cargando…</p>}>
        <Gastos />
      </Suspense>
    </Card>
  );
}
