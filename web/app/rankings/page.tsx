"use client";

import { 
  GraduationCap, Trophy, ArrowUpDown, ChevronDown, Landmark, 
  Filter, ChevronUp, ChevronRight, Brain, Newspaper, IndianRupee, 
  MapPin, Check, Star, ExternalLink, Search, X, FlaskConical,
  Scale, Palette, Stethoscope, Building2, Leaf, Pill, Info,
  LayoutGrid
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(" ");
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4006";

// ── Helpers ──────────────────────────────────────────────────────────────────
export function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface College {
  id: number;
  college?: string;
  nirf_category?: string;
  state: string;
  city?: string;
  nirf_rank?: number | null;
  avg_package?: number;
  highest_package?: number;
  innovation_score?: number;
  website?: string;
  patents?: number;
  research_papers?: number;
}

// ── Category config ───────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "All",         label: "All",         icon: Trophy       },
  { id: "Engineering", label: "Engineering", icon: Building2    },
  { id: "Management",  label: "Management",  icon: ArrowUpDown  },
  { id: "Medical",     label: "Medical",     icon: Stethoscope  },
  { id: "Law",         label: "Law",         icon: Scale        },
  { id: "Research",    label: "Research",    icon: FlaskConical },
  { id: "Design",      label: "Design",      icon: Palette      },
  { id: "Pharmacy",    label: "Pharmacy",    icon: Pill         },
  { id: "Agriculture", label: "Agriculture", icon: Leaf         },
  { id: "University",  label: "University",  icon: GraduationCap},
];

const sortOptions = [
  { label: "NIRF Rank", value: "nirf_rank" },
  { label: "Avg Package", value: "avg_package" },
  { label: "Innovation Score", value: "innovation_score" }
];

// ── Sub-components ────────────────────────────────────────────────────────────
function FilterSection({ title, options, selected, onChange, icon, singleSelect }: any) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="py-6 border-b border-white/5 last:border-0">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between mb-4 group">
        <div className="flex items-center gap-3">
          {icon}
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/60 group-hover:text-blue-400 transition-colors">{title}</span>
        </div>
        <ChevronRight size={14} className={cn("text-white/20 transition-transform", isOpen && "rotate-90")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5 pl-6">
              {options.map((opt: any) => {
                const label = typeof opt === "string" ? opt : (opt.label || opt.name);
                const value = typeof opt === "string" ? opt : (opt.value || opt.label || opt.name);
                const isSelected = selected.includes(value);

                return (
                  <button
                    key={value}
                    onClick={() => singleSelect ? (isSelected ? null : onChange(value)) : onChange(value)}
                    className={cn(
                      "w-full flex items-center justify-between group py-1.5 transition-all rounded-lg px-2 -mx-2",
                      isSelected ? "bg-white/[0.05]" : "hover:bg-blue-500/10"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-3.5 h-3.5 rounded transition-all flex items-center justify-center border",
                        isSelected ? "bg-white border-white" : "border-white/10 group-hover:border-white/30",
                        singleSelect && "rounded-full"
                      )}>
                        {isSelected && !singleSelect && <Check size={10} className="text-black" />}
                        {isSelected && singleSelect && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                      </div>
                      <span className={cn(
                        "text-[11px] font-medium transition-colors",
                        isSelected ? "text-white" : "text-white/30 group-hover:text-blue-400"
                      )}>{label}</span>
                    </div>
                    {opt.count > 0 && (
                      <span className="text-[9px] font-black text-white/10">{opt.count}</span>
                    )}
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

// Category gradient colours — shown as colour overlay on the campus image
const CATEGORY_COLORS: Record<string, string> = {
  Engineering:  "from-zinc-950/80 via-zinc-900/40 to-transparent",
  Management:   "from-amber-950/80 via-amber-900/40 to-transparent",
  Medical:      "from-emerald-950/80 via-emerald-900/40 to-transparent",
  Law:          "from-purple-950/80 via-purple-900/40 to-transparent",
  Research:     "from-cyan-950/80 via-cyan-900/40 to-transparent",
  Design:       "from-rose-950/80 via-rose-900/40 to-transparent",
  Pharmacy:     "from-teal-950/80 via-teal-900/40 to-transparent",
  Agriculture:  "from-lime-950/80 via-lime-900/40 to-transparent",
  University:   "from-indigo-950/80 via-indigo-900/40 to-transparent",
};

// Deterministic image seed from college name so each college always
// gets the same picsum campus photo (architecture/landscape images).
function imgSeed(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h) % 900 + 100; // keeps us in a good range
}

import { useShortlist } from "../context/ShortlistContext";
import { Bookmark } from "lucide-react";

function CollegeRow({ college, index }: { college: any; index: number }) {
  const slug = toSlug(college.college ?? "");
  const { addToShortlist, removeFromShortlist, isInShortlist } = useShortlist();
  const isSaved = isInShortlist(college.id);

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();  
    if (isSaved) {
      removeFromShortlist(college.id);
    } else {
      addToShortlist(college);
    }
  };

  const isTop3 = (college.nirf_rank ?? 999) <= 3;
  const lastUpdated = college.last_updated ? new Date(college.last_updated).toLocaleDateString() : "Never";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.4) }}
      className="relative group"
    >
      <Link href={`/colleges/${slug}`}
        className="flex items-center gap-4 sm:gap-8 py-6 border-b border-white/5 hover:bg-white/[0.02] transition-all">
        
        {/* ── Rank Number ── */}
        <div className="flex w-12 flex-col items-center justify-center shrink-0">
          <span className={cn(
            "text-xl font-serif font-black",
            isTop3 ? "text-white" : "text-white/20"
          )}>
            {college.nirf_rank ? college.nirf_rank : "—"}
          </span>
          <span className="text-[8px] font-black uppercase tracking-tighter text-white/10">Rank</span>
        </div>

        {/* ── Info ── */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm sm:text-lg font-serif font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                  {college.college}
                </h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-white/30">
                  <MapPin size={12} className="shrink-0" />
                  <span className="text-[10px] sm:text-[11px] font-medium truncate">{college.city}, {college.state}</span>
                </div>
                <span className="text-[9px] text-white/10 font-black uppercase tracking-widest">
                  Updated: {lastUpdated}
                </span>
              </div>
            </div>

            {/* Stats - Desktop Only */}
            <div className="hidden md:flex items-center gap-12 shrink-0">
              {college.avg_package != null && (
                <div className="text-right min-w-[80px]">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">Avg Package</p>
                  <p className="text-sm font-bold text-white">
                    ₹{college.avg_package}L
                  </p>
                </div>
              )}
              {college.innovation_score != null && (
                <div className="text-right min-w-[80px]">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">Innovation</p>
                  <p className="text-sm font-bold text-white flex items-center justify-end gap-1">
                    <Star size={12} className="fill-white/40 text-white/40" />{college.innovation_score}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={toggleSave}
                className={cn(
                  "p-2.5 rounded-xl transition-all border",
                  isSaved 
                    ? "bg-amber-500/10 border-amber-500/50 text-amber-500" 
                    : "bg-white/5 border-white/5 text-white/20 hover:text-amber-400 hover:border-amber-400/30"
                )}
              >
                <Bookmark size={16} className={cn(isSaved && "fill-amber-500")} />
              </button>
              <ChevronRight size={18} className="text-white/10 group-hover:text-blue-400 transition-all group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function RankingsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-[#050505] text-white items-center justify-center font-serif text-2xl italic animate-pulse">
        Initializing Intelligence...
      </div>
    }>
      <RankingsContent />
    </Suspense>
  );
}

function RankingsContent() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [filterOptions, setFilterOptions] = useState<{ states: any[] }>({ states: [] });
  const searchParams = useSearchParams();
  
  // Initialize states directly from URL search params
  const [selectedStates, setSelectedStates] = useState<string[]>(() => {
    const s = searchParams.get("state");
    return s ? [s] : [];
  });
  const [selectedCities, setSelectedCities] = useState<string[]>(() => {
    const c = searchParams.get("city");
    return c ? [c] : [];
  });

  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("nirf_rank");
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    const s = searchParams.get("state");
    const c = searchParams.get("city");
    if (s) setSelectedStates([s]);
    else setSelectedStates([]);
    
    if (c) setSelectedCities([c]);
    else setSelectedCities([]);
  }, [searchParams]);

  useEffect(() => {
    // Open hubs by default only on desktop
    if (window.innerWidth >= 1024) {
      setIsNewsOpen(true);
      setIsFiltersOpen(true);
    }
  }, []);

  const fetchFilters = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/rankings/filters`);
      const data = await res.json();
      setFilterOptions({ states: data.states || [] });
    } catch (err) { console.error(err); }
  }, []);

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      selectedStates.forEach(s => params.append("state", s));
      selectedCities.forEach(c => params.append("city", c));
      if (activeCategory !== "All") params.append("category", activeCategory);
      params.append("sort", sortBy);
      params.append("limit", "100");
      const res = await fetch(`${API_URL}/rankings?${params}`);
      const data = await res.json();
      setColleges(data.colleges || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [selectedStates, selectedCities, activeCategory, sortBy]);

  const fetchNews = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/news?limit=10`);
      const data = await res.json();
      // API returns 'articles' field
      setNews(data.articles || []);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchFilters(); }, [fetchFilters]);
  useEffect(() => { fetchRankings(); }, [fetchRankings]);
  useEffect(() => { fetchNews(); }, [fetchNews]);

  // Client-side search filter
  const visible = search.trim()
    ? colleges.filter(c => (c.college ?? "").toLowerCase().includes(search.toLowerCase()))
    : colleges;

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex w-16 border-r border-white/5 flex-col items-center py-6 gap-6 z-[100] bg-[#0a0a0a]">
        <Link href="/" className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-xl shadow-white/5">
          <GraduationCap className="text-black w-5 h-5" />
        </Link>
        <div className="flex flex-col gap-4">
          {[
            { icon: Brain, href: "/chat", label: "Chat" },
            { icon: Bookmark, href: "/shortlist", label: "Saved Colleges" },
            { icon: LayoutGrid, href: "/tools", label: "Tools" },
          ].map((item: any) => (
            <Link key={item.label} href={item.href} title={item.label} className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
              item.active ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.15)]" : "text-zinc-600 hover:text-blue-400 hover:bg-blue-500/10"
            )}>
              <item.icon size={18} />
            </Link>
          ))}
        </div>
      </aside>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-lg border-t border-white/5 flex items-center justify-around z-[200] px-6">
        {[
          { icon: GraduationCap, href: "/" },
          { icon: Brain, href: "/chat" },
          { icon: Bookmark, href: "/shortlist" },
          { icon: LayoutGrid, href: "/tools" },
        ].map((item: any, i) => (
          <Link key={i} href={item.href} className={cn("p-3 rounded-xl transition-all", item.active ? "bg-white text-black" : "text-zinc-600 hover:text-blue-400")}>
            <item.icon size={20} />
          </Link>
        ))}
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* ── Floating Filters Hub ── */}
        <AnimatePresence>
          {isFiltersOpen && (
            <>
              {/* Mobile Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsFiltersOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] lg:hidden"
              />
              <motion.aside 
                initial={{ x: -450, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -450, opacity: 0 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className={cn(
                  "fixed top-1/2 -translate-y-1/2 z-[300] flex flex-col shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500",
                  "left-0 w-[60vw] h-full rounded-none bg-zinc-950 top-0 translate-y-0", // Mobile: 60% width
                  "lg:left-24 lg:w-[320px] lg:max-h-[70vh] lg:bg-zinc-950/90 lg:backdrop-blur-3xl lg:border lg:border-white/10 lg:rounded-[2.5rem] lg:top-1/2 lg:-translate-y-1/2" // Desktop
                )}
              >
                <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center">
                      <Filter size={16} className="text-black" />
                    </div>
                    <div>
                      <h2 className="text-[10px] font-black uppercase tracking-[0.15em] text-white">Filters</h2>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsFiltersOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all group"
                  >
                    <X size={14} className="text-white/40 group-hover:text-blue-400 transition-colors" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                <FilterSection
                  title="Performance Metric"
                  options={sortOptions}
                  selected={[sortBy]}
                  onChange={(s: string) => { setSortBy(s); setIsFiltersOpen(false); }}
                  icon={<ArrowUpDown size={13} className="text-white/40" />}
                  singleSelect
                />
                <FilterSection
                  title="Academic Stream"
                  options={CATEGORIES.map(c => ({ label: c.id, count: 0 }))}
                  selected={[activeCategory]}
                  onChange={(s: string) => { setActiveCategory(s); setIsFiltersOpen(false); }}
                  icon={<GraduationCap size={13} className="text-white/40" />}
                  singleSelect
                />
                <FilterSection
                  title="Location"
                  options={filterOptions.states}
                  selected={selectedStates}
                  onChange={(s: string) => setSelectedStates(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                  icon={<Landmark size={13} className="text-white/40" />}
                />
              </div>

              <div className="p-4 border-t border-white/5 bg-white/[0.01]">
                <button 
                  onClick={() => { setSelectedStates([]); setActiveCategory("All"); setIsFiltersOpen(false); }}
                  className="w-full py-3 border border-white/10 hover:bg-blue-500/10 text-white/40 hover:text-blue-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl transition-all"
                >
                  Reset All
                </button>
              </div>
            </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* Header */}
          <header className="px-8 py-6 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsFiltersOpen(true)}
                className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all mr-2 group"
              >
                <Filter size={18} className="text-white/40 group-hover:text-blue-400 transition-colors" />
              </button>
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
                <GraduationCap className="text-black w-4 h-4" />
              </div>
              <span className="text-lg font-serif font-bold tracking-tight">
                Academia<span className="text-white/40">Rankings</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] hidden sm:block">
                {colleges.length} Institutions Found
              </div>
              <button 
                onClick={() => setIsNewsOpen(!isNewsOpen)}
                className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group"
              >
                <Newspaper size={14} className="text-white/40 group-hover:text-blue-400 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Live News</span>
              </button>
            </div>
          </header>

          <div className={cn(
            "flex-1 overflow-y-auto custom-scrollbar pb-24 md:pb-8 transition-all duration-700 ease-in-out",
            isFiltersOpen ? "lg:pl-[380px]" : "pl-0",
            isNewsOpen ? "lg:pr-[420px]" : "pr-0"
          )}>
            <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">

              {/* Hero */}
              <div className="mb-8">
                <p className="text-white/30 text-[9px] uppercase tracking-[0.25em] mb-2 font-black">NIRF 2025 · Ministry of Education</p>
                <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-white leading-tight mb-6">
                  Top <span className="text-white/30 italic">Institutions</span>
                </h1>

                {/* Search */}
                <div className="relative mb-6">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search colleges..."
                    className="w-full bg-white/[0.03] border border-white/10 focus:border-white/30 rounded-2xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-all"
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-blue-400">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Results count */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-[11px] text-white/30 font-medium">
                  {loading ? "Loading..." : `${visible.length} institution${visible.length !== 1 ? "s" : ""}`}
                  {activeCategory !== "All" && ` in ${activeCategory}`}
                  {search && ` matching "${search}"`}
                </span>
                {(selectedStates.length > 0 || selectedCities.length > 0) && (
                  <button onClick={() => { setSelectedStates([]); setSelectedCities([]); }} className="text-[10px] text-white/40 hover:text-blue-400 flex items-center gap-1">
                    <X size={11} /> Clear location
                  </button>
                )}
              </div>

              {/* College List */}
              {loading ? (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-24 sm:h-32 bg-white/[0.02] border border-white/5 rounded-3xl animate-pulse" />
                  ))}
                </div>
              ) : visible.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto">
                    <Search size={24} className="text-white/20" />
                  </div>
                  <p className="text-white/30 text-sm">No colleges found</p>
                  <button onClick={() => { setSearch(""); setActiveCategory("All"); setSelectedStates([]); setSelectedCities([]); }}
                    className="text-xs text-white/40 hover:text-blue-400 underline">Clear all filters</button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {visible.map((college, i) => (
                    <CollegeRow key={(college as any).id ?? college.college} college={college} index={i} />
                  ))}
                </div>
              )}

              <div className="mt-20 pt-16 border-t border-white/5 space-y-12 pb-16">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                    <Info size={14} className="text-white/40" />
                  </div>
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Intelligence Methodology</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Data Intelligence</p>
                    </div>
                    <p className="text-sm text-white/40 leading-relaxed font-medium">
                      Our institutional data is aggregated from the latest <span className="text-white/70">Ministry of Education (NIRF 2025)</span> reports, QS World Rankings, and verified campus audits. We prioritize accuracy by cross-referencing placement statistics and research outputs with official institutional disclosures.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Platform Scope</p>
                    </div>
                    <p className="text-sm text-white/40 leading-relaxed font-medium">
                      We currently track <span className="text-white/70">100+ premier institutions</span> across India, providing <span className="text-white/70">real-time AI insights</span> into courses, placements, and scholarship opportunities. This dashboard serves as a dynamic intelligence map of the Indian academic landscape.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* ── Floating News Hub ── */}
        <AnimatePresence>
          {(isNewsOpen && typeof window !== 'undefined' && window.innerWidth >= 1024) && (
            <>
              <motion.aside 
                initial={{ x: 450, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 450, opacity: 0 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className={cn(
                  "fixed top-1/2 -translate-y-1/2 z-[300] flex flex-col shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500",
                  "hidden lg:flex lg:right-6 lg:w-[380px] lg:max-h-[70vh] lg:bg-zinc-950/90 lg:backdrop-blur-3xl lg:border lg:border-white/10 lg:rounded-[2.5rem] lg:top-1/2 lg:-translate-y-1/2"
                )}
              >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center">
                    <Newspaper size={18} className="text-black" />
                  </div>
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-[0.15em] text-white">Live Intelligence</h2>
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-0.5">Real-time Feed</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsNewsOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all group"
                >
                  <X size={16} className="text-white/40 group-hover:text-blue-400 transition-colors" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
                {news.length === 0 ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="space-y-3 animate-pulse">
                      <div className="h-3 w-1/3 bg-white/5 rounded" />
                      <div className="h-5 w-full bg-white/5 rounded" />
                      <div className="h-32 w-full bg-white/5 rounded-2xl" />
                    </div>
                  ))
                ) : (
                  news.map((item, i) => {
                    const dateObj = new Date(item.published_at || item.created_at);
                    const formattedDate = isNaN(dateObj.getTime()) ? "Just Now" : dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                    
                    return (
                      <a 
                        key={i} 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="group block"
                      >
                        <article className="cursor-pointer">
                          <div className="flex items-center gap-2.5 mb-3">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/60 px-2 py-0.5 bg-white/5 rounded-md border border-white/10">
                              {item.category || "General"}
                            </span>
                            <span className="text-[9px] text-white/20 font-black uppercase tracking-[0.15em]">
                              {formattedDate}
                            </span>
                          </div>
                          
                          <h3 className="text-sm font-bold text-white/90 group-hover:text-blue-400 transition-colors leading-relaxed mb-4">
                            {item.title}
                          </h3>

                          <div className="flex items-center justify-between opacity-50 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div className="w-4 h-4 rounded bg-white/5 flex items-center justify-center shrink-0">
                                <span className="text-[7px] font-black text-white/40">{item.source?.[0] || 'A'}</span>
                              </div>
                              <p className="text-[9px] text-white/40 font-black uppercase tracking-widest truncate">
                                {item.source}
                              </p>
                            </div>
                            <ExternalLink size={12} className="text-white/20 group-hover:text-blue-400 transition-all" />
                          </div>
                          
                          <div className="h-px w-full bg-white/5 mt-6 group-last:hidden" />
                        </article>
                      </a>
                    );
                  })
                )}
              </div>

              <div className="p-4 border-t border-white/5 bg-white/[0.01]">
                <Link 
                  href="/news"
                  className="w-full py-3 bg-white hover:bg-blue-500 text-black hover:text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  Full Hub <ChevronRight size={14} />
                </Link>
              </div>
            </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }
      `}</style>
    </div>
  );
}
