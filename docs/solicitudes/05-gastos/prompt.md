# 05-gastos: módulo de gastos

Reconstruir el módulo de gastos igual que en `legacy/v1`: registrar, listar, buscar, editar y eliminar gastos, con la tabla `gastos` en Supabase (seguridad por filas, índice por usuario y fecha) y el inicio del portal alimentado con datos reales.

Incluye: formulario con valor con separador de miles, validación en cliente y servidor con la misma función, pantallas «Registrar gasto» y «Mis gastos» (total, buscador, filtro por categoría, navegación por mes, «Mostrar todo», secciones por categoría con subtotal), edición en `/panel/gastos/[id]/editar`, eliminación con confirmación, `key` para reiniciar el formulario, sección «Gastos» en el menú lateral y errores de Supabase traducidos (con aviso si falta la migración).

Skills usadas: `crear-migracion-supabase`, `crear-accion-servidor`, `crear-pantalla-panel`, `escribir-pruebas`, `vercel-react-best-practices`.
