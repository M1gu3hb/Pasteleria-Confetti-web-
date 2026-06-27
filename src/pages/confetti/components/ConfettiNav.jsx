import React from "react";
import { Link, useLocation } from "react-router-dom";
import { WhatsappLogo, Cake } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { entities } from "@/api/entitiesAdapter";

const WHATSAPP_PRINCIPAL = "https://wa.me/525593502639";

const LINKS = [
  { label: "Inicio", to: "/confetti" },
  { label: "Catálogo", to: "/confetti/catalogo" },
  { label: "Productos", to: "/confetti/productos" },
];

export default function ConfettiNav() {
  const location = useLocation();

  const { data: config } = useQuery({
    queryKey: ["configuracionNegocio"],
    queryFn: async () => {
      const list = await entities.ConfiguracionNegocio.list();
      return list[0] || null;
    },
  });

  const logoUrl = "https://ivqcxdpqxwjxfohiswqb.supabase.co/storage/v1/object/public/web-uploads/assets/2c2104ad3_1000135197.png";

  return (
    <>
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl">
        <div className="bg-white/90 backdrop-blur-xl border border-[#F0DDD5] rounded-full shadow-[0_4px_24px_rgba(92,45,30,0.12)] px-4 py-2 flex items-center justify-between gap-3">
          <Link to="/confetti" className="flex items-center gap-2 shrink-0">
            <img src={logoUrl} alt="Pastelería Confetti" className="h-11 w-auto object-contain" />
          </Link>

          {/* Links — visibles en todos los tamaños */}
          <div className="flex items-center gap-1 sm:gap-2">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-2 sm:px-3 py-2 rounded-full text-xs sm:text-sm font-['Plus_Jakarta_Sans'] font-medium transition-colors whitespace-nowrap ${
                    location.pathname === l.to
                    ? "text-[#E8579A] bg-[#FDEEF6]"
                    : "text-[#5C2D1E] hover:text-[#E8579A]"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <a
              href={WHATSAPP_PRINCIPAL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-[#FEF0E7] text-[#5C2D1E] flex items-center justify-center hover:bg-[#E8579A] hover:text-white transition-colors"
              aria-label="WhatsApp"
            >
              <WhatsappLogo size={20} weight="fill" />
            </a>
            <Link
              to="/confetti/pedir"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8579A] text-white font-['Plus_Jakarta_Sans'] font-semibold text-sm rounded-full hover:bg-[#d44488] transition-colors"
            >
              <Cake size={16} weight="fill" />
              Pedir mi pastel
            </Link>
          </div>

          {/* CTA Pedir — móvil (solo ícono) */}
          <Link
            to="/confetti/pedir"
            aria-label="Pedir mi pastel"
            className="md:hidden inline-flex items-center justify-center w-9 h-9 bg-[#E8579A] text-white rounded-full hover:bg-[#d44488] transition-colors shrink-0"
          >
            <Cake size={16} weight="fill" />
          </Link>
        </div>
      </nav>
    </>
  );
}