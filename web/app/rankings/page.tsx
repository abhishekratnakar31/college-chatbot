"use client";

import {
  GraduationCap,
  Trophy,
  ArrowUpDown,
  ChevronDown,
  Landmark,
  Filter,
  ChevronUp,
  ChevronRight,
  Brain,
  Newspaper,
  IndianRupee,
  MapPin,
  Check,
  Star,
  ExternalLink,
  Search,
  X,
  FlaskConical,
  Scale,
  Palette,
  Stethoscope,
  Building2,
  Leaf,
  Pill,
  Info,
  LayoutGrid,
  Bookmark,
  ChevronLeft,
  Sliders,
  Lock,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useState, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useShortlist } from "../context/ShortlistContext";

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(" ");
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4006";

// ── Helpers ──────────────────────────────────────────────────────────────────
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
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
  { id: "All", label: "All", icon: Trophy },
  { id: "Engineering", label: "Engineering", icon: Building2 },
  { id: "Management", label: "Management", icon: ArrowUpDown },
  { id: "Medical", label: "Medical", icon: Stethoscope },
  { id: "Law", label: "Law", icon: Scale },
  { id: "Research", label: "Research", icon: FlaskConical },
  { id: "Design", label: "Design", icon: Palette },
  { id: "Pharmacy", label: "Pharmacy", icon: Pill },
  { id: "Agriculture", label: "Agriculture", icon: Leaf },
  { id: "University", label: "University", icon: GraduationCap },
];

const sortOptions = [
  { label: "NIRF Rank", value: "nirf_rank" },
  { label: "Avg Package", value: "avg_package" },
  { label: "Innovation Score", value: "innovation_score" },
];

// ── Sub-components ────────────────────────────────────────────────────────────
function FilterSection({
  title,
  options,
  selected,
  onChange,
  icon,
  singleSelect = false,
  isLocked = false,
}: any) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b border-zinc-100 last:border-0 py-4 px-1">
      <button
        onClick={() => !isLocked && setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between group transition-all",
          isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        )}
      >
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">
            {title}
          </span>
          {isLocked && <Lock size={12} className="text-zinc-400" />}
        </div>
        {!isLocked && (
          <ChevronDown
            size={16}
            className={cn(
              "text-zinc-400 transition-transform duration-300",
              isOpen ? "rotate-180" : "rotate-0",
            )}
          />
        )}
      </button>

      <AnimatePresence>
        {isOpen && !isLocked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-1">
              {options.map((opt: any) => {
                const label =
                  typeof opt === "string" ? opt : opt.label || opt.name;
                const value =
                  typeof opt === "string"
                    ? opt
                    : opt.value || opt.label || opt.name;
                const isSelected = selected.includes(value);

                return (
                  <button
                    key={value}
                    onClick={() =>
                      singleSelect
                        ? isSelected
                          ? null
                          : onChange(value)
                        : onChange(value)
                    }
                    className={cn(
                      "w-full flex items-center justify-between py-2 px-3 transition-all duration-200 rounded-lg text-left",
                      isSelected
                        ? "bg-blue-50 text-blue-600 font-bold"
                        : "hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900",
                    )}
                  >
                    <span className="text-[12px]">{label}</span>
                    {isSelected && <Check size={14} />}
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
  Engineering: "from-zinc-950/80 via-zinc-900/40 to-transparent",
  Management: "from-amber-950/80 via-amber-900/40 to-transparent",
  Medical: "from-emerald-950/80 via-emerald-900/40 to-transparent",
  Law: "from-purple-950/80 via-purple-900/40 to-transparent",
  Research: "from-cyan-950/80 via-cyan-900/40 to-transparent",
  Design: "from-rose-950/80 via-rose-900/40 to-transparent",
  Pharmacy: "from-teal-950/80 via-teal-900/40 to-transparent",
  Agriculture: "from-lime-950/80 via-lime-900/40 to-transparent",
  University: "from-indigo-950/80 via-indigo-900/40 to-transparent",
};

// Deterministic image seed from college name so each college always
// gets the same picsum campus photo (architecture/landscape images).
function imgSeed(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++)
    h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return (Math.abs(h) % 900) + 100; // keeps us in a good range
}



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
  const lastUpdated = college.last_updated
    ? new Date(college.last_updated).toLocaleDateString()
    : "Never";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.4) }}
      className="relative group"
    >
      <Link
        href={`/colleges/${slug}`}
        className="flex items-center gap-4 sm:gap-8 py-6 border-b border-white/5 hover:bg-white/[0.02] transition-all"
      >
        {/* ── Rank Number ── */}
        <div className="flex w-12 flex-col items-center justify-center shrink-0">
          <span
            className={cn(
              "text-xl font-serif font-black",
              isTop3 ? "text-white" : "text-white/20",
            )}
          >
            {college.nirf_rank ? college.nirf_rank : "—"}
          </span>
          <span className="text-[8px] font-black uppercase tracking-tighter text-white/10">
            Rank
          </span>
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
                  <span className="text-[10px] sm:text-[11px] font-medium truncate">
                    {college.city}, {college.state}
                  </span>
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
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">
                    Avg Package
                  </p>
                  <p className="text-sm font-bold text-white">
                    ₹{college.avg_package}L
                  </p>
                </div>
              )}
              {college.innovation_score != null && (
                <div className="text-right min-w-[80px]">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">
                    Innovation
                  </p>
                  <p className="text-sm font-bold text-white flex items-center justify-end gap-1">
                    <Star size={12} className="fill-white/40 text-white/40" />
                    {college.innovation_score}
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
                    : "bg-white/5 border-white/5 text-white/20 hover:text-amber-400 hover:border-amber-400/30",
                )}
              >
                <Bookmark
                  size={16}
                  className={cn(isSaved && "fill-amber-500")}
                />
              </button>
              <ChevronRight
                size={18}
                className="text-white/10 group-hover:text-blue-400 transition-all group-hover:translate-x-1"
              />
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
    <Suspense
      fallback={
        <div className="flex h-screen bg-[#050505] text-white items-center justify-center font-serif text-2xl italic animate-pulse">
          Initializing Intelligence...
        </div>
      }
    >
      <RankingsContent />
    </Suspense>
  );
}

function RankingsContent() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [filterOptions, setFilterOptions] = useState<{ states: any[] }>({
    states: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
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


  const fetchFilters = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/rankings/filters`);
      const data = await res.json();
      setFilterOptions({ states: data.states || [] });
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      selectedStates.forEach((s) => params.append("state", s));
      selectedCities.forEach((c) => params.append("city", c));
      if (activeCategory !== "All") params.append("category", activeCategory);
      params.append("sort", sortBy);
      params.append("limit", "100");
      const res = await fetch(`${API_URL}/rankings?${params}`);
      const data = await res.json();
      setColleges(data.colleges || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedStates, selectedCities, activeCategory, sortBy]);

  const fetchNews = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/news?limit=10`);
      const data = await res.json();
      // API returns 'articles' field
      setNews(data.articles || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);
  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStates, selectedCities, activeCategory, sortBy, search]);

  // Client-side search filter
  const visible = search.trim()
    ? colleges.filter((c) =>
        (c.college ?? "").toLowerCase().includes(search.toLowerCase()),
      )
    : colleges;

  const totalPages = Math.ceil(visible.length / ITEMS_PER_PAGE);
  const paginatedItems = visible.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden">
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-[#121212]/90 border border-white/10 rounded-full px-2 py-2 flex items-center gap-1 shadow-2xl backdrop-blur-xl">
        {[
          { icon: GraduationCap, href: "/", label: "Home" },
          { icon: Brain, href: "/chat", label: "Chat" },
          { icon: Bookmark, href: "/shortlist", label: "Saved" },
          { icon: LayoutGrid, href: "/tools", active: true, label: "Apps" },
        ].map((item: any, i) => (
          <Link
            key={i}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300",
              item.active
                ? "bg-white text-black shadow-xl shadow-white/10"
                : "text-zinc-500 hover:text-white",
            )}
          >
            <item.icon size={20} />
            {item.active && (
              <span className="text-[13px] font-bold">{item.label}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* ── Filters Sidebar (QS Style) ── */}
      <AnimatePresence>
        {isFiltersOpen && (
          <>
            {/* Mobile Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFiltersOpen(false)}
              className="fixed inset-0 bg-black/60 z-[250]"
            />
            <motion.aside
              initial={{ x: -450, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -450, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={cn(
                "fixed z-[300] flex flex-col shadow-2xl overflow-hidden transition-all duration-500",
                "left-0 w-full sm:w-[360px] h-full rounded-none bg-white top-0",
              )}
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-zinc-900">
                  Filters ({selectedStates.length + (activeCategory !== "All" ? 1 : 0)})
                </h2>
                <button
                  onClick={() => setIsFiltersOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-all group"
                >
                  <X
                    size={16}
                    className="text-zinc-500 group-hover:text-zinc-900 transition-colors"
                  />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="space-y-1">
                  <FilterSection
                    title="Academic Stream"
                    options={CATEGORIES.map((c) => ({ label: c.id, count: 0 }))}
                    selected={[activeCategory]}
                    onChange={(s: string) => setActiveCategory(s)}
                    singleSelect
                  />
                  <FilterSection
                    title="Location Intelligence"
                    options={filterOptions.states}
                    selected={selectedStates}
                    onChange={(s: string) =>
                      setSelectedStates((prev) =>
                        prev.includes(s)
                          ? prev.filter((x) => x !== s)
                          : [...prev, s],
                      )
                    }
                  />
                </div>
              </div>

              {/* Sidebar Footer (QS Style) */}
              <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex items-center gap-4">
                <button
                  onClick={() => {
                    setSelectedStates([]);
                    setActiveCategory("All");
                  }}
                  className="flex-1 py-3 text-zinc-500 hover:text-zinc-900 text-xs font-bold transition-all"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsFiltersOpen(false)}
                  className="flex-[2] py-3 bg-[#B69CC4] hover:bg-[#A58AB5] text-black text-xs font-black uppercase tracking-widest rounded-lg shadow-lg shadow-purple-500/10 transition-all active:scale-95"
                >
                  Apply Filters
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* ── Breadcrumbs ── */}
        <div className="px-8 pt-8">
          <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
            <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
            <ChevronRight size={10} />
            <Link href="/tools" className="hover:text-blue-400 transition-colors">Tools</Link>
            <ChevronRight size={10} />
            <span className="text-white/40">Intelligence Index 2026</span>
          </div>
        </div>

        <div
          className={cn(
            "flex-1 overflow-y-auto custom-scrollbar pb-24 transition-all duration-700 ease-in-out px-0",
          )}
        >
          {/* ── Hero Section (QS Style) ── */}
          <section className="px-8 py-16 md:py-24 border-b border-white/5 bg-white/[0.01] relative overflow-hidden">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
              <div className="flex-1 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                    <Trophy className="text-black" size={24} />
                  </div>
                  <div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Official 2026 Edition</h2>
                    <p className="text-xs font-bold text-blue-400">Institutional Performance Index</p>
                  </div>
                </div>

                <h1 className="text-4xl md:text-6xl font-serif font-black text-white leading-[1.1] tracking-tight">
                  AcademiaAI Intelligence Index 2026: <br />
                  <span className="text-white/20">Top Indian Institutions.</span>
                </h1>

                <div className="space-y-6 max-w-2xl">
                  <p className="text-lg text-white/40 font-medium leading-relaxed">
                    Discover the top-performing universities across India indexed by our proprietary 
                    Neural Engine. Our 2026 edition evaluates institutional excellence through verified 
                    metrics in academic reputation, employer intelligence, and research output.
                  </p>
                  <p className="text-sm text-white/20 leading-relaxed">
                    Over 100 premier institutions are featured in this edition, providing students 
                    and stakeholders with data-driven insights into the evolving landscape of 
                    higher education. <button className="text-blue-400 hover:underline font-bold">Read more</button>
                  </p>
                </div>
              </div>

              {/* Decorative Badge */}
              <div className="hidden lg:block w-72 h-72 relative shrink-0">
                <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full animate-pulse" />
                <div className="relative z-10 w-full h-full border border-white/10 rounded-[3rem] bg-zinc-950/50 backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-center space-y-4">
                   <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-2">
                     <Brain size={40} className="text-black" />
                   </div>
                   <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Verified by</p>
                     <p className="text-lg font-serif font-bold text-white">Academia Intelligence</p>
                   </div>
                   <div className="pt-4 border-t border-white/5 w-full">
                     <p className="text-[9px] font-black uppercase tracking-widest text-blue-400">2026 Global Edition</p>
                   </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Dashboard Control Bar (The "Head") ── */}
          <div className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 px-8 py-6">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              <div className="flex items-center gap-4">
                {/* View Toggles */}
                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 shrink-0">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-xl shadow-xl transition-all">
                    <LayoutGrid size={14} />
                    <span className="text-[10px] font-black uppercase tracking-wider">Quick View</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-white/40 hover:text-white rounded-xl transition-all">
                    <Search size={14} />
                    <span className="text-[10px] font-black uppercase tracking-wider">Table View</span>
                  </button>
                </div>

                {/* Search Field */}
                <div className="relative flex-1 md:w-64">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                  <input 
                    type="text" 
                    placeholder="Search intelligence..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-[11px] font-bold text-white placeholder:text-white/20 outline-none focus:border-white/30 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-8">
                {/* Results Count */}
                <div className="flex flex-col items-end">
                   <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Current Index</p>
                   <p className="text-2xl font-serif font-black text-white">
                     {visible.length} <span className="text-xs font-bold text-white/30 uppercase ml-1">Results</span>
                   </p>
                </div>

                {/* QS Style Filter Button */}
                <button 
                  onClick={() => setIsFiltersOpen(true)}
                  className="flex items-center gap-4 px-6 py-3 bg-[#B69CC4] hover:bg-[#A58AB5] text-black rounded-xl transition-all shadow-[0_10px_40px_-10px_rgba(182,156,196,0.4)] active:scale-95 group border border-white/10"
                >
                  <Sliders size={18} className="group-hover:rotate-12 transition-transform" strokeWidth={2.5} />
                  <span className="text-sm font-bold tracking-tight">Apply Filters</span>
                  <div className="min-w-[28px] h-7 px-2 rounded-lg bg-white flex items-center justify-center text-xs font-black shadow-inner">
                    {selectedStates.length + (activeCategory !== "All" ? 1 : 0)}
                  </div>
                </button>
              </div>

            </div>

            {/* Meta Info Bar */}
            <div className="max-w-6xl mx-auto flex items-center justify-between mt-6 pt-4 border-t border-white/5">
               <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/20">
                 <span>Published on: <span className="text-white/40 ml-1">14 May 2026</span></span>
               </div>
               
               <div className="flex items-center gap-3">
                 <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Sort by:</span>
                 <select 
                   value={sortBy}
                   onChange={(e) => setSortBy(e.target.value)}
                   className="bg-transparent text-[10px] font-black uppercase tracking-widest text-blue-400 outline-none cursor-pointer hover:text-blue-300 transition-colors"
                 >
                   <option value="nirf_rank">Rank (Low to High)</option>
                   <option value="avg_package">Avg Package</option>
                   <option value="innovation_score">Innovation Score</option>
                 </select>
               </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-8 py-12">
            {/* Active Filter Chips (Simplified for QS Style) */}
            {(selectedStates.length > 0 || activeCategory !== "All") && (
              <div className="mb-10 flex flex-wrap items-center gap-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/20 mr-2">Filters active:</span>
                {activeCategory !== "All" && (
                  <button 
                    onClick={() => setActiveCategory("All")}
                    className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-2 hover:bg-blue-500/20 transition-all"
                  >
                    {activeCategory} <X size={10} />
                  </button>
                )}
                {selectedStates.map(s => (
                  <button 
                    key={s}
                    onClick={() => setSelectedStates(prev => prev.filter(x => x !== s))}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2 hover:bg-white/10 transition-all"
                  >
                    {s} <X size={10} />
                  </button>
                ))}
              </div>
            )}

            {/* College List */}
            {loading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-24 sm:h-32 bg-white/[0.02] border border-white/5 rounded-3xl animate-pulse"
                  />
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto">
                  <Search size={24} className="text-white/20" />
                </div>
                <p className="text-white/30 text-sm">No colleges found</p>
                <button
                  onClick={() => {
                    setSearch("");
                    setActiveCategory("All");
                    setSelectedStates([]);
                    setSelectedCities([]);
                  }}
                  className="text-xs text-white/40 hover:text-blue-400 underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3">
                  {paginatedItems.map((college, i) => (
                    <CollegeRow
                      key={(college as any).id ?? college.college}
                      college={college}
                      index={i}
                    />
                  ))}
                </div>

                {/* Pagination UI */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-4 pb-12">
                    <button
                      onClick={() => {
                        setCurrentPage((p) => Math.max(1, p - 1));
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      disabled={currentPage === 1}
                      className="group p-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-white/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                      <ChevronLeft
                        className="group-hover:-translate-x-1 transition-transform"
                        size={20}
                      />
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (p) =>
                            p === 1 ||
                            p === totalPages ||
                            Math.abs(p - currentPage) <= 1,
                        )
                        .map((p, i, arr) => (
                          <React.Fragment key={p}>
                            {i > 0 && arr[i - 1] !== p - 1 && (
                              <span className="text-white/10 font-black px-2">
                                ···
                              </span>
                            )}
                            <button
                              onClick={() => {
                                setCurrentPage(p);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className={cn(
                                "w-12 h-12 rounded-2xl font-black text-xs transition-all duration-300 border relative overflow-hidden",
                                currentPage === p
                                  ? "bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                  : "bg-white/5 border-white/5 text-white/20 hover:text-white hover:border-white/20 hover:bg-white/10",
                              )}
                            >
                              <span className="relative z-10">{p}</span>
                            </button>
                          </React.Fragment>
                        ))}
                    </div>

                    <button
                      onClick={() => {
                        setCurrentPage((p) => Math.min(totalPages, p + 1));
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      disabled={currentPage === totalPages}
                      className="group p-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-white/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                      <ChevronRight
                        className="group-hover:translate-x-1 transition-transform"
                        size={20}
                      />
                    </button>
                  </div>
                )}
              </>
            )}

            <div className="mt-20 pt-16 border-t border-white/5 space-y-12 pb-16">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                  <Info size={14} className="text-white/40" />
                </div>
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/30">
                  Intelligence Methodology
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
                      Data Intelligence
                    </p>
                  </div>
                  <p className="text-sm text-white/40 leading-relaxed font-medium">
                    Our institutional data is aggregated from the latest{" "}
                    <span className="text-white/70">
                      Ministry of Education (NIRF 2025)
                    </span>{" "}
                    reports, QS World Rankings, and verified campus audits. We
                    prioritize accuracy by cross-referencing placement
                    statistics and research outputs with official institutional
                    disclosures.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
                      Platform Scope
                    </p>
                  </div>
                  <p className="text-sm text-white/40 leading-relaxed font-medium">
                    We currently track{" "}
                    <span className="text-white/70">
                      100+ premier institutions
                    </span>{" "}
                    across India, providing{" "}
                    <span className="text-white/70">real-time AI insights</span>{" "}
                    into courses, placements, and scholarship opportunities.
                    This dashboard serves as a dynamic intelligence map of the
                    Indian academic landscape.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Floating News Hub ── */}
      <AnimatePresence>
        {isNewsOpen &&
          typeof window !== "undefined" &&
          window.innerWidth >= 1024 && (
            <>
              <motion.aside
                initial={{ x: 450, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 450, opacity: 0 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className={cn(
                  "fixed top-1/2 -translate-y-1/2 z-[300] flex flex-col shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500",
                  "hidden lg:flex lg:right-6 lg:w-[380px] lg:max-h-[70vh] lg:bg-zinc-950 lg:border lg:border-white/10 lg:rounded-[2.5rem] lg:top-1/2 lg:-translate-y-1/2",
                )}
              >
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center">
                      <Newspaper size={18} className="text-black" />
                    </div>
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-[0.15em] text-white">
                        Live Intelligence
                      </h2>
                      <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-0.5">
                        Real-time Feed
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsNewsOpen(false)}
                    className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all group"
                  >
                    <X
                      size={16}
                      className="text-white/40 group-hover:text-blue-400 transition-colors"
                    />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
                  {news.length === 0
                    ? [1, 2, 3].map((i) => (
                        <div key={i} className="space-y-3 animate-pulse">
                          <div className="h-3 w-1/3 bg-white/5 rounded" />
                          <div className="h-5 w-full bg-white/5 rounded" />
                          <div className="h-32 w-full bg-white/5 rounded-2xl" />
                        </div>
                      ))
                    : news.map((item, i) => {
                        const dateObj = new Date(
                          item.published_at || item.created_at,
                        );
                        const formattedDate = isNaN(dateObj.getTime())
                          ? "Just Now"
                          : dateObj.toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                            });

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
                                    <span className="text-[7px] font-black text-white/40">
                                      {item.source?.[0] || "A"}
                                    </span>
                                  </div>
                                  <p className="text-[9px] text-white/40 font-black uppercase tracking-widest truncate">
                                    {item.source}
                                  </p>
                                </div>
                                <ExternalLink
                                  size={12}
                                  className="text-white/20 group-hover:text-blue-400 transition-all"
                                />
                              </div>

                              <div className="h-px w-full bg-white/5 mt-6 group-last:hidden" />
                            </article>
                          </a>
                        );
                      })}
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

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.18);
        }
      `}</style>
    </div>
  );
}
