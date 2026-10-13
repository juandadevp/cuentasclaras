"use client";

import { useEffect, useState } from "react";
import type { Gasto } from "@/types/gasto";

export function useGastos() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch("/api/gastos")
      .then((r) => r.json())
      .then(setGastos)
      .finally(() => setCargando(false));
  }, []);

  return { gastos, cargando };
}
