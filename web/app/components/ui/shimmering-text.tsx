"use client";

import { motion } from "framer-motion";

interface ShimmeringTextProps {
  text: string;
  className?: string;
}

export function ShimmeringText({ text, className }: ShimmeringTextProps) {
  return (
    <div className={`relative inline-block ${className}`}>
      <motion.span
        initial={{ backgroundPosition: "-200% 0" }}
        animate={{ backgroundPosition: "200% 0" }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: "linear",
        }}
        className="bg-[linear-gradient(110deg,#a1a1aa,45%,#ffffff,55%,#a1a1aa)] bg-[length:200%_100%] bg-clip-text text-transparent font-medium"
      >
        {text}
      </motion.span>
    </div>
  );
}
