"use client";

import { useShortlist } from "../context/ShortlistContext";
import { 
  Bookmark, MapPin, Trophy, ArrowRight, GraduationCap, 
  Trash2, Building2, Search, Sparkles, ChevronRight,
  Brain, Newspaper, LayoutGrid
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toSlug } from "../rankings/page";

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(" ");

export default function ShortlistPage() {
  const { shortlist, removeFromShortlist } = useShortlist();

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-16 border-r border-white/5 flex-col items-center py-6 gap-6 z-[100] bg-[#0a0a0a]">
        <Link href="/" className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-xl shadow-white/5">
          <GraduationCap className="text-black w-5 h-5" />
        </Link>
        <div className="flex flex-col gap-4">
          {[
            { icon: Brain, href: "/chat", label: "Chat" },
            { icon: Newspaper, href: "/news", label: "News" },
            { icon: Trophy, href: "/rankings", label: "Rankings" },
            { icon: Bookmark, href: "/shortlist", label: "Saved Colleges", active: true },
          ].map((item) => (
            <Link key={item.label} href={item.href} title={item.label} className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
              item.active ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.15)]" : "text-zinc-600 hover:text-amber-400 hover:bg-amber-500/10"
            )}>
              <item.icon size={18} />
            </Link>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:pl-16 min-h-screen pb-24">
        <header className="px-6 sm:px-12 py-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#050505]/80 backdrop-blur-xl z-50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
              <Bookmark size={20} className="text-amber-500 fill-amber-500" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold tracking-tight">Saved <span className="text-white/40">Colleges</span></h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mt-0.5">{shortlist.length} Saved</p>
            </div>
          </div>
          <Link href="/rankings" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest text-white/60 group">
            Explore More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </header>

        <div className="max-w-6xl mx-auto px-6 sm:px-12 py-12">
          {shortlist.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-8 border border-white/10 relative">
                <Bookmark size={40} className="text-white/10" />
                <motion.div 
                   animate={{ scale: [1, 1.2, 1] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="absolute inset-0 flex items-center justify-center"
                >
                  <Plus size={16} className="text-amber-500 mt-8 ml-8" />
                </motion.div>
              </div>
              <h2 className="text-2xl font-serif font-bold text-white mb-2">No colleges saved yet</h2>
              <p className="text-white/40 text-sm max-w-sm mx-auto mb-10 leading-relaxed">
                Save your favorite colleges while browsing to easily compare and track your admission goals.
              </p>
              <Link href="/rankings" className="px-8 py-4 bg-white text-black text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5">
                Browse Rankings
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {shortlist.map((college, i) => (
                  <motion.div
                    key={college.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="group relative bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden hover:bg-white/[0.04] hover:border-white/10 transition-all p-6 sm:p-8"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex items-center gap-5 flex-1">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden relative">
                          {college.logo ? (
                            <img src={college.logo} alt="" className="w-full h-full object-contain p-3" />
                          ) : (
                            <Building2 className="text-white/20" size={32} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-amber-500/80 px-2 py-0.5 bg-amber-500/10 rounded-md border border-amber-500/20">
                              {college.nirf_category}
                            </span>
                            {college.nirf_rank && (
                              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                                Rank #{college.nirf_rank}
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg sm:text-xl font-serif font-bold text-white leading-tight group-hover:text-amber-400 transition-colors">
                            {college.college}
                          </h3>
                          <div className="flex items-center gap-3 mt-2 text-white/30">
                            <div className="flex items-center gap-1">
                              <MapPin size={12} />
                              <span className="text-[11px] font-medium">{college.city}, {college.state}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => removeFromShortlist(college.id)}
                        className="p-3 bg-white/5 hover:bg-amber-500/20 text-white/20 hover:text-amber-500 rounded-2xl transition-all border border-white/5 hover:border-amber-500/30 group/btn"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/5">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Avg Package</p>
                        <p className="text-sm font-bold text-white">₹{college.avg_package || "12.5"}L</p>
                      </div>
                      <div className="text-right">
                        <Link href={`/colleges/${toSlug(college.college ?? "")}`} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors group/link">
                          View Profile <ChevronRight size={12} className="group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-lg border-t border-white/5 flex items-center justify-around z-[200] px-6">
        {[
          { icon: GraduationCap, href: "/" },
          { icon: Brain, href: "/chat" },
          { icon: Newspaper, href: "/news" },
          { icon: Trophy, href: "/rankings" },
          { icon: Bookmark, href: "/shortlist", active: true },
        ].map((item, i) => (
          <Link key={i} href={item.href} className={cn("p-3 rounded-xl transition-all", item.active ? "bg-white text-black" : "text-zinc-600 hover:text-amber-400")}>
            <item.icon size={20} />
          </Link>
        ))}
      </nav>
    </div>
  );
}

function Plus({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
