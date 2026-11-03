# 06-presupuesto: presupuesto mensual por categoría

Reconstruir el presupuesto mensual por categoría igual que en `legacy/v1`: la persona fija un límite de gasto por categoría para un mes y ve cuánto lleva gastado frente a ese límite. Tabla `presupuestos` (un límite por usuario, categoría y mes; seguridad por filas), pantalla «Presupuesto» con formulario, resumen, tarjetas con barra de avance y botones Editar y Quitar, estados «Vas bien» (< 80 %), «Cerca» (80 a 100 %) y «Excedido» (> 100 %), navegación entre meses (solo hasta el mes siguiente) y enlace en el menú lateral.

Skills usadas: `crear-migracion-supabase`, `crear-accion-servidor`, `crear-pantalla-panel`, `escribir-pruebas`, `vercel-react-best-practices`.
