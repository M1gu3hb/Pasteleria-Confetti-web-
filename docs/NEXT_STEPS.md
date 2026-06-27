# NEXT_STEPS — Web Confetti

Última actualización: 2026-06-26 (WEB-0 hecho).

## ✅ WEB-0 — HECHO (pendiente de revisión de Miguel)
- Leídas las fuentes (ZIP web, auditoría, MDs 04/05/06) y verificadas contra el código real.
- Comprensión escrita + inventario verde/roja + GAPs: ver `docs/WEB0_RECON.md` y `PROJECT_CONTEXT.md`.
- Andamiaje: working tree `C:\Pasteleria Confetti\web`, git local con baseline (api_key REDACTADA) + docs vivos + rama `migracion/supabase`. Mismo Supabase `ivqcxdpqxwjxfohiswqb` confirmado.

## 🔴 PENDIENTE HUMANO DE MIGUEL (paso manual)
- **Crear el repo remoto** `M1gu3hb/Pasteleria-Confetti-Web` (privado). El PAT del MCP NO tiene scope de creación y `gh` no está instalado. Una vez creado: `git push -u origin main` y `git push -u origin migracion/supabase` (el remoto ya está configurado en el repo local).
- **Vercel:** crear proyecto APARTE ligado a ese repo (import one-click), rama `migracion/supabase`, + env vars `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (el MISMO Supabase del POS). Sin Vercel CLI ni git-link, no es automatizable.

## 🔵 PRÓXIMO PASO: WEB-1 (tras luz verde) — resolver GAPs + port capa de datos
Decisiones/diseño que firma Miguel antes de portar:
- **GAP 1 (folio):** elegir mecanismo de folio para pedidos web (anon) — RPC `SECURITY DEFINER` anon, o `folio` nullable asignado por el POS, o folio provisional en cliente.
- **GAP 2 (upload):** política Storage anon-INSERT acotada para la imagen de referencia, o alternativa.
- Port: reemplazar `base44.entities.*`→`supabase.from(...)` (catalogo_publico/config_publica/sucursales/categorias) e `enviarPedidoAlPOS`→`pedidos.insert`; eliminar puente/auth/plantilla; `sucursales_disponibles` (nombres)→`sucursal_ids`.
- Re-hospedar imágenes `media.base44.com` en Storage.

> Reglas: NO tocar el repo/Supabase del POS (solo LEER esquema/vistas). NO re-exponer la api_key. Web pública = anon key + RLS. DETENERSE y reportar al cerrar cada fase.
