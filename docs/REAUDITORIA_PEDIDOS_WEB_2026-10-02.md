# Reauditoría web — 2026-10-02

Envío durable: guardar UUID/datos/confirmación antes de RPC, recuperar envío original tras recarga o respuesta perdida y compartir petición ante doble toque. Rechazo definitivo revierte/limpia intención; fallo incierto/cuota conserva intención. Hay botón de recuperación, y gracias utiliza datos confirmados originales. SQL/Edge se versionan en el repo POS; leer allí REAUDITORIA_CIERRE_PENDIENTES_2026-10-02.md.

RPC nueva crear_pedido_web_idempotente conserva wrapper viejo. Cuotas de nuevas creaciones: 120/min global y 20/hora/teléfono; no limitan almacenamiento ni listas. Formularios: 20 controles nombrados/asociados, idioma español; test AST. Build ejecuta lint, deuda de tipos contrastada (23 errores antiguos, ninguno nuevo) y pruebas de envío/accesibilidad antes de Vite.

npm audit tras actualizaciones compatibles: dos moderados del router, cero altos/críticos. No se usó force. Esta revisión no certifica WCAG completa, restauración, dispositivos ni confidencialidad de Storage público. Navegadores viejos deben recargar para obtener intención persistente. No se enviaron pedidos ficticios a producción.

El registro de publicación se añade una vez comprobados GitHub, Supabase y Vercel.
