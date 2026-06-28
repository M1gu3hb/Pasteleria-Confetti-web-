# NEXT_STEPS — Web Confetti

Última actualización: 2026-06-27 (Web migrada y VALIDADA — WEB-0..3 + flujo cruzado; **bot 60 días confirmó web 30/30 pedidos a sucursal correcta**; próxima fase = **Vercel + MEJORAS**; cutover pendiente = lunes).

## 🟢 ESTADO ACTUAL (lee esto primero)
- **Web pública migrada, independiente y VALIDADA como en Base44** (WEB-0/1/2/3 hechas; flujo cruzado POS↔web aprobado por evidencia).
- **Bot de pruebas largas (60 días, repo del POS) confirmó la web a volumen:** **30/30 pedidos web** (pastel + catálogo) llegaron a la **sucursal correcta**, con aislamiento RLS intacto. La cadena NOMBRE→ID y `config_publica`/`catalogo_publico` se comportan fielmente.
- **CUTOVER NO hecho** — Abel se instala el **LUNES**; hasta entonces, Base44. **Imágenes de catálogo (`media.base44.com`): NO tocar** (se mantienen para la demo; al independizar, recrear/descargar idénticas, nunca quitarlas).

## ▶️ PRÓXIMA FASE = MEJORAS (orden completo en el repo POS: `docs/MEJORAS_POST_VALIDACION.md`)
- **#1 Vercel Web:** ❌ **FALTA** — este repo (`Pasteleria-Confetti-web-`) **no tiene proyecto Vercel** todavía. Crear un **proyecto APARTE** (one-click import), rama `migracion/supabase`, + env vars `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (el MISMO Supabase del POS, `ivqcxdpqxwjxfohiswqb`). (El POS ya está en Vercel como `pasteleria-confetti` en preview.)
- **Mejoras que tocan la web** (detalle en el doc del POS): **pagos mixtos** también en el anticipo/cobro de pedido web (#5) + resolver que el pedido web de catálogo nace con `saldo_pendiente=0`; **cancelación de pedido web** con anticipo → devolución negativa en corte (#6).
- **Verificaciones pendientes** (no probadas a fondo): adelantar pago de pedido web de **catálogo** con método → que sume en corte + dashboard; cambiar **imagen y descripción** de producto → reflejo en el catálogo web.

---


## ✅ WEB-0 — HECHO (pendiente de revisión de Miguel)
- Leídas las fuentes (ZIP web, auditoría, MDs 04/05/06) y verificadas contra el código real.
- Comprensión escrita + inventario verde/roja + GAPs: ver `docs/WEB0_RECON.md` y `PROJECT_CONTEXT.md`.
- Andamiaje: working tree `C:\Pasteleria Confetti\web`, git local con baseline (api_key REDACTADA) + docs vivos + rama `migracion/supabase`. Mismo Supabase `ivqcxdpqxwjxfohiswqb` confirmado.

## ✅ WEB-1 — HECHO (fixes de DB; pendiente de auditoría de Miguel)
- Andamiaje **pusheado** a `M1gu3hb/Pasteleria-Confetti-web-` (con guion final): `main` (baseline, api_key redactada) y `migracion/supabase` (docs).
- **GAP 1 RESUELTO** (migración 0017 en repo POS): trigger de folio web. **GAP 2 RESUELTO** (0018): bucket `web-uploads`. Ambas aplicadas a la Supabase compartida y verificadas (anon 11/11, folio `PP-A-0001`, regresión POS OK). Ver `PROJECT_CONTEXT.md §6`.

## 🔴 PENDIENTE HUMANO DE MIGUEL
- **Vercel:** crear proyecto APARTE ligado a `Pasteleria-Confetti-web-` (import one-click), rama `migracion/supabase`, + env vars `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (el MISMO Supabase del POS, `ivqcxdpqxwjxfohiswqb`).

## ✅ WEB-2 — PORT de la capa de datos: HECHO (pendiente de auditoría de Miguel)
> **Build verde + smoke real en preview** (ambos formularios crean fila `web/pendiente` con folio del trigger; NOMBRE→ID verificado con `prueba suscursal`; imagen a `web-uploads/pedidos/`; transaccional=0 tras limpiar). Resumen en `docs/CHANGELOG.md` (2026-06-27 cont. 2). **Flags:** fotos de catálogo aún en `media.base44.com` (`productos.imagen_url`, dato POS) → **bloqueante de cutover** documentado en repo POS (`NEXT_STEPS`/`BUGS_PENDING (g)`); `creado_por_nombre` **RESUELTO** (sello server-side, migración 0021); 1 imagen de prueba (93 B) residual en `web-uploads/pedidos/` (borrar por Storage dashboard). **WEB-3** (validación end-to-end POS↔web) **HECHA y aprobada por evidencia** (ver `docs/CHANGELOG.md` 2026-06-27 cont. 3): pedido web visible y fiel en el POS (badge 🌐 WEB, "Creado por Web Confetti", imagen de referencia) + aislamiento por sucursal; edición de producto en el POS reflejada de inmediato en el catálogo web (misma fila, sin sync); sin exponer costos; sin diffs vs Base44. **Siguiente:** import Vercel (Miguel) + bot de pruebas agresivas (al final).
>
> _Plan ejecutado (referencia):_ se trabajó en `C:\Pasteleria Confetti\web` (clon en `migracion/supabase`, `.env` ya con las claves del POS).
> (`VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`, mismos del POS — copiar byte-exacto del `.env` del POS).
> `npm install`. **NO tocar el repo/esquema POS** (0017/0018 ya cubren los GAPs). Es espejo de la Fase 2 del POS.

**1) Cliente Supabase anon + capa de adaptación (NO sed masivo):**
- `src/api/supabaseClient.js`: `createClient(url, anonKey, { auth:{ persistSession:false } })`.
- `src/api/entitiesAdapter.js`: `entities.{ProductoTerminado→catalogo_publico, ConfiguracionNegocio→config_publica, Sucursal→sucursales, CategoriaProducto→categorias_producto, PedidoPastel(create)→`rpc('crear_pedido_web')`}` con `.filter(query,sort,limit)/.list()` (solo filtros eq) + `uploadArchivo(file)`→bucket `web-uploads` (devuelve `{file_url}`). En `catalogo_publico` ignorar filtros `visible_en_web`/`activo` (la vista ya los aplica).
- **Envío del pedido = `supabase.rpc('crear_pedido_web', { payload })`** (NO `insert`). La RPC 0019 (repo POS, ya aplicada) inserta el pedido y **devuelve el folio** (`data` = string `PP-<prefijo>-####`). Los candados (`origen='web'`/`estado='pendiente'`, whitelist de columnas que descarta `devolver_base`/`folio`/financieros, requeridos + sucursal activa) y el folio (trigger 0017) viven **server-side** en 0019 — el front solo arma el `payload` con los nombres de columna de la tabla `pedidos` y lee el folio devuelto.

**2) MATAR EL PUENTE / auth / plantilla — borrar:** carpeta `base44/`, `src/api/base44Client.js`, `src/lib/app-params.js`, `src/lib/AuthContext.jsx`, `src/utils/posApiClient.js`, `src/utils/pedidoPastelUtils.js` (legacy, NO portar), `src/components/{ProtectedRoute,UserNotRegisteredError,AuthLayout,GoogleIcon}.jsx`, `src/pages/{Login,Register,ForgotPassword,ResetPassword}.jsx`, `src/components/ui/{chart,input-otp}.jsx` (deps rojas). **Arreglar:** `src/App.jsx` (quitar AuthProvider/useAuth → solo `<Routes>`), `src/lib/PageNotFound.jsx` (quitar `base44.auth.me`). `package.json` (quitar `@base44/*` + Stripe/leaflet/three/jspdf/html2canvas/react-markdown/react-quill/moment/recharts/lodash/dnd/input-otp; +`@supabase/supabase-js`). `vite.config.js` (sin `@base44/vite-plugin`; alias `@`→`./src`).
- Call-sites a portar (`base44.entities.*`→`entities.*`): `ConfettiCatalogo`, `ConfettiHome`, `ConfettiNav`, `ConfettiFooter` (config/sucursales), `ConfettiFormularioPastel` (Sucursal/Config + `UploadFile`→`uploadArchivo` + envío), `ConfettiFormularioProductos` (Producto/Sucursal/Categoria + envío + disponibilidad).

**3) ⚠️ FIDELIDAD nombre→ID (cambio de LÓGICA, no plomería) — solo en `ConfettiFormularioProductos.jsx` + `SucursalSelector.jsx`:**
- Hoy filtra/bloquea por `p.sucursales_disponibles` (**NOMBRES**) vía `nombresPermitidos` (intersección de nombres). `catalogo_publico` expone **`sucursal_ids` (IDs)**. Reescribir: `sucursalesValidasDe(p)` lee `p.sucursal_ids` (vacío/null = global); la intersección y `SucursalSelector` matchean por **`s.id`** (renombrar prop a `idsPermitidos`, `esPermitida = !ids || ids.includes(s.id)`). Para el mensaje de conflicto, mapear IDs→nombre (`sucursales.find(s=>s.id===…).nombre`).
- **Verificar explícitamente:** un producto limitado a 1 sucursal (en staging existe `prueba suscursal` → solo Xochimilco `057f9ba7…`) aparece/bloquea correcto **por ID**.

**4) UploadFile → `web-uploads`** (preserva contrato `{file_url}` que consume el form del pastel).

**5) Imágenes `media.base44.com` — YA RE-HOSPEDADAS** (esta sesión) en `web-uploads/assets/` (8 archivos, MISMOS nombres). Base nueva: `https://ivqcxdpqxwjxfohiswqb.supabase.co/storage/v1/object/public/web-uploads/assets/`. **WEB-2 solo cambia el prefijo** en `confettiImages.jsx`, `ConfettiNav.jsx`, `ConfettiFooter.jsx`, `ConfettiHome.jsx` (sed del prefijo `https://media.base44.com/images/public/6a2afcaf5df5e3322f4da64e/` → la base nueva). NO re-subir.

**6) ✅ RESUELTO — folio en pantalla Gracias (RPC `crear_pedido_web`, migración 0019 repo POS, ya aplicada y verificada):**
- Problema: anon hace INSERT pero **no puede leer de vuelta el folio** (`pedidos` sin SELECT para anon; `insert().select()` → **42501**). `ConfettiGracias` necesita el `?folio=`.
- **Solución (decisión de Miguel, bloqueada): opción 1.** RPC `crear_pedido_web(payload jsonb) returns text` SECURITY DEFINER que inserta el pedido **y devuelve el folio** en una sola llamada (reproduce el `crearPedidoPOS` de Base44 sin api_key). anon NUNCA lee `pedidos` directo.
- **En el port:** el envío hace `const { data: folio, error } = await supabase.rpc('crear_pedido_web', { payload })`; con `error` se muestra el fallo (mensaje de la RPC: requerido faltante, etc.), y `folio` (string `PP-<prefijo>-####`) se pasa a `ConfettiGracias` (`?folio=`). El front ya tiene el resto de params de Gracias (sucursal, fecha, wa) en cliente. La whitelist/candados/folio están server-side en 0019 — el front solo construye el `payload` con los nombres de columna de `pedidos`.
- Verificado anon: folio real devuelto, fila `web/pendiente`, catálogo `kilos=0`, SELECT directo → 42501, payloads inválidos rechazados. Ver POS `DECISIONS.md #22`.

**7) Build verde + deploy preview + SMOKE** (preview/local): catálogo desde `catalogo_publico` agrupado por `categoria_nombre`, branding Confetti (`config_publica`), imágenes re-hospedadas cargan; filtro por sucursal por ID (incl. producto de 1 sucursal); pastel: estima precio (precio_kilo_global/ratio), sube foto a `web-uploads`, ENVÍA → fila en `pedidos` `origen='web'/estado='pendiente'/folio PP-<prefijo>-#### (trigger)/tipo_pedido='pastel_personalizado'`; productos: texto en `notas_generales`, `kilos=0`; Gracias muestra el folio (según decisión #6). Verificar las filas/folios **por SQL/MCP** (anon no lee pedidos). Limpiar pedidos/archivos de prueba al terminar (staging solo maestros).

> Reglas: NO tocar el repo/esquema POS (solo LEER vistas; el esquema vive en el repo POS). NO re-exponer la api_key `847df…`. Web pública = anon key + RLS. NO validar conexión end-to-end POS↔web todavía (eso es WEB-3). DETENERSE y reportar al cerrar WEB-2.
