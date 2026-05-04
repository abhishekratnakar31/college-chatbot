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
  Menu,
  Settings,
  HelpCircle,
  Grid,
  CloudSun,
} from "lucide-react";

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(" ");
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4005";

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

function WeatherWidget() {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
  const dateString = date.toLocaleDateString('en-US', options);

  return (
    <div className="flex items-center gap-6 bg-[#1f1f1f] rounded-2xl p-4 px-6 border border-white/5 hover:bg-[#2a2a2a] transition-all cursor-pointer group">
      <div className="flex flex-col">
        <span className="text-xs font-medium text-zinc-400">{dateString}</span>
        <div className="flex items-center gap-2 mt-1">
          <CloudSun className="text-yellow-500 w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-lg font-bold text-white">25°C</span>
        </div>
        <span className="text-[10px] text-zinc-500 font-medium">Bengaluru • Cloudy</span>
      </div>
      <div className="h-10 w-px bg-white/10 hidden sm:block" />
      <div className="hidden sm:flex flex-col justify-center">
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Forecast</span>
        <span className="text-xs text-white font-medium">Tomorrow: 27°C</span>
      </div>
    </div>
  );
}

function ArticleCardLarge({ article }: { article: Article }) {
  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block space-y-4"
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-white/5">
        <img 
          src={article.image || `https://images.unsplash.com/photo-1523050853063-8951ac51b4c3?w=800&auto=format&fit=crop&q=60`} 
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4">
          <span className="px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-black text-white uppercase tracking-wider border border-white/10">
            {article.source}
          </span>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-serif font-bold leading-tight group-hover:text-blue-400 transition-colors">
          {article.title}
        </h3>
        <p className="text-zinc-400 text-sm line-clamp-2 leading-relaxed font-medium">
          {article.summary}
        </p>
        <div className="flex items-center gap-2 pt-1">
          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[10px] font-bold uppercase tracking-wider">
            {article.category || "General"}
          </span>
          <span className="text-zinc-800">•</span>
          <span className="text-[10px] font-bold text-zinc-600 uppercase">
            {new Date(article.published_at || article.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="text-zinc-800">•</span>
          <span className="text-[10px] font-bold text-zinc-600 uppercase hover:text-white transition-colors cursor-pointer">
            Read more
          </span>
        </div>
      </div>
    </motion.a>
  );
}

function ArticleListItem({ article }: { article: Article }) {
  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-4 py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] -mx-4 px-4 transition-all"
    >
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-4 bg-zinc-800 rounded flex items-center justify-center">
            <span className="text-[8px] font-black">{article.source[0]}</span>
          </div>
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
            {article.source}
          </span>
        </div>
        <h4 className="text-sm font-bold leading-tight group-hover:text-blue-400 transition-colors line-clamp-2">
          {article.title}
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold text-blue-500/70 uppercase">
            {article.category || "General"}
          </span>
          <span className="text-zinc-800 text-[10px]">•</span>
          <span className="text-[10px] font-bold text-zinc-700">
            {new Date(article.published_at || article.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
      <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-white/5 bg-zinc-900">
        <img 
          src={article.image || `https://images.unsplash.com/photo-1541339907198-e08759dfc3ef?w=400&auto=format&fit=crop&q=60`} 
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
    </motion.a>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#1a1a1a] rounded-[2rem] p-8 border border-white/5 space-y-6">
      <div className="flex items-center justify-between group cursor-pointer">
        <h2 className="text-xl font-serif font-bold flex items-center gap-2 group-hover:text-blue-400 transition-colors">
          {title} <ChevronRight size={18} className="text-blue-500" />
        </h2>
        <Settings size={16} className="text-zinc-700 hover:text-white transition-colors" />
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalSearch, setGlobalSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Home");

  const fetchNews = useCallback(async (category?: string) => {
    setLoading(true);
    try {
      let url = `${API_URL}/news?limit=30`;
      if (category && category !== "Home") {
        url += `&category=${encodeURIComponent(category)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { 
    fetchNews(activeTab); 
  }, [fetchNews, activeTab]);

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(globalSearch.toLowerCase()) ||
    a.source.toLowerCase().includes(globalSearch.toLowerCase())
  );

  const featured = filteredArticles[0];
  const mainList = filteredArticles.slice(1, 10);
  const sideList1 = filteredArticles.slice(10, 14);
  const sideList2 = filteredArticles.slice(14, 18);

  const tabs = [
    "Home", "Admissions", "Results", "Placements", "Colleges", 
    "Internships", "Scholarships", "Tech", "Business", "Science", "Medical"
  ];

  return (
    <div className="flex h-screen bg-[#121212] text-white font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-20 border-r border-white/5 flex-col items-center py-8 gap-8 z-[100] bg-[#0a0a0a] shrink-0">
        <Link href="/" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-xl shadow-white/5">
          <GraduationCap className="text-black w-6 h-6" />
        </Link>
        <div className="flex flex-col gap-4">
          {[
            { icon: Brain, href: "/chat", label: "Chat" },
            { icon: Newspaper, href: "/news", label: "News", active: true },
            { icon: Trophy, href: "/rankings", label: "Rankings" },
          ].map((item) => (
            <Link 
              key={item.label} 
              href={item.href} 
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all", 
                item.active 
                  ? "bg-white text-black shadow-xl shadow-white/10" 
                  : "text-zinc-600 hover:text-white hover:bg-zinc-900"
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
          { icon: Newspaper, href: "/news", active: true },
          { icon: Trophy, href: "/rankings" }
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

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ── Google News Style Header ─────────────────────────────────── */}
        <header className="sticky top-0 z-[150] bg-[#121212]/80 backdrop-blur-2xl border-b border-white/5 shrink-0">
          <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 shrink-0">
              <Menu className="p-2 text-zinc-400 hover:text-white cursor-pointer hover:bg-white/5 rounded-full transition-all" size={40} />
              <Link href="/" className="flex items-center gap-2 ml-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-serif font-bold hidden sm:inline tracking-tight text-white">
                  Academia<span className="text-zinc-500">News</span>
                </span>
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="max-w-[1600px] mx-auto px-4 flex items-center gap-6 h-12 overflow-x-auto no-scrollbar scroll-smooth">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "text-xs font-bold whitespace-nowrap transition-all relative h-full flex items-center px-2",
                  activeTab === tab ? "text-blue-500" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-500 rounded-t-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  />
                )}
              </button>
            ))}
          </nav>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar pb-32 md:pb-20">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-12 md:py-16">
        
        {/* Briefing Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">Your briefing</h1>
            <p className="text-zinc-500 font-medium">Monday, 4 May • Curated for you</p>
          </div>
          <WeatherWidget />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Top Stories Section */}
            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif font-bold text-blue-400 flex items-center gap-2 cursor-pointer hover:underline">
                  Top stories <ChevronRight size={20} />
                </h2>
              </div>

              {loading ? (
                <div className="space-y-12">
                  <div className="aspect-[16/9] bg-white/5 rounded-[2rem] animate-pulse" />
                  <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
                          <div className="h-4 w-1/2 bg-white/5 rounded animate-pulse" />
                        </div>
                        <div className="w-20 h-20 bg-white/5 rounded-xl animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Left Side: Large Featured */}
                  <div className="md:col-span-1 border-r border-white/5 pr-0 md:pr-10">
                    {featured && <ArticleCardLarge article={featured} />}
                  </div>
                  
                  {/* Right Side: Headlines List */}
                  <div className="md:col-span-1 space-y-2">
                    {mainList.map((article) => (
                      <ArticleListItem key={article.id} article={article} />
                    ))}
                    <button className="w-full py-4 bg-white/5 rounded-2xl text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 mt-4">
                      <Grid size={14} /> See more headlines and perspectives
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Sub-featured Row */}
            {!loading && filteredArticles[19] && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-white/5 pt-12">
                <ArticleCardLarge article={filteredArticles[19]} />
                <ArticleCardLarge article={filteredArticles[20] || filteredArticles[19]} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <SidebarSection title="Local news">
              {sideList1.map((article) => (
                <ArticleListItem key={article.id} article={article} />
              ))}
            </SidebarSection>

            <SidebarSection title="Picks for you">
              {sideList2.map((article) => (
                <ArticleListItem key={article.id} article={article} />
              ))}
            </SidebarSection>
            </div>
          </div>
        </div>
      </main>
    </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @font-face {
          font-family: 'Google Sans';
          src: url('https://fonts.gstatic.com/s/googlesans/v14/4UatR6uyKRu675gn5NjL5R7V9_3K.woff2') format('woff2');
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        h1, h2, h3, h4, .font-serif {
          font-family: 'DM Serif Display', serif;
        }
      `}</style>

      {/* Font imports */}
      <link href="https://fonts.googleapis.com/css2?family=DM+Serid+Display&family=Inter:wght@400;500;700;900&display=swap" rel="stylesheet" />
    </div>
  );
}
