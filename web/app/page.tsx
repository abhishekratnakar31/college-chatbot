"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import Link from "next/link";

import {
  ArrowRight,
  GraduationCap,
  Search,
  Newspaper,
  ExternalLink,
  Calendar,
  ArrowUpRight,
  Paperclip,
  FileText,
  X,
  Trophy,
  Brain,
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
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight mb-4">
              Top Study Places
            </h2>
            <p className="text-zinc-400 text-lg font-medium">
              Discover your future academic home in India's leading education
              hubs.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => scroll("left")}
              className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all shadow-sm"
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
              className="flex-shrink-0 w-72 aspect-[3/4] snap-start p-10 rounded-[2.5rem] bg-[#0d0d0d] border border-zinc-800/50 hover:border-zinc-600 hover:bg-[#111111] transition-all duration-700 group flex flex-col items-center justify-between text-center relative overflow-hidden shadow-2xl"
            >
              {/* Decorative Background Glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03)_0%,transparent_70%)]" />

              <div className="relative z-10 w-full flex flex-col items-center gap-8">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:scale-110 group-hover:border-zinc-700 transition-all duration-500 shadow-xl">
                  {React.cloneElement(city.icon as React.ReactElement<any>, {
                    className:
                      "w-8 h-8 text-zinc-500 group-hover:text-white transition-colors",
                  })}
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-serif font-medium text-zinc-200 group-hover:text-white transition-colors">
                    {city.name}
                  </h3>
                  <div className="px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 text-[10px] font-black text-zinc-600 uppercase tracking-widest group-hover:text-zinc-400 transition-colors">
                    {city.university}
                  </div>
                </div>
              </div>

              <div className="relative z-10 w-full pt-8 border-t border-zinc-900/50 flex flex-col items-center gap-4">
                <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em] group-hover:text-zinc-500 transition-colors">
                  Institution Hub
                </p>
                <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                  <ArrowUpRight size={16} className="text-white" />
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function ExperienceHub({ news, rankings }: { news: any[]; rankings: any[] }) {
  const [activeTab, setActiveTab] = useState("Chat");
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
    <section className="w-full py-24 md:py-48 px-6 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <Reveal>
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-6xl font-serif font-medium text-white">
              How you can use{" "}
              <span className="italic text-zinc-600">AcademiaAI.</span>
            </h2>
          </div>
        </Reveal>

        {/* Tab Bar */}
        <div className="bg-[#111111] p-1.5 rounded-[2rem] border border-zinc-800/50 flex flex-wrap justify-center gap-1 mb-16 relative z-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-full text-sm font-bold transition-all duration-500",
                activeTab === tab.id
                  ? "bg-zinc-200 text-black shadow-xl"
                  : "text-zinc-500 hover:text-white hover:bg-zinc-800/50",
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
          <div className="lg:col-span-5 space-y-10">
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
                  <h3 className="text-4xl md:text-6xl font-serif font-medium text-white leading-tight">
                    {tabs.find((t) => t.id === activeTab)?.label.split(" ")[0]}{" "}
                    <br />
                    <span className="text-zinc-600 italic">
                      {
                        tabs
                          .find((t) => t.id === activeTab)
                          ?.label.split(" ")[1]
                      }
                    </span>
                  </h3>
                  <p className="text-zinc-400 text-lg md:text-xl leading-relaxed font-medium">
                    {tabs.find((t) => t.id === activeTab)?.desc}
                  </p>
                </div>

                <p className="text-zinc-600 text-sm md:text-base leading-relaxed border-l border-zinc-800 pl-8">
                  {tabs.find((t) => t.id === activeTab)?.detail}
                </p>

                <Link
                  href={`/${activeTab.toLowerCase()}`}
                  className="inline-flex h-12 items-center px-10 rounded-full border border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:border-white transition-all shadow-xl"
                >
                  Explore {activeTab} Intelligence
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Preview Window */}
          <div className="lg:col-span-7 relative h-full">
            <div className="aspect-[4/3] rounded-[3rem] bg-[#0d0d0d] border border-zinc-800/50 relative overflow-hidden group shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.02)_0%,transparent_70%)]" />

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
                    <div className="absolute inset-0 bg-[#b69cc4] bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:32px_32px] rounded-3xl border border-white/20 shadow-2xl p-6 md:p-12 overflow-hidden flex flex-col justify-center">
                      {activeTab === "Chat" && (
                        <div className="space-y-6">
                          <div className="flex gap-4 items-start max-w-[85%]">
                            <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center shrink-0">
                              <Users size={14} className="text-black/50" />
                            </div>
                            <div className="bg-black p-5 rounded-2xl rounded-tl-none border border-white/5 shadow-2xl">
                              <p className="text-xs md:text-sm text-zinc-300">
                                Compare placements at IIT Delhi and BITS Pilani
                                for CS.
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-4 items-start ml-auto max-w-[85%] text-right">
                            <div className="bg-black p-5 rounded-2xl rounded-tr-none border border-white/5 shadow-2xl">
                              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                                IIT Delhi shows a{" "}
                                <span className="text-white font-bold">
                                  12% higher
                                </span>{" "}
                                median package for 2024, but BITS has a{" "}
                                <span className="text-white font-bold">
                                  wider recruiter network
                                </span>
                                ...
                              </p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-lg">
                              <GraduationCap size={14} className="text-black" />
                            </div>
                          </div>
                        </div>
                      )}
                      {activeTab === "News" && (
                        <div className="space-y-6">
                          <div className="flex justify-between items-center px-2">
                            <h4 className="text-[10px] font-black text-black/40 uppercase tracking-widest">
                              Global Intelligence
                            </h4>
                            <Radio
                              size={12}
                              className="text-black/60 animate-pulse"
                            />
                          </div>
                          <div className="space-y-4">
                            {news.slice(0, 3).map((article, i) => (
                              <div
                                key={i}
                                className="p-4 rounded-2xl bg-black border border-white/5 shadow-xl space-y-2"
                              >
                                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-zinc-600">
                                  <span>{article.source}</span>
                                  <span>{article.time}</span>
                                </div>
                                <p className="text-xs font-bold text-zinc-300 line-clamp-1">
                                  {article.title}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {activeTab === "Rankings" && (
                        <div className="space-y-5">
                          <h4 className="text-[10px] font-black text-black/40 uppercase tracking-widest px-2 mb-2">
                            Live Leaderboard
                          </h4>
                          <div className="space-y-3">
                            {rankings.slice(0, 4).map((college, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-4 p-4 rounded-2xl bg-black border border-white/5 shadow-xl group/rank hover:border-white/20 transition-all"
                              >
                                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-[10px] font-black text-zinc-500 group-hover/rank:text-white transition-all">
                                  #{college.rank || i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-zinc-300 truncate">
                                    {college.college}
                                  </p>
                                  <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">
                                    {college.city}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Decorative Elements */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 blur-[80px] rounded-full" />
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
    <div className="relative aspect-auto md:aspect-[4/3] min-h-[400px] md:min-h-0 rounded-[2rem] md:rounded-[3.5rem] overflow-hidden border border-zinc-800 bg-[#0d0d0d] p-6 md:p-8 flex flex-col gap-6 shadow-2xl shadow-black">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Current News */}
        <div className="bg-zinc-900/40 rounded-3xl p-6 border border-zinc-800/50 flex flex-col gap-4 overflow-hidden h-full">
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
                            i === 0 ? "text-white" : "text-zinc-400",
                          )}
                        >
                          {news.title}
                        </p>
                        {collegeLabel && (
                          <span className="flex-shrink-0 px-1.5 py-0.5 rounded-md bg-zinc-800 text-[7px] font-black text-zinc-500 uppercase tracking-tighter">
                            {collegeLabel}
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-zinc-600 font-medium uppercase tracking-tighter">
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
                    <div className="h-3 bg-zinc-800 rounded w-full" />
                    <div className="h-2 bg-zinc-800 rounded w-1/2" />
                  </div>
                ))}
          </div>
          <div className="pt-4 border-t border-zinc-800/50 flex items-center justify-between mt-auto">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
              <Newspaper size={14} className="text-zinc-500" />
            </div>
            <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">
              Live Updates
            </span>
          </div>
        </div>

        {/* Admission Updates */}
        <div className="space-y-6">
          <div className="bg-zinc-900/40 rounded-3xl p-6 border border-zinc-800/50 flex flex-col items-center justify-center text-center gap-4 h-full">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-zinc-800"
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
                  className="text-white"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-white">+12%</span>
                <span className="text-[8px] font-black text-zinc-600 uppercase">
                  Growth
                </span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Admission Rate
              </p>
              <p className="text-lg font-serif font-bold italic text-white mt-1">
                94% Enrollment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
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
      className="w-full py-20 md:py-48 px-6 bg-[#0a0a0a] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
        <motion.div style={{ y: y1 }} className="space-y-12">
          <Reveal delay={0.1}>
            <h2 className="text-4xl sm:text-5xl md:text-8xl font-serif font-bold text-white tracking-tighter leading-[0.95]">
              Stay ahead with the <br />
              <span className="text-zinc-600 italic">latest buzz.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-zinc-500 text-2xl font-medium max-w-xl leading-relaxed">
              Latest news and articles on admissions, cut-offs, and results
              across 100+ premier Indian institutions.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <Link
              href="/news"
              className="inline-flex items-center gap-4 px-8 py-5 md:px-12 md:py-6 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all hover:scale-105 shadow-2xl shadow-white/10 group/btn"
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
              {/* Ambient Glow behind dashboard */}
              <div className="absolute -inset-10 bg-white/[0.02] rounded-full blur-[80px] pointer-events-none -z-10" />
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
    <div className="relative aspect-auto md:aspect-[4/3] min-h-[400px] md:min-h-0 rounded-[2rem] md:rounded-[3.5rem] overflow-hidden border border-zinc-800 bg-[#0d0d0d] p-6 md:p-10 flex flex-col gap-8 shadow-2xl shadow-black">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            Live Leaderboard
          </h3>
          <p className="text-xl font-serif font-bold text-white mt-1 italic">
            Top Performers 2025
          </p>
        </div>
        <Trophy size={24} className="text-zinc-700" />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
        {colleges.length > 0
          ? colleges.map((college, i) => (
              <div key={college.id} className="flex items-center gap-6 group">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-black text-white group-hover:bg-blue-500 transition-colors flex-shrink-0">
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-zinc-300 group-hover:text-blue-400 transition-colors truncate">
                    {college.college}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest truncate">
                      {college.city}, {college.state}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="h-1 flex-1 bg-zinc-900 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(college.innovation_score / 100) * 100}%`,
                        }}
                        transition={{ duration: 1, delay: i * 0.05 }}
                        className="h-full bg-white/20"
                      />
                    </div>
                    <span className="text-[10px] font-black text-zinc-600">
                      {college.innovation_score}
                    </span>
                  </div>
                </div>
              </div>
            ))
          : [1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-6 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-zinc-900" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-zinc-900 rounded w-1/2" />
                  <div className="h-1 bg-zinc-900 rounded w-full" />
                </div>
              </div>
            ))}
      </div>

      <div className="pt-6 border-t border-zinc-900 flex items-center justify-between">
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full border-2 border-black bg-zinc-800"
            />
          ))}
          <div className="w-6 h-6 rounded-full border-2 border-black bg-zinc-900 flex items-center justify-center text-[8px] font-black text-zinc-500">
            +12
          </div>
        </div>
        <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">
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
      className="w-full py-48 px-6 bg-[#0a0a0a] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
        <motion.div
          style={{ y: y1 }}
          className="relative group lg:order-1 hidden md:block"
        >
          <Reveal delay={0.4}>
            <div className="relative group">
              <RankingsDashboard colleges={rankings} />
              {/* Ambient Glow behind dashboard */}
              <div className="absolute -inset-10 bg-white/[0.015] rounded-full blur-[80px] pointer-events-none -z-10" />
            </div>
          </Reveal>
        </motion.div>

        <motion.div style={{ y: y2 }} className="space-y-12 lg:order-2">
          <Reveal delay={0.1}>
            <h2 className="text-4xl sm:text-5xl md:text-8xl font-serif font-bold text-white tracking-tighter leading-[0.95]">
              Discover your <br />
              <span className="text-zinc-600 italic">perfect match.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-zinc-500 text-2xl font-medium max-w-xl leading-relaxed">
              Rankings based on verifiable innovation, placement metrics, and
              global impact.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <Link
              href="/rankings"
              className="inline-flex items-center gap-4 px-8 py-5 md:px-12 md:py-6 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all hover:scale-105 shadow-2xl shadow-white/10 group/btn"
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
    <section className="w-full py-32 md:py-64 px-6 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Intelligence Terminal Visual (Voice + Filters) */}
          <Reveal delay={0.2} className="order-2 lg:order-1">
            <div className="relative aspect-square w-full max-w-lg mx-auto">
              <div className="absolute inset-0 bg-[#b69cc4] bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:32px_32px] rounded-[3rem] border border-white/20 overflow-hidden group shadow-2xl flex flex-col">
                {/* Header/Status */}
                <div className="p-6 border-b border-zinc-900 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                      Neural-V1 Active
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-zinc-800" />
                    <div className="w-1 h-1 rounded-full bg-zinc-800" />
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-12 overflow-hidden">
                  {/* Left: Filter Sidebar */}
                  <div className="col-span-4 border-r border-zinc-900 p-4 space-y-6 bg-black/20">
                    <div className="space-y-3">
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                        Field
                      </p>
                      <div className="px-3 py-2 rounded-lg bg-white text-black text-[9px] font-bold text-center">
                        Engineering
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                        Exam
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {["JEE Main", "JEE Adv"].map((exam) => (
                          <div
                            key={exam}
                            className="px-2 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 text-[8px] font-bold text-center"
                          >
                            {exam}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                        Category
                      </p>
                      <div className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 text-[9px] font-bold text-center">
                        General
                      </div>
                    </div>
                  </div>

                  {/* Right: Voice Hub */}
                  <div className="col-span-8 relative flex flex-col items-center justify-center p-8">
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
                          className="absolute w-32 h-32 rounded-full border border-zinc-800"
                        />
                      ))}
                    </div>

                    {/* Mic Button */}
                    <div className="relative z-10 w-24 h-24 rounded-full bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center shadow-2xl group-hover:border-zinc-700 transition-all">
                      <Mic size={24} className="text-white mb-2" />
                      <span className="text-[7px] font-black text-zinc-500 uppercase tracking-tighter">
                        Tap to Speak
                      </span>
                    </div>

                    <div className="mt-8 text-center space-y-1">
                      <p className="text-[10px] font-bold text-white tracking-tight">
                        System Ready
                      </p>
                      <p className="text-[8px] text-zinc-500 leading-relaxed max-w-[140px]">
                        Initialize analysis across national pathways.
                      </p>
                    </div>

                    {/* Analyze Button */}
                    <div className="mt-10 w-full">
                      <div className="w-full py-3 rounded-xl bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest text-center shadow-[0_0_30px_rgba(37,99,235,0.3)]">
                        Analyze Signal
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ambient Glow */}
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500/[0.05] blur-[80px] rounded-full" />
              </div>
            </div>
          </Reveal>

          <Reveal className="order-1 lg:order-2">
            <div className="space-y-8 lg:pl-16">
              <h2 className="text-4xl md:text-7xl font-serif font-medium text-white tracking-tight leading-[1.1]">
                Eliminate guesswork. <br />
                <span className="text-zinc-600 italic">
                  Predict with precision.
                </span>
              </h2>
              <div className="space-y-6 max-w-xl">
                <p className="text-zinc-400 text-xl leading-relaxed font-medium">
                  Our Neural Predictor is an advanced inference engine that
                  cross-references your profile with 15+ years of institutional
                  cutoff shifts and enrollment behaviors.
                </p>
                <p className="text-zinc-600 text-base leading-relaxed border-l border-zinc-800 pl-6">
                  By modeling thousands of variables—from category shifts to
                  regional demand—Aura identifies patterns traditional search
                  misses, giving you a{" "}
                  <span className="text-white font-bold">94% accurate</span>{" "}
                  success probability.
                </p>
              </div>
              <Link
                href="/predictor"
                className="inline-flex items-center gap-4 text-xs font-black text-white uppercase tracking-[0.2em] group"
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
    <footer className="bg-[#0a0a0a] border-t border-zinc-900 pt-20 md:pt-32 pb-16 px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-16 mb-24">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <GraduationCap className="text-black w-6 h-6" />
              </div>
              <span className="text-2xl font-serif font-bold tracking-tight text-white">
                AcademiaAI
              </span>
            </div>
            <p className="text-zinc-500 text-base font-medium leading-relaxed max-w-[240px]">
              The intelligent platform to explore and discover Indian academia.
            </p>
          </div>
          <div className="col-span-1 md:col-span-1">
            <h4 className="text-white font-bold text-[10px] mb-8 uppercase tracking-[0.3em]">
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
                    className="text-zinc-500 hover:text-white text-sm transition-colors font-semibold"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 md:col-span-1">
            <h4 className="text-white font-bold text-[10px] mb-8 uppercase tracking-[0.3em]">
              Guidelines
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/guidelines/usage-policy"
                  className="text-zinc-500 hover:text-blue-400 text-sm transition-colors font-semibold"
                >
                  Usage Policy
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-1">
            <h4 className="text-white font-bold text-[10px] mb-8 uppercase tracking-[0.3em]">
              Support
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/support/documentation"
                  className="text-zinc-500 hover:text-blue-400 text-sm transition-colors font-semibold"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/support/contact"
                  className="text-zinc-500 hover:text-blue-400 text-sm transition-colors font-semibold"
                >
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-16 border-t border-zinc-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div className="space-y-3">
            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em]">
              © {new Date().getFullYear()} ACADEMIAAI. BUILT FOR THE NEXT
              GENERATION.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-[9px] text-zinc-800 font-black uppercase tracking-widest">
                AI Accuracy: 98.4%
              </span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4006";

export default function HeroPage() {
  const [query, setQuery] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [news, setNews] = useState<any[]>([]);
  const [rankings, setRankings] = useState<any[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mode, setMode] = useState<"web" | "compare" | "pdf">("web");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
      setMode("pdf");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "pdf" && attachedFile) {
      setIsUploading(true);
      setUploadProgressText("Initializing...");
      let uploadedFileUrl = "";
      try {
        const formData = new FormData();
        formData.append("file", attachedFile);
        const res = await fetch(`${API_URL}/upload`, {
          method: "POST",
          body: formData,
        });
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let done = false;
        while (!done) {
          const result = await reader?.read();
          if (result?.done) break;
          const chunk = decoder.decode(result?.value);
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data:")) {
              try {
                const parsed = JSON.parse(line.replace("data: ", "").trim());
                if (parsed.status === "verifying")
                  setUploadProgressText("Verifying relevance...");
                else if (parsed.status === "started")
                  setUploadProgressText(`Embedding (0/${parsed.total})...`);
                else if (parsed.status === "embedding")
                  setUploadProgressText(
                    `Embedding (${parsed.progress}/${parsed.total})...`,
                  );
                else if (parsed.status === "done") {
                  uploadedFileUrl = parsed.fileUrl ?? "";
                  done = true;
                } else if (parsed.page) {
                  setUploadProgressText(`Reading page ${parsed.page}...`);
                }
              } catch (e) {}
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploading(false);
        setUploadProgressText("");
      }

      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      params.set("file", attachedFile.name);
      if (uploadedFileUrl) params.set("fileUrl", uploadedFileUrl);
      params.set("mode", "pdf");
      window.location.href = `/chat?${params.toString()}`;
      return;
    }

    if (query.trim() || mode === "compare" || mode === "pdf") {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      params.set("mode", mode);
      window.location.href = `/chat?${params.toString()}`;
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
          fetch(`${API_URL}/rankings?limit=20&sort=rank_2024`).then((r) =>
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
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden selection:bg-white selection:text-black font-sans text-white">
      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative no-scrollbar">
        {/* Liquid Glass Distortion Filter */}

        <header
          ref={headerRef}
          className="fixed top-0 left-0 right-0 h-20 border-b border-white/5 flex items-center justify-between px-6 md:px-12 z-[200] bg-[#0a0a0a]"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.1)] group-hover:scale-105 transition-all shrink-0">
              <GraduationCap className="text-black w-5 h-5" />
            </div>
            <span className="text-xl font-serif font-bold text-white tracking-tight">
              Academia<span className="text-zinc-500 italic">AI</span>
            </span>
          </Link>

          {/* Desktop Nav - Moved to Right */}
          <nav className="hidden lg:flex items-center gap-10 ml-auto">
            {/* Platform Dropdown */}
            <div className="relative py-4">
              <button
                onClick={() =>
                  setActiveMenu(activeMenu === "platform" ? null : "platform")
                }
                className={cn(
                  "flex items-center gap-1.5 text-[13px] font-semibold transition-colors",
                  activeMenu === "platform"
                    ? "text-white"
                    : "text-zinc-400 hover:text-white",
                )}
              >
                Platform
                <ChevronDown
                  size={14}
                  className={cn(
                    "transition-transform duration-300",
                    activeMenu === "platform"
                      ? "rotate-180 text-white"
                      : "text-zinc-600",
                  )}
                />
              </button>

              {/* Dropdown Menu with Overlapping Roll-Down */}
              <div
                className={cn(
                  "absolute top-[70px] left-1/2 -translate-x-1/2 pointer-events-none z-[300] transition-all",
                  activeMenu === "platform" && "pointer-events-auto",
                )}
              >
                <div
                  className={cn(
                    "opacity-0 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.2,1,0.2,1)] w-72",
                    activeMenu === "platform"
                      ? "max-h-[500px] opacity-100"
                      : "max-h-0",
                  )}
                >
                  <div className="bg-[#0d0d0d] border border-zinc-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2 m-2">
                    {[
                      {
                        label: "Neural Chat",
                        href: "/chat",
                        desc: "AI-powered research engine",
                      },
                      {
                        label: "Smart Predictor",
                        href: "/predictor",
                        desc: "Advanced success modeling",
                      },
                    ].map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="block p-4 rounded-xl hover:bg-zinc-900 transition-colors group/item pointer-events-auto"
                      >
                        <p className="text-[13px] font-bold text-white mb-1">
                          {link.label}
                        </p>
                        <p className="text-[11px] text-zinc-500 group-hover/item:text-zinc-400 leading-tight">
                          {link.desc}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </header>

        {/* Mobile Navigation */}
        <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-[#121212]/90 border border-white/10 rounded-full px-2 py-2 flex items-center gap-1 shadow-2xl backdrop-blur-xl">
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
                  "flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300",
                  item.active
                    ? "bg-white text-black shadow-xl shadow-white/10"
                    : "text-zinc-500 hover:text-white",
                )}
              >
                <Icon size={20} />
                {item.active && (
                  <span className="text-[13px] font-bold">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <section className="relative flex items-center min-h-screen px-6 md:px-24 overflow-hidden pt-20 bg-[#0a0a0a]">
          <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div style={{ y: heroY }} className="space-y-10 text-left">
              <div className="space-y-6">
                <Reveal>
                  <h1 className="text-5xl md:text-8xl font-serif font-medium tracking-tight leading-[1.1] text-white">
                    Explore your
                    <br />
                    <span className="italic text-zinc-400">next big step.</span>
                  </h1>
                </Reveal>
                <Reveal delay={0.2}>
                  <p className="text-lg md:text-xl text-zinc-500 leading-relaxed font-medium max-w-xl opacity-90">
                    Tackle any big, bold, bewildering academic challenge with
                    AcademiaAI.
                  </p>
                </Reveal>
              </div>

              <Reveal delay={0.4}>
                <div className="space-y-6">
                  <form
                    onSubmit={handleSubmit}
                    className="relative group max-w-2xl"
                  >
                    <div className="relative flex items-center bg-[#141414] rounded-2xl border border-zinc-800 transition-all duration-300 focus-within:border-zinc-700 p-2">
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={
                          mode === "compare"
                            ? "Which colleges should I compare?"
                            : mode === "pdf"
                              ? "Ask something about your document..."
                              : "How can I help you today?"
                        }
                        className="w-full bg-transparent pl-4 pr-4 py-4 text-lg md:text-xl text-white placeholder:text-zinc-600 outline-none font-medium"
                      />
                      <button
                        type="submit"
                        disabled={isUploading}
                        className="px-6 py-3 bg-[#b69cc4] text-black font-bold text-sm rounded-xl hover:opacity-90 transition-all active:scale-95 flex items-center gap-2 shadow-[0_0_20px_rgba(182,156,196,0.2)]"
                      >
                        {isUploading
                          ? "..."
                          : mode === "compare"
                            ? "Compare"
                            : "Ask Academia"}
                        <ArrowRight size={18} />
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf"
                    />
                  </form>

                  <div className="flex flex-wrap gap-3">
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
                          "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-xs font-bold",
                          mode === item.mode
                            ? "border-white bg-white text-black"
                            : "border-zinc-800 bg-[#141414] text-zinc-500 hover:text-white hover:border-zinc-700",
                        )}
                      >
                        <item.icon size={14} />
                        {item.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("pdf");
                        fileInputRef.current?.click();
                      }}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-xs font-bold",
                        mode === "pdf"
                          ? "border-white bg-white text-black"
                          : "border-zinc-800 bg-[#141414] text-zinc-500 hover:text-white hover:border-zinc-700",
                      )}
                    >
                      <Paperclip size={14} />
                      Upload PDF
                    </button>
                  </div>
                </div>
              </Reveal>
            </motion.div>

            {/* Right Illustration: Neural Knowledge Graph */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="hidden lg:block relative"
            >
              <div className="relative aspect-square w-full max-w-xl ml-auto flex items-center justify-center">
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Central Core: Academia AI */}
                  <motion.div
                    animate={{ y: [-5, 5, -5] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="z-20 px-8 py-4 rounded-2xl bg-[#141414] border border-white/10 shadow-[0_0_50px_rgba(182,156,196,0.15)] flex items-center justify-center"
                  >
                    <h2 className="text-2xl font-serif font-medium text-white tracking-tight">
                      Academia <span className="text-[#b69cc4] italic">AI</span>
                    </h2>
                  </motion.div>

                  {/* Floating Nodes & Connectors */}
                  {[
                    { label: "Admissions", x: "80%", y: "40%", delay: 0.1 },
                    { label: "Cutoffs", x: "70%", y: "15%", delay: 0.3 },
                    { label: "Campus Life", x: "30%", y: "15%", delay: 0.5 },
                    { label: "Scholarship", x: "15%", y: "40%", delay: 0.7 },
                    { label: "Placements", x: "25%", y: "75%", delay: 0.9 },
                    { label: "Rankings", x: "75%", y: "75%", delay: 1.1 },
                  ].map((node, i) => (
                    <div key={i}>
                      {/* Connecting Path */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                        <motion.path
                          d={`M 280 280 L ${node.x} ${node.y}`}
                          stroke="#b69cc4"
                          strokeWidth="0.5"
                          strokeDasharray="4 4"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 0.2 }}
                          transition={{ duration: 1.5, delay: node.delay }}
                        />
                      </svg>

                      {/* Node Chip */}
                      <motion.div
                        style={{ left: node.x, top: node.y }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: node.delay }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 group hover:border-[#b69cc4] transition-all cursor-default shadow-xl"
                      >
                        <span className="text-[10px] font-black text-zinc-500 group-hover:text-white uppercase tracking-widest transition-colors">
                          {node.label}
                        </span>
                      </motion.div>
                    </div>
                  ))}

                  {/* Ambient Intelligence Field */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(182,156,196,0.05)_0%,transparent_70%)]" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 60,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute w-[80%] h-[80%] border border-white/[0.03] rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Philosophy Section: The Death of Filters */}
        <section className="w-full py-64 md:py-[400px] min-h-[900px] lg:min-h-screen px-6 bg-[#0a0a0a] relative flex flex-col items-start justify-center overflow-hidden">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-10 space-y-12 text-left">
              <Reveal>
                <h2 className="text-4xl md:text-8xl font-serif font-medium text-white leading-[1.05] tracking-tight">
                  Beyond the{" "}
                  <span className="text-[#b69cc4] italic">noise</span> <br />
                  of infinite filters.
                </h2>
              </Reveal>

              <div className="space-y-10 max-w-4xl">
                <Reveal delay={0.2}>
                  <p className="text-zinc-400 text-xl md:text-4xl leading-tight font-medium">
                    AcademiaAI transforms the hunt for your future into a{" "}
                    <span className="text-white italic">
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

          {/* Atmospheric Depth */}
          <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#b69cc4]/[0.02] blur-[160px] rounded-full pointer-events-none" />
        </section>

        {/* CTA: Start Chatting Box */}
        <section className="w-full pb-32 px-6 bg-[#0a0a0a] relative">
          <div className="max-w-7xl mx-auto">
            <Reveal delay={0.6}>
              <div className="w-full p-8 md:p-12 rounded-[2.5rem] bg-[#b69cc4] flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_0_50px_rgba(182,156,196,0.3)]">
                <div className="space-y-2">
                  <h3 className="text-2xl md:text-4xl font-serif font-medium text-black tracking-tight">
                    Ready to experience the future of education?
                  </h3>
                  <p className="text-black/60 text-lg md:text-xl font-medium">
                    Start a dialogue that matters.
                  </p>
                </div>

                <a
                  href="/chat"
                  className="group px-8 py-4 bg-black text-white font-bold text-lg rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-2xl whitespace-nowrap"
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
        <section className="w-full py-24 md:py-48 px-6 bg-[#0a0a0a] border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <div className="space-y-10 max-w-5xl">
                <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
                  Our Motive
                </div>
                <blockquote className="text-zinc-400 text-lg md:text-3xl font-medium leading-relaxed tracking-tight italic">
                  "To <span className="text-white">democratize</span> academic
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
