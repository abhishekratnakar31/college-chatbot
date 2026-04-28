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
  Trophy,
} from "lucide-react";

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(" ");
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4005";

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

interface FilterOption {
  name: string;
  count: number;
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

function NewsRow({ article, index }: { article: Article; index: number }) {
  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
      className="group flex flex-row items-center gap-4 py-4 border-b border-zinc-900/30 hover:bg-zinc-900/5 transition-all px-4 -mx-4 cursor-pointer no-underline"
    >
      <div className="flex-grow min-w-0 flex items-center gap-4">
        <div className="hidden sm:flex shrink-0">
          <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-[7px] font-black text-zinc-600 uppercase tracking-tighter">
            {article.source}
          </span>
        </div>
        
        <h2 className="text-white font-medium text-sm md:text-base leading-tight group-hover:text-zinc-200 transition-colors flex-grow py-1">
          {article.title}
        </h2>

        <div className="flex items-center gap-4 shrink-0">
          <span className="text-[8px] font-black text-zinc-800 uppercase tracking-tighter hidden md:inline">
            {new Date(article.published_at || article.created_at).toLocaleDateString()}
          </span>
          <div className="p-2 text-zinc-800 group-hover:text-white transition-colors">
            <ExternalLink size={12} />
          </div>
        </div>
      </div>
    </motion.a>
  );
}

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filterOptions, setFilterOptions] = useState({ sources: [], categories: [] });
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalSearch, setGlobalSearch] = useState("");

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "20" });
      selectedSources.forEach(s => params.append("source", s));
      selectedCategories.forEach(c => params.append("category", c));
      const res = await fetch(`${API_URL}/news?${params}`);
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [selectedSources, selectedCategories]);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden">
      
      <aside className="hidden md:flex w-20 border-r border-zinc-900 flex-col items-center py-8 gap-8 z-[100] bg-black">
        <Link href="/" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform">
          <GraduationCap className="text-black w-6 h-6" />
        </Link>
        <div className="flex flex-col gap-4">
          {[
            { icon: Brain, href: "/chat", label: "Chat" },
            { icon: Newspaper, href: "/news", label: "News", active: true },
            { icon: Trophy, href: "/rankings", label: "Rankings" },
          ].map((item) => (
            <Link key={item.label} href={item.href} className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all", item.active ? "bg-white text-black shadow-xl shadow-white/10" : "text-zinc-600 hover:text-white hover:bg-zinc-900")}>
              <item.icon size={20} />
            </Link>
          ))}
        </div>
      </aside>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-lg border-t border-zinc-900 flex items-center justify-around z-[200] px-6">
        {[
          { icon: GraduationCap, href: "/" },
          { icon: Brain, href: "/chat" },
          { icon: Newspaper, href: "/news", active: true },
          { icon: Trophy, href: "/rankings" }
        ].map((item, i) => (
          <Link key={i} href={item.href} className={cn("p-3 rounded-xl transition-all", item.active ? "bg-white text-black" : "text-zinc-600")}>
            <item.icon size={20} />
          </Link>
        ))}
      </nav>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 flex-shrink-0 border-r border-zinc-900/50 bg-black overflow-y-auto hidden xl:block p-10">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 mb-10 flex items-center gap-3">
            <Filter size={14} /> Intelligence Filters
          </h2>
          <FilterSection title="Sources" options={filterOptions.sources} selected={selectedSources} onChange={(s: any) => setSelectedSources(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} icon={<Building2 size={14} className="text-zinc-700" />} />
          <FilterSection title="Categories" options={filterOptions.categories} selected={selectedCategories} onChange={(c: any) => setSelectedCategories(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])} icon={<Tag size={14} className="text-zinc-700" />} />
        </div>

        <main className="flex-1 flex flex-col relative bg-[#0a0a0a]">
          <header className="h-20 border-b border-zinc-900 flex items-center justify-between px-6 md:px-10 z-[100] bg-black/50 backdrop-blur-xl shrink-0">
            <Link href="/" className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0">
                <GraduationCap className="text-black w-6 h-6" />
              </div>
              <span className="text-xl font-serif font-bold text-white tracking-tight whitespace-nowrap">Academia<span className="text-zinc-500">AI</span></span>
            </Link>
            <div className="flex items-center gap-4 md:gap-10">
              <Link href="/news" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">News</Link>
              <Link href="/rankings" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">Rankings</Link>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="max-w-5xl mx-auto px-6 md:px-12 py-12 md:py-20 pb-32 md:pb-20">
            <header className="mb-24 space-y-8">
              <h1 className="text-6xl md:text-7xl font-serif font-bold tracking-tight text-white">
                Latest <span className="text-zinc-800 italic">Insights</span>
              </h1>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <p className="text-zinc-500 text-lg font-medium max-w-md leading-relaxed">
                  Real-time academic intelligence from verified global institutions.
                </p>
                <div className="relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-white transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search articles..." 
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    className="bg-zinc-900/30 border-2 border-zinc-900 rounded-2xl py-4 pl-14 pr-6 text-sm font-medium text-white focus:outline-none focus:border-white focus:bg-black w-full md:w-72 transition-all shadow-sm"
                  />
                </div>
              </div>
            </header>

            {loading ? (
              <div className="space-y-20">
                {[1, 2, 3].map(i => <div key={i} className="h-64 bg-zinc-900/20 rounded-[3rem] animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-8">
                {articles.filter(a => a.title.toLowerCase().includes(globalSearch.toLowerCase())).map((article, i) => (
                  <NewsRow key={article.id} article={article} index={i} />
                ))}
              </div>
            )}
            </div>
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
