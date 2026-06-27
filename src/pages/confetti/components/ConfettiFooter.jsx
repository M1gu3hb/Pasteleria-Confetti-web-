import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, WhatsappLogo } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { entities } from "@/api/entitiesAdapter";

function waLink(telefono) {
  const digits = (telefono || "").replace(/\D/g, "");
  return digits ? `https://wa.me/52${digits}` : null;
}

export default function ConfettiFooter() {
  const { data: sucursales = [] } = useQuery({
    queryKey: ["sucursalesActivas"],
    queryFn: () =>
      entities.Sucursal.filter({ activa: true }, "orden_visual"),
  });

  const { data: config } = useQuery({
    queryKey: ["configuracionNegocio"],
    queryFn: async () => {
      const list = await entities.ConfiguracionNegocio.list();
      return list[0] || null;
    },
  });

  return (
    <footer className="bg-[#5C2D1E] text-white mt-20">
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Marca */}
        <div>
          <img
            src="https://ivqcxdpqxwjxfohiswqb.supabase.co/storage/v1/object/public/web-uploads/assets/2c2104ad3_1000135197.png"
            alt="Pastelería Confetti"
            className="h-24 w-24 object-contain rounded-full bg-white"
          />
          <p className="mt-4 font-['Dancing_Script'] font-semibold text-xl text-[#F5A0C8]">
            El sabor que hace memorable tu celebración
          </p>
          <p className="mt-3 text-sm font-['Plus_Jakarta_Sans'] text-white/70 leading-relaxed">
            Pastelería artesanal en CDMX. Especialidad: pastel de tres leches con relleno de fruta natural.
          </p>
        </div>

        {/* Sucursales */}
        <div>
          <h3 className="font-['Playfair_Display'] font-semibold text-lg mb-4">Sucursales</h3>
          <div className="space-y-4">
            {sucursales.map((s) => (
              <div key={s.id} className="text-sm font-['Plus_Jakarta_Sans']">
                <div className="font-semibold flex items-center gap-1.5">
                  <MapPin size={14} weight="fill" className="text-[#F5A0C8]" />
                  {s.nombre}
                </div>
                <div className="text-white/70 mt-0.5 ml-5">{s.direccion}</div>
                {s.telefono && (
                  <div className="flex items-center gap-3 mt-1 ml-5 text-white/80">
                    <span className="flex items-center gap-1">
                      <Phone size={13} /> {s.telefono}
                    </span>
                    <a
                      href={waLink(s.telefono)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[#F5A0C8] hover:text-white transition-colors"
                    >
                      <WhatsappLogo size={14} weight="fill" /> WhatsApp
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Links rápidos */}
        <div>
          <h3 className="font-['Playfair_Display'] font-semibold text-lg mb-4">Links rápidos</h3>
          <div className="flex flex-col gap-2 text-sm font-['Plus_Jakarta_Sans']">
            <Link to="/confetti" className="text-white/80 hover:text-[#F5A0C8] transition-colors">
              Inicio
            </Link>
            <Link to="/confetti/catalogo" className="text-white/80 hover:text-[#F5A0C8] transition-colors">
              Catálogo
            </Link>
            <Link to="/confetti/pedir" className="text-white/80 hover:text-[#F5A0C8] transition-colors">
              Pedir mi pastel
            </Link>
            <Link to="/confetti/productos" className="text-white/80 hover:text-[#F5A0C8] transition-colors">
              Pedir productos
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs font-['Plus_Jakarta_Sans'] text-white/60 px-6">
        Bodas · XV Años · Fiestas Infantiles · 1ª Comunión · Todo Tipo de Eventos
      </div>
    </footer>
  );
}