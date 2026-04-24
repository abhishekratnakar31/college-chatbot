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
  Newspaper
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

interface College {
  id: number;
  name: string;
  category: string;
  state: string;
  rank_2024: number;
  score: number;
  avg_package?: number;
  innovation_score?: number;
}

interface FilterOption {
  name: string;
  count: number;
}

function FilterSection({ 
  title, 
  options, 
  selected, 
  onChange, 
  icon 
}: { 
  title: string; 
  options: FilterOption[]; 
  selected: string[]; 
  onChange: (val: string) => void;
  icon?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [search, setSearch] = useState("");

  const filtered = (options || []).filter(opt => opt.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="border-b border-zinc-100 py-6 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between group mb-4"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-black uppercase tracking-widest text-zinc-400 group-hover:text-black transition-colors">{title}</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-zinc-600" /> : <ChevronDown className="w-4 h-4 text-zinc-600" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-700" />
              <input 
                type="text"
                placeholder={`Search ${title.toLowerCase()}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg py-2 pl-9 pr-4 text-xs text-zinc-800 focus:outline-none focus:border-blue-500 placeholder:text-zinc-300"
              />
            </div>
            
            <div className="max-h-60 overflow-y-auto pr-2 space-y-1.5 custom-scrollbar">
              {filtered.map(opt => (
                <label 
                  key={opt.name}
                  className="flex items-center gap-3 group cursor-pointer py-1"
                >
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox"
                      checked={selected.includes(opt.name)}
                      onChange={() => onChange(opt.name)}
                      className="peer h-4 w-4 appearance-none rounded border border-zinc-800 bg-zinc-900 checked:bg-white checked:border-white transition-all cursor-pointer"
                    />
                    <X className="absolute h-3 w-3 text-black opacity-0 peer-checked:opacity-100 left-0.5 pointer-events-none transition-opacity" />
                  </div>
                  <span className={cn(
                    "text-xs transition-colors",
                    selected.includes(opt.name) ? "text-black font-bold" : "text-zinc-500 group-hover:text-zinc-800"
                  )}>
                    {opt.name}
                  </span>
                  <span className="ml-auto text-[10px] font-medium text-zinc-700">({opt.count})</span>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RankingsPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [filterOptions, setFilterOptions] = useState<{ categories: FilterOption[], states: FilterOption[] }>({ categories: [], states: [] });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("rank_2024");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      selectedCategories.forEach(c => params.append("category", c));
      selectedStates.forEach(s => params.append("state", s));
      params.append("sort", sortBy); // Updated key to match backend 'sort'

      const res = await fetch(`${API_URL}/rankings?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setColleges(data.colleges ?? []); // Fixed: data.colleges instead of data
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedCategories, selectedStates, sortBy]);

  const fetchFilters = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/rankings/filters`);
      const data = await res.json();
      setFilterOptions(data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchRankings();
    fetchFilters();
  }, [fetchRankings, fetchFilters]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const toggleState = (state: string) => {
    setSelectedStates(prev => prev.includes(state) ? prev.filter(s => s !== state) : [...prev, state]);
  };

  return (
    <div className="flex h-screen bg-white text-black font-sans selection:bg-blue-50 overflow-hidden">
      
      {/* Sidebar */}
      <aside className="flex-shrink-0 w-14 h-full bg-white border-r border-zinc-100 flex flex-col items-center py-4 gap-1 z-50">
        <Link href="/" className="w-9 h-9 bg-white rounded-xl flex items-center justify-center mb-4 hover:scale-105 transition-transform shadow shadow-white/10">
          <GraduationCap className="text-black w-5 h-5" />
        </Link>
        <div className="w-6 h-px bg-zinc-900 mb-2" />
        <Link href="/chat" className="group relative w-10 h-10 flex items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-50 hover:text-black transition-all">
          <Brain className="w-5 h-5" />
        </Link>
        <Link href="/news" className="group relative w-10 h-10 flex items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-50 hover:text-black transition-all">
          <Newspaper className="w-5 h-5" />
        </Link>
        <Link href="/rankings" className="group relative w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all">
          <Trophy className="w-5 h-5" />
        </Link>
      </aside>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Filter Sidebar */}
        <div className="w-72 flex-shrink-0 border-r border-zinc-100 bg-white overflow-y-auto hidden lg:block">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <Filter className="w-3.5 h-3.5" /> Filters
              </h2>
              {(selectedCategories.length > 0 || selectedStates.length > 0) && (
                <button onClick={() => { setSelectedCategories([]); setSelectedStates([]); }} className="text-[10px] font-black uppercase text-zinc-400 hover:text-black transition-colors">Clear All</button>
              )}
            </div>

            <FilterSection 
              title="Location" 
              options={filterOptions.states} 
              selected={selectedStates} 
              onChange={toggleState} 
              icon={<Landmark className="w-3.5 h-3.5" />}
            />

            <FilterSection 
              title="Specialization" 
              options={filterOptions.categories} 
              selected={selectedCategories} 
              onChange={toggleCategory} 
              icon={<Microscope className="w-3.5 h-3.5" />}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <main className="p-10 lg:p-16 max-w-7xl mx-auto">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Institutional Analytics</span>
                </div>
                <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none text-black">Top <span className="text-zinc-200">Institutions</span></h1>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 px-4 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center gap-3">
                  <ArrowUpDown className="w-3.5 h-3.5 text-zinc-700" />
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-xs font-bold text-zinc-400 focus:outline-none appearance-none cursor-pointer pr-4"
                  >
                    <option value="nirf_rank">NIRF Rank</option>
                    <option value="score">Quality Score</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Chips */}
            {(selectedCategories.length > 0 || selectedStates.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-10">
                {selectedStates.map(s => (
                  <button key={s} onClick={() => toggleState(s)} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-bold text-zinc-400 hover:text-white hover:border-zinc-700 transition-all">
                    {s} <X className="w-3 h-3 text-zinc-700" />
                  </button>
                ))}
                {selectedCategories.map(c => (
                  <button key={c} onClick={() => toggleCategory(c)} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-bold text-zinc-400 hover:text-white hover:border-zinc-700 transition-all">
                    {c} <X className="w-3 h-3 text-zinc-700" />
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-zinc-50 border border-zinc-100 rounded-[2rem] animate-pulse" />)}
              </div>
            ) : colleges.length === 0 ? (
              <div className="py-20 text-center">
                <Building2 className="w-12 h-12 text-zinc-900 mx-auto mb-4" />
                <p className="text-zinc-500 font-bold">No institutions found matching these filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {colleges.map((college, idx) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      key={college.id}
                      className="group bg-white border border-zinc-100 p-6 rounded-3xl hover:bg-zinc-50 hover:border-blue-100 transition-all duration-300 flex flex-col md:flex-row items-center gap-6 relative"
                    >
                      {/* Left: Rank & Logo */}
                      <div className="flex items-center gap-6 flex-shrink-0">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform shadow-xl shadow-white/5">
                          <Building2 className="text-blue-600 w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">NIRF Rank</span>
                          <span className="text-2xl font-black text-black italic">#{college.rank_2024 || college.nirf_rank || "--"}</span>
                        </div>
                      </div>

                      {/* Middle: Name & Info */}
                      <div className="flex-grow min-w-0">
                        <h3 className="text-lg font-bold text-zinc-800 mb-1 group-hover:text-black transition-colors truncate">
                          {college.name || college.college}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-[9px] font-black uppercase text-zinc-400 border border-zinc-100 px-2 py-0.5 rounded-full">
                            {college.category || college.nirf_category}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-700 uppercase tracking-tight">
                            <Landmark className="w-3 h-3" />
                            {college.state}
                          </div>
                        </div>
                      </div>

                      {/* Right: Key Stats */}
                      <div className="flex items-center gap-8 md:gap-12 flex-shrink-0 w-full md:w-auto pt-4 md:pt-0 border-t md:border-0 border-zinc-100">
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-1">Quality Score</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, Number(college.score || college.innovation_score || 0))}%` }} />
                            </div>
                            <span className="text-xs font-black text-zinc-800 italic">{college.score || college.innovation_score || "--"}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end min-w-[80px]">
                          <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-1">Avg. Package</span>
                          <span className="text-sm font-black text-zinc-800 italic">₹{college.avg_package || "12.5"}L</span>
                        </div>

                        <button className="h-10 w-10 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center hover:bg-black hover:text-white transition-all group/btn">
                          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                        </button>
                      </div>

                      {/* Decorative gradient */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </main>

          <footer className="mt-20 bg-zinc-50 py-20 border-t border-zinc-100">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                  <GraduationCap className="text-white w-6 h-6" />
                </div>
                <span className="text-xl font-black tracking-tighter">CAMPUSAI</span>
              </div>
              <p className="text-zinc-800 text-[10px] font-black uppercase tracking-[0.3em]">© 2024 CAMPUSAI INTELLIGENCE SYSTEMS</p>
            </div>
          </footer>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f4f4f5; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #27272a; }
      `}</style>
    </div>
  );
}
