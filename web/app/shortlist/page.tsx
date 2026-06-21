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
    <div className="min-h-screen bg-[#f3f4f6] text-black font-sans overflow-x-hidden">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-16 border-r-2 border-black flex-col items-center py-6 gap-6 z-[100] bg-white">
        <Link href="/" className="w-10 h-10 bg-white border-2 border-black rounded-lg flex items-center justify-center hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
          <GraduationCap className="text-black w-5 h-5" />
        </Link>
        <div className="flex flex-col gap-4">
          {[
            { icon: Brain, href: "/chat", label: "Chat" },
            { icon: Bookmark, href: "/shortlist", label: "Saved Colleges", active: true },
            { icon: LayoutGrid, href: "/tools", label: "Tools" },
          ].map((item: any) => {
            const Icon = item.icon;
            return (
              <Link key={item.label} href={item.href} title={item.label} className={cn(
                "w-10 h-10 rounded-lg border-2 border-black flex items-center justify-center transition-all",
                item.active 
                  ? "bg-[#b69cc4] text-black shadow-[2px_2px_0px_0px_#000000]" 
                  : "bg-white text-zinc-600 hover:text-black hover:bg-[#b69cc4] shadow-none"
              )}>
                <Icon size={18} />
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:pl-16 min-h-screen pb-24">
        {/* ── Breadcrumbs ── */}
        <div className="px-6 sm:px-12 pt-8 pb-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <ChevronRight size={10} />
            <Link href="/tools" className="hover:text-black transition-colors">Tools</Link>
            <ChevronRight size={10} />
            <span className="text-black">Academic Vault</span>
          </div>
        </div>

        <header className="px-6 sm:px-12 py-8 border-b-2 border-black flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xl z-50 text-black">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#b69cc4]/30 border-2 border-black rounded-lg flex items-center justify-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              <Bookmark size={20} className="text-black fill-black" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold tracking-tight text-black">Saved <span className="text-zinc-500">Colleges</span></h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mt-0.5">{shortlist.length} Saved</p>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-6 sm:px-12 py-12">
          {shortlist.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="w-24 h-24 bg-white border-2 border-black rounded-[2.5rem] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-8 relative">
                <Bookmark size={40} className="text-zinc-300" />
                <motion.div 
                   animate={{ scale: [1, 1.2, 1] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="absolute inset-0 flex items-center justify-center"
                >
                  <Plus size={16} className="text-[#a387b3] mt-8 ml-8" />
                </motion.div>
              </div>
              <h2 className="text-2xl font-serif font-bold text-black mb-2">No colleges saved yet</h2>
              <p className="text-zinc-600 text-sm max-w-sm mx-auto mb-10 leading-relaxed font-medium">
                Save your favorite colleges while browsing to easily compare and track your admission goals.
              </p>
              <Link href="/rankings" className="px-8 py-4 bg-[#b69cc4] hover:bg-[#a387b3] text-black border-2 border-black text-xs font-black uppercase tracking-[0.2em] rounded-xl hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all">
                Browse Rankings
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {shortlist.map((college, i) => (
                  <motion.div
                    key={college.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="group relative bg-white border-2 border-black rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all p-4 sm:p-6"
                  >
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      {/* Logo Section */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-zinc-50 border-2 border-zinc-200 flex items-center justify-center shrink-0 overflow-hidden relative">
                        {college.logo ? (
                          <img src={college.logo} alt="" className="w-full h-full object-contain p-3" />
                        ) : (
                          <Building2 className="text-zinc-300" size={32} />
                        )}
                      </div>

                      {/* Main Info */}
                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                          <span className="text-[9px] font-black uppercase tracking-widest text-black bg-[#b69cc4]/30 px-2 py-0.5 border border-black/20 rounded">
                            {college.nirf_category}
                          </span>
                          {college.nirf_rank && (
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                              Rank #{college.nirf_rank}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg sm:text-xl font-serif font-bold text-black group-hover:text-[#a387b3] transition-colors truncate">
                          {college.college}
                        </h3>
                        <div className="flex items-center justify-center sm:justify-start gap-3 mt-1 text-zinc-600">
                          <div className="flex items-center gap-1">
                            <MapPin size={12} />
                            <span className="text-[11px] font-medium">{college.city}, {college.state}</span>
                          </div>
                        </div>
                      </div>

                      {/* Stats Section */}
                      <div className="hidden lg:flex flex-col items-end px-8 border-x-2 border-black/10">
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Avg Package</p>
                        <p className="text-base font-bold text-black">₹{college.avg_package || "12.5"}L</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
                        <Link 
                          href={`/colleges/${toSlug(college.college ?? "")}`} 
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border-2 border-black rounded-lg text-[10px] font-black uppercase tracking-widest text-black hover:bg-[#b69cc4] transition-all hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[2px_2px_0px_0px_#000000] group/link"
                        >
                          Profile <ChevronRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                        <button 
                          onClick={() => removeFromShortlist(college.id)}
                          className="p-2.5 bg-white hover:bg-rose-500 text-black hover:text-white rounded-lg transition-all border-2 border-black hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[2px_2px_0px_0px_#000000] group/btn"
                          title="Remove from shortlist"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-white border-2 border-black rounded-xl px-2 py-2 flex items-center gap-1 shadow-[4px_4px_0px_0px_#000000] text-black">
        {[
          { icon: GraduationCap, href: "/", label: "Home" },
          { icon: Brain, href: "/chat", label: "Chat" },
          { icon: Bookmark, href: "/shortlist", label: "Saved" },
          { icon: LayoutGrid, href: "/tools", label: "Apps" },
        ].map((item: any, i) => {
          const Icon = item.icon;
          return (
            <Link
              key={i}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300",
                item.href === "/shortlist"
                  ? "bg-[#b69cc4] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  : "text-zinc-600 hover:text-black rounded-lg",
              )}
            >
              <Icon size={20} />
              {item.href === "/shortlist" && (
                <span className="text-[13px] font-black">{item.label}</span>
              )}
            </Link>
          );
        })}
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
