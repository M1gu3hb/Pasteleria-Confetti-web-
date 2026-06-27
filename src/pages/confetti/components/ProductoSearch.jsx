import React, { useState, useRef, useEffect, useMemo } from "react";
import { MagnifyingGlass, Cake, X } from "@phosphor-icons/react";
import { Link } from "react-router-dom";

const normalizar = (str) =>
  (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export default function ProductoSearch({
  productos,
  cantidades,
  onIncrementar,
  onDecrementar,
  onAgregar,
  onEliminar,
  totalAprox,
}) {
  const [busqueda, setBusqueda] = useState("");
  const [abierto, setAbierto] = useState(false);
  const containerRef = useRef(null);

  // Click outside cierra el dropdown
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const resultados = useMemo(() => {
    if (busqueda.trim().length < 1) return [];
    const q = normalizar(busqueda);
    return productos.filter(
      (p) =>
        normalizar(p.nombre).includes(q) || normalizar(p.categoria_nombre).includes(q)
    );
  }, [busqueda, productos]);

  const seleccionados = productos.filter((p) => (cantidades[p.id] || 0) > 0);

  const handleAgregar = (producto) => {
    onAgregar(producto.id);
    setBusqueda("");
    setAbierto(false);
  };

  return (
    <div className="space-y-4">
      {/* Buscador */}
      <div className="relative" ref={containerRef}>
        <MagnifyingGlass
          size={20}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C4A89A]"
        />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setAbierto(true);
          }}
          onFocus={() => setAbierto(true)}
          placeholder="Busca un producto (ej: rebanada, gelatina, pay...)"
          className="w-full pl-11 pr-4 py-3 text-base font-['Plus_Jakarta_Sans'] text-[#2C1A0E] bg-white border-2 border-[#F0DDD5] rounded-xl focus:outline-none focus:border-[#E8579A] focus:ring-2 focus:ring-[#E8579A]/20 placeholder:text-[#C4A89A] transition-colors duration-200"
        />

        {/* Dropdown */}
        {abierto && busqueda.trim().length >= 1 && (
          <div className="absolute z-30 mt-2 w-full bg-white rounded-xl border border-[#F0DDD5] shadow-[0_8px_40px_rgba(92,45,30,0.15)] max-h-72 overflow-y-auto">
            {resultados.length === 0 ? (
              <div className="p-4 text-sm font-['Plus_Jakarta_Sans'] text-[#7C5C52]">
                No encontramos ese producto.{" "}
                <Link to="/confetti/pedir" className="text-[#E8579A] font-semibold hover:underline">
                  ¿Quieres pedir un pastel personalizado?
                </Link>
              </div>
            ) : (
              resultados.map((producto) => (
                <button
                  key={producto.id}
                  type="button"
                  onClick={() => handleAgregar(producto)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-[#FEF0E7] transition-colors border-b border-[#F0DDD5] last:border-b-0"
                >
                  {producto.imagen_url ? (
                    <img
                      src={producto.imagen_url}
                      alt={producto.nombre}
                      className="w-11 h-11 rounded-lg object-cover bg-[#FFF8F4] shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-[#FEF0E7] flex items-center justify-center shrink-0">
                      <Cake size={20} weight="thin" className="text-[#E8579A]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-['Plus_Jakarta_Sans'] font-medium text-[#2C1A0E] text-sm truncate">
                      {producto.nombre}
                    </div>
                    {producto.categoria_nombre && (
                      <div className="text-xs text-[#C4A89A] truncate">
                        {producto.categoria_nombre}
                      </div>
                    )}
                  </div>
                  <div className="font-['Playfair_Display'] text-[#E8579A] font-semibold text-sm shrink-0">
                    ${producto.precio_venta?.toLocaleString("es-MX")}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Productos seleccionados */}
      {seleccionados.length > 0 ? (
        <div className="bg-white rounded-2xl border border-[#F0DDD5] px-4">
          {seleccionados.map((producto) => (
            <div
              key={producto.id}
              className="flex items-center gap-3 py-3 border-b border-[#F0DDD5] last:border-b-0"
            >
              <div className="flex-1 min-w-0">
                <div className="font-['Plus_Jakarta_Sans'] font-medium text-[#2C1A0E] text-sm truncate">
                  {producto.nombre}
                </div>
                <div className="font-['Playfair_Display'] text-[#E8579A] font-semibold text-sm">
                  ${producto.precio_venta?.toLocaleString("es-MX")}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onDecrementar(producto.id)}
                  className="w-8 h-8 rounded-full bg-[#FEF0E7] text-[#5C2D1E] font-bold flex items-center justify-center hover:bg-[#E8579A] hover:text-white transition-colors"
                >
                  –
                </button>
                <span className="w-8 text-center font-['Plus_Jakarta_Sans'] font-semibold text-[#2C1A0E]">
                  {cantidades[producto.id] || 0}
                </span>
                <button
                  type="button"
                  onClick={() => onIncrementar(producto.id)}
                  className="w-8 h-8 rounded-full bg-[#FEF0E7] text-[#5C2D1E] font-bold flex items-center justify-center hover:bg-[#E8579A] hover:text-white transition-colors"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => onEliminar(producto.id)}
                  className="w-8 h-8 rounded-full text-[#C4A89A] hover:text-red-500 flex items-center justify-center transition-colors"
                  aria-label="Eliminar"
                >
                  <X size={16} weight="bold" />
                </button>
              </div>
            </div>
          ))}
          <div className="py-3 flex justify-end font-['Plus_Jakarta_Sans'] text-sm text-[#2C1A0E]">
            Total aprox:{" "}
            <span className="ml-1.5 font-['Playfair_Display'] font-semibold text-[#5C2D1E]">
              ${totalAprox.toLocaleString("es-MX")}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-sm font-['Plus_Jakarta_Sans'] text-[#7C5C52] text-center py-4">
          Busca y agrega los productos que quieres pedir.
        </p>
      )}
    </div>
  );
}