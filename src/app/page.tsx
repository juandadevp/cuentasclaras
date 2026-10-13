import { Suspense } from "react";
import { connection } from "next/server";
import { Card } from "@/components/ui/Card";
import { formatearMoneda } from "@/lib/format";
import { totalGastos } from "@/lib/utils";
import { listarGastos } from "@/services/gastos";

async function TotalMes() {
  await connection();
  const total = totalGastos(await listarGastos());
  return <p className="text-3xl font-semibold">{formatearMoneda(total)}</p>;
}

export default function Home() {
  return (
    <Card titulo="Total gastado este mes">
      <Suspense fallback={<p className="text-zinc-500">Cargando…</p>}>
        <TotalMes />
      </Suspense>
    </Card>
  );
}
