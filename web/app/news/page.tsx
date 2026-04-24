"use client";

import { useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  GraduationCap,
  ExternalLink,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Building2,
  AlertCircle,
  Loader2,
  Brain,
  Newspaper,
  Search,
  Filter,
  X,
  ChevronUp,
  ChevronDown,
  Tag,
  Trophy
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

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

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
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
                      className="peer h-4 w-4 appearance-none rounded border border-zinc-200 bg-zinc-50 checked:bg-black checked:border-black transition-all cursor-pointer"
                    />
                    <X className="absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100 left-0.5 pointer-events-none transition-opacity" />
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

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Recent";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Recent";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function SkeletonRow() {
  return (
    <div className="flex items-start gap-6 py-6 border-b border-zinc-100 animate-pulse">
      <div className="flex-shrink-0 w-24 space-y-2 pt-1">
        <div className="h-4 bg-zinc-100 rounded w-full" />
        <div className="h-3 bg-zinc-50 rounded w-3/4" />
      </div>
      <div className="flex-grow space-y-3">
        <div className="h-5 bg-zinc-100 rounded w-full" />
        <div className="h-3 bg-zinc-50 rounded w-4/5" />
      </div>
    </div>
  );
}

function NewsRow({ article, index }: { article: Article; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.02, ease: [0.16, 1, 0.3, 1] }}
      className="group flex items-start gap-6 py-6 border-b border-zinc-100 hover:bg-zinc-50 transition-colors duration-200"
    >
      <div className="flex-shrink-0 w-24 pt-0.5 space-y-2">
        <span className="inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-zinc-200 text-zinc-400 bg-zinc-50 leading-none">
          {article.source}
        </span>
        <div className="flex items-center gap-1.5 text-zinc-700 text-[10px] font-bold">
          <Calendar className="w-3 h-3 flex-shrink-0" />
          <span>{formatDate(article.published_at || article.created_at)}</span>
        </div>
      </div>

      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          {article.category && (
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">
              {article.category}
            </span>
          )}
        </div>
        <h2 className="text-zinc-800 font-bold text-sm md:text-base leading-snug mb-2 group-hover:text-black transition-colors">
          {article.title}
        </h2>
        <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2 font-medium">
          {article.summary}
        </p>
      </div>

      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-all group/link mt-0.5"
      >
        <span className="hidden sm:inline">Read</span>
        <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
      </a>
    </motion.article>
  );
}

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filterOptions, setFilterOptions] = useState<{ sources: FilterOption[], categories: FilterOption[] }>({ sources: [], categories: [] });
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "15", page: String(page) });
      selectedSources.forEach(s => params.append("source", s));
      selectedCategories.forEach(c => params.append("category", c));

      const res = await fetch(`${API_URL}/news?${params}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setArticles(data.articles ?? []);
      setPagination(data.pagination ?? null);
    } catch (err: any) {
      setError(err.message || "Failed to load news");
    } finally {
      setLoading(false);
    }
  }, [selectedSources, selectedCategories, page]);

  const fetchFilters = useCallback(async () => {
    try {
      const [srcRes, catRes] = await Promise.all([
        fetch(`${API_URL}/news/sources`),
        fetch(`${API_URL}/news/categories`)
      ]);
      const srcData = await srcRes.json();
      const catData = await catRes.json();
      
      setFilterOptions({
        sources: srcData.sources.map((s: any) => ({ name: s.source, count: parseInt(s.count) })),
        categories: catData.categories.map((c: any) => ({ name: c.category, count: parseInt(c.count) }))
      });
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchNews(); }, [fetchNews]);
  useEffect(() => { fetchFilters(); }, [fetchFilters]);

  const toggleSource = (src: string) => {
    setSelectedSources(prev => prev.includes(src) ? prev.filter(s => s !== src) : [...prev, src]);
    setPage(1);
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
    setPage(1);
  };

  const filteredArticles = articles.filter(a => a.title.toLowerCase().includes(globalSearch.toLowerCase()) || a.summary.toLowerCase().includes(globalSearch.toLowerCase()));

  return (
    <div className="flex h-screen bg-white text-black font-sans selection:bg-blue-50 overflow-hidden">
      
      <aside className="flex-shrink-0 w-14 h-full bg-white border-r border-zinc-100 flex flex-col items-center py-4 gap-1 z-50">
        <Link href="/" className="w-9 h-9 bg-white rounded-xl flex items-center justify-center mb-4 hover:scale-105 transition-transform">
          <GraduationCap className="text-black w-5 h-5" />
        </Link>
        <div className="w-6 h-px bg-zinc-900 mb-2" />
        <Link href="/chat" className="group relative w-10 h-10 flex items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-50 hover:text-black transition-all">
          <Brain className="w-5 h-5" />
        </Link>
        <Link href="/news" className="group relative w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all">
          <Newspaper className="w-5 h-5" />
        </Link>
        <Link href="/rankings" className="group relative w-10 h-10 flex items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-50 hover:text-black transition-all">
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
              {(selectedSources.length > 0 || selectedCategories.length > 0) && (
                <button onClick={() => { setSelectedSources([]); setSelectedCategories([]); }} className="text-[10px] font-black uppercase text-zinc-400 hover:text-black transition-colors">Clear All</button>
              )}
            </div>

            <FilterSection 
              title="Sources" 
              options={filterOptions.sources} 
              selected={selectedSources} 
              onChange={toggleSource} 
              icon={<Building2 className="w-3.5 h-3.5" />}
            />

            <FilterSection 
              title="Topics" 
              options={filterOptions.categories} 
              selected={selectedCategories} 
              onChange={toggleCategory} 
              icon={<Tag className="w-3.5 h-3.5" />}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <main className="max-w-4xl mx-auto px-6 py-16">
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-5xl font-black tracking-tight text-black mb-2">News & <span className="text-zinc-200">Articles</span></h1>
                <p className="text-zinc-500 font-medium text-sm">Real-time academic intelligence from verified institutions.</p>
              </div>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-zinc-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search articles..." 
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500 w-full sm:w-64 transition-all"
                />
              </div>
            </div>

            {/* Active Chips */}
            {(selectedSources.length > 0 || selectedCategories.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-8">
                {selectedSources.map(s => (
                  <button key={s} onClick={() => toggleSource(s)} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-full text-[10px] font-bold text-zinc-400 hover:text-black hover:border-zinc-300 transition-all">
                    {s} <X className="w-3 h-3 text-zinc-700" />
                  </button>
                ))}
                {selectedCategories.map(c => (
                  <button key={c} onClick={() => toggleCategory(c)} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-full text-[10px] font-bold text-zinc-400 hover:text-black hover:border-zinc-300 transition-all">
                    {c} <X className="w-3 h-3 text-zinc-700" />
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <div className="space-y-0">
                {Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)}
              </div>
            ) : error ? (
              <div className="py-20 text-center">
                <AlertCircle className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                <p className="text-zinc-500 font-bold mb-4">{error}</p>
                <button onClick={fetchNews} className="px-6 py-2 rounded-full border border-zinc-200 text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">Retry</button>
              </div>
            ) : articles.length === 0 ? (
              <div className="py-20 text-center">
                <Newspaper className="w-12 h-12 text-zinc-900 mx-auto mb-4" />
                <p className="text-zinc-500 font-bold">No articles found matching these filters.</p>
              </div>
            ) : (
              <div className="space-y-0">
                {filteredArticles.map((article, i) => <NewsRow key={article.id} article={article} index={i} />)}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && !loading && (
              <div className="flex items-center justify-center gap-4 mt-16 pb-20">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-10 h-10 rounded-xl border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-black disabled:opacity-20 transition-all">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-black text-zinc-700 tracking-widest uppercase">Page {page} of {pagination.pages}</span>
                <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="w-10 h-10 rounded-xl border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-black disabled:opacity-20 transition-all">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </main>
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
