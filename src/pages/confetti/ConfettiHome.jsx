import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  WhatsappLogo,
  Cake,
  Star,
  ArrowRight,
  NotePencil,
  CheckCircle,
  Sparkle,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import ConfettiParticles from "./components/ConfettiParticles";
import ConfettiReveal from "./components/ConfettiReveal";
import PasosEmojis from "./components/PasosEmojis";
import { CONFETTI_IMAGES } from "./components/confettiImages";

const WHATSAPP_FALLBACK = "5593502639"; // Xochimilco — fallback visual

function waLink(telefono) {
  const digits = (telefono || "").replace(/\D/g, "") || WHATSAPP_FALLBACK;
  return `https://wa.me/52${digits}`;
}

// Nombre visual: ocultar "/ Principal" sin tocar el dato real
function nombreVisual(nombre) {
  return (nombre || "").split("/")[0].trim();
}

const ESPECIALIDADES = [
  {
    key: "quinceanera",
    titulo: "Pastel de XV Años",
    descripcion:
      "Diseños únicos y personalizados para el día más especial. Desde clásico hasta temático.",
    imagen: CONFETTI_IMAGES.quinceanera_cake,
    badge: "Lo más pedido 🌟",
    full: true,
  },
  {
    key: "bodas",
    titulo: "Pasteles de Boda",
    descripcion: "Elegancia y sabor para el inicio de su historia juntos.",
    imagen: CONFETTI_IMAGES.wedding_cake,
  },
  {
    key: "infantiles",
    titulo: "Fiestas Infantiles",
    descripcion: "Colores, personajes y diversión para los más pequeños.",
    imagen: CONFETTI_IMAGES.birthday_cake_kids,
  },
  {
    key: "tresleches",
    titulo: "Tres Leches con Fruta",
    descripcion: "Nuestra especialidad de la casa: el famoso Paste Confetti.",
    imagen: CONFETTI_IMAGES.tres_leches_specialty,
    especial: true,
  },
];

const PASOS = [
  { icono: MapPin, titulo: "Elige sucursal", desc: "La más cercana a tu evento" },
  { icono: Cake, titulo: "Elige tu pastel", desc: "Catálogo o diseño personalizado" },
  { icono: NotePencil, titulo: "Envía tu pedido", desc: "Desde aquí, rápido y fácil" },
  { icono: CheckCircle, titulo: "Confirmamos", desc: "Te contactamos por WhatsApp" },
  { icono: Sparkle, titulo: "¡A celebrar!", desc: "Recoge en sucursal o coordinamos" },
];

export default function ConfettiHome() {
  const { data: sucursales = [] } = useQuery({
    queryKey: ["sucursalesActivas"],
    queryFn: () =>
      base44.entities.Sucursal.filter({ activa: true }, "orden_visual"),
  });

  const { data: config } = useQuery({
    queryKey: ["confConfig"],
    queryFn: async () => {
      const list = await base44.entities.ConfiguracionNegocio.list();
      return list[0] || null;
    },
  });

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="relative min-h-[100dvh] md:min-h-[92vh] overflow-hidden flex items-center justify-center">
        <ConfettiParticles active className="z-10" />

        {/* Imagen de fondo */}
        <motion.img
          src="https://media.base44.com/images/public/6a2afcaf5df5e3322f4da64e/928615b6c_generated_image.png"
          alt="Pastelería Confetti — pasteles artesanales"
          className="absolute inset-0 w-full h-full object-cover object-center"
          initial={{ scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.0, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Overlay gradiente cálido */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C1A0E]/90 via-[#2C1A0E]/55 to-[#2C1A0E]/15" />

        {/* Contenido */}
        <div className="relative z-20 text-center px-6 md:px-12 pt-16 md:pt-20 pb-16 max-w-4xl mx-auto">
          <motion.img
            src="https://media.base44.com/images/public/6a2afcaf5df5e3322f4da64e/2c2104ad3_1000135197.png"
            alt="Pastelería Confetti"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="h-40 md:h-56 object-contain mx-auto mb-3 drop-shadow-lg"
          />
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block text-[#F5A0C8] text-xs md:text-sm font-['Plus_Jakarta_Sans'] font-semibold tracking-[0.2em] uppercase mb-6"
          >
            ARTESANAL · CDMX · DESDE LOS SABORES QUE MÁS QUIERES
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            aria-label="El arte de endulzar la vida"
            className="cake-title font-['Playfair_Display'] font-bold text-5xl md:text-7xl leading-[1.15] tracking-tight mb-6 px-2"
          >
            El arte de endulzar<br /> la vida
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-white/80 font-['Plus_Jakarta_Sans'] text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-10"
          >
            Pasteles personalizados para bodas, XV años, fiestas infantiles y todo tipo de
            celebraciones. Especialidad: tres leches con fruta natural.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
          >
            <Link to="/confetti/pedir">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="cta-glow-primary inline-flex items-center gap-3 px-8 py-4 bg-[#E8579A] text-white font-['Plus_Jakarta_Sans'] font-semibold text-base rounded-2xl hover:bg-[#d44488] transition-colors duration-200"
              >
                Pedir mi pastel
                <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <ArrowRight size={14} weight="bold" />
                </span>
              </motion.button>
            </Link>

            <Link to="/confetti/catalogo">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="cta-glow-secondary inline-flex items-center gap-2 px-8 py-4 bg-white/15 backdrop-blur-sm text-white border-2 border-white/40 font-['Plus_Jakarta_Sans'] font-semibold text-base rounded-2xl hover:bg-white/25 transition-all duration-200"
              >
                Ver catálogo
              </motion.button>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.0 }}
            className="text-white/60 font-['Plus_Jakarta_Sans'] text-sm"
          >
            🎂 +500 pasteles entregados · 3 sucursales en CDMX · 15 años de experiencia
          </motion.p>
        </div>
      </section>

      {/* ============ ESPECIALIDADES (Magazine Cover) ============ */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">

          <ConfettiReveal>
            <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-semibold text-[#2C1A0E] text-center">
              Hecho con amor para cada celebración
            </h2>
            <p className="mt-3 text-center font-['Plus_Jakarta_Sans'] text-[#7C5C52]">
              Más de 15 años endulzando los momentos que más importan
            </p>
          </ConfettiReveal>

          <div className="mt-12 space-y-4">

            {/* FILA 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* XV Años — 2/3 ancho */}
              <ConfettiReveal className="md:col-span-2">
                <Link to="/confetti/pedir">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.3 }}
                    className="relative h-72 md:h-96 rounded-2xl overflow-hidden cursor-pointer group"
                  >
                    <img
                      src={CONFETTI_IMAGES.quinceanera_cake}
                      alt="Pastel de XV Años"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2C1A0E]/80 via-[#2C1A0E]/20 to-transparent" />
                    <span className="absolute top-4 left-4 bg-white/95 text-[#E8579A] text-xs font-['Plus_Jakarta_Sans'] font-bold px-3 py-1.5 rounded-full">
                      Lo más pedido 🌟
                    </span>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold text-white">
                        Pastel de XV Años
                      </h3>
                      <p className="mt-1 font-['Plus_Jakarta_Sans'] text-sm text-white/80">
                        Diseños únicos y personalizados para el día más especial
                      </p>
                      <span className="inline-flex items-center gap-1.5 mt-3 text-white/90 text-sm font-semibold group-hover:gap-2.5 transition-all">
                        Diseñar mi pastel <ArrowRight size={14} weight="bold" />
                      </span>
                    </div>
                  </motion.div>
                </Link>
              </ConfettiReveal>

              {/* Tres Leches — 1/3 ancho */}
              <ConfettiReveal delay={0.1}>
                <Link to="/confetti/pedir">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.3 }}
                    className="relative h-72 md:h-96 rounded-2xl overflow-hidden cursor-pointer group"
                  >
                    <img
                      src={CONFETTI_IMAGES.tres_leches_specialty}
                      alt="El Paste Confetti — Tres Leches"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#5C2D1E]/85 via-[#5C2D1E]/20 to-transparent" />
                    <span className="absolute top-4 left-4 bg-[#E8579A] text-white text-xs font-['Plus_Jakarta_Sans'] font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                      <Star size={11} weight="fill" /> Especialidad
                    </span>
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <p className="font-['Dancing_Script'] font-bold text-lg text-[#F5A0C8]">
                        Tres leches con fruta natural
                      </p>
                      <h3 className="font-['Playfair_Display'] text-xl font-bold text-white mt-0.5">
                        El Paste Confetti
                      </h3>
                      <p className="mt-1 font-['Plus_Jakarta_Sans'] text-xs text-white/75">
                        Nuestra creación más querida
                      </p>
                      <span className="inline-flex items-center gap-1.5 mt-3 text-white/90 text-sm font-semibold group-hover:gap-2.5 transition-all">
                        Quiero este pastel <ArrowRight size={14} weight="bold" />
                      </span>
                    </div>
                  </motion.div>
                </Link>
              </ConfettiReveal>
            </div>

            {/* FILA 2 — Bodas e Infantiles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  titulo: "Pasteles de Boda",
                  descripcion: "Elegancia y sabor para el inicio de su historia juntos",
                  imagen: CONFETTI_IMAGES.wedding_cake,
                  overlay: "from-[#2C1A0E]/75 via-[#2C1A0E]/15 to-transparent",
                },
                {
                  titulo: "Pastel con imagen personalizada",
                  descripcion: "Diseños impresos o dibujados sobre el pastel: personajes, princesas, fotos o ideas especiales",
                  imagen: CONFETTI_IMAGES.pastel_imagen_personalizada,
                  overlay: "from-[#5C2D1E]/75 via-[#5C2D1E]/15 to-transparent",
                },
              ].map((card, i) => (
                <ConfettiReveal key={card.titulo} delay={i * 0.1}>
                  <Link to="/confetti/pedir">
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.3 }}
                      className="relative h-56 md:h-64 rounded-2xl overflow-hidden cursor-pointer group"
                    >
                      <img
                        src={card.imagen}
                        alt={card.titulo}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${card.overlay}`} />
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="font-['Playfair_Display'] text-xl font-bold text-white">
                          {card.titulo}
                        </h3>
                        <p className="mt-0.5 font-['Plus_Jakarta_Sans'] text-sm text-white/75">
                          {card.descripcion}
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                </ConfettiReveal>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ============ CÓMO PEDIR ============ */}
      <section className="relative bg-white py-16 md:py-24 overflow-hidden">
        <PasosEmojis />
        <div className="relative max-w-6xl mx-auto px-6">
          <ConfettiReveal>
            <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-semibold text-[#2C1A0E] text-center">
              Tu pastel en 5 pasos
            </h2>
          </ConfettiReveal>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-4 relative">
            {/* Línea punteada (desktop) */}
            <div className="hidden md:block absolute top-7 left-[10%] right-[10%] border-t-2 border-dashed border-[#F0DDD5]" />
            {PASOS.map((paso, i) => {
              const Icono = paso.icono;
              return (
                <ConfettiReveal key={paso.titulo} delay={i * 0.1} className="relative">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-full bg-[#E8579A] text-white flex items-center justify-center font-['Plus_Jakarta_Sans'] font-bold text-lg relative z-10">
                      {i + 1}
                    </div>
                    <Icono size={24} className="mt-3 text-[#5C2D1E]" />
                    <h3 className="mt-2 font-['Plus_Jakarta_Sans'] font-semibold text-[#2C1A0E]">
                      {paso.titulo}
                    </h3>
                    <p className="mt-1 text-sm font-['Plus_Jakarta_Sans'] text-[#7C5C52]">
                      {paso.desc}
                    </p>
                  </div>
                </ConfettiReveal>
              );
            })}
          </div>
          <ConfettiReveal delay={0.3} className="mt-12 text-center">
            <Link to="/confetti/pedir">
              <motion.span
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#E8579A] text-white font-['Plus_Jakarta_Sans'] font-semibold text-lg rounded-2xl hover:bg-[#d44488] transition-colors duration-200"
              >
                ¡Empieza tu pedido ahora!
                <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <ArrowRight size={16} weight="bold" />
                </span>
              </motion.span>
            </Link>
          </ConfettiReveal>
        </div>
      </section>

      {/* ============ SUCURSALES ============ */}
      <section className="bg-[#FFF8F4] py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <ConfettiReveal>
            <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-semibold text-[#2C1A0E] text-center">
              Encuéntranos
            </h2>
          </ConfettiReveal>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {sucursales.map((s, i) => (
              <ConfettiReveal key={s.id} delay={i * 0.1}>
                <div className="bg-white rounded-2xl border border-[#F0DDD5] p-6 shadow-[0_4px_24px_rgba(92,45,30,0.08)] hover:shadow-[0_8px_40px_rgba(92,45,30,0.15)] transition-shadow duration-300 h-full flex flex-col">
                  <div className="flex items-center gap-2">
                    <MapPin size={22} weight="fill" className="text-[#E8579A]" />
                    <h3 className="font-['Playfair_Display'] font-semibold text-lg text-[#2C1A0E]">
                      {nombreVisual(s.nombre)}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm font-['Plus_Jakarta_Sans'] text-[#7C5C52] leading-relaxed flex-1">
                    {s.direccion}
                  </p>
                  {s.telefono && (
                    <p className="mt-3 text-sm font-['Plus_Jakarta_Sans'] text-[#5C2D1E] flex items-center gap-1.5 font-medium">
                      <Phone size={16} /> {s.telefono}
                    </p>
                  )}
                  <a
                    href={waLink(s.telefono)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FEF0E7] text-[#5C2D1E] font-['Plus_Jakarta_Sans'] font-semibold text-sm rounded-xl hover:bg-[#E8579A] hover:text-white transition-colors"
                  >
                    <WhatsappLogo size={18} weight="fill" /> WhatsApp
                  </a>
                </div>
              </ConfettiReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}