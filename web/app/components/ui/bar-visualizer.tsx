"use client";

import { motion, TargetAndTransition } from "framer-motion";
import { useEffect, useState } from "react";

export type AgentState = "listening" | "speaking" | "thinking" | "connecting" | "initializing";

interface BarVisualizerProps {
  state: AgentState;
  barCount?: number;
  className?: string;
  demo?: boolean;
  minHeight?: number;
  maxHeight?: number;
}

export function BarVisualizer({
  state,
  barCount = 12,
  className = "",
  minHeight = 4,
  maxHeight = 40,
}: BarVisualizerProps) {
  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    setBars(Array.from({ length: barCount }, (_, i) => i));
  }, [barCount]);

  const getAnimation = (index: number): TargetAndTransition => {
    switch (state) {
      case "listening":
        return {
          height: [minHeight, Math.random() * (maxHeight - minHeight) + minHeight, minHeight],
          transition: {
            duration: 0.5 + Math.random() * 0.5,
            repeat: Infinity,
            ease: "easeInOut" as any,
          },
        };
      case "speaking":
        return {
          height: [minHeight, Math.random() * maxHeight, minHeight],
          transition: {
            duration: 0.2 + Math.random() * 0.3,
            repeat: Infinity,
            ease: "easeInOut" as any,
          },
        };
      case "thinking":
        return {
          height: [minHeight, maxHeight / 2, minHeight],
          transition: {
            duration: 1,
            repeat: Infinity,
            delay: index * 0.1,
            ease: "easeInOut" as any,
          },
        };
      case "connecting":
      case "initializing":
        return {
          opacity: [0.3, 1, 0.3],
          height: minHeight,
          transition: {
            duration: 1.5,
            repeat: Infinity,
            delay: index * 0.1,
          },
        };
      default:
        return { height: minHeight };
    }
  };

  const getBarColor = () => {
    switch (state) {
      case "listening": return "bg-white";
      case "speaking": return "bg-white";
      case "thinking": return "bg-white";
      default: return "bg-white";
    }
  };

  return (
    <div className={`flex items-end justify-center gap-1 ${className}`}>
      {bars.map((_, i) => (
        <motion.div
          key={i}
          animate={getAnimation(i)}
          className={`w-1.5 rounded-full ${getBarColor()} opacity-80`}
          initial={{ height: minHeight }}
        />
      ))}
    </div>
  );
}
