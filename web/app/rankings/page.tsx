"use client";

import { 
  GraduationCap, 
  Trophy, 
  FlaskConical, 
  ArrowUpDown, 
  GitCompare, 
  ChevronDown, 
  Star, 
  Microscope, 
  Landmark, 
  Search, 
  Filter, 
  ChevronUp, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  AlertCircle,
  Building2,
  Brain,
  Newspaper,
  Calendar,
  IndianRupee
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(" ");
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4005";

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
}

function FilterSection({ title, options, selected, onChange, icon }: any) {
  const [isOpen, setIsOpen] = useState(true);
  const [search, setSearch] = useState("");
  const filtered = (options || []).filter((opt: any) => opt.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="border-b border-zinc-900 py-8 last:border-0">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between group mb-6">
        <div className="flex items-center gap-3">
          {icon}
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 group-hover:text-white transition-colors">{title}</span>
        </div>
        {isOpen ? <ChevronUp size={14} className="text-zinc-800" /> : <ChevronDown size={14} className="text-zinc-800" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
              <input 
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-900 rounded-xl py-2.5 pl-9 pr-4 text-[11px] text-white focus:outline-none focus:border-zinc-700 placeholder:text-zinc-700 transition-all"
              />
            </div>
            <div className="max-h-60 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
              {filtered.map((opt: any) => (
                <label key={opt.name} className="flex items-center gap-3 group cursor-pointer py-1.5 px-2 rounded-lg hover:bg-zinc-900 transition-all">
                  <input 
                    type="checkbox"
                    checked={selected.includes(opt.name)}
                    onChange={() => onChange(opt.name)}
                    className="w-4 h-4 rounded border-zinc-800 bg-black text-white focus:ring-0 cursor-pointer transition-all"
                  />
                  <span className={cn("text-[11px] font-medium transition-colors", selected.includes(opt.name) ? "text-white font-bold" : "text-zinc-500 group-hover:text-white")}>
                    {opt.name}
                  </span>
                  <span className="ml-auto text-[9px] font-black text-zinc-800">{opt.count}</span>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CollegeCard({ college, index }: { college: College; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="group bg-zinc-900/40 border border-zinc-900 p-8 rounded-[2.5rem] hover:bg-zinc-900 transition-all duration-500 relative flex flex-col md:flex-row items-center gap-10"
    >
      <div className="flex items-center gap-8 flex-shrink-0">
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em] mb-2">Rank</span>
          <span className="text-4xl font-serif font-bold text-white italic leading-none">
            #{college.rank_2024 || college.nirf_rank || "--"}
          </span>
        </div>
        <div className="w-px h-12 bg-zinc-800" />
      </div>

      <div className="flex-grow min-w-0 space-y-3">
        <h3 className="text-xl md:text-2xl font-serif font-bold text-white group-hover:text-zinc-200 transition-colors leading-tight">
          {college.name || college.college}
        </h3>
        <div className="flex flex-wrap items-center gap-4">
          <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border border-zinc-800 text-zinc-500 bg-black">
            {college.category || college.nirf_category}
          </span>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600">
            <Landmark size={14} />
            {college.state}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-12 flex-shrink-0 w-full md:w-auto pt-8 md:pt-0 border-t md:border-0 border-zinc-800">
        <div className="flex flex-col items-end gap-2">
          <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em]">Quality Score</span>
          <div className="flex items-center gap-4">
            <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Number(college.score || college.innovation_score || 0))}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-white" 
              />
            </div>
            <span className="text-xs font-black text-white">{college.score || college.innovation_score || "--"}</span>
          </div>
        </div>
 
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em] mb-1">Avg Package</span>
          <span className="text-lg font-black text-white italic">₹{college.avg_package || "12.5"}L</span>
        </div>
 
        <button className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center hover:scale-105 transition-transform shadow-xl shadow-white/10">
          <ChevronRight size={20} />
        </button>
      </div>
    </motion.div>
  );
}

export default function RankingsPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [filterOptions, setFilterOptions] = useState({ categories: [], states: [] });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("rank_2024");
  const [loading, setLoading] = useState(true);

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      selectedCategories.forEach(c => params.append("category", c));
      selectedStates.forEach(s => params.append("state", s));
      params.append("sort", sortBy);
      const res = await fetch(`${API_URL}/rankings?${params}`);
      const data = await res.json();
      setColleges(data.colleges || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [selectedCategories, selectedStates, sortBy]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const state = params.get("state");
    if (state) setSelectedStates([state]);
  }, []);

  useEffect(() => { fetchRankings(); }, [fetchRankings]);

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden">
      
      <aside className="w-20 border-r border-zinc-900 flex flex-col items-center py-8 gap-8 z-[100] bg-black">
        <Link href="/" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform">
          <GraduationCap className="text-black w-6 h-6" />
        </Link>
        <div className="flex flex-col gap-4">
          {[
            { icon: Brain, href: "/chat", label: "Chat" },
            { icon: Newspaper, href: "/news", label: "News" },
            { icon: Trophy, href: "/rankings", label: "Rankings", active: true },
          ].map((item) => (
            <Link key={item.label} href={item.href} className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all", item.active ? "bg-white text-black shadow-xl shadow-white/10" : "text-zinc-600 hover:text-white hover:bg-zinc-900")}>
              <item.icon size={20} />
            </Link>
          ))}
        </div>
      </aside>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 flex-shrink-0 border-r border-zinc-900/50 bg-black overflow-y-auto hidden xl:block p-10">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 mb-10 flex items-center gap-3">
            <Filter size={14} /> Analytics Filters
          </h2>
          <FilterSection title="Location" options={filterOptions.states} selected={selectedStates} onChange={(s: any) => setSelectedStates(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} icon={<Landmark size={14} className="text-zinc-700" />} />
          <FilterSection title="Specialization" options={filterOptions.categories} selected={selectedCategories} onChange={(c: any) => setSelectedCategories(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])} icon={<Microscope size={14} className="text-zinc-700" />} />
        </div>

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#0a0a0a]">
          <div className="max-w-5xl mx-auto px-12 py-20">
            <header className="mb-24 space-y-8">
              <h1 className="text-6xl md:text-7xl font-serif font-bold tracking-tight text-white">
                Top <span className="text-zinc-800 italic">Institutions</span>
              </h1>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <p className="text-zinc-500 text-lg font-medium max-w-md leading-relaxed">
                  Data-driven rankings based on academic excellence and placement metrics.
                </p>
                <div className="h-14 px-6 bg-zinc-900/30 border-2 border-zinc-900 rounded-2xl flex items-center gap-4">
                  <ArrowUpDown size={18} className="text-zinc-700" />
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-xs font-black uppercase tracking-widest text-zinc-500 focus:outline-none appearance-none cursor-pointer pr-4"
                  >
                    <option value="nirf_rank" className="bg-black">NIRF Rank</option>
                    <option value="score" className="bg-black">Quality Score</option>
                  </select>
                </div>
              </div>
            </header>

            {loading ? (
              <div className="space-y-8">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-zinc-900/20 rounded-[2.5rem] animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-6">
                {colleges.map((college, i) => (
                  <CollegeCard key={college.id} college={college} index={i} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #18181b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #fff; }
      `}</style>
    </div>
  );
}
