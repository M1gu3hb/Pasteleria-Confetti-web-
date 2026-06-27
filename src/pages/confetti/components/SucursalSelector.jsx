import React from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, CheckCircle, WarningCircle } from "@phosphor-icons/react";

export default function SucursalSelector({
  sucursales = [],
  seleccionada,
  onSelect,
  error,
  idsPermitidos = null,
}) {
  const esPermitida = (s) =>
    !idsPermitidos || idsPermitidos.includes(s.id);
  return (
    <div className="space-y-3">
      {sucursales.map((sucursal) => {
        const selected = sucursal.id === seleccionada?.id;
        const permitida = esPermitida(sucursal);
        return (
          <motion.button
            key={sucursal.id}
            type="button"
            disabled={!permitida}
            whileTap={permitida ? { scale: 0.97 } : {}}
            animate={selected ? { scale: [1, 1.03, 1] } : {}}
            transition={{ duration: 0.3 }}
            onClick={() => permitida && onSelect(sucursal)}
            className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
              !permitida
                ? "border-[#F0DDD5] bg-[#F7F2EF] opacity-50 cursor-not-allowed"
                : selected
                ? "border-[#E8579A] bg-[#FDEEF6] shadow-[0_0_0_4px_rgba(232,87,154,0.15)]"
                : "border-[#F0DDD5] bg-white hover:border-[#E8579A]/50"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-['Plus_Jakarta_Sans'] font-semibold text-[#2C1A0E] text-base">
                  {sucursal.nombre}
                </div>
                <div className="text-sm text-[#7C5C52] mt-1 flex items-start gap-1.5 font-['Plus_Jakarta_Sans']">
                  <MapPin size={14} className="mt-0.5 shrink-0" />
                  {sucursal.direccion}
                </div>
                {sucursal.telefono && (
                  <div className="text-sm text-[#7C5C52] mt-0.5 flex items-center gap-1.5 font-['Plus_Jakarta_Sans']">
                    <Phone size={14} className="shrink-0" />
                    {sucursal.telefono}
                  </div>
                )}
              </div>
              {selected && (
                <CheckCircle size={24} weight="fill" className="text-[#E8579A] shrink-0" />
              )}
            </div>
          </motion.button>
        );
      })}
      {error && (
        <div className="mt-2 text-sm text-red-500 font-medium flex items-center gap-1 font-['Plus_Jakarta_Sans']">
          <WarningCircle size={16} /> Por favor selecciona una sucursal para continuar
        </div>
      )}
    </div>
  );
}