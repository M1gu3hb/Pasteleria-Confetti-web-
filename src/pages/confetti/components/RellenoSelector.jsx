import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CaretRight, Check, X } from "@phosphor-icons/react";

export default function RellenoSelector({ value, onChange, rellenos = [], precioKiloGlobal = 0 }) {
  const [abierto, setAbierto] = useState(false);

  const seleccionar = (nombre, precioKilo) => {
    onChange(nombre, precioKilo);
    setAbierto(false);
  };

  return (
    <div>
      {/* Barra */}
      <button
        type="button"
        onClick={() => setAbierto((a) => !a)}
        className={`w-full flex items-center justify-between px-4 py-3 border-2 rounded-xl font-['Plus_Jakarta_Sans'] cursor-pointer hover:border-[#E8579A] transition-colors ${
          value
            ? "bg-[#FDEEF6] border-[#E8579A] text-[#2C1A0E]"
            : "bg-white border-[#F0DDD5] text-[#7C5C52]"
        }`}
      >
        <span className="flex items-center gap-2">
          {value ? (
            <>
              <Check size={18} weight="bold" className="text-[#E8579A]" /> {value}
            </>
          ) : (
            "Elige tu relleno"
          )}
        </span>
        <CaretRight
          size={18}
          weight="bold"
          className={`text-[#C4A89A] transition-transform ${abierto ? "rotate-90" : ""}`}
        />
      </button>

      {/* Panel */}
      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-4 bg-white border-2 border-[#F0DDD5] rounded-xl">
              {rellenos.length === 0 ? (
                <p className="text-sm font-['Plus_Jakarta_Sans'] text-[#7C5C52]">
                  Cuéntanos en las notas qué relleno prefieres y te confirmamos por WhatsApp.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {rellenos.map((r) => {
                    const activo = value === r.nombre;
                    const precioKilo = Number(r.precio_kilo) || 0;
                    return (
                      <button
                        key={r.id || r.nombre}
                        type="button"
                        onClick={() => {
                          if (activo) {
                            onChange("", 0);
                            setAbierto(false);
                          } else {
                            seleccionar(r.nombre, precioKilo);
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-['Plus_Jakarta_Sans'] font-medium border transition-colors text-left ${
                          activo
                            ? "bg-[#E8579A] text-white border-[#E8579A]"
                            : "bg-white border-[#F0DDD5] text-[#7C5C52] hover:border-[#E8579A]"
                        }`}
                      >
                        {r.nombre}
                        {precioKilo > 0 && (
                          <span className={`text-xs ${activo ? "text-white/80" : "text-[#C4A89A]"}`}>
                            ${precioKilo.toLocaleString("es-MX")}/kg
                          </span>
                        )}
                        {activo && <X size={14} weight="bold" className="text-white/90" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}