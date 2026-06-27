# WEB-0 — Reconocimiento de la Web Confetti (recon + andamiaje)

Fuentes leídas: ZIP `confetti-pasteleria-web` (código real, 109 archivos), `Analisis ZIP Web.txt`,
MDs 04/05/06. Verificado contra el código real (no asumido). App Base44 web `6a2afcaf5df5e3322f4da64e`.

## (a) Qué hace la web
Catálogo público mobile-first, **sin login, sin pago, sin carrito persistente complejo**. Rutas (App.jsx,
todas públicas): `/`→`/confetti`; bajo `ConfettiLayout`: `/confetti` (Home), `/confetti/catalogo`,
`/confetti/pedir` (pastel), `/confetti/productos` (catálogo), `/confetti/gracias`. Cliente con
`requiresAuth:false`. Flujos:
- **Catálogo:** `ProductoTerminado.filter({visible_en_web:true, activo:true})`, agrupa por `categoria_nombre` (string).
- **Pedido pastel personalizado** (`ConfettiFormularioPastel`): kilos/personas/concepto/decorado/rellenos/leyenda/extras (base/oblea/muñeca/velas) + imagen de referencia (`integrations.Core.UploadFile`) + datos cliente + fecha/hora. Estima precio con `precio_kilo_global`/`ratio_personas_por_kilo` (el POS tiene la última palabra).
- **Pedido productos de catálogo** (`ConfettiFormularioProductos`): elige productos → viajan como **texto** en `notas_generales`. Disponibilidad por `sucursales_disponibles` (nombres).
- **Envío:** ambos formularios llaman `enviarPedidoAlPOS({origen:'web', estado:'pendiente', tipo_pedido, sucursal_id, …})`.
- **Gracias:** confirmación leyendo querystring (folio, sucursal, fecha, wa).

## (b) Cómo colapsa el puente en Opción A — qué se elimina
| Artefacto del puente (hoy) | Destino (Opción A) |
|---|---|
| `base44/functions/crearPedidoPOS/entry.ts` (Deno; api_key, mapea sucursal por nombre, genera folio en `FolioContador` del POS, `POST PedidoPastel`) | **ELIMINAR.** La web hace `INSERT` directo en `pedidos` con anon key + RLS |
| `src/utils/posApiClient.js` → `enviarPedidoAlPOS` (`functions.invoke`) | **ELIMINAR.** Reemplazar por `supabase.from('pedidos').insert(...)` |
| `api_key 847df…` hardcodeada en `entry.ts` | **ELIMINAR** (redactada en baseline; Miguel la rota) |
| `producto_pos_id` (vínculo de copia web) | **ELIMINAR** — una sola tabla `productos`, un solo `id` |
| `folio_pedido` (web) vs `folio` (POS) | **UNIFICAR** a `folio` |
| `sucursales_disponibles` (array de **nombres**) | **CAMBIAR** a `sucursal_ids` (IDs) — `catalogo_publico` ya expone `sucursal_ids` |
| Sync POS→Web de productos | NO existía en este ZIP (vive en el POS); con DB compartida no hay sync |
| `base44.auth.*`, `AuthContext`, `app-params.js`, `createAxiosClient`, `ProtectedRoute`, páginas Login/Register/Forgot/Reset | **ELIMINAR/VACIAR** — web pública con anon key, sin login |
| `integrations.Core.UploadFile` | Reescribir a **Supabase Storage** (ver GAP 2) |

## (c) Tablas/vistas compartidas que cubren la web + GAPs
Ver tabla de cobertura en `PROJECT_CONTEXT.md §5` (todo verificado por MCP: anon SÍ lee catalogo_publico/
config_publica/sucursales/categorias; INSERT pedidos permitido; SELECT pedidos denegado).

**GAPs (resolver en WEB-1):**
1. **Folio del pedido web** — `pedidos.folio` NOT NULL; anon no puede ejecutar `siguiente_folio`. (confirmado por MCP: `anon_exec_siguiente_folio=false`, `pedidos_folio_nullable=NO`.)
2. **Upload imagen pastel** — bucket `uploads` solo INSERT a `authenticated` (anon solo READ). (confirmado por MCP: políticas `uploads_auth_insert`=authenticated, `uploads_public_read`=public.)

## (d) Inventario VERDE / ROJA del ZIP web
### VERDE (lo real de Confetti)
- **6 entidades:** `ProductoTerminado`, `PedidoPastel`, `Sucursal`, `CategoriaProducto`, `ConfiguracionNegocio`, `User` (built-in, casi sin uso). Limpio — NO hay basura de restaurante aquí (eso es del POS).
- **Páginas confetti:** Home, Catalogo, FormularioPastel, FormularioProductos, Gracias + componentes (ConfettiLayout/Nav/Footer, ProductCard, SucursalSelector, RellenoSelector, PrecioResumen, ProductoSearch, ProductosVerTodos, ConfettiReveal/Particles, PasosEmojis, confettiImages).
- React Query, Tailwind, paleta de marca (#E8579A/#5C2D1E/#FFF8F4).

### ROJA (basura de plantilla a descartar)
- **Deps instaladas y NO importadas en `src/`:** `@stripe/*`, `react-leaflet`, `three`, `jspdf`, `html2canvas`, `react-quill`, `react-markdown`, `recharts`, `moment`, `@hello-pangea/dnd`, `input-otp`, gran parte de `@radix-ui/*`.
- **Plantilla muerta:** `ProtectedRoute.jsx` (no usado), `Login/Register/ForgotPassword/ResetPassword.jsx` (NO ruteadas), `AuthLayout.jsx`, `GoogleIcon.jsx`, `UserNotRegisteredError.jsx`, casi todo `components/ui/*` salvo lo que importen las páginas confetti.
- **Legacy no invocado:** `pedidoPastelUtils.js::generarFolioPedido` (lee `folio_pedido` local; ningún formulario lo llama).
- **Puente:** `crearPedidoPOS/entry.ts` + `posApiClient.js` (eliminar en Opción A).
- **Infra Base44:** `@base44/sdk`, `@base44/vite-plugin`, `base44Client.js`, `app-params.js` (reemplazar por supabase-js + vite plugin react).

## (e) FLAG (no se arregla en WEB-0)
Imágenes en `media.base44.com` (logo + arte) en ConfettiHome/Nav/Footer/confettiImages → re-hospedar en Storage en el port.
