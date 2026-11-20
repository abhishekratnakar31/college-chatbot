"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  role: "user" | "assistant";
  content: string;
};

import {
  ArrowRight,
  GraduationCap,
  Search,
  Newspaper,
  ExternalLink,
  Calendar,
  ArrowUpRight,
  FileText,
  X,
  Trophy,
  Brain,
  Loader2,
  FlaskConical,
  HeartPulse,
  Landmark,
  Palette,
  Microscope,
  Building2,
  Building,
  University,
  School,
  Library,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Sparkles,
  IndianRupee,
  Info,
  Zap,
  Bookmark,
  Crosshair,
  LayoutGrid,
  MessageCircle,
  Database,
  TrendingUp,
  ShieldCheck,
  Layers,
  Users,
  Mic,
  Radio,
  Twitter,
  Github,
  Linkedin,
  ChevronDown,
} from "lucide-react";

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(" ");

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

// ── Parallax Component ──────────────────────────────────────────────────────
function ParallaxScroll({
  children,
  speed = 0.5,
}: {
  children: React.ReactNode;
  speed?: number;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 200]);

  return (
    <motion.div ref={ref} style={{ y }}>
      {children}
    </motion.div>
  );
}

// ── Reveal Component ────────────────────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Top Study Places ─────────────────────────────────────────────────────────
const TOP_CITIES = [
  {
    name: "Delhi NCR",
    icon: <Landmark className="w-8 h-8 text-zinc-600" />,
    query: "New Delhi",
    state: "Delhi",
    university: "IIT Delhi",
  },
  {
    name: "Bangalore",
    icon: <Building2 className="w-8 h-8 text-zinc-600" />,
    query: "Bangalore",
    state: "Karnataka",
    university: "IISc Bangalore",
  },
  {
    name: "Hyderabad",
    icon: <Building className="w-8 h-8 text-zinc-600" />,
    query: "Hyderabad",
    state: "Telangana",
    university: "IIT Hyderabad",
  },
  {
    name: "Pune",
    icon: <University className="w-8 h-8 text-zinc-600" />,
    query: "Pune",
    state: "Maharashtra",
    university: "COEP Pune",
  },
  {
    name: "Mumbai",
    icon: <Building2 className="w-8 h-8 text-zinc-600" />,
    query: "Mumbai",
    state: "Maharashtra",
    university: "IIT Bombay",
  },
  {
    name: "Chennai",
    icon: <School className="w-8 h-8 text-zinc-600" />,
    query: "Chennai",
    state: "Tamil Nadu",
    university: "IIT Madras",
  },
  {
    name: "Kolkata",
    icon: <Library className="w-8 h-8 text-zinc-600" />,
    query: "Kolkata",
    state: "West Bengal",
    university: "Jadavpur University",
  },
  {
    name: "Bhopal",
    icon: <Landmark className="w-8 h-8 text-zinc-600" />,
    query: "Bhopal",
    state: "Madhya Pradesh",
    university: "MANIT Bhopal",
  },
];

function TopStudyPlaces() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth / 2
          : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-16 md:py-32 px-6">
      <Reveal>
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 md:gap-0 mb-12 md:mb-16">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-serif font-black text-black tracking-tight mb-4">
              Top Study Places
            </h2>
            <p className="text-zinc-700 text-lg font-medium">
              Discover your future academic home in India's leading education
              hubs.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => scroll("left")}
              className="w-12 h-12 rounded-full border-2 border-black bg-white text-black flex items-center justify-center hover:bg-[#b69cc4] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-12 h-12 rounded-full border-2 border-black bg-white text-black flex items-center justify-center hover:bg-[#b69cc4] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </Reveal>
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-12 scrollbar-hide snap-x snap-mandatory"
      >
        {TOP_CITIES.map((city, i) => (
          <Reveal key={city.name} delay={i * 0.05}>
            <Link
              href={`/rankings?city=${encodeURIComponent(city.query)}&state=${encodeURIComponent(city.state)}`}
              className="flex-shrink-0 w-72 aspect-[3/4] snap-start p-10 rounded-[2.5rem] bg-white border-2 border-black hover:bg-[#f9fafb] transition-all duration-500 group flex flex-col items-center justify-between text-center relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="relative z-10 w-full flex flex-col items-center gap-8">
                <div className="w-16 h-16 rounded-2xl bg-[#f3f4f6] border-2 border-black flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {React.cloneElement(city.icon as React.ReactElement<any>, {
                    className:
                      "w-8 h-8 text-black group-hover:text-black transition-colors",
                  })}
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-serif font-black text-black">
                    {city.name}
                  </h3>
                  <div className="px-3 py-1 rounded-full bg-[#f3f4f6] border-2 border-black text-[10px] font-black text-black uppercase tracking-widest">
                    {city.university}
                  </div>
                </div>
              </div>

              <div className="relative z-10 w-full pt-8 border-t-2 border-black flex flex-col items-center gap-4">
                <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em]">
                  Institution Hub
                </p>
                <div className="w-10 h-10 rounded-full border-2 border-black bg-[#b69cc4] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <ArrowUpRight size={16} className="text-black" />
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

const DEFAULT_PREVIEW_NEWS = [
  {
    id: 1,
    title: "UP NEET PG 2026 Round 2 Merit List Out: Check State Rank List & Choice",
    source: "NEET PG",
    category: "Admissions",
    published_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 2,
    title: "IIT Delhi Launches Special PhD Admission Drive for Emerging Tech Research",
    source: "IIT Delhi",
    category: "Research",
    published_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  },
  {
    id: 3,
    title: "JEE Advanced 2026 Cutoff Ranks & B.Tech CSE Opening-Closing Trends",
    source: "JEE Portal",
    category: "Admissions",
    published_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
];

const DEFAULT_PREVIEW_RANKINGS = [
  {
    id: 1,
    college: "IIT Madras",
    nirf_rank: 1,
    nirf_category: "Engineering",
    city: "Chennai",
    state: "Tamil Nadu",
    avg_package: "21.4",
  },
  {
    id: 2,
    college: "IISc Bangalore",
    nirf_rank: 2,
    nirf_category: "University",
    city: "Bangalore",
    state: "Karnataka",
    avg_package: "28.0",
  },
  {
    id: 3,
    college: "IIT Bombay",
    nirf_rank: 3,
    nirf_category: "Engineering",
    city: "Mumbai",
    state: "Maharashtra",
    avg_package: "23.5",
  },
  {
    id: 4,
    college: "IIT Delhi",
    nirf_rank: 4,
    nirf_category: "Engineering",
    city: "New Delhi",
    state: "Delhi",
    avg_package: "22.8",
  },
];

function ExperienceHub({ news: propNews, rankings: propRankings }: { news?: any[]; rankings?: any[] }) {
  const [activeTab, setActiveTab] = useState("Chat");
  const [newsList, setNewsList] = useState<any[]>(propNews && propNews.length > 0 ? propNews : DEFAULT_PREVIEW_NEWS);
  const [rankingsList, setRankingsList] = useState<any[]>(propRankings && propRankings.length > 0 ? propRankings : DEFAULT_PREVIEW_RANKINGS);

  useEffect(() => {
    if (propNews && propNews.length > 0) {
      setNewsList(propNews);
    } else {
      fetch(`${API_URL}/news?limit=5`)
        .then((r) => r.json())
        .then((d) => {
          if (d.articles && d.articles.length > 0) setNewsList(d.articles);
        })
        .catch(() => {});
    }
  }, [propNews]);

  useEffect(() => {
    if (propRankings && propRankings.length > 0) {
      setRankingsList(propRankings);
    } else {
      fetch(`${API_URL}/rankings?limit=5&sort=nirf_rank`)
        .then((r) => r.json())
        .then((d) => {
          if (d.colleges && d.colleges.length > 0) setRankingsList(d.colleges);
        })
        .catch(() => {});
    }
  }, [propRankings]);
  const tabs = [
    {
      id: "Chat",
      icon: Brain,
      label: "Neural Chat",
      desc: "Interact with our RAG-powered engine to extract precise data from thousands of college prospectuses.",
      detail:
        "Neural Chat offers a unified interface for deep academic research. Seamlessly upload college prospectuses as PDFs, interact hands-free with Aura Voice, or activate Comparison Mode for side-by-side institutional analysis. Toggle Web Mode for real-time internet intelligence, ensuring you have every perspective.",
    },
    {
      id: "News",
      icon: Newspaper,
      label: "Intelligence Feed",
      desc: "A real-time pulse of Indian academia, tracking every major admission update and cutoff change.",
      detail:
        "Stay ahead with our Intelligence Feed, a real-time data layer tracking every major shift in Indian academia. From sudden admission notification drops to evolving cutoff trends, our AI aggregates and synthesizes information from official sources to keep you informed instantly.",
    },
    {
      id: "Rankings",
      icon: Trophy,
      label: "Global Rankings",
      desc: "Go beyond simple lists with verifiable innovation and placement-density metrics.",
      detail:
        "Navigate institutional excellence with our Global Rankings engine. We move beyond static lists by integrating verifiable placement-density metrics and innovation scores. Discover colleges that truly align with your research ambitions and career ROI through our data-driven academic leaderboard.",
    },
  ];

  return (
    <section className="w-full py-24 md:py-48 px-6 bg-[#f3f4f6]">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <Reveal>
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-6xl font-serif font-black text-black">
              How you can use{" "}
              <span className="italic text-[#b69cc4]">AcademiaAI.</span>
            </h2>
          </div>
        </Reveal>

        {/* Tab Bar */}
        <div className="bg-white p-1.5 rounded-full border-2 border-black flex flex-wrap justify-center gap-1 mb-16 relative z-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-full text-sm font-black transition-all duration-300",
                activeTab === tab.id
                  ? "bg-[#b69cc4] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  : "text-zinc-600 hover:text-black hover:bg-zinc-100",
              )}
            >
              <tab.icon size={18} />
              {tab.id}
            </button>
          ))}
        </div>

        {/* Split Section: Text Left, Preview Right */}
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          {/* Left: Narrative */}
          <div className="lg:col-span-5 space-y-10 text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <h3 className="text-4xl md:text-6xl font-serif font-black text-black leading-tight">
                    {tabs.find((t) => t.id === activeTab)?.label.split(" ")[0]}{" "}
                    <br />
                    <span className="text-[#b69cc4] italic">
                      {
                        tabs
                          .find((t) => t.id === activeTab)
                          ?.label.split(" ")[1]
                      }
                    </span>
                  </h3>
                  <p className="text-zinc-700 text-lg md:text-xl leading-relaxed font-medium">
                    {tabs.find((t) => t.id === activeTab)?.desc}
                  </p>
                </div>

                <p className="text-zinc-600 text-sm md:text-base leading-relaxed border-l-2 border-black pl-8">
                  {tabs.find((t) => t.id === activeTab)?.detail}
                </p>

                <Link
                  href={`/${activeTab.toLowerCase()}`}
                  className="inline-flex h-12 items-center px-10 rounded-full border-2 border-black bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-[#b69cc4] transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  Explore {activeTab} Intelligence
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Preview Window */}
          <div className="lg:col-span-7 relative h-full">
            <div className="aspect-[4/3] rounded-[3rem] bg-white border-2 border-black relative overflow-hidden group shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.6, ease: "circOut" }}
                  className="absolute inset-0 p-6 md:p-10 flex items-center justify-center"
                >
                  {/* Visual Preview */}
                  <div className="w-full h-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#b69cc4] bg-[linear-gradient(to_right,#00000010_1px,transparent_1px),linear-gradient(to_bottom,#00000010_1px,transparent_1px)] bg-[size:32px_32px] rounded-3xl border-2 border-black p-6 md:p-12 overflow-hidden flex flex-col justify-center">
                      {activeTab === "Chat" && (
                        <div className="space-y-6 text-left">
                          <div className="flex gap-4 items-start max-w-[85%]">
                            <div className="w-8 h-8 rounded-full bg-white border border-black flex items-center justify-center shrink-0">
                              <Users size={14} className="text-black" />
                            </div>
                            <div className="bg-white p-5 rounded-2xl rounded-tl-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                              <p className="text-xs md:text-sm text-black font-semibold">
                                Compare placements at IIT Delhi and BITS Pilani
                                for CS.
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-4 items-start ml-auto max-w-[85%] text-right justify-end">
                            <div className="bg-zinc-50 p-5 rounded-2xl rounded-tr-none border-2 border-black">
                              <p className="text-xs md:text-sm text-black font-medium leading-relaxed">
                                IIT Delhi shows a{" "}
                                <span className="text-black font-black underline">
                                  12% higher
                                </span>{" "}
                                median package for 2024, but BITS has a{" "}
                                <span className="text-black font-black underline">
                                  wider recruiter network
                                </span>
                                ...
                              </p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                              <GraduationCap size={14} className="text-black" />
                            </div>
                          </div>
                        </div>
                      )}
                      {activeTab === "News" && (
                        <div className="space-y-4 text-left w-full">
                          <div className="flex justify-between items-center px-1">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                              <h4 className="text-xs font-black text-black uppercase tracking-widest">
                                Global Intelligence Feed
                              </h4>
                            </div>
                            <Link
                              href="/news"
                              className="text-[11px] font-black text-black hover:text-[#8a689b] flex items-center gap-1 group bg-white/70 px-2.5 py-1 rounded-full border border-black/30 shadow-[1px_1px_0px_0px_#000000]"
                            >
                              <span>Explore News</span>
                              <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                          </div>
                          <div className="space-y-2.5">
                            {newsList.slice(0, 3).map((article, i) => (
                              <Link
                                key={article.id || i}
                                href="/news"
                                className="block p-4 rounded-2xl bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all group/item"
                              >
                                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-zinc-500 mb-1.5">
                                  <span className="bg-[#b69cc4] text-black px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_#000000]">
                                    {article.category || "Intel"}
                                  </span>
                                  <span className="font-bold text-zinc-600">
                                    {article.source || "Official Source"} • {formatRelativeTime(article.published_at || article.created_at) || "Latest"}
                                  </span>
                                </div>
                                <p className="text-xs md:text-sm font-bold text-black line-clamp-1 group-hover/item:text-[#8a689b] transition-colors">
                                  {article.title}
                                </p>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                      {activeTab === "Rankings" && (
                        <div className="space-y-4 text-left w-full">
                          <div className="flex justify-between items-center px-1">
                            <div className="flex items-center gap-2">
                              <Trophy size={14} className="text-black" />
                              <h4 className="text-xs font-black text-black uppercase tracking-widest">
                                Live NIRF Leaderboard
                              </h4>
                            </div>
                            <Link
                              href="/rankings"
                              className="text-[11px] font-black text-black hover:text-[#8a689b] flex items-center gap-1 group bg-white/70 px-2.5 py-1 rounded-full border border-black/30 shadow-[1px_1px_0px_0px_#000000]"
                            >
                              <span>View Rankings</span>
                              <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                          </div>
                          <div className="space-y-2.5">
                            {rankingsList.slice(0, 4).map((college, i) => (
                              <Link
                                key={college.id || i}
                                href="/rankings"
                                className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group/rank hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                              >
                                <div className="w-8 h-8 rounded-xl bg-[#f3f4f6] border border-black flex items-center justify-center text-xs font-black text-black group-hover/rank:bg-[#b69cc4] transition-colors shrink-0">
                                  #{college.nirf_rank || college.rank || i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-black truncate group-hover/rank:text-[#8a689b] transition-colors">
                                    {college.college}
                                  </p>
                                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider truncate">
                                    {college.city}{college.state ? `, ${college.state}` : ""}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-zinc-100 border border-black/20 text-zinc-700">
                                    {college.avg_package && Number(college.avg_package) > 0 ? `₹${college.avg_package}L` : college.nirf_category || "NIRF Top"}
                                  </span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Section Card ────────────────────────────────────────────────────────────
function SectionCard({
  title,
  desc,
  href,
  image,
  badge,
  icon: Icon,
  reverse = false,
  customContent,
}: any) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row items-center gap-16 lg:gap-24",
        reverse && "md:flex-row-reverse",
      )}
    >
      <div className="flex-1 space-y-10">
        <Reveal>
          <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            <Icon size={14} />
            {badge}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-[1.05] tracking-tighter">
            {title}
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-zinc-400 text-xl font-medium leading-relaxed max-w-xl">
            {desc}
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <Link
            href={href}
            className="inline-flex items-center gap-4 px-10 py-5 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all hover:scale-105 shadow-2xl shadow-white/5 group"
          >
            Explore{" "}
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </Reveal>
      </div>
      <div className="flex-1 w-full">
        <Reveal delay={0.2}>
          {customContent ? (
            customContent
          ) : (
            <div className="relative aspect-[4/3] rounded-[3.5rem] overflow-hidden shadow-2xl shadow-black/40 group bg-zinc-900 border border-zinc-800">
              <img
                src={image}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          )}
        </Reveal>
      </div>
    </div>
  );
}

// ── News Dashboard Component ────────────────────────────────────────────────
function NewsDashboard({ articles }: { articles: any[] }) {
  return (
    <div className="relative aspect-auto md:aspect-[4/3] min-h-[400px] md:min-h-0 rounded-[2rem] md:rounded-[3.5rem] overflow-hidden border-2 border-black bg-white p-6 md:p-8 flex flex-col gap-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Current News */}
        <div className="bg-zinc-50 rounded-3xl p-6 border-2 border-black flex flex-col gap-4 overflow-hidden h-full">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
            Current News
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {articles.length > 0
              ? articles.map((news, i) => {
                  // Extract acronym or first few words as potential college context if not in source
                  const collegeMatch =
                    news.title.match(/^([A-Z]{2,6})\b/) ||
                    news.title.match(
                      /at (IIT [A-Z][a-z]+|NIT [A-Z][a-z]+|BITS [A-Z][a-z]+)/,
                    );
                  const collegeLabel = collegeMatch ? collegeMatch[1] : null;

                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            "text-[11px] font-bold leading-tight line-clamp-2",
                            i === 0 ? "text-black" : "text-zinc-700",
                          )}
                        >
                          {news.title}
                        </p>
                        {collegeLabel && (
                          <span className="flex-shrink-0 px-1.5 py-0.5 rounded-md bg-white border border-black text-[7px] font-black text-black uppercase tracking-tighter">
                            {collegeLabel}
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-zinc-500 font-medium uppercase tracking-tighter">
                        {news.source} •{" "}
                        {formatRelativeTime(
                          news.published_at || news.created_at,
                        )}
                      </p>
                    </div>
                  );
                })
              : [1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2 animate-pulse">
                    <div className="h-3 bg-zinc-200 rounded w-full" />
                    <div className="h-2 bg-zinc-200 rounded w-1/2" />
                  </div>
                ))}
          </div>
          <div className="pt-4 border-t-2 border-black flex items-center justify-between mt-auto">
            <div className="w-8 h-8 rounded-lg bg-[#b69cc4] border border-black flex items-center justify-center">
              <Newspaper size={14} className="text-black" />
            </div>
            <span className="text-[9px] font-black text-black uppercase tracking-widest">
              Live Updates
            </span>
          </div>
        </div>

        {/* Admission Updates */}
        <div className="space-y-6">
          <div className="bg-zinc-50 rounded-3xl p-6 border-2 border-black flex flex-col items-center justify-center text-center gap-4 h-full">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-zinc-200"
                />
                <motion.circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="251.2"
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: 251.2 * 0.28 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="text-[#b69cc4]"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-black">+12%</span>
                <span className="text-[8px] font-black text-zinc-500 uppercase">
                  Growth
                </span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Admission Rate
              </p>
              <p className="text-lg font-serif font-black italic text-black mt-1">
                94% Enrollment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Intelligence Section ───────────────────────────────────────────────────
function IntelligenceSection({ news }: { news: any[] }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <div
      ref={containerRef}
      id="news"
      className="w-full py-20 md:py-48 px-6 bg-[#f3f4f6] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
        <motion.div style={{ y: y1 }} className="space-y-12 text-left">
          <Reveal delay={0.1}>
            <h2 className="text-4xl sm:text-5xl md:text-8xl font-serif font-black text-black tracking-tighter leading-[0.95]">
              Stay ahead with the <br />
              <span className="text-[#b69cc4] italic font-medium">latest buzz.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-zinc-700 text-2xl font-medium max-w-xl leading-relaxed">
              Latest news and articles on admissions, cut-offs, and results
              across 100+ premier Indian institutions.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <Link
              href="/news"
              className="inline-flex items-center gap-4 px-8 py-5 md:px-12 md:py-6 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#b69cc4] hover:text-black border-2 border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] group/btn"
            >
              Explore Full Feed
              <ArrowRight
                size={16}
                className="group-hover/btn:translate-x-1 transition-transform"
              />
            </Link>
          </Reveal>
        </motion.div>

        <motion.div
          style={{ y: y2 }}
          className="relative group hidden md:block"
        >
          <Reveal delay={0.4}>
            <div className="relative group">
              <NewsDashboard articles={news} />
            </div>
          </Reveal>
        </motion.div>
      </div>
    </div>
  );
}

// ── Rankings Dashboard Component ─────────────────────────────────────────────
function RankingsDashboard({ colleges }: { colleges: any[] }) {
  return (
    <div className="relative aspect-auto md:aspect-[4/3] min-h-[400px] md:min-h-0 rounded-[2rem] md:rounded-[3.5rem] overflow-hidden border-2 border-black bg-white p-6 md:p-10 flex flex-col gap-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            Live Leaderboard
          </h3>
          <p className="text-xl font-serif font-black text-black mt-1 italic">
            Top Performers 2025
          </p>
        </div>
        <Trophy size={24} className="text-black" />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
        {colleges.length > 0
          ? colleges.map((college, i) => (
              <div key={college.id} className="flex items-center gap-6 group">
                <div className="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center text-xs font-black text-black group-hover:bg-[#b69cc4] transition-colors flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-black group-hover:text-[#b69cc4] transition-colors truncate">
                    {college.college}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest truncate">
                      {college.city}, {college.state}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="h-2 flex-1 bg-zinc-100 rounded-full border border-black overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(college.innovation_score / 100) * 100}%`,
                        }}
                        transition={{ duration: 1, delay: i * 0.05 }}
                        className="h-full bg-[#b69cc4]"
                      />
                    </div>
                    <span className="text-[10px] font-black text-black">
                      {college.innovation_score}
                    </span>
                  </div>
                </div>
              </div>
            ))
          : [1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-6 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-zinc-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-zinc-200 rounded w-1/2" />
                  <div className="h-1 bg-zinc-200 rounded w-full" />
                </div>
              </div>
            ))}
      </div>

      <div className="pt-6 border-t-2 border-black flex items-center justify-between">
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full border-2 border-black bg-[#b69cc4]"
            />
          ))}
          <div className="w-6 h-6 rounded-full border-2 border-black bg-white flex items-center justify-center text-[8px] font-black text-black">
            +12
          </div>
        </div>
        <span className="text-[9px] font-black text-black uppercase tracking-widest">
          Global Index Verified
        </span>
      </div>
    </div>
  );
}

// ── Rankings Section ────────────────────────────────────────────────────────
function RankingsSection({ rankings }: { rankings: any[] }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <div
      ref={containerRef}
      id="rankings"
      className="w-full py-48 px-6 bg-[#f3f4f6] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
        <motion.div
          style={{ y: y1 }}
          className="relative group lg:order-1 hidden md:block"
        >
          <Reveal delay={0.4}>
            <div className="relative group">
              <RankingsDashboard colleges={rankings} />
            </div>
          </Reveal>
        </motion.div>

        <motion.div style={{ y: y2 }} className="space-y-12 lg:order-2 text-left">
          <Reveal delay={0.1}>
            <h2 className="text-4xl sm:text-5xl md:text-8xl font-serif font-black text-black tracking-tighter leading-[0.95]">
              Discover your <br />
              <span className="text-[#b69cc4] italic font-medium">perfect match.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-zinc-700 text-2xl font-medium max-w-xl leading-relaxed">
              Rankings based on verifiable innovation, placement metrics, and
              global impact.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <Link
              href="/rankings"
              className="inline-flex items-center gap-4 px-8 py-5 md:px-12 md:py-6 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#b69cc4] hover:text-black border-2 border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] group/btn"
            >
              View Rankings
              <ArrowRight
                size={16}
                className="group-hover/btn:translate-x-1 transition-transform"
              />
            </Link>
          </Reveal>
        </motion.div>
      </div>
    </div>
  );
}

// ── Quick Actions ────────────────────────────────────────────────────────────
function InformationHub({ news, rankings }: { news: any[]; rankings: any[] }) {
  return (
    <section className="w-full py-32 md:py-64 px-6 bg-[#f3f4f6]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Intelligence Terminal Visual (Voice + Filters) */}
          <Reveal delay={0.2} className="order-2 lg:order-1">
            <div className="relative aspect-square w-full max-w-lg mx-auto">
              <div className="absolute inset-0 bg-[#b69cc4] bg-[linear-gradient(to_right,#00000010_1px,transparent_1px),linear-gradient(to_bottom,#00000010_1px,transparent_1px)] bg-[size:32px_32px] rounded-[3rem] border-2 border-black overflow-hidden group shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                {/* Header/Status */}
                <div className="p-6 border-b-2 border-black flex justify-between items-center bg-white">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-black uppercase tracking-[0.2em]">
                      Neural-V1 Active
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-black" />
                    <div className="w-1.5 h-1.5 rounded-full bg-black" />
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-12 overflow-hidden bg-white/50">
                  {/* Left: Filter Sidebar */}
                  <div className="col-span-4 border-r-2 border-black p-4 space-y-6 bg-white/80">
                    <div className="space-y-3">
                      <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">
                        Field
                      </p>
                      <div className="px-3 py-2 rounded-lg bg-[#b69cc4] border border-black text-black text-[9px] font-black text-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                        Engineering
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">
                        Exam
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {["JEE Main", "JEE Adv"].map((exam) => (
                          <div
                            key={exam}
                            className="px-2 py-1.5 rounded-lg bg-white border border-black text-black text-[8px] font-bold text-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                          >
                            {exam}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">
                        Category
                      </p>
                      <div className="px-3 py-2 rounded-lg bg-white border border-black text-black text-[9px] font-bold text-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                        General
                      </div>
                    </div>
                  </div>

                  {/* Right: Voice Hub */}
                  <div className="col-span-8 relative flex flex-col items-center justify-center p-8 bg-white/20">
                    {/* Ripple Rings */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {[1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1.5, opacity: 0 }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.8,
                          }}
                          className="absolute w-32 h-32 rounded-full border border-black/20"
                        />
                      ))}
                    </div>

                    {/* Mic Button */}
                    <div className="relative z-10 w-24 h-24 rounded-full bg-white border-2 border-black flex flex-col items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all">
                      <Mic size={24} className="text-black mb-2" />
                      <span className="text-[7px] font-black text-black uppercase tracking-tighter">
                        Tap to Speak
                      </span>
                    </div>

                    <div className="mt-8 text-center space-y-1">
                      <p className="text-[10px] font-black text-black tracking-tight uppercase">
                        System Ready
                      </p>
                      <p className="text-[8px] text-zinc-600 leading-relaxed max-w-[140px]">
                        Initialize analysis across national pathways.
                      </p>
                    </div>

                    {/* Analyze Button */}
                    <div className="mt-10 w-full">
                      <div className="w-full py-3 rounded-xl bg-black border-2 border-black text-white text-[9px] font-black uppercase tracking-widest text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#b69cc4] hover:text-black transition-all">
                        Analyze Signal
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal className="order-1 lg:order-2">
            <div className="space-y-8 lg:pl-16 text-left">
              <h2 className="text-4xl md:text-7xl font-serif font-black text-black tracking-tight leading-[1.1]">
                Eliminate guesswork. <br />
                <span className="text-[#b69cc4] italic font-medium">
                  Predict with precision.
                </span>
              </h2>
              <div className="space-y-6 max-w-xl">
                <p className="text-zinc-700 text-xl leading-relaxed font-medium">
                  Our Neural Predictor is an advanced inference engine that
                  cross-references your profile with 15+ years of institutional
                  cutoff shifts and enrollment behaviors.
                </p>
                <p className="text-zinc-600 text-base leading-relaxed border-l-2 border-black pl-6">
                  By modeling thousands of variables—from category shifts to
                  regional demand—Aura identifies patterns traditional search
                  misses, giving you a{" "}
                  <span className="text-black font-black underline">94% accurate</span>{" "}
                  success probability.
                </p>
              </div>
              <Link
                href="/predictor"
                className="inline-flex items-center gap-4 text-xs font-black text-black hover:text-[#b69cc4] uppercase tracking-[0.2em] group"
              >
                Check My Chances{" "}
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-white border-t-2 border-black pt-20 md:pt-32 pb-16 px-6 md:px-8 text-black">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-16 mb-24">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white rounded-xl border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <GraduationCap className="text-black w-6 h-6" />
              </div>
              <span className="text-2xl font-serif font-black tracking-tight text-black">
                AcademiaAI
              </span>
            </div>
            <p className="text-zinc-600 text-base font-semibold leading-relaxed max-w-[240px]">
              The intelligent platform to explore and discover Indian academia.
            </p>
          </div>
          <div className="col-span-1 md:col-span-1">
            <h4 className="text-black font-black text-[10px] mb-8 uppercase tracking-[0.3em]">
              Platform
            </h4>
            <ul className="space-y-4">
              {[
                { label: "AI Chatbot", href: "/chat" },
                { label: "Latest News", href: "#news" },
                { label: "Global Rankings", href: "#rankings" },
                { label: "Smart Predictor", href: "/predictor" },
                { label: "My Vault", href: "/shortlist" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-zinc-600 hover:text-[#b69cc4] text-sm transition-colors font-bold"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 md:col-span-1">
            <h4 className="text-black font-black text-[10px] mb-8 uppercase tracking-[0.3em]">
              Guidelines
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/guidelines/usage-policy"
                  className="text-zinc-600 hover:text-[#b69cc4] text-sm transition-colors font-bold"
                >
                  Usage Policy
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-1">
            <h4 className="text-black font-black text-[10px] mb-8 uppercase tracking-[0.3em]">
              Support
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/support/documentation"
                  className="text-zinc-600 hover:text-[#b69cc4] text-sm transition-colors font-bold"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/support/contact"
                  className="text-zinc-600 hover:text-[#b69cc4] text-sm transition-colors font-bold"
                >
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-16 border-t border-zinc-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div className="space-y-3">
            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em]">
              © {new Date().getFullYear()} ACADEMIAAI. BUILT FOR THE NEXT
              GENERATION.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">
                AI Accuracy: 98.4%
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function AssistantContent({ content, mode }: { content: string; mode: string }) {
  if (mode !== "compare") {
    return (
      <div className="prose prose-neutral max-w-none text-black">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    );
  }

  const introEndIndex = content.indexOf("\n### ");
  const restEndIndex = content.search(/\n##\s+/);
  const intro = introEndIndex === -1 ? "" : content.substring(0, introEndIndex);
  const rest = restEndIndex === -1 ? "" : content.substring(restEndIndex);

  const sections: { heading: string; body: string }[] = [];
  const parts = content.split(/(?=^### )/m);
  for (const part of parts) {
    const firstLine = part.split("\n")[0];
    const match = firstLine.match(/^###\s+(.+)/);
    if (match) {
      const body = part.replace(/^###\s+.+\n?/, "");
      sections.push({ heading: match[1].trim(), body });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {intro && (
        <div className="prose prose-neutral max-w-none text-black">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{intro}</ReactMarkdown>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sections.map((college, i) => (
          <div
            key={i}
            className="border-2 border-black rounded-lg p-4 bg-white shadow-[2px_2px_0px_0px_#b69cc4]"
          >
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-4 h-4 text-black shrink-0" />
              <h4 className="font-black text-sm text-black m-0">{college.heading}</h4>
            </div>
            <div className="prose prose-neutral max-w-none prose-sm text-black">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{college.body}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
      {rest && (
        <div className="prose prose-neutral max-w-none text-black">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{rest}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4006";

export default function HeroPage() {
  const { user, token, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/chat");
    }
  }, [authLoading, user, router]);

  const [isAdmin, setIsAdmin] = useState(false);
  const [query, setQuery] = useState("");
  const [news, setNews] = useState<any[]>([]);
  const [rankings, setRankings] = useState<any[]>([]);
  const [mode, setMode] = useState<"web" | "compare">("web");
  const headerRef = useRef<HTMLElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatActive, setIsChatActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [colleges, setColleges] = useState<string[]>([]);
  const [collegeInput, setCollegeInput] = useState("");
  const MAX_COMPARE_COLLEGES = 5;
  const [showAuthModal, setShowAuthModal] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!token) { setIsAdmin(false); return; }
    fetch(`${API_URL}/admin/check`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setIsAdmin(d.isAdmin))
      .catch(() => setIsAdmin(false));
  }, [token]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    if (!user) {
      const count = parseInt(localStorage.getItem("guest_questions_asked") || "0", 10);
      if (count >= 3) {
        setShowAuthModal(true);
        return;
      }
      localStorage.setItem("guest_questions_asked", (count + 1).toString());
    }

    setIsChatActive(true);
    setIsLoading(true);

    const userMessage: Message = { role: "user", content: textToSend };
    let currentHistory: Message[] = [];
    setMessages((prev) => {
      currentHistory = [...prev];
      return [...prev, userMessage, { role: "assistant", content: "" }];
    });

    setQuery("");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...currentHistory, userMessage],
          mode: mode,
          ...(mode === "compare" && colleges.length > 0 ? { colleges: colleges.slice(0, MAX_COMPARE_COLLEGES) } : {}),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Failed to query the intelligence engine.");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      if (!reader) throw new Error("No response stream available");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data:")) {
            const dataStr = line.replace("data: ", "").trim();
            if (dataStr === "[DONE]") break;
            try {
              const json = JSON.parse(dataStr);
              if (json.choices?.[0]?.delta?.content) {
                assistantText += json.choices[0].delta.content;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1].content = assistantText;
                  return updated;
                });
              }
            } catch {}
          }
        }
      }
    } catch (err: any) {
      console.error("Chat Error:", err);
      if (err.name !== "AbortError") {
        setMessages((prev) => {
          const updated = [...prev];
          if (updated[updated.length - 1].role === "assistant") {
            updated[updated.length - 1].content = `⚠️ **Error:** ${err.message || "Failed to connect to the engine."}`;
          }
          return updated;
        });
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      handleSend(query.trim());
    }
  };

  const SUGGESTIONS = [
    "Predict my chances",
    "IIT Bombay CS cutoff",
    "NIT Trichy placements",
    "Top MBA colleges",
  ];

  useEffect(() => {
    async function init() {
      try {
        const [newsRes, rankingsRes] = await Promise.all([
          fetch(`${API_URL}/news?limit=10`).then((r) => r.json()),
          fetch(`${API_URL}/rankings?limit=20&sort=nirf_rank`).then((r) =>
            r.json(),
          ),
        ]);
        setNews(newsRes.articles || []);
        setRankings(rankingsRes.colleges || []);
      } catch (err) {
        console.error("Initialization failed:", err);
      }
    }
    init();
  }, [API_URL]);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -100]);

  return (
    <div className="flex h-screen bg-[#f3f4f6] overflow-hidden selection:bg-black selection:text-white font-sans text-black">
      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative no-scrollbar">
        {/* Brutalist Header */}

        <header
          ref={headerRef}
          className="fixed top-0 left-0 right-0 h-20 border-b-2 border-black flex items-center justify-between px-6 md:px-12 z-[200] bg-white text-black"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-white rounded-lg border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all shrink-0">
              <GraduationCap className="text-black w-5 h-5" />
            </div>
            <span className="text-xl font-serif font-black text-black tracking-tight uppercase">
              Academia<span className="text-[#b69cc4] italic font-medium">AI</span>
            </span>
          </Link>

          {/* Desktop Nav - Moved to Right */}
          <nav className="hidden lg:flex items-center gap-10 ml-auto">
            {/* User Profile / Auth State */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 hover:opacity-85 transition-opacity"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="w-8 h-8 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-white border-2 border-black flex items-center justify-center text-xs font-black text-black uppercase shadow-[2px_2px_0px_0px_#000000]">
                      {user.displayName ? user.displayName[0] : (user.email ? user.email[0] : "U")}
                    </div>
                  )}
                </button>
                {profileDropdownOpen && (
                  <div className="absolute right-0 top-[45px] w-48 bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_#000000] p-2 z-[300] text-black">
                    <div className="px-3 py-2 border-b-2 border-zinc-100 mb-1">
                      <p className="text-[11px] font-black text-black truncate">
                        {user.displayName || "User"}
                      </p>
                      <p className="text-[9px] text-zinc-500 truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs font-black text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
                      >
                        <ShieldCheck size={14} />
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-black text-red-600 hover:bg-zinc-50 rounded-md transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 border-2 border-black rounded-lg bg-[#b69cc4] text-black font-extrabold text-[13px] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                Sign In
              </Link>
            )}
          </nav>
        </header>

        {/* Mobile Navigation */}
        <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-white border-2 border-black rounded-xl px-2 py-2 flex items-center gap-1 shadow-[4px_4px_0px_0px_#000000] text-black">
          {[
            { icon: GraduationCap, href: "/", active: true, label: "Home" },
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
                  item.active
                    ? "bg-[#b69cc4] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    : "text-zinc-600 hover:text-black rounded-lg",
                )}
              >
                <Icon size={20} />
                {item.active && (
                  <span className="text-[13px] font-black">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <section className="relative flex items-center min-h-screen px-6 md:px-24 overflow-hidden pt-20 bg-[#f3f4f6]">
          <div className={cn(
            "relative z-10 w-full mx-auto transition-all duration-700 items-center",
            isChatActive
              ? "max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch min-h-[550px] lg:h-[calc(100vh-160px)] pt-4"
              : "max-w-5xl flex items-center justify-center"
          )}>
            {/* Left Content */}
            <motion.div
              style={{ y: heroY }}
              className={cn(
                "transition-all duration-700 w-full",
                isChatActive
                  ? "lg:col-span-5 flex flex-col justify-center items-start text-left space-y-6 lg:h-full lg:pr-6"
                  : "space-y-12 text-center flex flex-col items-center"
              )}
            >
              <div className="space-y-6 w-full">
                <Reveal>
                  <h1 className={cn(
                    "font-serif font-black tracking-tight leading-[1.1] text-black transition-all duration-700",
                    isChatActive
                      ? "text-3xl md:text-5xl lg:text-6xl text-left w-full"
                      : "text-5xl md:text-8xl lg:text-9xl text-center w-full"
                  )}>
                    Explore your
                    <br />
                    <span className="italic text-zinc-500">next big step.</span>
                  </h1>
                </Reveal>
                <Reveal delay={0.2}>
                  <p className={cn(
                    "text-zinc-700 leading-relaxed font-semibold transition-all duration-700 opacity-90",
                    isChatActive
                      ? "text-sm md:text-base text-left max-w-md mx-0"
                      : "text-lg md:text-xl lg:text-2xl text-center max-w-2xl mx-auto"
                  )}>
                    Tackle any big, bold, bewildering academic challenge with
                    AcademiaAI.
                  </p>
                </Reveal>
              </div>

              <Reveal delay={0.4} className="w-full">
                <div className={cn(
                  "space-y-6 w-full flex flex-col",
                  isChatActive ? "items-start" : "items-center"
                )}>
                  <form
                    onSubmit={handleSubmit}
                    className={cn(
                      "relative group transition-all duration-700 w-full",
                      isChatActive ? "max-w-xl mx-0 text-left" : "max-w-3xl mx-auto"
                    )}
                  >
                    <div className="bg-white rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-within:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all p-2">
                      {mode === "compare" && (
                        <div className="flex flex-col gap-1.5 px-3 pt-2 pb-1 border-b border-black/10 mb-1">
                          {colleges.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {colleges.map((c, i) => (
                                <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#b69cc4] border border-black rounded-md text-[10px] font-black text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                                  {c}
                                  <button
                                    onClick={() => setColleges((prev) => prev.filter((_, idx) => idx !== i))}
                                    className="ml-0.5 hover:text-red-700 transition-colors"
                                  >
                                    <X size={9} strokeWidth={3} />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <input
                              value={collegeInput}
                              onChange={(e) => setCollegeInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && collegeInput.trim()) {
                                  e.preventDefault();
                                  if (colleges.length < MAX_COMPARE_COLLEGES) {
                                    setColleges((prev) => [...prev, collegeInput.trim()]);
                                    setCollegeInput("");
                                  }
                                }
                              }}
                              placeholder={colleges.length >= MAX_COMPARE_COLLEGES ? `Max ${MAX_COMPARE_COLLEGES} colleges reached` : `Add college name... (${colleges.length}/${MAX_COMPARE_COLLEGES})`}
                              disabled={colleges.length >= MAX_COMPARE_COLLEGES}
                              className="flex-1 min-w-0 bg-transparent py-1 text-sm font-semibold text-black placeholder:text-zinc-400 outline-none disabled:opacity-40"
                            />
                            {collegeInput.trim() && colleges.length < MAX_COMPARE_COLLEGES && (
                              <button
                                onClick={() => {
                                  setColleges((prev) => [...prev, collegeInput.trim()]);
                                  setCollegeInput("");
                                }}
                                className="shrink-0 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-black text-white rounded border border-black hover:bg-zinc-800 transition-colors"
                              >
                                Add
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder={
                            mode === "compare"
                              ? colleges.length < 2
                                ? "Add at least 2 colleges above, then ask your question..."
                                : "Ask a comparison question..."
                              : "How can I help you today?"
                          }
                          className="w-full bg-transparent pl-4 pr-4 py-4 text-lg md:text-xl text-black placeholder:text-zinc-500 outline-none font-medium"
                        />
                        <button
                          type="submit"
                          className="px-6 py-3 bg-[#b69cc4] text-black font-black text-sm rounded-lg border-2 border-black hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all shrink-0 flex items-center gap-2"
                        >
                          {mode === "compare"
                            ? "Compare"
                            : "Ask Academia"}
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    </div>
                  </form>

                  <div className={cn(
                    "flex flex-wrap gap-3 transition-all duration-700",
                    isChatActive ? "justify-start" : "justify-center"
                  )}>
                    {[
                      {
                        label: "Compare",
                        icon: Crosshair,
                        mode: "compare" as const,
                      },
                      { label: "Research", icon: Search, mode: "web" as const },
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setMode(item.mode)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 font-black text-xs transition-all",
                          mode === item.mode
                            ? "border-black bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            : "border-black bg-white text-black hover:bg-zinc-100 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                        )}
                      >
                        <item.icon size={14} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </Reveal>
            </motion.div>

            {/* Right Split Panel: Live Chat Ans */}
            {isChatActive && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="lg:col-span-7 flex flex-col bg-white border-2 border-black rounded-xl h-[500px] lg:h-full overflow-hidden relative shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              >
                {/* Header */}
                <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between bg-[#f3f4f6]">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-[#b69cc4]" />
                    <span className="text-xs font-black text-black uppercase tracking-wider">AcademiaAI Intelligence</span>
                  </div>
                  <button
                    onClick={() => {
                      if (abortControllerRef.current) abortControllerRef.current.abort();
                      setMessages([]);
                      setIsChatActive(false);
                    }}
                    className="text-zinc-600 hover:text-black transition-colors p-1"
                    title="Close chat session"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Message list area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-left bg-zinc-50/50">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex flex-col w-full",
                        msg.role === "user" ? "items-end" : "items-start"
                      )}
                    >
                      <div
                        className={cn(
                          "px-4 py-3 rounded-lg max-w-[85%] text-sm leading-relaxed",
                          msg.role === "user"
                            ? "bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            : "bg-[#f3f4f6] border-2 border-black text-black"
                        )}
                      >
                        {msg.role === "assistant" ? (
                          <AssistantContent content={msg.content || "Thinking..."} mode={mode} />
                        ) : (
                          msg.content
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && messages.length > 0 && messages[messages.length - 1].content === "" && (
                    <div className="flex items-center gap-2 text-black text-sm italic pl-2">
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      Thinking...
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </motion.div>
            )}
          </div>

          {/* Auth Limit Modal */}
          {showAuthModal && (
            <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-md"
                onClick={() => setShowAuthModal(false)}
              />
              <div className="relative z-10 w-full max-w-md bg-white border-2 border-black rounded-lg p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center space-y-6 text-black">
                <div className="w-16 h-16 bg-[#f3f4f6] border-2 border-black rounded-lg flex items-center justify-center text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <Brain size={32} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-serif font-black uppercase text-black">
                    Sign in to continue exploring
                  </h3>
                  <p className="text-sm text-zinc-700 leading-relaxed">
                    You've reached the free guest limit of 3 questions. Sign in or create a free account to continue using AcademiaAI and unlock unlimited questions.
                  </p>
                </div>

                <div className="flex flex-col w-full gap-3 pt-2">
                  <Link
                    href="/login"
                    className="w-full py-3 bg-[#b69cc4] text-black font-extrabold text-sm rounded-lg border-2 border-black hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all text-center"
                  >
                    Sign In
                  </Link>
                  <button
                    onClick={() => {
                      localStorage.setItem("hero_chat_messages", JSON.stringify(messages));
                      router.push("/login?continue=/chat");
                    }}
                    className="w-full py-3 border-2 border-black bg-white text-black hover:bg-[#f3f4f6] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-extrabold text-sm rounded-lg transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  >
                    Continue to Full Chat (Sign Up)
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Philosophy Section: The Death of Filters */}
        <section className="w-full py-64 md:py-[400px] min-h-[900px] lg:min-h-screen px-6 bg-[#f3f4f6] relative flex flex-col items-start justify-center overflow-hidden">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-10 space-y-12 text-left">
              <Reveal>
                <h2 className="text-4xl md:text-8xl font-serif font-black text-black leading-[1.05] tracking-tight">
                  Beyond the{" "}
                  <span className="text-[#b69cc4] italic font-black">noise</span> <br />
                  of infinite filters.
                </h2>
              </Reveal>

              <div className="space-y-10 max-w-4xl">
                <Reveal delay={0.2}>
                  <p className="text-zinc-700 text-xl md:text-4xl leading-tight font-medium">
                    AcademiaAI transforms the hunt for your future into a{" "}
                    <span className="text-black italic font-black">
                      natural conversation
                    </span>
                    .
                  </p>
                </Reveal>

                <Reveal delay={0.3}>
                  <p className="text-zinc-600 text-base md:text-2xl leading-relaxed">
                    We’ve stripped away the clinical friction of traditional
                    search to build a partner that understands your ambitions as
                    clearly as a mentor. No more rigid databases—just a
                    human-centric dialogue that turns overwhelming institutional
                    data into your next big breakthrough.
                  </p>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* CTA: Start Chatting Box */}
        <section className="w-full pb-32 px-6 bg-[#f3f4f6] relative">
          <div className="max-w-7xl mx-auto">
            <Reveal delay={0.6}>
              <div className="w-full p-8 md:p-12 rounded-[2.5rem] bg-[#b69cc4] border-2 border-black flex flex-col md:flex-row items-center justify-between gap-8 shadow-[6px_6px_0px_0px_#000000] text-black">
                <div className="space-y-2 text-left">
                  <h3 className="text-2xl md:text-4xl font-serif font-black text-black tracking-tight">
                    Ready to experience the future of education?
                  </h3>
                  <p className="text-black/85 text-lg md:text-xl font-medium">
                    Start a dialogue that matters.
                  </p>
                </div>

                <a
                  href="/chat"
                  className="group px-8 py-4 bg-white text-black border-2 border-black font-black text-lg rounded-2xl hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition-all flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap"
                >
                  Start Chatting
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        <ExperienceHub news={news} rankings={rankings} />

        <InformationHub news={news} rankings={rankings} />

        {/* Motive Section */}
        <section className="w-full py-24 md:py-48 px-6 bg-[#f3f4f6] border-t-2 border-black">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <div className="space-y-10 max-w-5xl text-left">
                <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
                  Our Motive
                </div>
                <blockquote className="text-zinc-700 text-lg md:text-3xl font-medium leading-relaxed tracking-tight italic">
                  "To <span className="text-black font-black underline">democratize</span> academic
                  intelligence. We believe every student deserves access to the
                  same high-resolution data and predictive insights once
                  reserved for institutional insiders. AcademiaAI is our
                  commitment to building a more transparent, data-driven, and
                  equitable path to education."
                </blockquote>
              </div>
            </Reveal>
          </div>
        </section>

        <Footer />
        <style jsx global>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </div>
  );
}
