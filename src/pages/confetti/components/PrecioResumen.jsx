import React from "react";

export default function PrecioResumen({
  kilos,
  precioKilo,
  subtotalPastel,
  subtotalExtras,
  importeBase = 0,
  cotizaAparte = false,
  topeBaseKg = 0,
  total,
  sucursalNombre,
  fechaEntrega,
  rellenoNombre,
  rellenoPrecio = 0,
}) {
  const sinPrecio = !precioKilo || precioKilo <= 0;
  const rellenoCobra = Number(rellenoPrecio) > 0;

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
        {/* FIX 2: importe 0 no muestra línea; cotiza aparte muestra leyenda. */}
        {cotizaAparte ? (
          <div className="flex justify-between">
            <span>Importe de base</span>
            <span className="font-semibold text-[#8B5E3C]">Se cotiza aparte</span>
          </div>
        ) : Number(importeBase) > 0 ? (
          <div className="flex justify-between">
            <span>Importe de base</span>
            <span className="font-semibold text-[#2C1A0E]">${Number(importeBase).toLocaleString("es-MX")}</span>
          </div>
        ) : null}
        {rellenoCobra && (
          <div className="flex justify-between">
            <span>Relleno{rellenoNombre ? ` · ${rellenoNombre}` : ""}</span>
            <span className="font-semibold text-[#2C1A0E]">+${Number(rellenoPrecio).toLocaleString("es-MX")}</span>
          </div>
        )}
        {(() => {
          const extrasSolos = Math.round((Number(subtotalExtras || 0) - (rellenoCobra ? Number(rellenoPrecio) : 0)) * 100) / 100;
          return (
            <div className="flex justify-between">
              <span>Extras</span>
              <span className="font-semibold text-[#2C1A0E]">
                {extrasSolos > 0 ? `$${extrasSolos.toLocaleString("es-MX")}` : "—"}
              </span>
            </div>
          );
        })()}
        <div className="border-t border-[#F0DDD5] pt-2 flex justify-between items-center">
          <span className="font-semibold text-[#2C1A0E]">Total estimado</span>
          <span className="font-['Playfair_Display'] font-semibold text-xl text-[#5C2D1E]">
            {cotizaAparte || (sinPrecio && subtotalExtras === 0) ? "A consultar" : `$${total.toLocaleString("es-MX")}`}
          </span>
        </div>
        {cotizaAparte && (
          <p className="text-xs text-[#8B5E3C]">
            Los pasteles de más de {topeBaseKg} kg se cotizan aparte — te confirmamos el precio por WhatsApp.
          </p>
        )}
      </div>
      <p className="mt-4 text-xs font-['Plus_Jakarta_Sans'] text-[#7C5C52] leading-relaxed">
        💡 El precio final puede variar según el diseño y disponibilidad. Te confirmamos el monto
        exacto por WhatsApp.
      </p>
    </div>
  );
}