"use client";

import { useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  GraduationCap,
  ChevronRight,
  Brain,
  Newspaper,
  Search,
  Settings,
  CloudSun,
  Bookmark,
  LayoutGrid,
  Tag,
  Clock,
  ArrowUpRight,
  Globe,
  Bell,
  Sparkles,
  TrendingUp,
  Zap,
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

// Enhanced Fallback Images for a Professional Look
const getFallbackImage = (category?: string, index: number = 0) => {
  const cat = (category || "General").toLowerCase();

  // High-quality architectural and academic imagery
  const images = {
    admission: [
      "https://images.unsplash.com/photo-1523050853063-8951ac51b4c3?w=1200&q=80",
      "https://images.unsplash.com/photo-1541339907198-e08759dfc3ef?w=1200&q=80",
    ],
    placement: [
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=80",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80",
    ],
    tech: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80",
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80",
    ],
    medical: [
      "https://images.unsplash.com/photo-1505751172107-5732488c371c?w=1200&q=80",
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80",
    ],
    general: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80",
      "https://images.unsplash.com/photo-1498243639359-f75cb752ee97?w=1200&q=80",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80",
    ],
  };

  if (cat.includes("admission")) return images.admission[index % 2];
  if (cat.includes("placement")) return images.placement[index % 2];
  if (cat.includes("tech")) return images.tech[index % 2];
  if (cat.includes("medical")) return images.medical[index % 2];

  return images.general[index % 3];
};

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews(activeTab);
  }, [fetchNews, activeTab]);

  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(globalSearch.toLowerCase()) ||
      a.source.toLowerCase().includes(globalSearch.toLowerCase()),
  );

  const featured = filteredArticles[0];
  const bentoGrid = filteredArticles.slice(1, 10);
  const trending = filteredArticles.slice(10, 15);

  const tabs = [
    "Home",
    "Admissions",
    "Results",
    "Placements",
    "Colleges",
    "Internships",
    "Scholarships",
    "Tech",
    "Business",
    "Science",
  ];



  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col">
        {/* ── Breadcrumbs ── */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
            <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
            <ChevronRight size={10} />
            <Link href="/tools" className="hover:text-blue-400 transition-colors">Tools</Link>
            <ChevronRight size={10} />
            <span className="text-white/40">Live Intelligence Feed</span>
          </div>
        </div>

        {/* Modern Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0a0a]/80 backdrop-blur-xl z-[150] shrink-0">
          <div className="flex items-center gap-10">
            <span className="text-2xl font-serif font-bold tracking-tight">
              Academia<span className="text-zinc-600 italic">Intel</span>
            </span>
            <nav className="hidden xl:flex items-center gap-8">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] transition-all relative py-2",
                    activeTab === tab
                      ? "text-white"
                      : "text-zinc-500 hover:text-white",
                  )}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="tab-active"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full shadow-[0_0_10px_white]"
                    />
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
              />
              <input
                type="text"
                placeholder="Search dossiers..."
                className="bg-zinc-900/50 border border-white/5 rounded-full pl-12 pr-6 py-2.5 text-xs w-72 outline-none focus:bg-zinc-900 focus:border-white/20 transition-all"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
            </div>
            <button className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-colors">
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* Scrollable Intelligence Feed */}
        <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth p-6 lg:p-10">
          <div className="max-w-[1600px] mx-auto space-y-12 pb-24">
            {/* Optimized Intel Header */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-blue-400">
                  <Sparkles size={14} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                    Live Intelligence Feed
                  </span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-serif font-bold tracking-tight">
                  Global Briefing.
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <WeatherWidget />
              </div>
            </div>

            {/* Compact Hybrid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Featured & Bento */}
              <div className="lg:col-span-8 space-y-6">
                {/* Compact Featured Card */}
                <div className="relative h-[400px] rounded-[2.5rem] overflow-hidden border border-white/5 group shadow-xl">
                  {featured ? (
                    <Link
                      href={featured.url}
                      target="_blank"
                      className="block w-full h-full relative"
                    >
                      <ArticleImage
                        src={featured.image}
                        category={featured.category}
                        className="absolute inset-0"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/10 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-8 space-y-3 w-full">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-full">
                            Top Intelligence
                          </span>
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-serif font-bold leading-tight group-hover:text-blue-400 transition-colors">
                          {featured.title}
                        </h2>
                        <p className="text-zinc-400 text-sm font-medium line-clamp-1 max-w-xl">
                          {featured.summary}
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <div className="w-full h-full bg-zinc-900 animate-pulse" />
                  )}
                </div>

                {/* Secondary Bento Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {bentoGrid.slice(0, 2).map((a, i) => (
                    <div
                      key={a.id}
                      className="rounded-[2.5rem] border border-white/5 overflow-hidden group bg-[#121212] relative h-64 shadow-lg"
                    >
                      <Link
                        href={a.url}
                        target="_blank"
                        className="flex flex-col h-full"
                      >
                        <div className="h-32 relative overflow-hidden">
                          <ArticleImage
                            src={a.image}
                            category={a.category}
                            index={i}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent" />
                        </div>
                        <div className="p-6 pt-2">
                          <h3 className="text-lg font-serif font-bold leading-tight group-hover:text-blue-400 transition-colors line-clamp-2">
                            {a.title}
                          </h3>
                          <div className="mt-4 flex items-center justify-between opacity-50">
                            <span className="text-[9px] font-bold uppercase tracking-widest">
                              {a.source}
                            </span>
                            <span className="text-[9px] font-bold uppercase">
                              {formatRelativeTime(
                                a.published_at || a.created_at,
                              )}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Dense List */}
              <div className="lg:col-span-4 space-y-6">
                {/* Dense News List */}
                <div className="bg-[#121212] rounded-[2.5rem] border border-white/5 p-8 shadow-xl space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Latest Intelligence
                    </span>
                    <TrendingUp size={14} className="text-blue-500" />
                  </div>
                  <div className="space-y-4">
                    {filteredArticles.slice(3, 10).map((a) => (
                      <Link
                        key={a.id}
                        href={a.url}
                        target="_blank"
                        className="flex items-start gap-4 group/item py-2 border-b border-white/5 last:border-0"
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/5">
                          <ArticleImage
                            src={a.image}
                            category={a.category}
                            className="w-full h-full object-cover grayscale group-hover/item:grayscale-0 transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-[13px] font-bold leading-tight group-hover/item:text-blue-400 transition-colors line-clamp-2">
                            {a.title}
                          </h4>
                          <div className="flex items-center gap-3 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                            <span>{a.source}</span>
                            <span>•</span>
                            <span>
                              {formatRelativeTime(
                                a.published_at || a.created_at,
                              )}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

      {/* Mobile Floating Nav */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-[#121212]/90 border border-white/10 rounded-full px-2 py-2 flex items-center gap-1 shadow-2xl backdrop-blur-xl">
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
              "flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300",
              item.active
                ? "bg-white text-black shadow-xl"
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

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        body {
          font-family:
            "Inter",
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            sans-serif;
          background: #0a0a0a;
        }

        h1,
        h2,
        h3,
        h4,
        .font-serif {
          font-family: "DM Serif Display", serif;
        }
      `}</style>

      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;700;900&display=swap"
        rel="stylesheet"
      />
    </div>
  );
}

function WeatherWidget() {
  const date = new Date();
  return (
    <div className="bg-[#121212] border border-white/5 rounded-[2.5rem] p-6 px-10 flex items-center gap-10 hover:bg-[#1a1a1a] transition-all cursor-default group shadow-2xl">
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2">
          {date.toLocaleDateString("en-US", { weekday: "long" })},{" "}
          {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
        <div className="flex items-center gap-4">
          <CloudSun className="text-yellow-500 w-10 h-10 group-hover:scale-110 transition-transform" />
          <div className="flex flex-col">
            <span className="text-4xl font-serif font-bold text-white">
              25°C
            </span>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
              Cloudy • BLR
            </span>
          </div>
        </div>
      </div>
      <div className="w-px h-16 bg-white/5" />
      <div className="flex flex-col justify-center">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2">
          Tomorrow
        </span>
        <span className="text-xl font-bold text-white">27°C</span>
        <span className="text-[10px] font-medium text-emerald-500 uppercase tracking-wider">
          Sunny
        </span>
      </div>
    </div>
  );
}

// Dedicated Image Component to handle fallback and variety
function ArticleImage({
  src,
  category,
  className,
  index = 0,
}: {
  src?: string;
  category?: string;
  className?: string;
  index?: number;
}) {
  const [imgSrc, setImgSrc] = useState(
    src || getFallbackImage(category, index),
  );
  const [hasError, setHasError] = useState(false);

  // If the source looks like a generic Google News logo, use fallback
  const isGenericLogo =
    src?.includes("google") || src?.includes("logo") || !src;

  useEffect(() => {
    if (isGenericLogo) {
      setImgSrc(getFallbackImage(category, index));
    } else {
      setImgSrc(src!);
    }
  }, [src, category, index, isGenericLogo]);

  return (
    <img
      src={imgSrc}
      className={cn("w-full h-full object-cover", className)}
      alt=""
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(getFallbackImage(category, index));
        }
      }}
    />
  );
}
