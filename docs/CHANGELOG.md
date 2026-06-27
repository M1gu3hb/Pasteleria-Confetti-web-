# CHANGELOG — Web Confetti

Orden cronológico inverso. Conventional-ish. El esquema vive en el repo POS (fuente única).

## 2026-06-27 (cont. 2) — WEB-2: PORT de la capa de datos HECHO (build verde + smoke real)
**Independización de Base44 completa en código.** El puente murió; la web habla con el Supabase compartido vía anon key + RLS, y crea pedidos por la RPC `crear_pedido_web`.

- **Capa de datos nueva:** `src/api/supabaseClient.js` (anon, `persistSession:false`) + `src/api/entitiesAdapter.js` (contrato `entities.*` preservado: `ProductoTerminado→catalogo_publico`, `ConfiguracionNegocio→config_publica`, `Sucursal→sucursales`, `CategoriaProducto→categorias_producto`; **el catálogo ignora los filtros `visible_en_web`/`activo`** que la vista ya aplica; `PedidoPastel.create→rpc('crear_pedido_web')` que **devuelve el folio**; `uploadArchivo(file)→web-uploads` con contrato `{file_url}`).
- **Puente/auth/plantilla ELIMINADOS:** borrados `src/api/base44Client.js`, `src/utils/posApiClient.js`, `src/utils/pedidoPastelUtils.js` (legacy folio), `src/lib/app-params.js`, `src/lib/AuthContext.jsx`, `ProtectedRoute`/`AuthLayout`/`GoogleIcon`/`UserNotRegisteredError`, páginas `Login`/`Register`/`ForgotPassword`/`ResetPassword`, `ui/chart`+`ui/input-otp`, `src/utils/index.ts` (createPageUrl sin uso) y **toda la carpeta `base44/`** (incl. `functions/crearPedidoPOS/entry.ts` con la api_key). `App.jsx` sin `AuthProvider`/`useAuth` (solo rutas públicas); `PageNotFound.jsx` sin `base44.auth.me`; `vite.config.js` sin `@base44/vite-plugin` (+ alias `@`); `package.json` sin `@base44/*` ni deps rojas (Stripe/leaflet/three/jspdf/html2canvas/quill/markdown/recharts/moment/dnd/input-otp/lodash) + `@supabase/supabase-js`.
- **FIDELIDAD NOMBRE→ID (cambio de LÓGICA):** `ConfettiFormularioProductos` + `SucursalSelector` ahora matchean disponibilidad por **`sucursal_ids` (uuid[])** vía `s.id` (`idsPermitidos`, `esPermitida=!ids||ids.includes(s.id)`), con mapeo ID→nombre para los mensajes. **Verificado en preview** con `prueba suscursal` (solo Xochimilco `057f9ba7…`): auto-selecciona Xochimilco, **bloquea** Topilejo y San Gregorio, mensaje correcto.
- **Imágenes de marca:** prefijo cambiado a `web-uploads/assets/` en Home/Nav/Footer/confettiImages (8 assets cargan 200).
- **Build verde** (`vite build`, exit 0). **Smoke real (preview, anon, Supabase compartido):** catálogo desde `catalogo_publico` agrupado por `categoria_nombre` + branding `config_publica`; pastel → sube imagen a `web-uploads/pedidos/` + RPC → fila `web/pendiente/pastel_personalizado` folio `PP-B-0001`, kilos=3, precio_kilo_usado=140, total 420, `imagen_referencia_url` OK, Gracias muestra el folio; productos → texto en `notas_generales`, kilos=0, folio `PP-A-0001`. **Cero errores de consola.** Filas/contador de prueba limpiados (transaccional=0).
- **Flags:** (1) las **fotos de producto del catálogo** siguen en `media.base44.com` (vienen de `productos.imagen_url`, dato del POS) → **documentado como BLOQUEANTE DE CUTOVER** en el repo POS (`NEXT_STEPS`/`BUGS_PENDING (g)`); re-hospedarlas es migración de datos del POS, no se ejecuta en WEB-2; (2) **RESUELTO** — `creado_por_nombre='Web Confetti'` ahora lo **sella la RPC** server-side (**migración 0021**, constante no inyectable; verificado); (3) 1 imagen de prueba (93 B) en `web-uploads/pedidos/` → anotada para borrado por Storage dashboard (`service_role`; no se tocó RLS).
- **Pendiente humano:** import del proyecto Vercel (Miguel). **NO** se validó end-to-end POS↔web (eso es WEB-3).

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
