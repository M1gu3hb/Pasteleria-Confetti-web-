import { supabase } from '@/api/supabaseClient';

const enCurso = new Map();
const clave = tipo => `confetti:envio-web:v1:${tipo}`;
export function hayEnvioPendiente(tipo) {
  try { return !!localStorage.getItem(clave(tipo)); } catch { return false; }
}

export function enviarPedidoWeb(tipo, payload, confirmacion = {}) {
  const slot = clave(tipo);
  if (enCurso.has(slot)) return enCurso.get(slot);
  const promesa = (async () => {
    let previo;
    try { previo = localStorage.getItem(slot); }
    catch { throw new Error('No se pudo conservar el envío en este dispositivo. Contacta a la sucursal por WhatsApp.'); }
    let intencion;
    if (previo) {
      try { intencion = JSON.parse(previo); } catch { throw new Error('No se pudo recuperar el envío pendiente. Contacta a la sucursal antes de enviar otro.'); }
      if (!intencion?.id || !intencion?.payload || intencion.payload.tipo_pedido !== tipo) throw new Error('El envío pendiente no se pudo verificar. Contacta a la sucursal.');
    } else {
      if (!payload) throw new Error('No hay un envío pendiente para recuperar.');
      intencion = { id: crypto.randomUUID(), payload, confirmacion };
      // Persist BEFORE calling the server. Never replace uncertain payloads.
      try { localStorage.setItem(slot, JSON.stringify(intencion)); }
      catch { throw new Error('No se pudo conservar el envío. Contacta a la sucursal por WhatsApp.'); }
    }
    const { data, error } = await supabase.rpc('crear_pedido_web_idempotente', { p_intencion: intencion.id, payload: intencion.payload });
    if (error) {
      // A definitive business rejection rolls back the whole RPC. A lost
      // response, quota cooldown or ambiguous failure retains the original.
      if (error.code === 'P0001' && /^(PEDIDO_INVALIDO|PEDIDO_WEB_INVALIDO|CAMPO_PEDIDO_PROTEGIDO|PAGO_WEB_PROHIBIDO|IMPORTE_WEB_INVALIDO|CLIENTE_INVALIDO|FECHA_ENTREGA_INVALIDA|SALDO_WEB_INVALIDO|SUCURSAL_WEB_INVALIDA|fecha_entrega|estado invalido)/i.test(error.message)) {
        try { localStorage.removeItem(slot); } catch { /* retain safely */ }
      }
      const mensaje = /LIMITE_PEDIDOS_WEB/.test(error.message) ? 'Recibimos muchos pedidos recientes. Espera unos minutos y recupera este mismo envío.' :
        /FECHA_ENTREGA_INVALIDA/.test(error.message) ? 'La fecha de entrega ya no es válida. Actualiza la fecha y vuelve a enviar.' :
        /CLIENTE_INVALIDO/.test(error.message) ? 'Revisa tu nombre y número de teléfono antes de enviar.' :
        'No se confirmó el envío. Recupera este mismo pedido o contacta a la sucursal por WhatsApp.';
      throw new Error(mensaje);
    }
    if (typeof data !== 'string' || !data.trim()) throw new Error('No se pudo confirmar el folio. Recupera este mismo envío.');
    try { localStorage.removeItem(slot); } catch { /* confirmed, retry stays idempotent */ }
    return { folio: data, datosOriginales: intencion.payload, confirmacion: intencion.confirmacion || {}, recuperado: !!previo };
  })();
  enCurso.set(slot, promesa);
  promesa.then(() => enCurso.delete(slot), () => enCurso.delete(slot));
  return promesa;
}

export function urlGraciasPedido(resultado) {
  const p = resultado.datosOriginales;
  const c = resultado.confirmacion;
  const params = new URLSearchParams({ folio: resultado.folio, sucursal: p.sucursal_nombre || '', fecha: p.fecha_entrega || '', wa: c.whatsapp || '' });
  if (c.sinFoto) params.set('sinfoto', '1');
  return `/confetti/gracias?${params}`;
}
