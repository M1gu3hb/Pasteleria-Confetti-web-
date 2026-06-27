# CHANGELOG — Web Confetti

Orden cronológico inverso. Conventional-ish. El esquema vive en el repo POS (fuente única).

## 2026-06-27 (cont.) — WEB-2 sub-paso 1: RPC `crear_pedido_web` (folio-Gracias RESUELTO)
- **Decisión de Miguel bloqueada (opción 1).** Migración **0019 `web_crear_pedido_rpc`** en el **repo POS** (el esquema vive solo allí; ya aplicada y verificada en la Supabase compartida): RPC `crear_pedido_web(payload jsonb) → text` SECURITY DEFINER que inserta el pedido web y **devuelve el folio** en una sola llamada — reemplaza el `crearPedidoPOS` de Base44 **sin api_key**.
- **Impacto en el port (ESTE repo, pendiente):** el envío del pedido pasa de `insert` a `supabase.rpc('crear_pedido_web', { payload })`; el folio devuelto alimenta `ConfettiGracias` (`?folio=`). Los candados (`origen='web'`/`estado='pendiente'`), la whitelist de columnas (descarta `devolver_base`/`folio`/financieros) y el folio (trigger 0017) viven **server-side** en 0019. Ver `docs/NEXT_STEPS.md #6` y POS `DECISIONS.md #22`.
- **Verificado (rol anon):** folios reales `PP-A-0001` (pastel) / `PP-B-0001` (catálogo, `kilos=0` + productos en `notas_generales`), fila `origen='web'/estado='pendiente'`, `SELECT … FROM pedidos` directo → **42501**, payloads inválidos (falta requerido / `estado='pagada'` / `origen!='web'`) rechazados; inyección `folio`/`total_abonado`/`devolver_base` ignorada. Limpieza: transaccional=0, folio_contador=0.
- **Aún sin cambios de código de la web** (el port arranca tras la auditoría de 0019 por Miguel).

## 2026-06-27 — Cierre/handoff: WEB-2 NO iniciado; imágenes re-hospedadas
- **WEB-2 (port de la capa de datos) se PAUSÓ por ventana de contexto antes de empezar el código.** Un intento de port se descartó por completo (nada commiteado); la próxima sesión arranca WEB-2 con **clon fresco**. Plan detallado en `docs/NEXT_STEPS.md`.
- **Imágenes `media.base44.com` YA RE-HOSPEDADAS** en `web-uploads/assets/` (8 archivos, mismos nombres). Base nueva `…/storage/v1/object/public/web-uploads/assets/`. WEB-2 solo cambia el prefijo de URL — NO re-subir.
- **Hallazgo:** anon hace INSERT en `pedidos` pero NO puede leer de vuelta el folio (sin SELECT; 42501 probado). La fila SÍ queda con `PP-<prefijo>-####` (trigger 0017). Para mostrar el folio en la pantalla Gracias: RPC `crear_pedido_web` SECURITY DEFINER (recomendado, migración 0019 repo POS) / Gracias sin folio / policy anon SELECT (descartada). **→ RESUELTO vía 0019; ver entrada de arriba (2026-06-27 cont.).**

## 2026-06-27 — WEB-1: GAPs resueltos + andamiaje pusheado
- Andamiaje **pusheado** a `M1gu3hb/Pasteleria-Confetti-web-` (CON guion final): `main` (baseline export, api_key REDACTADA) y `migracion/supabase` (docs vivos).
- **GAP 1 (folio web) RESUELTO** — migración **0017** en el repo POS: trigger `BEFORE INSERT` en `pedidos` (`origen='web' AND folio IS NULL`) → `siguiente_folio('pedido_pastel', sucursal_id)` (SECURITY DEFINER). `folio` sigue NOT NULL; anon sin execute directo.
- **GAP 2 (upload imagen) RESUELTO** — migración **0018**: bucket dedicado `web-uploads` (público/no-listable, 5MB, solo imágenes); anon INSERT solo ahí; el `uploads` del POS sigue authenticated-only.
- Verificado en la Supabase compartida: **anon 11/11**, folio `PP-A-0001` asignado por el trigger, **regresión POS limpia**. Harness `scripts/web1_gaps_verify.mjs` (repo POS).

## 2026-06-26 — WEB-0: recon + andamiaje
- Leídas las fuentes (ZIP web, auditoría, MDs 04/05/06) y verificadas contra el código real.
- Comprensión escrita + inventario verde/roja + GAPs (ver `docs/WEB0_RECON.md`).
- Arquitectura confirmada: **Opción A** — misma Supabase del POS (`ivqcxdpqxwjxfohiswqb`) + anon key + RLS; el puente Base44 desaparece. Repo web privado APARTE; Vercel aparte (import pendiente de Miguel).
