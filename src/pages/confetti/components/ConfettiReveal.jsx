import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function ConfettiReveal({ children, delay = 0, direction = "up", className = "" }) {
  const reduceMotion = useReducedMotion();

  const variants = {
    hidden: reduceMotion
      ? { opacity: 0 }
      : {
          opacity: 0,
          y: direction === "up" ? 32 : direction === "down" ? -32 : 0,
          x: direction === "left" ? 32 : direction === "right" ? -32 : 0,
          filter: "blur(6px)",
        },
    visible: { opacity: 1, y: 0, x: 0, filter: "blur(0px)" },
  };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}