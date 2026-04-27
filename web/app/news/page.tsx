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
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col md:flex-row items-start gap-10 py-16 border-b border-zinc-900/50 hover:bg-zinc-900/20 transition-all duration-500 rounded-[2rem] px-8 -mx-8"
    >
      <div className="flex-grow min-w-0 space-y-6">
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border border-zinc-800 text-zinc-500 bg-black">
            {article.source}
          </span>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-700">
            {article.category}
          </span>
        </div>
        <h2 className="text-white font-serif font-bold text-2xl md:text-3xl leading-tight group-hover:text-zinc-200 transition-colors">
          {article.title}
        </h2>
        <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-zinc-600">
          <div className="flex items-center gap-2">
            <Calendar size={14} />
            <span>{new Date(article.published_at || article.created_at).toLocaleDateString()}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-zinc-800" />
          <span>{Math.floor(Math.random() * 10 + 1)} min read</span>
        </div>
        <p className="text-zinc-400 text-base leading-relaxed line-clamp-3 font-medium max-w-2xl">
          {article.summary}
        </p>
        <a href={article.url} target="_blank" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-all group/link">
          Read Full Article <ExternalLink size={14} className="group-hover/link:translate-x-1 transition-transform" />
        </a>
      </div>
      <div className="flex-shrink-0 w-full md:w-56 aspect-square rounded-[2.5rem] overflow-hidden border border-zinc-900 bg-zinc-900 group-hover:shadow-2xl group-hover:shadow-black transition-all duration-700">
        <img src={article.image || "/news_hero.png"} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
      </div>
    </motion.article>
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
      
      <aside className="w-20 border-r border-zinc-900 flex flex-col items-center py-8 gap-8 z-[100] bg-black">
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

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 flex-shrink-0 border-r border-zinc-900/50 bg-black overflow-y-auto hidden xl:block p-10">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 mb-10 flex items-center gap-3">
            <Filter size={14} /> Intelligence Filters
          </h2>
          <FilterSection title="Sources" options={filterOptions.sources} selected={selectedSources} onChange={(s: any) => setSelectedSources(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} icon={<Building2 size={14} className="text-zinc-700" />} />
          <FilterSection title="Categories" options={filterOptions.categories} selected={selectedCategories} onChange={(c: any) => setSelectedCategories(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])} icon={<Tag size={14} className="text-zinc-700" />} />
        </div>

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#0a0a0a]">
          <div className="max-w-5xl mx-auto px-12 py-20">
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
