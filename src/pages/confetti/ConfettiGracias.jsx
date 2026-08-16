import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, WhatsappLogo } from "@phosphor-icons/react";
import ConfettiParticles from "./components/ConfettiParticles";

const WHATSAPP_PRINCIPAL = "525593502639";

export default function ConfettiGracias() {
  const urlParams = new URLSearchParams(window.location.search);
  const folio = urlParams.get("folio") || "";
  const sucursal = urlParams.get("sucursal") || "";
  const fecha = urlParams.get("fecha") || "";
  const waParam = (urlParams.get("wa") || "").replace(/\D/g, "");
  // La foto de referencia no se pudo subir. El pedido SÍ entró: sólo hay que
  // pedirle la imagen por WhatsApp. Se le dice claro para que no se quede con
  // la duda de si su pastel va a salir sin la referencia que eligió.
  const sinFoto = urlParams.get("sinfoto") === "1";

  const [confettiActivo, setConfettiActivo] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setConfettiActivo(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Número de la sucursal si viene; si no, el principal
  const waNumero = waParam
    ? waParam.startsWith("52")
      ? waParam
      : `52${waParam}`
    : WHATSAPP_PRINCIPAL;

  const mensajeWa = encodeURIComponent(
    `Hola, confirmo mi pedido ${folio} de Pastelería Confetti. ¿Me pueden confirmar disponibilidad y detalles?`
  );

  return (
    <div className="relative min-h-[70vh] flex items-center justify-center px-4 py-12">
      <ConfettiParticles active={confettiActivo} />
      <div className="relative z-10 w-full max-w-md text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-[#E8579A] flex items-center justify-center mx-auto"
        >
          <CheckCircle size={40} weight="fill" className="text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 font-['Playfair_Display'] text-3xl font-bold text-[#2C1A0E]"
        >
          ¡Tu pedido fue enviado! 🎉
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-3 font-['Plus_Jakarta_Sans'] text-[#7C5C52]"
        >
          📱 Tu pedido fue enviado. Para confirmarlo, escríbenos por WhatsApp con tu folio.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mt-3 inline-block bg-[#FDEEF6] text-[#5C2D1E] text-sm font-['Plus_Jakarta_Sans'] px-4 py-2 rounded-full"
        >
          👇 Toca el botón verde para confirmar tu pedido <strong>{folio}</strong>.
        </motion.p>

        {sinFoto && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.58 }}
            className="mt-4 mx-auto max-w-md rounded-2xl border-2 border-[#E8579A] bg-[#FFF1F6] px-4 py-3 text-left"
          >
            <p className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#C22C6E]">
              📷 Tu foto de referencia no se pudo subir
            </p>
            <p className="mt-1 font-['Plus_Jakarta_Sans'] text-sm text-[#5C2D1E]">
              Tu pedido <strong>sí quedó registrado</strong>, no lo vuelvas a
              enviar. Sólo mándanos la foto por WhatsApp junto con tu folio y
              listo.
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-white rounded-2xl border border-[#F0DDD5] shadow-[0_4px_24px_rgba(92,45,30,0.08)] overflow-hidden text-left"
        >
          <div className="p-6 text-center">
            <p className="text-sm font-['Plus_Jakarta_Sans'] text-[#7C5C52]">Número de folio</p>
            <p className="mt-1 font-mono font-bold text-2xl tracking-widest text-[#5C2D1E]">
              {folio || "—"}
            </p>
            <p className="mt-1 text-xs font-['Plus_Jakarta_Sans'] text-[#C4A89A]">
              (guárdalo para referencia)
            </p>
          </div>
          <div className="border-t border-[#F0DDD5] p-4 space-y-1.5 text-sm font-['Plus_Jakarta_Sans']">
            {sucursal && (
              <div className="flex justify-between">
                <span className="text-[#7C5C52]">Sucursal</span>
                <span className="font-semibold text-[#2C1A0E]">{sucursal}</span>
              </div>
            )}
            {fecha && (
              <div className="flex justify-between">
                <span className="text-[#7C5C52]">Fecha estimada</span>
                <span className="font-semibold text-[#2C1A0E]">{fecha}</span>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 space-y-3"
        >
          <a
            href={`https://wa.me/${waNumero}?text=${mensajeWa}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#25D366] text-white font-['Plus_Jakarta_Sans'] font-semibold rounded-2xl hover:bg-[#1ebe5d] transition-colors"
          >
            <WhatsappLogo size={20} weight="fill" />
            Confirmar mi pedido por WhatsApp
          </a>
          <Link
            to="/confetti/pedir"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent text-[#5C2D1E] border-2 border-[#5C2D1E] font-['Plus_Jakarta_Sans'] font-semibold rounded-2xl hover:bg-[#5C2D1E] hover:text-white transition-all"
          >
            Hacer otro pedido
          </Link>
          <Link
            to="/confetti"
            className="block text-sm font-['Plus_Jakarta_Sans'] text-[#7C5C52] hover:text-[#E8579A] transition-colors"
          >
            Volver al inicio
          </Link>
        </motion.div>
      </div>
    </div>
  );
}