import React from "react";

export default function PrecioResumen({
  kilos,
  precioKilo,
  subtotalPastel,
  subtotalExtras,
  total,
  sucursalNombre,
  fechaEntrega,
}) {
  const sinPrecio = !precioKilo || precioKilo <= 0;

  return (
    <div className="bg-white rounded-2xl border border-[#F0DDD5] shadow-[0_4px_24px_rgba(92,45,30,0.08)] p-6">
      <h3 className="font-['Playfair_Display'] font-semibold text-lg text-[#2C1A0E]">
        Resumen de tu pedido
      </h3>
      <div className="mt-4 space-y-2 text-sm font-['Plus_Jakarta_Sans'] text-[#7C5C52]">
        {sucursalNombre && (
          <div className="flex justify-between">
            <span>Sucursal</span>
            <span className="font-semibold text-[#2C1A0E]">{sucursalNombre}</span>
          </div>
        )}
        {fechaEntrega && (
          <div className="flex justify-between">
            <span>Fecha de entrega</span>
            <span className="font-semibold text-[#2C1A0E]">{fechaEntrega}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Pastel</span>
          <span className="font-semibold text-[#2C1A0E]">
            {sinPrecio
              ? `${kilos || 0} kg · A consultar`
              : `${kilos || 0} kg × $${precioKilo.toLocaleString("es-MX")} = $${subtotalPastel.toLocaleString("es-MX")}`}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Extras</span>
          <span className="font-semibold text-[#2C1A0E]">
            {subtotalExtras > 0 ? `$${subtotalExtras.toLocaleString("es-MX")}` : "—"}
          </span>
        </div>
        <div className="border-t border-[#F0DDD5] pt-2 flex justify-between items-center">
          <span className="font-semibold text-[#2C1A0E]">Total estimado</span>
          <span className="font-['Playfair_Display'] font-semibold text-xl text-[#5C2D1E]">
            {sinPrecio && subtotalExtras === 0 ? "A consultar" : `$${total.toLocaleString("es-MX")}`}
          </span>
        </div>
      </div>
      <p className="mt-4 text-xs font-['Plus_Jakarta_Sans'] text-[#7C5C52] leading-relaxed">
        💡 El precio final puede variar según el diseño y disponibilidad. Te confirmamos el monto
        exacto por WhatsApp.
      </p>
    </div>
  );
}