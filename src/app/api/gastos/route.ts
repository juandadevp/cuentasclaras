import { NextResponse } from "next/server";
import { crearGasto, listarGastos } from "@/services/gastos";
import type { NuevoGasto } from "@/types/gasto";

export async function GET() {
  return NextResponse.json(await listarGastos());
}

export async function POST(request: Request) {
  const body = (await request.json()) as NuevoGasto;
  if (!body.descripcion || typeof body.monto !== "number") {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  return NextResponse.json(await crearGasto(body), { status: 201 });
}
