import React from "react";
import { useReducedMotion } from "framer-motion";

const EMOJIS = ["🎂", "🍰", "🧁", "🎉", "✨", "💖", "🎈", "🍓", "🥳"];

// Posiciones en los bordes (left/right %, top %). Las del centro se ocultan en móvil.
const POSICIONES = [
  { e: "🎂", top: "6%", left: "3%", size: "text-3xl", soloDesktop: false, delay: "0s" },
  { e: "🍓", top: "14%", left: "92%", size: "text-2xl", soloDesktop: false, delay: "0.6s" },
  { e: "🧁", top: "70%", left: "5%", size: "text-3xl", soloDesktop: false, delay: "1.1s" },
  { e: "🎉", top: "78%", left: "90%", size: "text-2xl", soloDesktop: false, delay: "0.3s" },
  { e: "✨", top: "40%", left: "1%", size: "text-2xl", soloDesktop: true, delay: "0.9s" },
  { e: "💖", top: "48%", left: "95%", size: "text-2xl", soloDesktop: true, delay: "1.4s" },
  { e: "🎈", top: "4%", left: "48%", size: "text-2xl", soloDesktop: true, delay: "0.4s" },
  { e: "🥳", top: "88%", left: "46%", size: "text-2xl", soloDesktop: true, delay: "1.0s" },
];

export default function PasosEmojis() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {POSICIONES.map((p, i) => (
        <span
          key={i}
          className={`absolute -translate-x-1/2 -translate-y-1/2 ${p.size} ${
            p.soloDesktop ? "hidden lg:block" : "block"
          } opacity-80 select-none`}
          style={{
            top: p.top,
            left: p.left,
            animation: reduceMotion
              ? "none"
              : `confettiFloat ${3 + (i % 3)}s ease-in-out ${p.delay} infinite`,
          }}
        >
          {p.e}
        </span>
      ))}
    </div>
  );
}