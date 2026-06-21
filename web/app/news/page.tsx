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
  CloudSun,
  Bookmark,
  LayoutGrid,
  TrendingUp,
  Sparkles,
  Bell,
  ExternalLink,
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

const getFallbackImage = (category?: string, index: number = 0) => {
  const cat = (category || "General").toLowerCase();

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
    <div className="min-h-screen bg-[#f3f4f6] text-black font-sans flex flex-col selection:bg-[#b69cc4]/30">
      {/* ── Breadcrumbs ── */}
      <div className="px-8 pt-8 pb-2">
        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight size={10} />
          <Link href="/tools" className="hover:text-black transition-colors">Tools</Link>
          <ChevronRight size={10} />
          <span className="text-black">Live Intelligence Feed</span>
        </div>
      </div>

      {/* Modern Header */}
      <header className="h-20 border-b-2 border-black flex items-center justify-between px-8 bg-white/95 backdrop-blur-xl z-[150] shrink-0 text-black">
        <div className="flex items-center gap-10">
          <span className="text-2xl font-serif font-black tracking-tight text-black">
            Academia<span className="text-zinc-500 italic font-bold">Intel</span>
          </span>
          <nav className="hidden xl:flex items-center gap-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em] transition-all relative py-2",
                  activeTab === tab
                    ? "text-black font-black"
                    : "text-zinc-500 hover:text-black",
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="tab-active"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full"
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
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              placeholder="Search dossiers..."
              className="bg-white border-2 border-black rounded-xl pl-12 pr-6 py-2.5 text-xs w-72 text-black outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-zinc-400"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />
          </div>
          <button className="w-10 h-10 border-2 border-black rounded-lg bg-white flex items-center justify-center text-black hover:bg-[#b69cc4] transition-all hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] shadow-[2px_2px_0px_0px_#000000] active:shadow-none">
            <Bell size={18} />
          </button>
        </div>
      </header>

      {/* Scrollable Intelligence Feed */}
      <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth p-6 lg:p-10">
        <div className="max-w-[1600px] mx-auto space-y-12 pb-24">
          {/* Intel Header */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8">
            <div className="space-y-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 text-black bg-[#b69cc4]/30 border border-black/20 px-2 py-0.5 rounded-md w-fit">
                <Sparkles size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  Live Intelligence Feed
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-serif font-black tracking-tight text-black">
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
              <div className="relative h-[400px] rounded-[2.5rem] overflow-hidden border-2 border-black group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                {featured ? (
                  <Link
                    href={featured.url}
                    target="_blank"
                    className="block w-full h-full relative"
                  >
                    <ArticleImage
                      src={featured.image}
                      category={featured.category}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-8 space-y-3 w-full text-white">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-[#b69cc4] text-black text-[9px] font-black uppercase tracking-widest rounded border-2 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                          Top Intelligence
                        </span>
                      </div>
                      <h2 className="text-3xl lg:text-4xl font-serif font-black leading-tight group-hover:text-[#a387b3] transition-colors">
                        {featured.title}
                      </h2>
                      <p className="text-zinc-300 text-sm font-medium line-clamp-1 max-w-xl">
                        {featured.summary}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <div className="w-full h-full bg-zinc-200 animate-pulse" />
                )}
              </div>

              {/* Secondary Bento Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bentoGrid.slice(0, 2).map((a, i) => (
                  <div
                    key={a.id}
                    className="rounded-[2.5rem] border-2 border-black overflow-hidden group bg-white relative h-64 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    <Link
                      href={a.url}
                      target="_blank"
                      className="flex flex-col h-full"
                    >
                      <div className="h-32 relative overflow-hidden border-b border-black">
                        <ArticleImage
                          src={a.image}
                          category={a.category}
                          index={i}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <div className="p-6 pt-2 text-black">
                        <h3 className="text-lg font-serif font-black leading-tight group-hover:text-[#a387b3] transition-colors line-clamp-2">
                          {a.title}
                        </h3>
                        <div className="mt-4 flex items-center justify-between text-zinc-500">
                          <span className="text-[9px] font-black uppercase tracking-widest">
                            {a.source}
                          </span>
                          <span className="text-[9px] font-black uppercase">
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
            <div className="lg:col-span-4">
              <div className="bg-white rounded-[2.5rem] border-2 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6 text-black">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Latest Intelligence
                  </span>
                  <TrendingUp size={14} className="text-[#a387b3]" />
                </div>
                <div className="space-y-4">
                  {filteredArticles.slice(3, 10).map((a) => (
                    <Link
                      key={a.id}
                      href={a.url}
                      target="_blank"
                      className="flex items-start gap-4 group/item py-2 border-b border-black/10 last:border-0"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 border-black bg-zinc-50">
                        <ArticleImage
                          src={a.image}
                          category={a.category}
                          className="w-full h-full object-cover grayscale group-hover/item:grayscale-0 transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[13px] font-bold leading-tight group-hover/item:text-[#a387b3] transition-colors line-clamp-2 text-black">
                          {a.title}
                        </h4>
                        <div className="flex items-center gap-3 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
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
    <div className="bg-white border-2 border-black rounded-[2rem] p-6 px-10 flex items-center gap-10 hover:bg-zinc-50 transition-all cursor-default group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black">
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
          {date.toLocaleDateString("en-US", { weekday: "long" })},{" "}
          {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
        <div className="flex items-center gap-4">
          <CloudSun className="text-yellow-500 w-10 h-10 group-hover:scale-110 transition-transform" />
          <div className="flex flex-col">
            <span className="text-4xl font-serif font-black text-black">
              25°C
            </span>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
              Cloudy • BLR
            </span>
          </div>
        </div>
      </div>
      <div className="w-0.5 h-16 bg-black/10" />
      <div className="flex flex-col justify-center">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
          Tomorrow
        </span>
        <span className="text-xl font-bold text-black">27°C</span>
        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
          Sunny
        </span>
      </div>
    </div>
  );
}

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
