"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Brain, Globe, BookOpen, Sparkles, GraduationCap, ChevronRight, Zap, Search } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export default function HeroPage() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden selection:bg-zinc-800 text-[#ececec] font-sans">
      
      {/* Decorative Background Orbs removed for pure charcoal black look */}

      {/* Navigation Bar */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-8 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">CampusAI</span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-6"
        >
          {/* Navigation links removed */}
        </motion.div>
      </nav>

      {/* Hero Content */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 pt-20 md:pt-32 pb-32 max-w-7xl mx-auto text-center">
        

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight mb-8 max-w-5xl leading-[0.9] text-gradient"
        >
          Research with <br/> <span className="text-white">Precision.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-12 leading-relaxed font-medium"
        >
          The ultimate AI assistant for prospective students. Analyze PDFs, search verified academic web data, and get instant citations.
        </motion.p>

        {/* Premium Search Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl mx-auto relative"
        >
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const query = formData.get("query");
              window.location.href = `/chat?q=${encodeURIComponent(query as string)}`;
            }}
            className="glow-border relative group"
          >
            <div className="absolute -inset-0.5 bg-white/5 rounded-[40px] blur opacity-75 group-focus-within:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-zinc-950 rounded-[38px] border border-zinc-800/50 p-3 flex flex-col md:flex-row items-center gap-3">
              <div className="flex-grow w-full flex items-center px-4 gap-3">
                <Search className="w-6 h-6 text-zinc-500" />
                <input
                  name="query"
                  type="text"
                  placeholder="Ask about admission requirements, scholarships, or campus life..."
                  className="w-full bg-transparent border-none outline-none py-4 text-lg md:text-xl text-white placeholder:text-zinc-600 font-medium"
                />
              </div>
              <button
                type="submit"
                className="w-full md:w-auto bg-white text-black px-8 py-4 rounded-[28px] font-bold text-lg flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all active:scale-95 whitespace-nowrap"
              >
                Analyze Now
                <ChevronRight size={20} />
              </button>
            </div>
          </form>

          {/* Quick Suggestions */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {["Stanford Tuition 2025", "MIT CS Rankings", "Harvard Scholarships"].map((tag) => (
              <button 
                key={tag}
                onClick={() => {
                  window.location.href = `/chat?q=${encodeURIComponent(tag)}`;
                }}
                className="px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/50 text-sm font-medium text-zinc-500 hover:text-white hover:border-zinc-700 transition-all"
              >
                {tag}
              </button>
            ))}
          </div>
        </motion.div>


      </main>
      
      {/* Footer / Spacer */}
      <div className="h-64 pointer-events-none" />
    </div>
  );
}
