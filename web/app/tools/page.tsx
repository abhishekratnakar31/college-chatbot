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
    color: "bg-[#b69cc4]",
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
    color: "bg-[#fcd34d]",
    href: "/rankings",
    category: "Productivity",
    isFeatured: false,
  },
  {
    id: "news",
    name: "Live Intelligence",
    description: "Real-time updates on examinations and academic policy.",
    icon: Newspaper,
    color: "bg-[#f472b6]",
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

  return (
    <div className="flex h-screen bg-[#f3f4f6] text-black font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-16 border-r-2 border-black flex-col items-center py-6 gap-6 z-[100] bg-white shrink-0">
        <Link
          href="/"
          className="w-10 h-10 bg-white border-2 border-black rounded-lg flex items-center justify-center hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
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
                "w-10 h-10 rounded-lg border-2 border-black flex items-center justify-center transition-all",
                item.active
                  ? "bg-[#b69cc4] text-black shadow-[2px_2px_0px_0px_#000000]"
                  : "bg-white text-zinc-600 hover:text-black hover:bg-[#b69cc4] shadow-none",
              )}
            >
              <item.icon size={18} />
            </Link>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* ── Breadcrumbs ── */}
        <div className="px-6 md:px-16 pt-8">
          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <ChevronRight size={10} />
            <span className="text-black">Intelligence Hub</span>
          </div>
        </div>

        {/* Header */}
        <header className="h-24 md:h-32 flex items-end justify-between px-6 md:px-16 pb-6 md:pb-10 bg-[#f3f4f6] z-50">
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              Apps{" "}
              <span className="text-[10px] bg-[#b69cc4]/35 border border-black text-black px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">
                BETA
              </span>
            </h1>
            <p className="text-[13px] text-zinc-600 font-bold mt-1">
              Explore and use AI systems in AcademiaAI
            </p>
          </div>

          <div className="relative group hidden sm:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search apps"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 md:w-80 bg-white border-2 border-black rounded-xl py-2.5 pl-11 pr-4 text-sm text-black outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-zinc-400"
            />
          </div>
        </header>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 md:px-16 pb-32">
          <div className="max-w-6xl mx-auto space-y-10">
            {/* Hero Banner */}
            <section>
              <div className="relative h-[280px] md:h-[320px] rounded-[2rem] overflow-hidden group bg-gradient-to-br from-[#b69cc4] via-[#fcd34d] to-[#f472b6] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="relative h-full flex items-center justify-between p-8 md:p-12 text-black">
                  <div className="max-w-sm space-y-6">
                    <div className="w-14 h-14 bg-white border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_#000000]">
                      <Zap className="text-black w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                        Predict with Neural Engine
                      </h2>
                      <p className="text-[13px] text-black/80 font-bold leading-relaxed">
                        Analyze and forecast your admission success with high
                        precision.
                      </p>
                    </div>
                    <Link
                      href="/predictor"
                      className="inline-flex items-center px-8 py-2.5 bg-black text-white hover:bg-zinc-800 border-2 border-black rounded-xl text-xs font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                    >
                      View App
                    </Link>
                  </div>

                  {/* Top Right Pill */}
                  <div className="absolute top-6 right-6 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border-2 border-black text-[10px] font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <span className="font-extrabold text-[#a387b3]">@NeuralEngine</span> predict
                  </div>

                  {/* Visual Preview */}
                  <div className="hidden lg:block w-[400px] h-full relative">
                    <div className="absolute top-1/2 -translate-y-1/2 right-0 w-full aspect-[4/3] bg-white border-2 border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-2">
                      <div className="w-full h-full rounded-xl bg-zinc-100 flex items-center justify-center overflow-hidden border border-black">
                        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000')] bg-cover bg-center" />
                      </div>
                      <div className="absolute top-6 left-6 w-8 h-8 bg-white border-2 border-black rounded-lg flex items-center justify-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                        <Sparkles size={14} className="text-black" />
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
                    "px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
                    activeCategory === cat
                      ? "bg-[#b69cc4] text-black"
                      : "bg-white text-zinc-600 hover:text-black",
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* List Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24">
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
                      className="group flex items-center gap-4 transition-all py-4 px-6 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <div
                        className={cn(
                          "w-12 h-12 rounded-lg flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#000000] shrink-0",
                          tool.color,
                        )}
                      >
                        <tool.icon className="text-black w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[14px] font-black text-black leading-tight group-hover:text-[#a387b3] transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-[12px] text-zinc-600 font-bold truncate mt-0.5">
                          {tool.description}
                        </p>
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-black group-hover:translate-x-0.5 transition-all"
                      />
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </section>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-white border-2 border-black rounded-xl px-2 py-2 flex items-center gap-1 shadow-[4px_4px_0px_0px_#000000] text-black">
          <nav className="flex items-center gap-1">
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
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300",
                  item.active
                    ? "bg-[#b69cc4] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    : "text-zinc-600 hover:text-black rounded-lg",
                )}
              >
                <item.icon size={20} />
                {item.active && (
                  <span className="text-[13px] font-black">{item.label}</span>
                )}
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
