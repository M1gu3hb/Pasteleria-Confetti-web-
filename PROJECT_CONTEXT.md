# PROJECT_CONTEXT — Web Confetti (catálogo público; migración Base44 → Vercel + Supabase compartido)

> **Fuente principal de transferencia.** Léelo COMPLETO antes de tocar nada, junto con `CLAUDE.md` y `docs/`.
> Última actualización: 2026-06-26 (WEB-0: recon + andamiaje).
> **Working tree:** `C:\Pasteleria Confetti\web`. Repo: `M1gu3hb/Pasteleria-Confetti-Web` (privado; **pendiente de crear el remoto** — ver NEXT_STEPS).

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
| Crear pedido tentativo | tabla `pedidos` (RLS WITH CHECK `origen='web' AND estado='pendiente'`) | ✅ INSERT (sin SELECT) |

## 6. GAPs — RESUELTOS en WEB-1 (migraciones en el repo POS, Supabase compartido)
- **GAP 1 — folio del pedido web → RESUELTO (0017).** Trigger `BEFORE INSERT` en `pedidos` (`origen='web' AND folio IS NULL`) que asigna `siguiente_folio('pedido_pastel', sucursal_id)` vía función SECURITY DEFINER. `folio` sigue NOT NULL; anon sigue sin execute directo. **La web hace INSERT sin folio y la fila queda con `PP-<prefijo>-####`.** Verificado.
- **GAP 2 — upload de imagen → RESUELTO (0018).** Bucket dedicado **`web-uploads`** (público/no-listable, 5MB, solo imágenes); anon INSERT solo ahí; lectura por URL. El `uploads` del POS sigue authenticated-only. Verificado.
- **Cambio de código (WEB-2) — `sucursales_disponibles` (nombres) → `sucursal_ids` (IDs):** `catalogo_publico` expone `sucursal_ids`; la lógica de disponibilidad cambia de match por nombre a match por ID. (Se hace en el port.)

> Las migraciones 0017/0018 viven en el repo POS (`supabase/migrations/`, fuente única de verdad del esquema), ya aplicadas a la Supabase compartida.

## 7. FLAG (anotado, no arreglado en WEB-0)
Imágenes hardcodeadas en `media.base44.com` (logo + arte): `ConfettiHome.jsx`, `ConfettiNav.jsx`,
`ConfettiFooter.jsx`, `confettiImages.jsx`. **Mueren al apagar Base44** → re-hospedar en Supabase Storage/Vercel en el port.

## 8. Repo / plataformas
- GitHub: `M1gu3hb/Pasteleria-Confetti-Web` (**privado**, separado del POS). `main` = baseline export (api_key REDACTADA). Rama de trabajo `migracion/supabase`.
- Supabase: **el MISMO del POS** (`ivqcxdpqxwjxfohiswqb`) — NO crear otro proyecto.
- Vercel: proyecto **aparte** ligado a este repo (import one-click de Miguel).

## 9. Próximo paso — ver `docs/NEXT_STEPS.md`
Miguel revisa WEB-0. Luego WEB-1 (resolver GAP 1/2 + port de la capa de datos Base44→Supabase). NO migrar código aún.
