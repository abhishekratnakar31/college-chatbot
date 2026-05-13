"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  GraduationCap,
  Brain,
  Newspaper,
  Trophy,
  LayoutGrid,
  Bookmark,
  Search,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Clock,
  ChevronRight,
  TrendingUp,
  Boxes,
  Mic,
} from "lucide-react";

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(" ");

const TOOLS = [
  {
    id: "predictor",
    name: "Neural Predictor",
    description: "AI-powered admission forecasting & 2024-25 cutoff prediction.",
    icon: Zap,
    color: "bg-[#0066FF]",
    href: "/predictor",
    category: "Featured",
    isFeatured: true,
    tag: "@NeuralEngine 2024-25 UPDATED",
  },
  {
    id: "rankings",
    name: "Institutional Rankings",
    description: "Explore the latest NIRF and global academic rankings.",
    icon: Trophy,
    color: "bg-[#FF9500]",
    href: "/rankings",
    category: "Productivity",
    isFeatured: false,
  },
  {
    id: "news",
    name: "Live Intelligence",
    description: "Real-time updates on examinations and academic policy.",
    icon: Newspaper,
    color: "bg-[#34C759]",
    href: "/news",
    category: "Lifestyle",
    isFeatured: false,
  },
];

const CATEGORIES = ["Featured", "Lifestyle", "Productivity"];

export default function ToolsHub() {
  const [activeCategory, setActiveCategory] = useState("Featured");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = TOOLS.filter((tool) => {
    const matchesCategory =
      activeCategory === "Featured" ? true : tool.category === activeCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredTool = TOOLS[0];

  return (
    <div className="flex h-screen bg-[#0d0d0d] text-white font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-16 border-r border-white/5 flex-col items-center py-6 gap-6 z-[100] bg-[#0d0d0d] shrink-0">
        <Link
          href="/"
          className="w-10 h-10 bg-white rounded-xl flex items-center justify-center hover:scale-110 transition-transform shadow-xl shadow-white/5"
        >
          <GraduationCap className="text-black w-5 h-5" />
        </Link>
        <div className="flex flex-col gap-4">
          {[
            { icon: Brain, href: "/chat", label: "Chat" },
            { icon: Bookmark, href: "/shortlist", label: "Saved" },
            { icon: LayoutGrid, href: "/tools", label: "Tools", active: true },
          ].map((item, i) => (
            <Link
              key={i}
              href={item.href}
              title={item.label}
              className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                item.active
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-600 hover:text-zinc-300",
              )}
            >
              <item.icon size={18} />
            </Link>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-24 md:h-32 flex items-end justify-between px-6 md:px-16 pb-6 md:pb-10 bg-[#0d0d0d] z-50">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              Apps{" "}
              <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter">
                BETA
              </span>
            </h1>
            <p className="text-[13px] text-zinc-500 font-medium mt-1">
              Explore and use AI systems in AcademiaAI
            </p>
          </div>

          <div className="relative group hidden sm:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input
              type="text"
              placeholder="Search apps"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 md:w-80 bg-[#1a1a1a] border border-transparent rounded-full py-2.5 pl-11 pr-4 text-sm outline-none focus:border-zinc-700 transition-all placeholder:text-zinc-600"
            />
          </div>
        </header>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 md:px-16 pb-32">
          <div className="max-w-6xl mx-auto space-y-10">
            {/* Hero Banner - ChatGPT Style */}
            <section>
              <div className="relative h-[280px] md:h-[320px] rounded-[2rem] overflow-hidden group bg-gradient-to-br from-[#4A90E2] to-[#67B26F]">
                <div className="relative h-full flex items-center justify-between p-8 md:p-12 text-white">
                  <div className="max-w-sm space-y-6">
                    <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl">
                      <Zap className="text-[#4A90E2] w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                        Predict with Neural Engine
                      </h2>
                      <p className="text-[13px] text-white/80 font-medium leading-relaxed">
                        Analyze and forecast your admission success with high
                        precision.
                      </p>
                    </div>
                    <Link
                      href="/predictor"
                      className="inline-flex items-center px-8 py-2.5 bg-black text-white rounded-full text-xs font-bold hover:scale-105 transition-all"
                    >
                      View
                    </Link>
                  </div>

                  {/* Top Right Pill */}
                  <div className="absolute top-6 right-6 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
                    <span className="opacity-70">@NeuralEngine</span> predict
                    results
                  </div>

                  {/* Visual Preview */}
                  <div className="hidden lg:block w-[400px] h-full relative">
                    <div className="absolute top-1/2 -translate-y-1/2 right-0 w-full aspect-[4/3] bg-white rounded-3xl overflow-hidden shadow-2xl p-2">
                      <div className="w-full h-full rounded-2xl bg-zinc-100 flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000')] bg-cover bg-center" />
                      </div>
                      <div className="absolute top-6 left-6 w-8 h-8 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg cursor-pointer">
                        <Sparkles size={14} className="text-blue-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Category Tabs */}
            <div className="flex gap-2 pb-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-5 py-2 rounded-full text-xs font-bold transition-all",
                    activeCategory === cat
                      ? "bg-[#2f2f2f] text-white"
                      : "text-zinc-500 hover:text-white",
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* List Grid - ChatGPT Style */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
              <AnimatePresence mode="popLayout">
                {filteredTools.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <Link
                      href={tool.href}
                      className="group flex items-center gap-4 transition-all py-2"
                    >
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center shadow-lg shrink-0",
                          tool.color,
                        )}
                      >
                        <tool.icon className="text-white w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[14px] font-bold text-white leading-tight">
                          {tool.name}
                        </h3>
                        <p className="text-[12px] text-zinc-500 font-medium truncate mt-0.5">
                          {tool.description}
                        </p>
                      </div>
                      <ChevronRight
                        size={14}
                        className="text-zinc-800 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all"
                      />
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </section>
          </div>
        </div>

        {/* Mobile Navigation - Pill Style */}
        <div className="md:hidden fixed bottom-8 left-0 right-0 flex justify-center z-[200] px-6">
          <nav className="bg-[#1a1a1a]/95 backdrop-blur-2xl border border-white/5 rounded-full p-2 flex items-center gap-1 shadow-2xl">
            {[
              { icon: GraduationCap, href: "/", label: "Home" },
              { icon: Brain, href: "/chat", label: "Chat" },
              { icon: Bookmark, href: "/shortlist", label: "Saved" },
              { icon: LayoutGrid, href: "/tools", label: "Apps", active: true },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300",
                  item.active
                    ? "bg-white text-black shadow-lg"
                    : "text-zinc-600 hover:text-white",
                )}
              >
                <item.icon size={18} />
                <span
                  className={cn(
                    "text-xs font-bold",
                    item.active ? "block" : "hidden",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
