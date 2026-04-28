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
} from "lucide-react";

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(" ");

// ── Animated cycling word ────────────────────────────────────────────────────
const CYCLE_WORDS = ["Search", "Explore", "Discover", "Analyse"];

function CycleWord() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % CYCLE_WORDS.length),
      3000,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <span className="relative inline-block overflow-hidden align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={CYCLE_WORDS[index]}
          initial={{ y: 48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block text-white"
        >
          {CYCLE_WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// ── Hero Background ──────────────────────────────────────────────────────────
function HeroBackground() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 200]);

  return (
    <div className="absolute inset-0 overflow-hidden hidden md:block">
      <motion.div
        style={{ y }}
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.15 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <img
          src="/monochrome_hero_abstract_1777281034931.png"
          alt=""
          className="w-full h-full object-cover"
          draggable={false}
        />
      </motion.div>
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,#0a0a0a_100%)]" />
    </div>
  );
}

// ── Reveal Component ────────────────────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
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
  },
  {
    name: "Bangalore",
    icon: <Building2 className="w-8 h-8 text-zinc-600" />,
    query: "Bangalore",
    state: "Karnataka",
  },
  {
    name: "Hyderabad",
    icon: <Building className="w-8 h-8 text-zinc-600" />,
    query: "Hyderabad",
    state: "Telangana",
  },
  {
    name: "Pune",
    icon: <University className="w-8 h-8 text-zinc-600" />,
    query: "Pune",
    state: "Maharashtra",
  },
  {
    name: "Mumbai",
    icon: <Building2 className="w-8 h-8 text-zinc-600" />,
    query: "Mumbai",
    state: "Maharashtra",
  },
  {
    name: "Chennai",
    icon: <School className="w-8 h-8 text-zinc-600" />,
    query: "Chennai",
    state: "Tamil Nadu",
  },
  {
    name: "Kolkata",
    icon: <Library className="w-8 h-8 text-zinc-600" />,
    query: "Kolkata",
    state: "West Bengal",
  },
  {
    name: "Bhopal",
    icon: <Landmark className="w-8 h-8 text-zinc-600" />,
    query: "Bhopal",
    state: "Madhya Pradesh",
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
              className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-sm"
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
              href={`/rankings?state=${encodeURIComponent(city.state)}`}
              className="flex-shrink-0 w-48 aspect-[4/5] snap-start p-8 rounded-[2rem] bg-zinc-900/30 border border-zinc-800 hover:border-white hover:bg-zinc-900 transition-all group flex flex-col items-center justify-center text-center gap-6"
            >
              <div className="group-hover:scale-110 group-hover:text-white transition-all duration-500">
                {city.icon}
              </div>
              <span className="text-sm font-bold tracking-tight text-zinc-500 group-hover:text-white transition-colors">
                {city.name}
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
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
  customContent
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
            className="inline-flex items-center gap-4 px-10 py-5 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all hover:scale-105 shadow-2xl shadow-white/5 group"
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
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
    <div className="relative aspect-auto md:aspect-[4/3] min-h-[400px] md:min-h-0 rounded-[2rem] md:rounded-[3.5rem] overflow-hidden border border-zinc-800 bg-black/40 backdrop-blur-3xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl shadow-black">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Current News */}
        <div className="bg-zinc-900/40 rounded-3xl p-6 border border-zinc-800/50 flex flex-col gap-4 overflow-hidden h-full">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Current News</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {articles.length > 0 ? (
            articles.map((news, i) => {
              // Extract acronym or first few words as potential college context if not in source
              const collegeMatch = news.title.match(/^([A-Z]{2,6})\b/) || news.title.match(/at (IIT [A-Z][a-z]+|NIT [A-Z][a-z]+|BITS [A-Z][a-z]+)/);
              const collegeLabel = collegeMatch ? collegeMatch[1] : null;

              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("text-[11px] font-bold leading-tight line-clamp-2", i === 0 ? "text-white" : "text-zinc-400")}>{news.title}</p>
                    {collegeLabel && (
                      <span className="flex-shrink-0 px-1.5 py-0.5 rounded-md bg-zinc-800 text-[7px] font-black text-zinc-500 uppercase tracking-tighter">
                        {collegeLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] text-zinc-600 font-medium uppercase tracking-tighter">{news.source} • {new Date(news.published_at || news.created_at).toLocaleDateString()}</p>
                </div>
              );
            })
          ) : (
              [1, 2, 3].map(i => (
                <div key={i} className="space-y-2 animate-pulse">
                  <div className="h-3 bg-zinc-800 rounded w-full" />
                  <div className="h-2 bg-zinc-800 rounded w-1/2" />
                </div>
              ))
            )}
          </div>
          <div className="pt-4 border-t border-zinc-800/50 flex items-center justify-between mt-auto">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
              <Newspaper size={14} className="text-zinc-500" />
            </div>
            <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Live Updates</span>
          </div>
        </div>

        {/* Admission Updates */}
        <div className="space-y-6">
          <div className="bg-zinc-900/40 rounded-3xl p-6 border border-zinc-800/50 flex flex-col items-center justify-center text-center gap-4 h-full">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-800" />
                <motion.circle 
                  cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray="251.2" 
                  initial={{ strokeDashoffset: 251.2 }} 
                  animate={{ strokeDashoffset: 251.2 * 0.28 }} 
                  transition={{ duration: 1.5, ease: "easeOut" }} 
                  className="text-white" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-white">+12%</span>
                <span className="text-[8px] font-black text-zinc-600 uppercase">Growth</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Admission Rate</p>
              <p className="text-lg font-serif font-bold italic text-white mt-1">94% Enrollment</p>
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
  return (
    <div className="w-full py-20 md:py-48 px-6 bg-[#0a0a0a] relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
        <div className="space-y-12">
          <Reveal delay={0.1}>
            <h2 className="text-4xl sm:text-5xl md:text-8xl font-serif font-bold text-white tracking-tighter leading-[0.95]">
              Stay ahead with the <br />
              <span className="text-zinc-600 italic">latest buzz.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-zinc-500 text-2xl font-medium max-w-xl leading-relaxed">
              Latest news and articles on admissions, cut-offs, and results across 500+ Indian institutions.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <Link
              href="/news"
              className="inline-flex items-center gap-4 px-8 py-5 md:px-12 md:py-6 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all hover:scale-105 shadow-2xl shadow-white/10 group/btn"
            >
              Explore Full Feed
              <ArrowRight
                size={16}
                className="group-hover/btn:translate-x-1 transition-transform"
              />
            </Link>
          </Reveal>
        </div>

        <Reveal delay={0.4}>
          <div className="relative group hidden md:block">
            <NewsDashboard articles={news} />
            {/* Ambient Glow behind dashboard */}
            <div className="absolute -inset-10 bg-white/[0.02] rounded-full blur-[80px] pointer-events-none -z-10" />
          </div>
        </Reveal>
      </div>

      {/* Subtle Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/[0.01] to-transparent pointer-events-none" />
    </div>
  );
}

// ── Rankings Dashboard Component ─────────────────────────────────────────────
function RankingsDashboard({ colleges }: { colleges: any[] }) {
  return (
    <div className="relative aspect-auto md:aspect-[4/3] min-h-[400px] md:min-h-0 rounded-[2rem] md:rounded-[3.5rem] overflow-hidden border border-zinc-800 bg-black/40 backdrop-blur-3xl p-6 md:p-10 flex flex-col gap-8 shadow-2xl shadow-black">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Live Leaderboard</h3>
          <p className="text-xl font-serif font-bold text-white mt-1 italic">Top Performers 2024</p>
        </div>
        <Trophy size={24} className="text-zinc-700" />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
        {colleges.length > 0 ? (
          colleges.map((college, i) => (
            <div key={college.id} className="flex items-center gap-6 group">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-black text-white group-hover:bg-white group-hover:text-black transition-colors flex-shrink-0">
                #{i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors truncate">
                  {college.college}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest truncate">{college.city}, {college.state}</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="h-1 flex-1 bg-zinc-900 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(college.innovation_score / 100) * 100}%` }}
                      transition={{ duration: 1, delay: i * 0.05 }}
                      className="h-full bg-white/20"
                    />
                  </div>
                  <span className="text-[10px] font-black text-zinc-600">{college.innovation_score}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          [1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-6 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-zinc-900" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-zinc-900 rounded w-1/2" />
                <div className="h-1 bg-zinc-900 rounded w-full" />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-6 border-t border-zinc-900 flex items-center justify-between">
        <div className="flex -space-x-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-6 h-6 rounded-full border-2 border-black bg-zinc-800" />
          ))}
          <div className="w-6 h-6 rounded-full border-2 border-black bg-zinc-900 flex items-center justify-center text-[8px] font-black text-zinc-500">+12</div>
        </div>
        <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Global Index Verified</span>
      </div>
    </div>
  );
}

// ── Rankings Section ────────────────────────────────────────────────────────
function RankingsSection({ rankings }: { rankings: any[] }) {
  return (
    <div className="w-full py-48 px-6 bg-[#0a0a0a] relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
        <Reveal delay={0.4}>
          <div className="relative group lg:order-1 hidden md:block">
            <RankingsDashboard colleges={rankings} />
            {/* Ambient Glow behind dashboard */}
            <div className="absolute -inset-10 bg-white/[0.015] rounded-full blur-[80px] pointer-events-none -z-10" />
          </div>
        </Reveal>

        <div className="space-y-12 lg:order-2">
          <Reveal delay={0.1}>
            <h2 className="text-4xl sm:text-5xl md:text-8xl font-serif font-bold text-white tracking-tighter leading-[0.95]">
              Discover your <br />
              <span className="text-zinc-600 italic">perfect match.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-zinc-500 text-2xl font-medium max-w-xl leading-relaxed">
              Rankings based on verifiable innovation, placement metrics, and global impact.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <Link
              href="/rankings"
              className="inline-flex items-center gap-4 px-8 py-5 md:px-12 md:py-6 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all hover:scale-105 shadow-2xl shadow-white/10 group/btn"
            >
              View Rankings
              <ArrowRight
                size={16}
                className="group-hover/btn:translate-x-1 transition-transform"
              />
            </Link>
          </Reveal>
        </div>
      </div>

      {/* Subtle Background Elements */}
      <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-white/[0.01] to-transparent pointer-events-none" />
    </div>
  );
}

// ── Quick Actions ────────────────────────────────────────────────────────────
function QuickActions({ news, rankings }: { news: any[], rankings: any[] }) {
  return (
    <div className="w-full space-y-20 md:space-y-48 py-20 md:py-48 px-6 overflow-hidden">
      <IntelligenceSection news={news} />
      <RankingsSection rankings={rankings} />

      <div className="max-w-7xl mx-auto hidden">
        <SectionCard
          reverse
          title={
            <>
              Discover your{" "}
              <span className="text-zinc-300 ">perfect match</span>
            </>
          }
          desc="Rankings based on verifiable innovation, placement metrics, and global impact."
          href="/rankings"
          image="/rankings_section.png"
          icon={Trophy}
        />
      </div>
    </div>
  );
}

// ── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-black border-t border-zinc-900 pt-20 md:pt-32 pb-16 px-6 md:px-8">
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
            <h4 className="text-white font-bold text-[10px] mb-8 uppercase tracking-[0.3em]">Platform</h4>
            <ul className="space-y-4">
              {["AI Chatbot", "Latest News", "Rankings"].map(item => (
                <li key={item}>
                  <Link href={`/${item.toLowerCase().replace(" ", "")}`} className="text-zinc-500 hover:text-white text-sm transition-colors font-semibold">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 md:col-span-1">
            <h4 className="text-white font-bold text-[10px] mb-8 uppercase tracking-[0.3em]">Guidelines</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/guidelines/usage-policy" className="text-zinc-500 hover:text-white text-sm transition-colors font-semibold">
                  Usage Policy
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-1">
            <h4 className="text-white font-bold text-[10px] mb-8 uppercase tracking-[0.3em]">Support</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/support/documentation" className="text-zinc-500 hover:text-white text-sm transition-colors font-semibold">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/support/contact" className="text-zinc-500 hover:text-white text-sm transition-colors font-semibold">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-16 border-t border-zinc-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div className="space-y-3">
            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em]">
              © {new Date().getFullYear()} ACADEMIAAI. BUILT FOR THE NEXT GENERATION.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-900 text-[9px] font-black uppercase tracking-widest text-zinc-600">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Systems Operational
              </div>
              <span className="text-[9px] text-zinc-800 font-black uppercase tracking-widest">
                AI Accuracy: 98.4%
              </span>
            </div>
          </div>

          <div className="max-w-md p-8 bg-zinc-900/30 rounded-3xl border border-zinc-800/50">
            <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Info size={14} className="text-zinc-500" />
              Platform Guidelines
            </p>
            <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
              AcademiaAI is an AI-powered intelligence platform. While we strive for absolute accuracy, always verify critical admission dates and cutoffs with official university portals. Use the platform responsibly to explore and discover academia.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function HeroPage() {
  const [query, setQuery] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [news, setNews] = useState<any[]>([]);
  const [rankings, setRankings] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_URL_BASE =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4005";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachedFile(e.target.files?.[0] ?? null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (attachedFile) {
      setIsUploading(true);
      let uploadedFileUrl = "";
      try {
        const formData = new FormData();
        formData.append("file", attachedFile);
        const res = await fetch(`${API_URL_BASE}/upload`, {
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
              const parsed = JSON.parse(line.replace("data: ", "").trim());
              if (parsed.status === "done") {
                uploadedFileUrl = parsed.fileUrl ?? "";
                done = true;
              }
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploading(false);
      }

      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      params.set("file", attachedFile.name);
      if (uploadedFileUrl) params.set("fileUrl", uploadedFileUrl);
      params.set("mode", "pdf");
      window.location.href = `/chat?${params.toString()}`;
      return;
    }
    if (query.trim()) {
      window.location.href = `/chat?q=${encodeURIComponent(query)}&mode=web`;
    }
  };

  const SUGGESTIONS = [
    "IIT Bombay CS cutoff",
    "NIT Trichy placements",
    "Top MBA colleges",
    "JEE Advanced eligibility",
  ];

  useEffect(() => {
    async function init() {
      try {
        const [newsRes, rankingsRes] = await Promise.all([
          fetch(`${API_URL_BASE}/news?limit=10`).then(r => r.json()),
          fetch(`${API_URL_BASE}/rankings?limit=20&sort=rank_2024`).then(r => r.json())
        ]);
        setNews(newsRes.articles || []);
        setRankings(rankingsRes.colleges || []);
      } catch (err) {
        console.error("Initialization failed:", err);
      }
    }
    init();
  }, [API_URL_BASE]);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -100]);

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] overflow-x-hidden selection:bg-white selection:text-black font-sans text-white">
      {/* Liquid Glass Distortion Filter */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter
            id="glass-distortion"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.02 0.02"
              numOctaves="2"
              seed="92"
              result="noise"
            />
            <feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="blurred"
              scale="200"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <header className="fixed top-0 left-0 right-0 h-20 border-b border-transparent md:border-zinc-900/10 flex items-center justify-between px-6 md:px-10 z-[100] bg-black/50 backdrop-blur-xl md:backdrop-blur-none md:bg-transparent transition-all">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.1)] group-hover:scale-105 transition-all shrink-0">
            <GraduationCap className="text-black w-6 h-6" />
          </div>
          <span className="text-xl font-serif font-bold text-white tracking-tighter whitespace-nowrap">
            Academia<span className="text-zinc-500">AI</span>
          </span>
        </Link>
        <div className="flex items-center gap-4 md:gap-10">
          <Link href="/news" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">News</Link>
          <Link href="/rankings" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">Rankings</Link>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-lg border-t border-zinc-900 flex items-center justify-around z-[200] px-6">
        {[
          { icon: GraduationCap, href: "/", active: true },
          { icon: Brain, href: "/chat" },
          { icon: Newspaper, href: "/news" },
          { icon: Trophy, href: "/rankings" }
        ].map((item, i) => (
          <Link key={i} href={item.href} className={cn("p-3 rounded-xl transition-all", item.active ? "bg-white text-black" : "text-zinc-600")}>
            <item.icon size={20} />
          </Link>
        ))}
      </nav>

      <section className="relative flex items-center justify-center min-h-screen px-4 overflow-hidden pt-20">
        <HeroBackground />

        {/* Main Content - Centered */}
        <motion.div
          style={{ y: heroY }}
          className="relative z-10 w-full max-w-5xl mx-auto text-center"
        >
          {/* Hero Text - Moved Above Search */}
          <div className="mb-10 md:mb-16">
            <Reveal>
              <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tighter leading-tight mb-4 text-white">
                <CycleWord />{" "}
                <span className="text-zinc-700">Every College.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-sm md:text-lg text-zinc-400 leading-relaxed font-medium max-w-2xl mx-auto opacity-80">
                Live admissions, placements, and academic intelligence across
                India's top institutions.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.4}>
            <form onSubmit={handleSubmit} className="relative group">
              <div className="relative flex items-center liquid-glass-container rounded-full transition-all duration-500 shadow-2xl shadow-black/5 p-1 md:p-2 border-2 border-transparent group-focus-within:border-white/10">
                <Search className="absolute left-6 md:left-8 w-5 h-5 md:w-8 md:h-8 text-zinc-300 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask anything about colleges..."
                  className="w-full bg-transparent pl-12 md:pl-20 pr-4 py-4 md:py-10 text-xl md:text-4xl text-white placeholder:text-zinc-600 outline-none font-serif font-medium"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "p-3 md:p-10 mr-1 md:mr-2 text-zinc-300 hover:text-white transition-colors",
                    attachedFile && "text-white",
                  )}
                >
                  <Paperclip className="w-5 h-5 md:w-8 md:h-8" />
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 md:px-14 py-3 md:py-6 mr-7 bg-white text-black font-bold text-xs md:text-xl rounded-full hover:bg-zinc-200 transition-all active:scale-95 shadow-xl disabled:opacity-50"
                >
                  {isUploading ? "Indexing..." : "Search"}
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
            {attachedFile && (
              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-black bg-zinc-50 py-2 px-4 rounded-full mx-auto w-fit">
                <FileText size={14} /> {attachedFile.name}
                <button
                  onClick={() => setAttachedFile(null)}
                  className="ml-2 hover:text-zinc-400"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-6 md:mt-10">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() =>
                    (window.location.href = `/chat?q=${encodeURIComponent(s)}&mode=web`)
                  }
                  className="px-4 md:px-6 py-2 md:py-3 rounded-full border border-zinc-800 bg-zinc-900/50 text-[9px] md:text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:border-white transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </Reveal>
        </motion.div>
      </section>

      <TopStudyPlaces />
      <QuickActions news={news} rankings={rankings} />

      <div className="w-full py-64 px-6 bg-[#0a0a0a] relative overflow-hidden">
        <Reveal>
          <div className="max-w-6xl mx-auto relative text-center space-y-16">
            <div className="flex justify-center items-center gap-8 mb-12">
              <h3 className="text-white text-5xl md:text-7xl font-bold tracking-tighter">
                Academia<span className="text-zinc-600 italic">AI</span>
              </h3>
            </div>

            <div className="space-y-8">
              <h2 className="text-6xl md:text-[12rem] font-serif font-bold text-white tracking-tighter leading-[0.85]">
                Join <span className="text-zinc-700 italic">&</span> <br />
                Get Started
              </h2>
              <p className="text-zinc-500 text-2xl md:text-3xl max-w-3xl mx-auto font-medium leading-relaxed">
                Experience the next generation of academic intelligence. <br />
                Data-driven decisions start here.
              </p>
            </div>

            <div className="flex flex-col items-center gap-16">
              <Link 
                href="/chat" 
                className="px-12 py-8 md:px-20 md:py-10 bg-white text-black font-black uppercase tracking-[0.4em] text-sm rounded-2xl hover:bg-zinc-200 transition-all inline-flex items-center gap-8 group/btn shadow-[0_30px_70px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95"
              >
                Enter Platform
                <ArrowRight size={24} className="group-hover/btn:translate-x-3 transition-transform" />
              </Link>

              {/* Social Proof / Stats */}
              <div className="flex flex-wrap justify-center gap-12 pt-16 border-t border-zinc-900/50 w-full max-w-2xl mx-auto">
                
                <div className="w-px h-12 bg-zinc-900" />
                <div className="text-center">
                  <p className="text-white text-4xl font-serif font-bold tracking-tighter">500+</p>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mt-2">Colleges</p>
                </div>
                <div className="w-px h-12 bg-zinc-900" />
                <div className="text-center">
                  <p className="text-white text-4xl font-serif font-bold tracking-tighter">24/7</p>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mt-2">Live Intel</p>
                </div>
              </div>
            </div>

            {/* Expansive Ambient Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.03] rounded-full blur-[150px] pointer-events-none -z-10" />
          </div>
        </Reveal>
      </div>

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
  );
}


