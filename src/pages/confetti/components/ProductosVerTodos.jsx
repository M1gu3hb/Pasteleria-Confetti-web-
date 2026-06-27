import React, { useMemo } from "react";
import { Cake } from "@phosphor-icons/react";

export default function ProductosVerTodos({
  productos,
  cantidades,
  onIncrementar,
  onDecrementar,
  totalAprox,
  categorias = [],
}) {
  // Agrupar por categoría, ordenando por el campo "orden" de CategoriaProducto.
  // Categorías sin coincidencia activa van a "Otros" al final.
  const grupos = useMemo(() => {
    const norm = (s) => (s || "").trim().toLowerCase();
    const ordenPorNombre = new Map(
      categorias.map((c) => [norm(c.nombre), c.orden ?? 999])
    );

    const mapa = new Map();
    productos.forEach((p) => {
      const nombre = (p.categoria_nombre || "").trim();
      const cat = nombre && ordenPorNombre.has(norm(nombre)) ? nombre : "Otros";
      if (!mapa.has(cat)) mapa.set(cat, []);
      mapa.get(cat).push(p);
    });

    return Array.from(mapa.entries()).sort(([a], [b]) => {
      const oa = a === "Otros" ? Infinity : ordenPorNombre.get(norm(a)) ?? 999;
      const ob = b === "Otros" ? Infinity : ordenPorNombre.get(norm(b)) ?? 999;
      return oa - ob;
    });
  }, [productos, categorias]);

  const hayAlguno = productos.some((p) => (cantidades[p.id] || 0) > 0);

  return (
    <div className="space-y-6">
      {grupos.map(([categoria, items]) => (
        <div key={categoria}>
          <h3 className="mb-2.5 text-sm font-['Plus_Jakarta_Sans'] font-bold uppercase tracking-wide text-[#E8579A]">
            {categoria}
          </h3>
          <div className="bg-white rounded-2xl border border-[#F0DDD5] px-4">
            {items.map((producto) => {
              const cant = cantidades[producto.id] || 0;
              return (
                <div
                  key={producto.id}
                  className={`flex items-center gap-3 py-3 border-b border-[#F0DDD5] last:border-b-0 -mx-4 px-4 rounded-lg ${
                    cant > 0 ? "bg-[#FDEEF6] border-l-2 border-l-[#E8579A]" : ""
                  }`}
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
                      {cant}
                    </span>
                    <button
                      type="button"
                      onClick={() => onIncrementar(producto.id)}
                      className="w-8 h-8 rounded-full bg-[#FEF0E7] text-[#5C2D1E] font-bold flex items-center justify-center hover:bg-[#E8579A] hover:text-white transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {hayAlguno && (
        <div className="flex justify-end font-['Plus_Jakarta_Sans'] text-sm text-[#2C1A0E]">
          Total aprox:{" "}
          <span className="ml-1.5 font-['Playfair_Display'] font-semibold text-[#5C2D1E]">
            ${totalAprox.toLocaleString("es-MX")}
          </span>
        </div>
      )}
    </div>
  );
}