// =====================================================================
// Capa de adaptación: contrato base44.entities.* -> Supabase (web pública)
// ---------------------------------------------------------------------
// La web es SOLO lectura de lo público + UNA escritura (crear pedido):
//   * Lecturas -> vistas/tablas públicas (anon + RLS):
//       ProductoTerminado -> catalogo_publico   (la vista YA filtra visible_en_web/activo)
//       ConfiguracionNegocio -> config_publica
//       Sucursal -> sucursales        CategoriaProducto -> categorias_producto
//   * Escritura -> PedidoPastel.create llama la RPC `crear_pedido_web` (0019),
//       que inserta el pedido Y DEVUELVE el folio (anon NO hace insert/SELECT directo).
//   * uploadArchivo(file) -> bucket `web-uploads` (preserva el contrato { file_url }).
// Preserva la firma que usan las páginas: X.filter(query, sort, limit) / X.list(sort, limit).
// NO es un find-replace: el contrato no cambia, solo la fuente de datos.
// =====================================================================
import { supabase } from './supabaseClient';

// Entidad Base44 (PascalCase) -> relación pública (snake_case)
const TABLE_MAP = {
  ProductoTerminado: 'catalogo_publico',
  ConfiguracionNegocio: 'config_publica',
  Sucursal: 'sucursales',
  CategoriaProducto: 'categorias_producto',
};

// Filtros a IGNORAR por relación: la vista ya los aplica y la columna NO existe
// en la vista pública (filtrar por ella daría "column does not exist").
const IGNORE_FILTERS = {
  catalogo_publico: new Set(['visible_en_web', 'activo']),
};

// "-orden" -> order(orden, desc) ; "orden_visual" -> order(orden_visual, asc)
function applySort(builder, sort) {
  if (!sort || typeof sort !== 'string') return builder;
  const desc = sort.startsWith('-');
  const col = desc ? sort.slice(1) : sort;
  return builder.order(col, { ascending: !desc, nullsFirst: false });
}

function makeReadEntity(table) {
  const ignore = IGNORE_FILTERS[table];

  const run = async (build) => {
    const { data, error } = await build(supabase.from(table).select('*'));
    if (error) throw new Error(`[${table}] ${error.message}`);
    return Array.isArray(data) ? data : data ? [data] : [];
  };

  const applyQuery = (b, query) => {
    for (const [field, value] of Object.entries(query || {})) {
      if (ignore && ignore.has(field)) continue; // la vista ya lo aplica
      b = value === null ? b.is(field, null) : b.eq(field, value);
    }
    return b;
  };

  return {
    async filter(query = {}, sort, limit) {
      return run((b) => {
        b = applyQuery(b, query);
        b = applySort(b, sort);
        if (typeof limit === 'number') b = b.limit(limit);
        return b;
      });
    },
    async list(sort, limit) {
      return run((b) => {
        b = applySort(b, sort);
        if (typeof limit === 'number') b = b.limit(limit);
        return b;
      });
    },
  };
}

// PedidoPastel.create -> RPC crear_pedido_web (devuelve el folio). NUNCA insert directo.
// La RPC (0019, SECURITY DEFINER) fuerza origen='web'/estado='pendiente', acota
// tipo_pedido, whitelistea columnas (ignora devolver_base/folio/financieros) y asigna
// el folio vía el trigger 0017. Devuelve { folio } para la pantalla Gracias.
const pedidoEntity = {
  async create(payload) {
    const { data, error } = await supabase.rpc('crear_pedido_web', { payload });
    if (error) throw new Error(error.message);
    return { folio: data };
  },
};

// Stub inocuo para cualquier entidad no mapeada (no debería ocurrir en la web).
const inertEntity = {
  async filter() { return []; },
  async list() { return []; },
  async create(obj) { return obj; },
};

const _cache = {};
function makeEntity(name) {
  if (name === 'PedidoPastel') return pedidoEntity;
  const table = TABLE_MAP[name];
  return table ? makeReadEntity(table) : inertEntity;
}

// Proxy: entities.<Entidad> devuelve su adaptador (memoizado).
export const entities = new Proxy({}, {
  get(_t, name) {
    if (typeof name !== 'string') return undefined;
    if (!_cache[name]) _cache[name] = makeEntity(name);
    return _cache[name];
  },
});

// Reemplazo de base44.integrations.Core.UploadFile: sube al bucket `web-uploads`
// (0018) y devuelve { file_url } con la URL pública. Mismo contrato que consume
// el formulario del pastel (uploadResult?.file_url).
export async function uploadArchivo(file) {
  if (!file) return { file_url: null };
  const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase();
  const path = `pedidos/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from('web-uploads')
    .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type || undefined });
  if (error) throw new Error(`[web-uploads] ${error.message}`);
  const { data } = supabase.storage.from('web-uploads').getPublicUrl(path);
  return { file_url: data.publicUrl };
}
