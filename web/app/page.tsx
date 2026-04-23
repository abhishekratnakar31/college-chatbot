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
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-white/5">
            <GraduationCap className="text-black w-6 h-6" />
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

        {/* How it Works / Capabilities Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-32 w-full max-w-5xl mx-auto"
        >
          <div className="text-center mb-16">
            <span className="text-zinc-400 font-bold tracking-widest text-[10px] uppercase bg-zinc-800/50 px-4 py-1.5 rounded-full border border-zinc-700/50">Dual Intelligence</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-8 tracking-tight">How it works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* PDF Mode Card */}
            <div className="relative group">
              <div className="absolute -inset-px bg-gradient-to-b from-white/10 to-transparent rounded-[32px] opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative p-8 md:p-10 rounded-[32px] bg-zinc-950 border border-zinc-800/50 hover:border-zinc-700/50 transition-all h-full flex flex-col">
                <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center mb-8 border border-zinc-800 group-hover:scale-110 transition-transform">
                  <BookOpen className="text-white w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Analyze Your PDFs</h3>
                <p className="text-zinc-400 leading-relaxed text-lg font-medium">
                  Upload admission brochures, research papers, or financial aid guides. Our AI indexes the content to provide <span className="text-white">instant, cited answers</span> directly from your specific documents.
                </p>
                <div className="mt-auto pt-8 flex items-center gap-2 text-zinc-500 group-hover:text-white transition-colors font-semibold uppercase text-xs tracking-widest">
                  Personalized Context <ArrowRight size={14} />
                </div>
              </div>
            </div>

            {/* Web Search Mode Card */}
            <div className="relative group">
              <div className="absolute -inset-px bg-gradient-to-b from-white/10 to-transparent rounded-[32px] opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative p-8 md:p-10 rounded-[32px] bg-zinc-950 border border-zinc-800/50 hover:border-zinc-700/50 transition-all h-full flex flex-col">
                <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center mb-8 border border-zinc-800 group-hover:scale-110 transition-transform">
                  <Globe className="text-white w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Live Web Search</h3>
                <p className="text-zinc-400 leading-relaxed text-lg font-medium">
                  Need the latest info? Switch to Web Mode to search <span className="text-white">verified academic databases</span> and college websites for real-time tuition updates, rankings, and campus news.
                </p>
                <div className="mt-auto pt-8 flex items-center gap-2 text-zinc-500 group-hover:text-white transition-colors font-semibold uppercase text-xs tracking-widest">
                  Real-time Intelligence <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Implementation Steps Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-32 w-full max-w-5xl mx-auto border-t border-zinc-800/50 pt-32"
        >
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Three steps to precision</h2>
            <p className="text-zinc-500 mt-4 text-lg">Your journey from raw data to verified insights.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-12 items-start justify-between relative">
            {/* Step 1 */}
            <div className="flex-1 flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl font-bold text-white mb-6 group-hover:border-white/50 group-hover:bg-white/5 transition-all duration-500 shadow-xl">
                01
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Choose Mode</h4>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-[240px]">
                Toggle between PDF mode for your documents or Web mode for live academic data.
              </p>
            </div>

            {/* Connecting Line 1 */}
            <div className="hidden md:block absolute top-8 left-[22%] right-[68%] h-px bg-zinc-800" />

            {/* Step 2 */}
            <div className="flex-1 flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl font-bold text-white mb-6 group-hover:border-white/50 group-hover:bg-white/5 transition-all duration-500 shadow-xl">
                02
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Input Context</h4>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-[240px]">
                Upload your university research files or type your specific college query.
              </p>
            </div>

            {/* Connecting Line 2 */}
            <div className="hidden md:block absolute top-8 left-[55%] right-[35%] h-px bg-zinc-800" />

            {/* Step 3 */}
            <div className="flex-1 flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl font-bold text-white mb-6 group-hover:border-white/50 group-hover:bg-white/5 transition-all duration-500 shadow-xl">
                03
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Verify & Cite</h4>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-[240px]">
                Review instant responses with precise citations and direct source links.
              </p>
            </div>
          </div>
        </motion.div>


      </main>
      
      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-900 bg-black pt-12 pb-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <GraduationCap className="text-black w-5 h-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">CampusAI</span>
            </div>
            <p className="text-zinc-600 text-xs">
              © {new Date().getFullYear()} CampusAI. Built for researchers.
            </p>
          </div>
          
          <div className="flex items-center gap-8">
            <Link href="/chat" className="text-zinc-500 hover:text-white text-xs transition-colors font-medium">Chat</Link>
            <Link href="#" className="text-zinc-500 hover:text-white text-xs transition-colors font-medium">Privacy</Link>
            <Link href="#" className="text-zinc-500 hover:text-white text-xs transition-colors font-medium">Terms</Link>
            <span className="flex items-center gap-1.5 text-zinc-600 text-xs ml-4">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
              System Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
