# NEXT_STEPS — Web Confetti

Última actualización: 2026-06-26 (WEB-0 hecho).

## ✅ WEB-0 — HECHO (pendiente de revisión de Miguel)
- Leídas las fuentes (ZIP web, auditoría, MDs 04/05/06) y verificadas contra el código real.
- Comprensión escrita + inventario verde/roja + GAPs: ver `docs/WEB0_RECON.md` y `PROJECT_CONTEXT.md`.
- Andamiaje: working tree `C:\Pasteleria Confetti\web`, git local con baseline (api_key REDACTADA) + docs vivos + rama `migracion/supabase`. Mismo Supabase `ivqcxdpqxwjxfohiswqb` confirmado.

## ✅ WEB-1 — HECHO (fixes de DB; pendiente de auditoría de Miguel)
- Andamiaje **pusheado** a `M1gu3hb/Pasteleria-Confetti-web-` (con guion final): `main` (baseline, api_key redactada) y `migracion/supabase` (docs).
- **GAP 1 RESUELTO** (migración 0017 en repo POS): trigger de folio web. **GAP 2 RESUELTO** (0018): bucket `web-uploads`. Ambas aplicadas a la Supabase compartida y verificadas (anon 11/11, folio `PP-A-0001`, regresión POS OK). Ver `PROJECT_CONTEXT.md §6`.

## 🔴 PENDIENTE HUMANO DE MIGUEL
- **Vercel:** crear proyecto APARTE ligado a `Pasteleria-Confetti-web-` (import one-click), rama `migracion/supabase`, + env vars `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (el MISMO Supabase del POS, `ivqcxdpqxwjxfohiswqb`).

## 🔵 PRÓXIMO PASO: WEB-2 — port de la capa de datos (tras auditoría de Miguel)
- Reemplazar `base44.entities.*`→`supabase.from(...)`: catálogo (`catalogo_publico`), config (`config_publica`), `sucursales`, `categorias_producto`.
- Reemplazar `enviarPedidoAlPOS`→`supabase.from('pedidos').insert({origen:'web', estado:'pendiente', …})` (el folio lo pone el trigger 0017); upload de imagen → `web-uploads` (0018).
- Eliminar puente/auth/plantilla (crearPedidoPOS, posApiClient, base44Client, AuthContext, Login/Register/ProtectedRoute, deps rojas).
- `sucursales_disponibles` (nombres)→`sucursal_ids` (IDs). Re-hospedar imágenes `media.base44.com` en Storage.
- Build verde + smoke (catálogo carga; enviar pedido web → aparece en el POS con folio).

> Reglas: NO tocar el repo/Supabase del POS (solo LEER esquema/vistas). NO re-exponer la api_key. Web pública = anon key + RLS. DETENERSE y reportar al cerrar cada fase.
