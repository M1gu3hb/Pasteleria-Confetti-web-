import { base44 } from "@/api/base44Client";

// Genera folio incremental por sucursal: PP-[PREFIJO]-0001
export async function generarFolioPedido(sucursalId, folioPrefijo) {
  const prefijo = folioPrefijo || "X";
  const ultimos = await base44.entities.PedidoPastel.filter(
    { sucursal_id: sucursalId },
    "-created_date",
    1
  );
  let siguiente = 1;
  if (ultimos.length > 0 && ultimos[0].folio_pedido) {
    const partes = ultimos[0].folio_pedido.split("-");
    const num = parseInt(partes[partes.length - 1], 10);
    if (!isNaN(num)) siguiente = num + 1;
  }
  return `PP-${prefijo}-${String(siguiente).padStart(4, "0")}`;
}

// Precio por kilo (global por ahora)
export async function getPrecioKilo() {
  const configs = await base44.entities.ConfiguracionNegocio.list();
  return configs[0]?.precio_kilo_global || 0;
}

// Ratio de personas por kilo (default 10)
export async function getRatioPersonas() {
  const configs = await base44.entities.ConfiguracionNegocio.list();
  return configs[0]?.ratio_personas_por_kilo || 10;
}

// Configuración completa del negocio
export async function getConfiguracionNegocio() {
  const configs = await base44.entities.ConfiguracionNegocio.list();
  return configs[0] || null;
}