"use client";

import { 
  GraduationCap, Trophy, ArrowUpDown, ChevronDown, Landmark, 
  Filter, ChevronUp, ChevronRight, Brain, Newspaper, IndianRupee, MapPin, Check, Star, ExternalLink
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(" ");
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4005";

interface College {
  id: number;
  name?: string;
  college?: string;
  category: string;
  nirf_category?: string;
  state: string;
  rank_2024?: number;
  nirf_rank?: number | null;
  score: number;
  avg_package?: number;
  innovation_score?: number;
  website?: string;
}

function FilterSection({ title, options, selected, onChange, icon }: any) {
  const [isOpen, setIsOpen] = useState(true);
  const filtered = options || [];

  return (
    <div className="border-b border-white/5 py-8 last:border-0">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between group mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            {icon}
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 group-hover:text-white transition-colors">{title}</span>
        </div>
        {isOpen ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-4">

            <div className="max-h-64 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
              {filtered.map((opt: any) => {
                const isSelected = selected.includes(opt.name);
                return (
                  <button 
                    key={opt.name} 
                    onClick={() => onChange(opt.name)}
                    className="w-full flex items-center gap-3 group cursor-pointer py-2 px-3 rounded-xl hover:bg-white/[0.04] transition-all text-left"
                  >
                    <div className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center transition-all shadow-inner",
                      isSelected ? "bg-white border-white" : "border-white/10 bg-black group-hover:border-white/20"
                    )}>
                      {isSelected && <Check size={10} className="text-black font-black" />}
                    </div>
                    <span className={cn(
                      "text-[11px] transition-colors", 
                      isSelected ? "text-white font-bold" : "text-white/60 font-medium group-hover:text-white/90"
                    )}>
                      {opt.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CollegeCard({ college, index }: { college: College; index: number }) {
  const isTop3 = (college.rank_2024 || college.nirf_rank || 999) <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className={cn(
        "group relative flex flex-col md:flex-row md:items-center gap-6 p-5 sm:p-6 rounded-3xl border backdrop-blur-sm transition-all duration-300",
        isTop3 
          ? "bg-white/[0.03] border-white/20 hover:border-white/40 hover:-translate-y-1" 
          : "bg-white/[0.01] border-white/5 hover:bg-white/[0.03] hover:border-white/10 hover:-translate-y-1"
      )}
    >
      {/* Rank Indicator */}
      <div className="flex items-center justify-center w-12 h-12 shrink-0">
        <span className={cn(
          "text-3xl font-serif font-bold italic transition-colors",
          isTop3 ? "text-white" : "text-white/10 group-hover:text-white/40"
        )}>
          #{college.rank_2024 || college.nirf_rank || "--"}
        </span>
      </div>

      <div className="flex-grow flex flex-col md:flex-row md:items-center justify-between gap-6 min-w-0">
        
        {/* Main Info */}
        <div className="flex items-center gap-5 flex-grow min-w-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 bg-gradient-to-br from-white/10 to-white/5 rounded-[1.25rem] border border-white/10 flex items-center justify-center shadow-inner relative overflow-hidden">
             {/* Glow effect inside logo box */}
             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/10 pointer-events-none" />
            <span className="text-xl sm:text-2xl font-black text-white/50 font-serif drop-shadow-md">
              {(college.name || college.college || "?")[0]}
            </span>
          </div>
          
          <div className="flex-grow min-w-0 space-y-1.5">
            <div className="flex items-center gap-3">
              <h3 className="text-base sm:text-xl font-serif font-bold text-white group-hover:text-white/80 transition-colors truncate tracking-tight">
                {college.name || college.college}
              </h3>
              {college.website && (
                <a 
                  href={college.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-white/40 hover:text-white"
                  title="Visit Official Website"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-white/30 font-medium">
                <MapPin size={12} className="text-white/40" />
                {college.state}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-white/60">
                {college.category || "General"}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-8 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
          <div className="flex flex-col gap-1.5 items-start sm:items-end">
            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Est. Package</span>
            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/60 font-bold text-sm flex items-center gap-1">
              <IndianRupee size={14} />
              {college.avg_package || "12.5"} LPA
            </div>
          </div>
          
          <div className="hidden sm:block w-px h-12 bg-white/5" />

          <div className="flex flex-col gap-1.5 items-start sm:items-end">
            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Quality Score</span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/60 font-bold text-sm">
              <Star size={14} className="fill-white/10" />
              {college.score ? college.score.toFixed(1) : "--"}
            </div>
          </div>

          <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 cursor-pointer hover:bg-blue-500 hover:text-white">
            <ChevronRight size={20} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function RankingsPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [filterOptions, setFilterOptions] = useState({ states: [] });
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("rank_2024");
  const [loading, setLoading] = useState(true);

  const fetchFilters = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/rankings/filters`);
      const data = await res.json();
      setFilterOptions({
        states: data.states || [],
      });
    } catch (err) {
      console.error("[Rankings Page] Failed to fetch filters:", err);
    }
  }, []);

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      selectedStates.forEach(s => params.append("state", s));
      params.append("sort", sortBy);
      const res = await fetch(`${API_URL}/rankings?${params}`);
      const data = await res.json();
      setColleges(data.colleges || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [selectedStates, sortBy]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const state = params.get("state");
    if (state) setSelectedStates([state]);
    fetchFilters();
  }, [fetchFilters]);

  useEffect(() => { fetchRankings(); }, [fetchRankings]);

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden">
      
      {/* Global Navigation Sidebar */}
      <aside className="hidden md:flex w-20 border-r border-white/5 flex-col items-center py-8 gap-8 z-[100] bg-[#0a0a0a]">
        <Link href="/" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-xl shadow-white/5">
          <GraduationCap className="text-black w-6 h-6" />
        </Link>
        <div className="flex flex-col gap-4">
          {[
            { icon: Brain, href: "/chat", label: "Chat" },
            { icon: Newspaper, href: "/news", label: "News" },
            { icon: Trophy, href: "/rankings", label: "Rankings", active: true },
          ].map((item) => (
            <Link 
              key={item.label} 
              href={item.href} 
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all", 
                item.active 
                  ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.15)]" 
                  : "text-zinc-600 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={20} />
            </Link>
          ))}
        </div>
      </aside>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-lg border-t border-white/5 flex items-center justify-around z-[200] px-6">
        {[
          { icon: GraduationCap, href: "/" },
          { icon: Brain, href: "/chat" },
          { icon: Newspaper, href: "/news" },
          { icon: Trophy, href: "/rankings", active: true }
        ].map((item, i) => (
          <Link 
            key={i} 
            href={item.href} 
            className={cn(
              "p-3 rounded-xl transition-all", 
              item.active ? "bg-white text-black" : "text-zinc-600"
            )}
          >
            <item.icon size={20} />
          </Link>
        ))}
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Secondary Sidebar: Analytics Filters */}
        <div className="w-80 flex-shrink-0 border-r border-white/5 bg-zinc-950/40 backdrop-blur-md overflow-y-auto hidden xl:block p-8">
          <div className="sticky top-0 bg-zinc-950/80 backdrop-blur-xl -mx-8 px-8 py-6 mb-4 border-b border-white/5 z-10">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-3">
              <Filter size={14} className="text-white/40" /> Analytics Engine
            </h2>
          </div>
          <FilterSection title="Location" options={filterOptions.states} selected={selectedStates} onChange={(s: any) => setSelectedStates(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} icon={<Landmark size={14} className="text-blue-400" />} />

        </div>

        <main className="flex-1 flex flex-col relative overflow-hidden bg-black/50">
          
          {/* Header */}
          <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 md:px-12 z-[100] bg-black/30 backdrop-blur-xl shrink-0">
            <Link href="/" className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0">
                <GraduationCap className="text-black w-5 h-5" />
              </div>
              <span className="text-xl font-serif font-bold text-white tracking-tight whitespace-nowrap">
                Academia<span className="text-white/50">Rankings</span>
              </span>
            </Link>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar pb-32 md:pb-20 relative">


            <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-12 md:py-24 relative z-10">
              
              {/* Hero Section */}
              <header className="mb-20 space-y-8">
                <div className="space-y-6">
                  <div className="space-y-4">
                   
                    <p className="text-white/40 text-[11px] leading-relaxed max-w-2xl uppercase tracking-wider font-medium">
                      Our intelligence engine aggregates and synthesizes multi-dimensional data from premier national and international academic bodies. Primary sources include the <span className="text-white/60">National Institutional Ranking Framework (NIRF)</span>, the <span className="text-white/60">Ministry of Education (MoE)</span>, and the <span className="text-white/60">AISHE portal</span>. This dataset is meticulously cross-referenced with official university statutes and placement audit reports to ensure a high-fidelity representation of academic excellence.
                    </p>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-white leading-tight">
                    Top <span className="text-white/40 italic">Institutions</span>
                  </h1>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-6 border-t border-white/5">
                  <p className="text-white/40 text-lg font-medium max-w-md leading-relaxed">
                    Data-driven academic excellence metrics. Explore premier destinations for your career.
                  </p>
                  
                  {/* Custom Sort Dropdown Area */}
                  <div className="relative group">
                    <div className="h-14 px-5 bg-white/[0.02] border border-white/5 hover:border-white/20 rounded-2xl flex items-center gap-4 transition-all cursor-pointer">
                      <ArrowUpDown size={16} className="text-white/40" />
                      <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-transparent text-xs font-black uppercase tracking-widest text-white focus:outline-none appearance-none cursor-pointer pr-4"
                      >
                        <option value="nirf_rank" className="bg-zinc-900">Sort by NIRF Rank</option>
                        <option value="score" className="bg-zinc-900">Sort by Quality Score</option>
                      </select>
                    </div>
                  </div>
                </div>
              </header>

              {/* College Grid/List */}
              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-32 bg-white/[0.02] border border-white/5 rounded-3xl animate-pulse flex items-center px-6">
                       <div className="w-16 h-16 bg-white/5 rounded-2xl" />
                       <div className="ml-6 space-y-3 flex-1">
                          <div className="h-5 w-1/3 bg-white/5 rounded-lg" />
                          <div className="h-3 w-1/4 bg-white/5 rounded-lg" />
                       </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {colleges.map((college, i) => (
                    <CollegeCard key={college.id} college={college} index={i} />
                  ))}
                </div>
              )}

              {/* Data Resources Note */}
              <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Data Transparency</h4>
                  <p className="text-[11px] text-white/30 max-w-sm leading-relaxed">
                    Our rankings are aggregated from the National Institutional Ranking Framework (NIRF), Ministry of Education data portals, and certified college placement reports.
                  </p>
                </div>
                <div className="flex gap-8">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Resources</h4>
                    <ul className="text-[11px] text-white/30 space-y-1">
                      <li>• NIRF Methodology</li>
                      <li>• AISHE Data Portals</li>
                      <li>• University Statutes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}

