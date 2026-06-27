/**
 * Cliente para crear pedidos en el POS de Confetti.
 * La escritura se hace vía la función backend `crearPedidoPOS`
 * (server-to-server, sin CORS).
 */
import { base44 } from "@/api/base44Client";

/**
 * Envía un pedido al POS a través de la función backend.
 * El backend mapea la sucursal por nombre, genera el folio
 * y crea el pedido en el POS. Devuelve { ok, folio, pedido }.
 */
export async function enviarPedidoAlPOS(pedidoData) {
  const response = await base44.functions.invoke("crearPedidoPOS", pedidoData);
  const resultado = response?.data;
  if (!resultado?.ok) {
    throw new Error(resultado?.error || "No se pudo crear el pedido");
  }
  return resultado;
}