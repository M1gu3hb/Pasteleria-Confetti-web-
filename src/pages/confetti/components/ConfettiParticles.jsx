import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

const CONFETTI_COLORS = ["#E8579A", "#5C2D1E", "#F5A0C8", "#8B5E3C", "#FFF8F4", "#FDEEF6"];
const NUM_PARTICLES = 25;

export default function ConfettiParticles({ active = true, className = "" }) {
  const reduceMotion = useReducedMotion();

  const particles = useMemo(
    () =>
      Array.from({ length: NUM_PARTICLES }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 6 + Math.random() * 6,
        delay: Math.random() * 3,
        duration: 2.5 + Math.random() * 2,
        rotation: Math.random() * 720,
      })),
    []
  );

  if (reduceMotion || !active) return null;

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute",
            top: 0,
            left: `${p.x}%`,
            width: p.size,
            height: p.size / 2,
            backgroundColor: p.color,
            borderRadius: 2,
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: "105vh", opacity: [1, 1, 0], rotate: p.rotation }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "linear",
            repeat: Infinity,
            repeatDelay: 3,
          }}
        />
      ))}
    </div>
  );
}