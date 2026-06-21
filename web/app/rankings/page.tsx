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
    <div className="border-b-2 border-black last:border-0 py-4 px-1">
      <button
        onClick={() => !isLocked && setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between group transition-all",
          isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        )}
      >
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-bold text-black group-hover:text-[#a387b3] transition-colors">
            {title}
          </span>
          {isLocked && <Lock size={12} className="text-zinc-500" />}
        </div>
        {!isLocked && (
          <ChevronDown
            size={16}
            className={cn(
              "text-black transition-transform duration-300",
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
                      "w-full flex items-center justify-between py-2 px-3 transition-all duration-200 rounded-lg text-left border border-transparent",
                      isSelected
                        ? "bg-[#b69cc4]/30 border-2 border-black text-black font-bold"
                        : "hover:bg-zinc-100 text-zinc-600 hover:text-black",
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

// Deterministic image seed from college name
function imgSeed(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++)
    h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return (Math.abs(h) % 900) + 100;
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
        className="flex items-center gap-4 sm:gap-8 py-6 px-6 bg-white border-2 border-black rounded-xl hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all mb-4"
      >
        {/* ── Rank Number ── */}
        <div className="flex w-12 h-12 rounded-xl bg-zinc-100 border-2 border-black flex-col items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000000]">
          <span
            className={cn(
              "text-lg font-serif font-black",
              isTop3 ? "text-black" : "text-zinc-600",
            )}
          >
            {college.nirf_rank ? college.nirf_rank : "—"}
          </span>
          <span className="text-[7px] font-black uppercase tracking-tighter text-zinc-500">
            Rank
          </span>
        </div>

        {/* ── Info ── */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm sm:text-lg font-serif font-bold text-black group-hover:text-[#a387b3] transition-colors truncate">
                  {college.college}
                </h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-zinc-600">
                  <MapPin size={12} className="shrink-0 text-black" />
                  <span className="text-[10px] sm:text-[11px] font-medium truncate">
                    {college.city}, {college.state}
                  </span>
                </div>
                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">
                  Updated: {lastUpdated}
                </span>
              </div>
            </div>

            {/* Stats - Desktop Only */}
            <div className="hidden md:flex items-center gap-12 shrink-0">
              {college.avg_package != null && (
                <div className="text-right min-w-[80px]">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">
                    Avg Package
                  </p>
                  <p className="text-sm font-bold text-black">
                    ₹{college.avg_package}L
                  </p>
                </div>
              )}
              {college.innovation_score != null && (
                <div className="text-right min-w-[80px]">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">
                    Innovation
                  </p>
                  <p className="text-sm font-bold text-black flex items-center justify-end gap-1">
                    <Star size={12} className="fill-[#b69cc4] text-black" />
                    {college.innovation_score}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleSave}
                className={cn(
                  "p-2.5 rounded-lg transition-all border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
                  isSaved
                    ? "bg-[#b69cc4] text-black"
                    : "bg-white text-zinc-600 hover:text-black",
                )}
              >
                <Bookmark
                  size={16}
                  className={cn(isSaved && "fill-black")}
                />
              </button>
              <ChevronRight
                size={18}
                className="text-black/30 group-hover:text-black transition-all group-hover:translate-x-1"
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
        <div className="flex h-screen bg-[#f3f4f6] text-black items-center justify-center font-serif text-2xl italic animate-pulse">
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
    <div className="flex h-screen bg-[#f3f4f6] text-black font-sans overflow-hidden">
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
                item.href === "/tools"
                  ? "bg-[#b69cc4] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  : "text-zinc-600 hover:text-black rounded-lg",
              )}
            >
              <Icon size={20} />
              {item.href === "/tools" && (
                <span className="text-[13px] font-black">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Filters Sidebar ── */}
      <AnimatePresence>
        {isFiltersOpen && (
          <>
            {/* Mobile Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFiltersOpen(false)}
              className="fixed inset-0 bg-black/40 z-[250]"
            />
            <motion.aside
              initial={{ x: -450, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -450, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={cn(
                "fixed z-[300] flex flex-col shadow-[4px_4px_0px_0px_#000000] overflow-hidden transition-all duration-500",
                "left-0 w-full sm:w-[360px] h-full rounded-none bg-white top-0 border-r-2 border-black text-black",
              )}
            >
              <div className="p-6 border-b-2 border-black flex items-center justify-between">
                <h2 className="text-lg font-bold text-black">
                  Filters ({selectedStates.length + (activeCategory !== "All" ? 1 : 0)})
                </h2>
                <button
                  onClick={() => setIsFiltersOpen(false)}
                  className="w-8 h-8 rounded-lg border-2 border-black bg-white flex items-center justify-center hover:bg-[#b69cc4] transition-all hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]"
                >
                  <X size={16} className="text-black" />
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

              {/* Sidebar Footer */}
              <div className="p-6 border-t-2 border-black bg-zinc-50 flex items-center gap-4">
                <button
                  onClick={() => {
                    setSelectedStates([]);
                    setActiveCategory("All");
                  }}
                  className="flex-1 py-3 text-zinc-600 hover:text-black text-xs font-bold transition-all"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsFiltersOpen(false)}
                  className="flex-[2] py-3 bg-[#b69cc4] hover:bg-[#a387b3] text-black text-xs font-black uppercase tracking-widest rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
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
          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <ChevronRight size={10} />
            <Link href="/tools" className="hover:text-black transition-colors">Tools</Link>
            <ChevronRight size={10} />
            <span className="text-black">Intelligence Index 2026</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 transition-all duration-700 ease-in-out px-0">
          {/* ── Hero Section ── */}
          <section className="px-8 py-16 md:py-24 border-b-2 border-black bg-white relative overflow-hidden">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
              <div className="flex-1 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#b69cc4] rounded-xl flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                    <Trophy className="text-black" size={24} />
                  </div>
                  <div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Official 2026 Edition</h2>
                    <p className="text-xs font-bold text-black">Institutional Performance Index</p>
                  </div>
                </div>

                <h1 className="text-4xl md:text-6xl font-serif font-black text-black leading-[1.1] tracking-tight">
                  AcademiaAI Intelligence Index 2026: <br />
                  <span className="text-zinc-500">Top Indian Institutions.</span>
                </h1>

                <div className="space-y-6 max-w-2xl">
                  <p className="text-lg text-zinc-700 font-medium leading-relaxed">
                    Discover the top-performing universities across India indexed by our proprietary 
                    Neural Engine. Our 2026 edition evaluates institutional excellence through verified 
                    metrics in academic reputation, employer intelligence, and research output.
                  </p>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    Over 100 premier institutions are featured in this edition, providing students 
                    and stakeholders with data-driven insights into the evolving landscape of 
                    higher education. <button className="text-black font-extrabold hover:underline">Read more</button>
                  </p>
                </div>
              </div>

              {/* Decorative Badge */}
              <div className="hidden lg:block w-72 h-72 relative shrink-0">
                <div className="absolute inset-0 bg-[#b69cc4]/10 blur-[100px] rounded-full animate-pulse" />
                <div className="relative z-10 w-full h-full border-2 border-black rounded-[2rem] bg-white flex flex-col items-center justify-center p-8 text-center space-y-4 shadow-[4px_4px_0px_0px_#000000]">
                   <div className="w-20 h-20 rounded-full bg-[#b69cc4] border-2 border-black flex items-center justify-center mb-2 shadow-[2px_2px_0px_0px_#000000]">
                     <Brain size={40} className="text-black" />
                   </div>
                   <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Verified by</p>
                     <p className="text-lg font-serif font-bold text-black">Academia Intelligence</p>
                   </div>
                   <div className="pt-4 border-t-2 border-black w-full">
                     <p className="text-[9px] font-black uppercase tracking-widest text-[#a387b3]">2026 Global Edition</p>
                   </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Dashboard Control Bar ── */}
          <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b-2 border-black px-8 py-6">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              <div className="flex items-center gap-4 flex-1">
                {/* View Toggles */}
                <div className="flex bg-zinc-100 p-1 rounded-xl border-2 border-black shrink-0">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000000] transition-all">
                    <LayoutGrid size={14} />
                    <span className="text-[10px] font-black uppercase tracking-wider">Quick View</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-zinc-500 hover:text-black rounded-lg transition-all">
                    <Search size={14} />
                    <span className="text-[10px] font-black uppercase tracking-wider">Table View</span>
                  </button>
                </div>

                {/* Search Field */}
                <div className="relative flex-1 md:max-w-xs">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input 
                    type="text" 
                    placeholder="Search intelligence..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white border-2 border-black rounded-xl pl-10 pr-4 py-3 text-[11px] font-bold text-black placeholder:text-zinc-400 outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-8">
                {/* Results Count */}
                <div className="flex flex-col items-end">
                   <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Current Index</p>
                   <p className="text-2xl font-serif font-black text-black">
                     {visible.length} <span className="text-xs font-bold text-zinc-600 uppercase ml-1">Results</span>
                   </p>
                </div>

                {/* QS Style Filter Button */}
                <button 
                  onClick={() => setIsFiltersOpen(true)}
                  className="flex items-center gap-4 px-6 py-3 bg-[#b69cc4] hover:bg-[#a387b3] text-black border-2 border-black rounded-xl transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none group"
                >
                  <Sliders size={18} className="group-hover:rotate-12 transition-transform" strokeWidth={2.5} />
                  <span className="text-sm font-bold tracking-tight">Apply Filters</span>
                  <div className="min-w-[28px] h-7 px-2 rounded-lg bg-white border border-black flex items-center justify-center text-xs font-black">
                    {selectedStates.length + (activeCategory !== "All" ? 1 : 0)}
                  </div>
                </button>
              </div>

            </div>

            {/* Meta Info Bar */}
            <div className="max-w-6xl mx-auto flex items-center justify-between mt-6 pt-4 border-t border-zinc-200">
               <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-600">
                 <span>Published on: <span className="text-black ml-1">14 May 2026</span></span>
               </div>
               
               <div className="flex items-center gap-3">
                 <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Sort by:</span>
                 <select 
                   value={sortBy}
                   onChange={(e) => setSortBy(e.target.value)}
                   className="bg-transparent text-[10px] font-black uppercase tracking-widest text-black font-bold outline-none cursor-pointer hover:underline transition-colors"
                 >
                   <option value="nirf_rank">Rank (Low to High)</option>
                   <option value="avg_package">Avg Package</option>
                   <option value="innovation_score">Innovation Score</option>
                 </select>
               </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-8 py-12">
            {/* Active Filter Chips */}
            {(selectedStates.length > 0 || activeCategory !== "All") && (
              <div className="mb-10 flex flex-wrap items-center gap-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mr-2">Filters active:</span>
                {activeCategory !== "All" && (
                  <button 
                    onClick={() => setActiveCategory("All")}
                    className="px-3 py-1.5 bg-[#b69cc4]/30 border-2 border-black rounded-lg text-[9px] font-black uppercase tracking-widest text-black flex items-center gap-2 hover:bg-[#b69cc4]/50 transition-all"
                  >
                    {activeCategory} <X size={10} />
                  </button>
                )}
                {selectedStates.map(s => (
                  <button 
                    key={s}
                    onClick={() => setSelectedStates(prev => prev.filter(x => x !== s))}
                    className="px-3 py-1.5 bg-white border-2 border-black rounded-lg text-[9px] font-black uppercase tracking-widest text-black flex items-center gap-2 hover:bg-zinc-100 transition-all"
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
                    className="h-24 sm:h-32 bg-white border-2 border-black rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <div className="w-16 h-16 bg-white border-2 border-black rounded-xl flex items-center justify-center mx-auto shadow-[2px_2px_0px_0px_#000000]">
                  <Search size={24} className="text-black" />
                </div>
                <p className="text-zinc-600 text-sm">No colleges found</p>
                <button
                  onClick={() => {
                    setSearch("");
                    setActiveCategory("All");
                    setSelectedStates([]);
                    setSelectedCities([]);
                  }}
                  className="text-xs text-black font-bold hover:underline"
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
                      className="group p-4 rounded-xl bg-white border-2 border-black text-black hover:bg-[#b69cc4] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
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
                              <span className="text-black font-black px-2">
                                ···
                              </span>
                            )}
                            <button
                              onClick={() => {
                                setCurrentPage(p);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className={cn(
                                "w-12 h-12 rounded-xl font-black text-xs transition-all duration-300 border-2 border-black relative overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
                                currentPage === p
                                  ? "bg-[#b69cc4] text-black"
                                  : "bg-white text-black hover:bg-[#b69cc4]",
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
                      className="group p-4 rounded-xl bg-white border-2 border-black text-black hover:bg-[#b69cc4] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
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

            <div className="mt-20 pt-16 border-t-2 border-black space-y-12 pb-16">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                  <Info size={14} className="text-black" />
                </div>
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-black">
                  Intelligence Methodology
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-black" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a387b3]">
                      Data Intelligence
                    </p>
                  </div>
                  <p className="text-sm text-zinc-700 leading-relaxed font-medium">
                    Our institutional data is aggregated from the latest{" "}
                    <span className="text-black font-bold">
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
                    <div className="w-1.5 h-1.5 rounded-full bg-black" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a387b3]">
                      Platform Scope
                    </p>
                  </div>
                  <p className="text-sm text-zinc-700 leading-relaxed font-medium">
                    We currently track{" "}
                    <span className="text-black font-bold">
                      100+ premier institutions
                    </span>{" "}
                    across India, providing{" "}
                    <span className="text-black font-bold">real-time AI insights</span>{" "}
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
                  "fixed top-1/2 -translate-y-1/2 z-[300] flex flex-col shadow-[4px_4px_0px_0px_#000000] overflow-hidden transition-all duration-500",
                  "hidden lg:flex lg:right-6 lg:w-[380px] lg:max-h-[70vh] lg:bg-white lg:border-2 lg:border-black lg:rounded-[2rem] lg:top-1/2 lg:-translate-y-1/2 text-black",
                )}
              >
                <div className="p-6 border-b-2 border-black flex items-center justify-between bg-zinc-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#b69cc4] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                      <Newspaper size={18} className="text-black" />
                    </div>
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-[0.15em] text-black">
                        Live Intelligence
                      </h2>
                      <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">
                        Real-time Feed
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsNewsOpen(false)}
                    className="w-9 h-9 rounded-lg border-2 border-black bg-white flex items-center justify-center hover:bg-[#b69cc4] transition-all hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]"
                  >
                    <X size={16} className="text-black" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
                  {news.length === 0
                    ? [1, 2, 3].map((i) => (
                        <div key={i} className="space-y-3 animate-pulse">
                          <div className="h-3 w-1/3 bg-zinc-200 rounded" />
                          <div className="h-5 w-full bg-zinc-200 rounded" />
                          <div className="h-32 w-full bg-zinc-200 rounded-2xl" />
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
                                <span className="text-[9px] font-black uppercase tracking-widest text-black px-2 py-0.5 bg-[#b69cc4]/30 rounded-md border border-black/20">
                                  {item.category || "General"}
                                </span>
                                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.15em]">
                                  {formattedDate}
                                </span>
                              </div>

                              <h3 className="text-sm font-bold text-black group-hover:text-[#a387b3] transition-colors leading-relaxed mb-4">
                                {item.title}
                              </h3>

                              <div className="flex items-center justify-between opacity-50 group-hover:opacity-100 transition-opacity">
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <div className="w-4 h-4 rounded bg-zinc-200 flex items-center justify-center shrink-0">
                                    <span className="text-[7px] font-black text-black">
                                      {item.source?.[0] || "A"}
                                    </span>
                                  </div>
                                  <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest truncate">
                                    {item.source}
                                  </p>
                                </div>
                                <ExternalLink
                                  size={12}
                                  className="text-zinc-600 group-hover:text-black transition-all"
                                />
                              </div>

                              <div className="h-px w-full bg-black/10 mt-6 group-last:hidden" />
                            </article>
                          </a>
                        );
                      })}
                </div>

                <div className="p-4 border-t-2 border-black bg-zinc-50">
                  <Link
                    href="/news"
                    className="w-full py-3 bg-[#b69cc4] hover:bg-[#a387b3] text-black border-2 border-black text-[10px] font-black uppercase tracking-[0.2em] rounded-lg transition-all flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]"
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
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
          border: 1px solid #f3f4f6;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.4);
        }
      `}</style>
    </div>
  );
}
