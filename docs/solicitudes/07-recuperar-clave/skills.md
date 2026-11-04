# 07-recuperar-clave: skills usadas

Módulo: **Recuperar la contraseña**. Las skills están en `.claude/skills/`; el prompt y el plan de este módulo están en `prompt.md` y `plan.md` de esta carpeta.

| Skill | Para qué se usó en este módulo |
|---|---|
| `autenticacion-supabase` | Flujo `/recuperar` y `/restablecer`: mismo mensaje exista o no el correo, destinos del callback en lista cerrada y cierre de otras sesiones. |
| `crear-accion-servidor` | Acciones `solicitarRecuperacion` y `restablecerClave` con validación, sesión y límite de frecuencia. |
| `escribir-pruebas` | Pruebas de las validaciones nuevas, de los errores y de los destinos permitidos. |
| `vercel-react-best-practices` | Formularios de recuperación y de nueva contraseña. |
