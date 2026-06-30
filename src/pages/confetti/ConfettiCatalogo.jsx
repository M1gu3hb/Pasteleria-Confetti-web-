import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Cake, WhatsappLogo, ArrowRight } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { entities } from "@/api/entitiesAdapter";
import ConfettiReveal from "./components/ConfettiReveal";
import ProductCard from "./components/ProductCard";

const WHATSAPP_PRINCIPAL = "https://wa.me/525593502639";

export default function ConfettiCatalogo() {
  const navigate = useNavigate();

  // Catálogo PLANO (CAMBIOS_V2 Fase 05): la vitrina muestra TODOS los productos
  // seguidos, sin filtros ni encabezados por categoría. Las categorías solo se
  // usan al hacer un pedido de catálogo (ProductoSearch), no aquí.
  const { data: productos = [], isLoading } = useQuery({
    queryKey: ["productosWeb"],
    queryFn: () =>
      entities.ProductoTerminado.filter(
        { visible_en_web: true, activo: true },
        "categoria_nombre",
        100
      ),
  });

  const handlePedir = (producto) => {
    navigate(`/confetti/productos?producto=${producto.id}`);
  };

  return (
    <div className="pb-24">
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <ConfettiReveal>
          <h1 className="font-['Playfair_Display'] text-3xl md:text-4xl font-semibold text-[#2C1A0E] text-center">
            Nuestros Productos
          </h1>
          <p className="mt-3 text-center font-['Plus_Jakarta_Sans'] text-[#7C5C52]">
            Selecciona lo que quieres para tu celebración
          </p>
        </ConfettiReveal>

        {/* Grid de productos (plano, sin filtros por categoría) */}
        {isLoading ? (
          <div className="mt-10 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-[#F0DDD5] overflow-hidden animate-pulse"
                >
                  <div className="aspect-square bg-[#FEF0E7]" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-[#FEF0E7] rounded w-1/3" />
                    <div className="h-4 bg-[#FEF0E7] rounded w-2/3" />
                    <div className="h-4 bg-[#FEF0E7] rounded w-1/4" />
                  </div>
                </div>
              ))}
          </div>
        ) : productos.length === 0 ? (
          <div className="mt-16 text-center max-w-md mx-auto">
            <Cake size={64} weight="thin" className="text-[#E8579A] mx-auto" />
            <h2 className="mt-4 font-['Playfair_Display'] text-2xl font-semibold text-[#2C1A0E]">
              Catálogo en preparación
            </h2>
            <p className="mt-2 font-['Plus_Jakarta_Sans'] text-[#7C5C52]">
              Pronto estarán disponibles nuestros productos. Mientras tanto, contáctanos para saber
              qué tenemos disponible.
            </p>
            <a
              href={WHATSAPP_PRINCIPAL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3.5 bg-[#E8579A] text-white font-['Plus_Jakarta_Sans'] font-semibold rounded-2xl hover:bg-[#d44488] transition-colors"
            >
              <WhatsappLogo size={20} weight="fill" /> WhatsApp
            </a>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {productos.map((producto, index) => (
              <ProductCard key={producto.id} producto={producto} index={index} onPedir={handlePedir} />
            ))}
          </div>
        )}

        {/* Banner CTA (desktop) */}
        <ConfettiReveal className="hidden md:block mt-16">
          <div className="bg-[#FEF0E7] rounded-2xl p-8 flex items-center justify-between gap-6">
            <div>
              <h3 className="font-['Playfair_Display'] text-2xl font-semibold text-[#2C1A0E]">
                ¿No encuentras lo que buscas?
              </h3>
              <p className="mt-1 font-['Plus_Jakarta_Sans'] text-[#7C5C52]">
                Diseñamos tu pastel personalizado →
              </p>
            </div>
            <Link
              to="/confetti/pedir"
              className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#E8579A] text-white font-['Plus_Jakarta_Sans'] font-semibold rounded-2xl hover:bg-[#d44488] transition-colors shrink-0"
            >
              Armar mi pastel
              <ArrowRight size={16} weight="bold" />
            </Link>
          </div>
        </ConfettiReveal>
      </div>

      {/* Barra fija inferior (mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#F0DDD5] px-4 py-3 flex items-center justify-between gap-3">
        <span className="text-xs font-['Plus_Jakarta_Sans'] text-[#7C5C52] leading-tight">
          ¿No encuentras lo que buscas?
        </span>
        <Link
          to="/confetti/pedir"
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-[#E8579A] text-white font-['Plus_Jakarta_Sans'] font-semibold text-sm rounded-xl"
        >
          Armar mi pastel <ArrowRight size={14} weight="bold" />
        </Link>
      </div>
    </div>
  );
}