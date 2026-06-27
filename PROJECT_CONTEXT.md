# PROJECT_CONTEXT — Web Confetti (catálogo público; migración Base44 → Vercel + Supabase compartido)

> **Fuente principal de transferencia.** Léelo COMPLETO antes de tocar nada, junto con `CLAUDE.md` y `docs/`.
> Última actualización: 2026-06-27 (WEB-0 y WEB-1 HECHAS; WEB-2 EN CURSO — sub-paso 1 = RPC `crear_pedido_web` / migración 0019 en repo POS, aplicada y verificada; sigue el port de la capa de datos).
> **Working tree:** `C:\Pasteleria Confetti\web`. Repo: `M1gu3hb/Pasteleria-Confetti-web-` (privado, **CON guion final**). `main`=baseline export (api_key REDACTADA); rama de trabajo `migracion/supabase`.

## 1. Objetivo
Independizar la **web pública / catálogo** de Pastelería Confetti de Base44, sobre infra propia:
**React (Vite) en Vercel + el MISMO Supabase del POS** (Opción A, DB compartida + RLS, anon key).
Idéntico en comportamiento; NO es rediseño. El POS ya está migrado y cerrado (Fase 5 aprobada).

## 2. Qué es la Web
Catálogo **mobile-first**, público, **sin login y sin pago**. Muestra productos (visibles en web) y
sucursales; permite enviar un **pedido tentativo** (pastel personalizado o productos de catálogo) que
el POS revisa, confirma y cobra. La web es un **canal de entrada**, no una dependencia: el POS opera
aunque la web caiga.

## 3. Stack
- Frontend: React 18 + Vite 6 + Tailwind 3 + React Router 6 + React Query 5 (export Base44 `6a2afcaf5df5e3322f4da64e`). Sin TS real.
- Datos: **Supabase compartido** `ivqcxdpqxwjxfohiswqb` (anon key + RLS). Sin base propia.
- Hosting destino: **Vercel, proyecto APARTE** del POS (import pendiente de Miguel).

## 4. Arquitectura — Opción A (el puente colapsa)
La web **lee** las tablas/vistas compartidas y **inserta** en `pedidos`. **Desaparece** todo el puente
Base44 (`crearPedidoPOS`/`entry.ts`, `posApiClient.js`, `enviarPedidoAlPOS`, `api_key`, sync de productos,
`producto_pos_id`, `folio_pedido`, `sucursales_disponibles` por nombre). Detalle en `docs/WEB0_RECON.md` y doc 06.

## 5. Cobertura de la DB compartida (verificado por MCP)
| La web necesita | Cubierto por | anon |
|---|---|---|
| Catálogo (visible_en_web, activo) | vista `catalogo_publico` (id, nombre, descripcion_web, precio_venta, categoria_nombre, imagen_url, **sucursal_ids**, orden) | ✅ SELECT |
| Config de marca + precio pastel | vista `config_publica` (nombre_negocio, logo_url, color_primario, color_acento, precio_kilo_global, ratio_personas_por_kilo) | ✅ SELECT |
| Sucursales activas | tabla `sucursales` (RLS `activa=true`) | ✅ SELECT |
| Categorías | tabla `categorias_producto` (RLS `activo=true`) | ✅ SELECT |
| Crear pedido tentativo | tabla `pedidos` vía **RPC `crear_pedido_web`** (0019; enforce `origen='web' AND estado='pendiente'`, devuelve el folio) | ✅ EXECUTE (sin SELECT) |

## 6. GAPs — RESUELTOS en WEB-1 (migraciones en el repo POS, Supabase compartido)
- **GAP 1 — folio del pedido web → RESUELTO (0017).** Trigger `BEFORE INSERT` en `pedidos` (`origen='web' AND folio IS NULL`) que asigna `siguiente_folio('pedido_pastel', sucursal_id)` vía función SECURITY DEFINER. `folio` sigue NOT NULL; anon sigue sin execute directo. **La web hace INSERT sin folio y la fila queda con `PP-<prefijo>-####`.** Verificado.
- **GAP 2 — upload de imagen → RESUELTO (0018).** Bucket dedicado **`web-uploads`** (público/no-listable, 5MB, solo imágenes); anon INSERT solo ahí; lectura por URL. El `uploads` del POS sigue authenticated-only. Verificado.
- **Cambio de código (WEB-2) — `sucursales_disponibles` (nombres) → `sucursal_ids` (IDs):** `catalogo_publico` expone `sucursal_ids`; la lógica de disponibilidad cambia de match por nombre a match por ID. **Cambio de LÓGICA, no plomería** — un find-replace lo rompe en silencio. (Se hace en el port; verificar con producto de 1 sucursal.)
- **✅ Folio en pantalla Gracias — RESUELTO (RPC, migración 0019 repo POS, aplicada y verificada):** anon hace INSERT pero **NO puede leer de vuelta el folio** (`pedidos` sin SELECT para anon; `insert().select()` → 42501). **Decisión de Miguel (bloqueada): opción 1** — RPC `crear_pedido_web(payload jsonb) → text` SECURITY DEFINER que inserta y **devuelve el folio**. En el port, el envío usa `supabase.rpc('crear_pedido_web', { payload })` (no `insert`) y pasa el folio devuelto a `ConfettiGracias`. anon nunca lee `pedidos` directo. Descartadas: Gracias sin folio; policy anon SELECT.

> Las migraciones 0017/0018 viven en el repo POS (`supabase/migrations/`, fuente única de verdad del esquema), ya aplicadas a la Supabase compartida.

## 7. Imágenes `media.base44.com` — YA RE-HOSPEDADAS (esta sesión)
Las 8 imágenes (logo + arte de `ConfettiHome.jsx`, `ConfettiNav.jsx`, `ConfettiFooter.jsx`, `confettiImages.jsx`)
**ya se subieron** a `web-uploads/assets/` (mismos nombres de archivo). Base nueva:
`https://ivqcxdpqxwjxfohiswqb.supabase.co/storage/v1/object/public/web-uploads/assets/`.
**WEB-2 solo cambia el prefijo de URL** (de `https://media.base44.com/images/public/6a2afcaf5df5e3322f4da64e/` a la base nueva). NO re-subir.

## 8. Repo / plataformas
- GitHub: `M1gu3hb/Pasteleria-Confetti-web-` (**privado**, separado del POS; **CON guion final**). `main` = baseline export (api_key REDACTADA). Rama de trabajo `migracion/supabase`.
- Supabase: **el MISMO del POS** (`ivqcxdpqxwjxfohiswqb`) — NO crear otro proyecto.
- Vercel: proyecto **aparte** ligado a este repo (import one-click de Miguel).

## 9. Estado y próximo paso — ver `docs/NEXT_STEPS.md`
- **WEB-0** (recon + andamiaje): HECHA. Repo web pusheado.
- **WEB-1** (GAP1 trigger 0017 + GAP2 bucket 0018, en repo POS): HECHA y verificada (anon 11/11, folio `PP-A-0001`, regresión POS limpia).
- **WEB-2** (port de la capa de datos Base44→Supabase): **HECHO (pendiente de auditoría de Miguel).** Sub-paso 1: RPC `crear_pedido_web` (0019/0020, repo POS). Port: cliente anon + `entitiesAdapter` (contrato `entities.*`), puente/auth/plantilla eliminados (incl. `base44/` y la api_key), NOMBRE→ID verificado con `prueba suscursal`, imágenes de marca re-hospedadas, `UploadFile→web-uploads`. **Build verde + smoke real en preview** (ambos formularios → fila `web/pendiente`, folio del trigger en Gracias, imagen en `web-uploads/pedidos/`; transaccional=0 tras limpiar). Detalle en `docs/CHANGELOG.md` (2026-06-27 cont. 2) y `docs/NEXT_STEPS.md`. Flags abiertos: fotos de catálogo aún en `media.base44.com` (`productos.imagen_url`, POS), `creado_por_nombre` no se sella, 1 imagen de prueba residual en Storage. **NO** validar end-to-end POS↔web todavía (eso es WEB-3); pendiente humano: import Vercel.
