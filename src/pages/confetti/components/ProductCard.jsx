import React from "react";
import { motion } from "framer-motion";
import { Cake } from "@phosphor-icons/react";

export default function ProductCard({ producto, onPedir, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl overflow-hidden border border-[#F0DDD5] shadow-[0_4px_24px_rgba(92,45,30,0.08)] hover:shadow-[0_8px_40px_rgba(92,45,30,0.15)] transition-all duration-300"
    >
      <div className="aspect-square overflow-hidden bg-[#FFF8F4]">
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#FEF0E7] gap-2 p-3">
            <Cake size={40} weight="thin" className="text-[#E8579A]" />
            <span className="text-xs font-['Plus_Jakarta_Sans'] text-[#7C5C52] text-center">
              {producto.nombre}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <span className="text-xs font-['Plus_Jakarta_Sans'] font-medium text-[#E8579A] uppercase tracking-wide">
          {producto.categoria_nombre}
        </span>
        <h3 className="mt-1 font-['Playfair_Display'] font-semibold text-[#2C1A0E] text-base leading-tight">
          {producto.nombre}
        </h3>
        {producto.descripcion_web && (
          <p className="mt-1 text-sm font-['Plus_Jakarta_Sans'] text-[#7C5C52] leading-relaxed line-clamp-2">
            {producto.descripcion_web}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="font-['Playfair_Display'] font-semibold text-[#5C2D1E] text-lg">
            ${producto.precio_venta?.toLocaleString("es-MX")}
          </span>
          <button
            onClick={() => onPedir(producto)}
            className="text-xs font-['Plus_Jakarta_Sans'] font-semibold text-white bg-[#E8579A] px-3 py-1.5 rounded-full hover:bg-[#d44488] transition-colors"
          >
            Pedir
          </button>
        </div>
      </div>
    </motion.div>
  );
}