"use client";

import { useEffect, useCallback, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import {
  GraduationCap,
  ChevronRight,
  Brain,
  Newspaper,
  Search,
  CloudSun,
  Bookmark,
  TrendingUp,
  Sparkles,
  ExternalLink,
  Filter,
  RefreshCw,
  X,
  Clock,
  Building2,
  SlidersHorizontal,
} from "lucide-react";

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(" ");
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4006";

function formatRelativeTime(dateString: string | null) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

interface Article {
  id: number;
  title: string;
  summary: string;
  url: string;
  source: string;
  category: string;
  image: string;
  published_at: string | null;
  created_at: string;
}

const CATEGORY_TABS = [
  { id: "All", label: "All News" },
  { id: "Admissions", label: "Admissions" },
  { id: "Colleges", label: "Colleges" },
  { id: "Placements", label: "Placements" },
  { id: "Results", label: "Results" },
  { id: "Tech", label: "Tech & Engineering" },
  { id: "Scholarships", label: "Scholarships" },
  { id: "Business", label: "Business & MBA" },
  { id: "Science", label: "Science & Research" },
  { id: "Medical", label: "Medical & Health" },
  { id: "Internships", label: "Internships" },
];

export default function NewsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState("All");
  const [availableSources, setAvailableSources] = useState<string[]>([]);

  // Fetch available sources on mount
  useEffect(() => {
    fetch(`${API_URL}/news/sources`)
      .then((res) => res.json())
      .then((data) => {
        if (data.sources && Array.isArray(data.sources)) {
          setAvailableSources(data.sources.map((s: any) => s.source).filter(Boolean));
        }
      })
      .catch((err) => console.warn("Failed to load news sources:", err));
  }, []);

  const fetchNews = useCallback(async (category?: string, source?: string) => {
    setLoading(true);
    try {
      let url = `${API_URL}/news?limit=40`;
      if (category && category !== "All") {
        url += `&category=${encodeURIComponent(category)}`;
      }
      if (source && source !== "All") {
        url += `&source=${encodeURIComponent(source)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (err) {
      console.error("[News Feed] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews(activeTab, selectedSource);
  }, [fetchNews, activeTab, selectedSource]);

  // Client-side text filter on the fetched articles
  const filteredArticles = articles.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      a.title?.toLowerCase().includes(q) ||
      a.summary?.toLowerCase().includes(q) ||
      a.source?.toLowerCase().includes(q) ||
      a.category?.toLowerCase().includes(q)
    );
  });

  const featured = filteredArticles[0];
  const bentoGrid = filteredArticles.slice(1, 5);
  const latestList = filteredArticles.slice(5, 17);

  const resetFilters = () => {
    setActiveTab("All");
    setSelectedSource("All");
    setSearchQuery("");
  };

  const hasActiveFilters = activeTab !== "All" || selectedSource !== "All" || !!searchQuery.trim();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-black font-sans flex flex-col selection:bg-[#b69cc4]/30">
      {/* ── Breadcrumbs ── */}
      <div className="px-6 lg:px-12 pt-6 pb-2">
        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight size={10} />
          <Link href="/tools" className="hover:text-black transition-colors">Tools</Link>
          <ChevronRight size={10} />
          <span className="text-black font-black">Live Intelligence Feed</span>
        </div>
      </div>

      {/* Top Header */}
      <header className="h-18 border-b-2 border-black flex items-center justify-between px-6 lg:px-12 bg-white/95 backdrop-blur-xl z-50 shrink-0 text-black">
        <div className="flex items-center gap-6">
          <span className="text-2xl font-serif font-black tracking-tight text-black">
            Academia<span className="text-zinc-500 italic font-bold">Intel</span>
          </span>
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-zinc-100 border border-black/20 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Continuous Wire</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchNews(activeTab, selectedSource)}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-bold bg-white border-2 border-black px-3.5 py-2 rounded-xl hover:bg-[#b69cc4] transition-all shadow-[2px_2px_0px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            title="Refresh News"
          >
            <RefreshCw size={14} className={cn(loading && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </header>

      {/* Main Feed Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth p-6 lg:p-12">
        <div className="max-w-[1600px] mx-auto space-y-8 pb-24">
          
          {/* Header Title + Weather */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-black bg-[#b69cc4]/30 border border-black/20 px-2.5 py-0.5 rounded-md w-fit">
                <Sparkles size={13} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  Real-Time Intelligence
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-serif font-black tracking-tight text-black">
                Global Briefing.
              </h1>
              <p className="text-sm font-medium text-zinc-600 max-w-xl">
                Verified admissions cut-offs, counselling results, institutional rankings, and placement dossiers across India.
              </p>
            </div>
            <WeatherWidget />
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ── PROMINENT FILTER & SEARCH BAR ───────────────────────────── */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="bg-white border-2 border-black rounded-[2rem] p-5 shadow-[4px_4px_0px_0px_#000000] space-y-4">
            
            {/* Top Row: Category Pills (Horizontally Scrollable) */}
            <div className="flex items-center justify-between gap-4 border-b border-black/10 pb-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-500 shrink-0">
                <Filter size={14} className="text-black" />
                <span>Topic:</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 w-full">
                {CATEGORY_TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "text-xs font-bold px-4 py-2 rounded-xl whitespace-nowrap transition-all border-2",
                        isActive
                          ? "bg-[#b69cc4] text-black border-black font-black shadow-[2px_2px_0px_0px_#000000] -translate-y-0.5"
                          : "bg-zinc-50 text-zinc-700 border-black/15 hover:border-black hover:bg-white hover:text-black"
                      )}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Row: Search Box + Source Selector + Active Filter Tags */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
              <div className="flex flex-1 items-center gap-3">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search dossiers, colleges, exams..."
                    className="w-full bg-zinc-50 border-2 border-black rounded-xl pl-10 pr-9 py-2 text-xs font-medium text-black outline-none focus:bg-white focus:shadow-[2px_2px_0px_0px_#000000] transition-all placeholder:text-zinc-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Source Filter Dropdown */}
                {availableSources.length > 0 && (
                  <div className="relative">
                    <select
                      value={selectedSource}
                      onChange={(e) => setSelectedSource(e.target.value)}
                      className="bg-zinc-50 border-2 border-black rounded-xl px-3 py-2 text-xs font-bold text-black outline-none focus:bg-white focus:shadow-[2px_2px_0px_0px_#000000] cursor-pointer transition-all"
                    >
                      <option value="All">All Institutions & Sources</option>
                      {availableSources.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Status & Reset Button */}
              <div className="flex items-center justify-between md:justify-end gap-3 text-xs">
                <span className="font-bold text-zinc-500">
                  Showing <strong className="text-black font-black">{filteredArticles.length}</strong> dossiers
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1.5 text-xs font-black text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-300 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <X size={12} />
                    <span>Clear Filters</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ── FEED LAYOUT (CLEAN, IMAGE-FREE EDITORIAL GRID) ──────────── */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          
          {loading ? (
            /* Loading Skeleton */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-6">
                <div className="rounded-[2.5rem] border-2 border-black bg-white p-8 lg:p-10 shadow-[4px_4px_0px_0px_#000000] space-y-4 animate-pulse">
                  <div className="h-4 w-28 bg-zinc-200 rounded" />
                  <div className="h-8 w-3/4 bg-zinc-200 rounded" />
                  <div className="h-16 w-full bg-zinc-100 rounded" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-[2rem] border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_#000000] space-y-3 animate-pulse">
                      <div className="h-3 w-20 bg-zinc-200 rounded" />
                      <div className="h-6 w-full bg-zinc-200 rounded" />
                      <div className="h-10 w-full bg-zinc-100 rounded" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-4">
                <div className="rounded-[2.5rem] border-2 border-black bg-white p-8 shadow-[4px_4px_0px_0px_#000000] space-y-4 animate-pulse">
                  <div className="h-4 w-32 bg-zinc-200 rounded" />
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 w-full bg-zinc-100 rounded" />
                  ))}
                </div>
              </div>
            </div>
          ) : filteredArticles.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-[2.5rem] border-2 border-black p-12 text-center shadow-[4px_4px_0px_0px_#000000] max-w-lg mx-auto space-y-4 my-8">
              <div className="w-14 h-14 rounded-2xl bg-[#b69cc4]/30 border-2 border-black flex items-center justify-center mx-auto">
                <Newspaper size={28} className="text-black" />
              </div>
              <h3 className="text-xl font-serif font-black text-black">No intelligence dossiers found</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">
                No matching reports were found for category &ldquo;{activeTab}&rdquo;
                {selectedSource !== "All" ? ` from ${selectedSource}` : ""}
                {searchQuery ? ` matching "${searchQuery}"` : ""}.
              </p>
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 bg-[#b69cc4] text-black font-black text-xs px-5 py-2.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Lead Story + Secondary Grid */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* ── Featured Headline Card ── */}
                {featured && (
                  <div className="rounded-[2.5rem] border-2 border-black group shadow-[4px_4px_0px_0px_#000000] bg-white p-8 lg:p-10 transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000000]">
                    <Link
                      href={featured.url}
                      target="_blank"
                      className="flex flex-col justify-between h-full space-y-6"
                    >
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-[#b69cc4] text-black text-[10px] font-black uppercase tracking-widest rounded border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000000]">
                              Lead Dossier
                            </span>
                            <span className="px-3 py-1 bg-zinc-100 text-zinc-800 text-[10px] font-bold uppercase tracking-wider rounded border border-black/20">
                              {featured.category || "General"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                            <Building2 size={13} className="text-zinc-400" />
                            <span>{featured.source}</span>
                            <span>•</span>
                            <Clock size={12} className="text-zinc-400" />
                            <span>{formatRelativeTime(featured.published_at || featured.created_at)}</span>
                          </div>
                        </div>

                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black leading-tight text-black group-hover:text-[#8a689b] transition-colors">
                          {featured.title}
                        </h2>

                        <p className="text-zinc-700 text-sm lg:text-base font-normal leading-relaxed">
                          {featured.summary}
                        </p>
                      </div>

                      <div className="pt-4 border-t-2 border-black/10 flex items-center justify-between text-black font-black text-xs uppercase tracking-wider">
                        <span className="flex items-center gap-2 group-hover:underline text-[#8a689b]">
                          Read full briefing <ExternalLink size={14} />
                        </span>
                        <span className="text-zinc-400 font-mono text-[11px] font-bold">{featured.source}</span>
                      </div>
                    </Link>
                  </div>
                )}

                {/* ── Sub-Featured Grid (4 Cards) ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {bentoGrid.map((a) => (
                    <div
                      key={a.id}
                      className="rounded-[2rem] border-2 border-black p-6 group bg-white shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000000] transition-all flex flex-col justify-between"
                    >
                      <Link
                        href={a.url}
                        target="_blank"
                        className="flex flex-col justify-between h-full space-y-4"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-800 text-[9px] font-black uppercase tracking-wider rounded border border-black/20">
                              {a.category || "General"}
                            </span>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase">
                              {formatRelativeTime(a.published_at || a.created_at)}
                            </span>
                          </div>
                          <h3 className="text-base font-serif font-black leading-snug group-hover:text-[#8a689b] transition-colors line-clamp-3 text-black">
                            {a.title}
                          </h3>
                          <p className="text-zinc-600 text-xs leading-relaxed line-clamp-2">
                            {a.summary}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-black/10 flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                          <span className="truncate max-w-[180px]">{a.source}</span>
                          <ExternalLink size={12} className="group-hover:text-black transition-colors shrink-0" />
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Right Column: Live Wire Intelligence ── */}
              <div className="lg:col-span-4">
                <div className="bg-white rounded-[2.5rem] border-2 border-black p-6 lg:p-8 shadow-[4px_4px_0px_0px_#000000] space-y-5 text-black sticky top-6">
                  <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-widest text-black">
                        Live Wire Intel
                      </span>
                    </div>
                    <TrendingUp size={15} className="text-[#8a689b]" />
                  </div>

                  <div className="space-y-3 divide-y divide-black/10">
                    {latestList.map((a, idx) => (
                      <Link
                        key={a.id}
                        href={a.url}
                        target="_blank"
                        className="block group/item pt-3 first:pt-0 hover:bg-zinc-50/80 rounded-xl px-2.5 -mx-2.5 transition-colors"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono font-black text-zinc-400">
                                #{String(idx + 6).padStart(2, "0")}
                              </span>
                              <span className="px-2 py-0.5 bg-[#b69cc4]/20 text-black text-[8px] font-black uppercase tracking-wider rounded border border-black/20">
                                {a.category || "General"}
                              </span>
                            </div>
                            <span className="text-[9px] font-bold text-zinc-400 uppercase">
                              {formatRelativeTime(a.published_at || a.created_at)}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold leading-snug group-hover/item:text-[#8a689b] transition-colors line-clamp-2 text-black">
                            {a.title}
                          </h4>
                          <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                            {a.source}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* Mobile Floating Nav */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-white border-2 border-black rounded-xl px-2 py-2 flex items-center gap-1 shadow-[4px_4px_0px_0px_#000000] text-black">
        {[
          { icon: GraduationCap, href: "/", label: "Home" },
          { icon: Brain, href: "/chat", label: "Chat" },
          { icon: Bookmark, href: "/shortlist", label: "Saved" },
          { icon: Newspaper, href: "/news", active: true, label: "News" },
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

function WeatherWidget() {
  const date = new Date();
  return (
    <div className="bg-white border-2 border-black rounded-[2rem] p-5 px-8 flex items-center gap-8 hover:bg-zinc-50 transition-all cursor-default group shadow-[4px_4px_0px_0px_#000000] text-black">
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1.5">
          {date.toLocaleDateString("en-US", { weekday: "long" })},{" "}
          {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
        <div className="flex items-center gap-3.5">
          <CloudSun className="text-yellow-500 w-8 h-8 group-hover:scale-110 transition-transform" />
          <div className="flex flex-col">
            <span className="text-3xl font-serif font-black text-black">
              25°C
            </span>
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
              Cloudy • BLR
            </span>
          </div>
        </div>
      </div>
      <div className="w-0.5 h-14 bg-black/10" />
      <div className="flex flex-col justify-center">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">
          Tomorrow
        </span>
        <span className="text-lg font-bold text-black">27°C</span>
        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">
          Sunny
        </span>
      </div>
    </div>
  );
}
