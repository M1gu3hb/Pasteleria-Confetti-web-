import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const POS_APP_ID = "6a28a71350ef872d8486262b";
const POS_BASE_URL = `https://app.base44.com/api/apps/${POS_APP_ID}`;
const POS_API_KEY = "REDACTED-rotar-en-cutover"; // baseline: api_key real redactada (seguridad). El puente desaparece en Opción A.

Deno.serve(async (req) => {
  try {
    // Validar que la petición venga de un contexto válido del propio proyecto
    const base44 = createClientFromRequest(req);

    const body = await req.json();

    if (!body || !body.cliente_nombre || !body.cliente_telefono || !body.fecha_entrega) {
      return Response.json(
        { ok: false, error: "Faltan campos requeridos del pedido" },
        { status: 400 }
      );
    }

    const posHeaders = {
      "Content-Type": "application/json",
      "api_key": POS_API_KEY,
    };

    // 1. Mapear sucursal por nombre
    let sucursales = [];
    try {
      const sucRes = await fetch(
        `${POS_BASE_URL}/entities/Sucursal?q=${encodeURIComponent(
          JSON.stringify({ activa: true })
        )}`,
        { headers: posHeaders }
      );
      sucursales = sucRes.ok ? await sucRes.json() : [];
    } catch (_e) {
      sucursales = [];
    }

    const sucMatch = Array.isArray(sucursales)
      ? sucursales.find((s) => s.nombre === body.sucursal_nombre)
      : null;
    const sucursalId = sucMatch?.id || body.sucursal_id;
    const prefijo = sucMatch?.folio_prefijo || "W";

    // 2. Generar folio
    let folio;
    try {
      const fcRes = await fetch(
        `${POS_BASE_URL}/entities/FolioContador?q=${encodeURIComponent(
          JSON.stringify({ tipo: "pedido_pastel", sucursal_id: sucursalId })
        )}`,
        { headers: posHeaders }
      );
      const contadores = fcRes.ok ? await fcRes.json() : [];
      if (Array.isArray(contadores) && contadores.length > 0) {
        const c = contadores[0];
        const num = (c.ultimo_numero || 0) + 1;
        await fetch(`${POS_BASE_URL}/entities/FolioContador/${c.id}`, {
          method: "PUT",
          headers: posHeaders,
          body: JSON.stringify({ ultimo_numero: num }),
        });
        folio = `PP-${prefijo}-${String(num).padStart(4, "0")}`;
      } else {
        const createRes = await fetch(`${POS_BASE_URL}/entities/FolioContador`, {
          method: "POST",
          headers: posHeaders,
          body: JSON.stringify({
            tipo: "pedido_pastel",
            sucursal_id: sucursalId,
            prefijo,
            ultimo_numero: 1,
          }),
        });
        folio = createRes.ok
          ? `PP-${prefijo}-0001`
          : `PP-${prefijo}-W${Date.now().toString().slice(-6)}`;
      }
    } catch (_e) {
      folio = `PP-${prefijo}-W${Date.now().toString().slice(-6)}`;
    }

    // 3. Crear el pedido en el POS
    const pedidoFinal = {
      ...body,
      folio,
      sucursal_id: sucursalId,
      sucursal_nombre: sucMatch?.nombre || body.sucursal_nombre,
    };

    const crearRes = await fetch(`${POS_BASE_URL}/entities/PedidoPastel`, {
      method: "POST",
      headers: posHeaders,
      body: JSON.stringify(pedidoFinal),
    });

    if (!crearRes.ok) {
      const errText = await crearRes.text();
      return Response.json(
        { ok: false, error: `POS rechazó: ${crearRes.status} ${errText}` },
        { status: 502 }
      );
    }

    const pedido = await crearRes.json();
    return Response.json({ ok: true, folio, pedido });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
});