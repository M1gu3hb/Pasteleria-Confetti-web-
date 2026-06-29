import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CaretRight, Check } from "@phosphor-icons/react";

export default function RellenoSelector({ value, onChange, rellenos = [], precioKiloGlobal = 0 }) {
  const [abierto, setAbierto] = useState(false);

  const seleccionar = (nombre, precio) => {
    onChange(nombre, precio);
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
            <div className="mt-3 p-4 bg-white border-2 border-[#F0DDD5] rounded-2xl">
              {rellenos.length === 0 ? (
                <p className="text-sm font-['Plus_Jakarta_Sans'] text-[#7C5C52]">
                  Cuéntanos en las notas qué relleno prefieres y te confirmamos por WhatsApp.
                </p>
              ) : (
                <>
                  {/* Opciones: grid aireado, full-width, fácil de tocar en móvil */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {rellenos.map((r) => {
                      const activo = value === r.nombre;
                      const precio = Number(r.precio_kilo) || 0; // valor configurado = monto plano que se SUMA
                      return (
                        <button
                          key={r.id || r.nombre}
                          type="button"
                          onClick={() => (activo ? seleccionar("", 0) : seleccionar(r.nombre, precio))}
                          aria-pressed={activo}
                          className={`group flex items-center justify-between gap-3 w-full px-4 py-3 min-h-[52px] rounded-xl border-2 text-left font-['Plus_Jakarta_Sans'] transition-colors ${
                            activo
                              ? "bg-[#E8579A] border-[#E8579A] text-white"
                              : "bg-white border-[#F0DDD5] text-[#2C1A0E] hover:border-[#E8579A] hover:bg-[#FDEEF6]/40"
                          }`}
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <span
                              className={`shrink-0 flex items-center justify-center w-5 h-5 rounded-full border-2 ${
                                activo ? "border-white bg-white/20" : "border-[#E8B9D2]"
                              }`}
                            >
                              {activo && <Check size={12} weight="bold" className="text-white" />}
                            </span>
                            <span className="text-sm font-medium leading-snug break-words">{r.nombre}</span>
                          </span>
                          {precio > 0 && (
                            <span
                              className={`shrink-0 text-xs font-bold px-2 py-1 rounded-full ${
                                activo ? "bg-white/20 text-white" : "bg-[#FDEEF6] text-[#E8579A]"
                              }`}
                            >
                              +${precio.toLocaleString("es-MX")}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-xs font-['Plus_Jakarta_Sans'] text-[#7C5C52]">
                    Toca de nuevo el relleno elegido para quitarlo. Los rellenos con precio se suman al total.
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
