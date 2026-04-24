"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

interface PreviewArticle {
  id: number;
  title: string;
  summary: string;
  url: string;
  source: string;
  image: string;
  published_at: string | null;
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

// ── Animated cycling word ────────────────────────────────────────────────────
const CYCLE_WORDS = [
  "Search",
  "Explore",
  "Discover",
  "Analyse",
];

function CycleWord() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % CYCLE_WORDS.length), 3000);
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
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block text-black"
        >
          {CYCLE_WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// ── Slider dots ─────────────────────────────────────────────────────────
function SliderDots({ current, total, onSelect }: { current: number; total: number; onSelect: (i: number) => void }) {
  return (
    <div className="relative z-10 flex items-center gap-2.5 mt-10">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={`Go to slide ${i + 1}`}
          className={`transition-all duration-500 rounded-full ${
            i === current
              ? "w-7 h-2 bg-black"
              : "w-2 h-2 bg-black/15 hover:bg-black/30"
          }`}
        />
      ))}
    </div>
  );
}

// ── Background image slider ──────────────────────────────────────────────────
const SLIDES = [
  "/Karnataka-University-Dharwad.jpg",
  "/chitkara.jpg",
  "/iit bomaby.jpeg",
  "/polaris.webp",
  "/pu.jpeg",
  "/scaler.avif",
];

function HeroBackground({ current }: { current: number }) {
  return (
    <>
      {/* Slides */}
      {SLIDES.map((src, i) => (
        <motion.div
          key={src}
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: i === current ? 1 : 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover"
            draggable={false}
          />
        </motion.div>
      ))}
      {/* White overlay for text readability */}
      <div className="absolute inset-0 bg-white/85" />
      {/* Bottom fade into white sections */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-white to-transparent" />
    </>
  );
}

// ── Top Study Places ─────────────────────────────────────────────────────────
const TOP_CITIES = [
  { name: "Delhi NCR", icon: <Landmark className="w-10 h-10 text-blue-600/80" />, query: "New Delhi" },
  { name: "Bangalore", icon: <Building2 className="w-10 h-10 text-blue-600/80" />, query: "Bangalore" },
  { name: "Hyderabad", icon: <Building className="w-10 h-10 text-blue-600/80" />, query: "Hyderabad" },
  { name: "Pune", icon: <University className="w-10 h-10 text-blue-600/80" />, query: "Pune" },
  { name: "Mumbai", icon: <Building2 className="w-10 h-10 text-blue-600/80" />, query: "Mumbai" },
  { name: "Chennai", icon: <School className="w-10 h-10 text-blue-600/80" />, query: "Chennai" },
  { name: "Kolkata", icon: <Library className="w-10 h-10 text-blue-600/80" />, query: "Kolkata" },
  { name: "Bhopal", icon: <Landmark className="w-10 h-10 text-blue-600/80" />, query: "Bhopal" },
  { name: "Indore", icon: <Building className="w-10 h-10 text-blue-600/80" />, query: "Indore" },
  { name: "Nagpur", icon: <Building2 className="w-10 h-10 text-blue-600/80" />, query: "Nagpur" },
];

function TopStudyPlaces() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-24">
      <div className="flex items-end justify-between mb-12 px-2">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight">
            Top Study Places
          </h2>
          <p className="text-zinc-500 text-sm mt-2">Explore top colleges in India's major academic hubs</p>
        </div>
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-colors"
            >
              <ChevronLeft size={20} className="text-zinc-400" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-colors"
            >
              <ChevronRight size={20} className="text-zinc-400" />
            </button>
          </div>
          <Link
            href="/rankings"
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors md:ml-4"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory px-2"
      >
        {TOP_CITIES.map((city) => (
          <Link
            key={city.name}
            href={`/colleges/${city.query.toLowerCase().replace(/\s+/g, "-")}`}
            className="flex-shrink-0 w-40 aspect-square snap-start p-4 rounded-xl bg-white border border-zinc-100 hover:border-blue-100 hover:bg-blue-50/10 transition-all group flex flex-col items-center justify-center text-center gap-4"
          >
            <div className="group-hover:scale-105 transition-transform duration-500">
              {React.cloneElement(city.icon as React.ReactElement, { strokeWidth: 1.5 })}
            </div>
            <span className="text-sm font-bold text-zinc-700 group-hover:text-black transition-colors">
              {city.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
const NEWS_CATEGORIES = [
  "All",
  "Hackathons & Competitions",
  "Engineering",
  "Medical",
  "Design",
  "Management",
  "Science",
  "Commerce",
  "Exams",
];

function LatestNewsStrip() {
  const [articles, setArticles] = useState<PreviewArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    setLoading(true);
    const categoryParam = selectedCategory === "All" ? "" : `&category=${selectedCategory}`;
    fetch(`${API_URL}/news?limit=6${categoryParam}`)
      .then((r) => r.json())
      .then((d) => setArticles(d.articles ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-5xl mx-auto border-t border-zinc-200 pt-24"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight">
            College News & Articles
          </h2>
          <p className="text-zinc-500 text-sm mt-2">Stay updated with the latest in Indian academia</p>
        </div>
        <Link
          href="/news"
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"
        >
          View All <ArrowRight size={14} />
        </Link>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-10">
        {NEWS_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              selectedCategory === cat
                ? "bg-black text-white shadow-lg shadow-black/10 scale-105"
                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-black"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="divide-y divide-zinc-100">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-6 py-4 animate-pulse">
              <div className="flex-shrink-0 w-24 space-y-2 pt-1">
                <div className="h-3 bg-zinc-200 rounded w-full" />
                <div className="h-3 bg-zinc-100 rounded w-3/4" />
              </div>
              <div className="flex-grow space-y-2">
                <div className="h-4 bg-zinc-200 rounded w-full" />
                <div className="h-4 bg-zinc-200 rounded w-4/5" />
                <div className="h-3 bg-zinc-100 rounded w-2/3 mt-1" />
              </div>
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-3xl border border-zinc-100 bg-zinc-50/50">
          <Newspaper className="w-10 h-10 text-zinc-200 mb-4" />
          <p className="text-zinc-400 text-sm font-medium">No articles found in this category.</p>
          <button
            onClick={() => setSelectedCategory("All")}
            className="mt-4 text-xs font-bold text-black hover:underline underline-offset-4"
          >
            Clear Filter
          </button>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100">
          {articles.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="group flex items-start gap-6 py-5 transition-colors duration-200"
            >
              <div className="flex-shrink-0 w-24 pt-1 space-y-2">
                <span className="inline-block px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-zinc-200 text-zinc-500 bg-white leading-none shadow-sm">
                  {a.source}
                </span>
                <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-medium">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  <span>{formatDate(a.published_at)}</span>
                </div>
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-zinc-800 text-base font-bold leading-snug line-clamp-2 group-hover:text-black transition-colors">
                  {a.title}
                </p>
                <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2 mt-1.5">
                  {a.summary}
                </p>
              </div>
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Read ${a.title}`}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-50 text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black hover:bg-zinc-100 transition-all group/link mt-1"
              >
                <span className="hidden sm:inline">Read</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
              </a>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── College Rankings Strip ───────────────────────────────────────────────────
interface RankingCollege {
  college: string;
  nirf_rank: number | null;
  nirf_category: string;
  global_rank: number | null;
  patents: number;
  research_papers: number;
  hackathons_won: number;
  startups_incubated: number;
  awards: string[];
  innovation_score: number;
}

const RANK_CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Engineering: <FlaskConical className="w-3 h-3" />,
  Medical: <HeartPulse className="w-3 h-3" />,
  Management: <Landmark className="w-3 h-3" />,
  Design: <Palette className="w-3 h-3" />,
  Research: <Microscope className="w-3 h-3" />,
};

function InnovationBar({ score, max = 150 }: { score: number; max?: number }) {
  const pct = Math.min(100, (score / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
        />
      </div>
      <span className="text-[11px] font-bold text-amber-500 w-7 text-right tabular-nums">{score}</span>
    </div>
  );
}

function CollegeRankingsStrip() {
  const [colleges, setColleges] = useState<RankingCollege[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/rankings/top`)
      .then((r) => r.json())
      .then((d) => setColleges(d.colleges ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-5xl mx-auto border-t border-zinc-200 pt-24"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight">
            College Rankings
          </h2>
          <p className="text-zinc-500 text-sm mt-2">Ranked by innovation score — patents, startups, research & hackathons</p>
        </div>
        <Link
          href="/rankings"
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"
        >
          Full Rankings <ArrowRight size={14} />
        </Link>
      </div>
      {/* Horizontal Slider of Boxes */}
      <div className="relative -mx-6 px-6">
        {loading ? (
          <div className="flex gap-4 overflow-x-auto pb-8 scrollbar-hide">
            {[0,1,2,3].map((i) => (
              <div key={i} className="flex-shrink-0 w-72 h-48 rounded-2xl bg-zinc-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide">
            {colleges.slice(0, 12).map((c, i) => (
              <motion.div
                key={c.college}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex-shrink-0 w-72 snap-start p-6 rounded-3xl bg-white border border-zinc-100 hover:border-amber-200 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all group"
              >
                {/* Rank & Category */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-[10px] font-black text-zinc-400 group-hover:border-amber-100 group-hover:text-amber-500 transition-colors">
                    {c.nirf_rank ? `#${c.nirf_rank}` : '—'}
                  </div>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-50 text-zinc-400 text-[9px] font-bold uppercase tracking-wider border border-zinc-100 group-hover:border-amber-50/50 group-hover:bg-amber-50/30 group-hover:text-amber-600 transition-colors">
                    {RANK_CATEGORY_ICONS[c.nirf_category]}
                    {c.nirf_category}
                  </span>
                </div>

                {/* Name */}
                <h3 className="font-bold text-black text-sm mb-4 line-clamp-2 h-10 group-hover:text-amber-600 transition-colors">
                  {c.college}
                </h3>

                {/* Innovation Score */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">Innovation</span>
                    <span className="text-[10px] font-black text-amber-500">{c.innovation_score}</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(c.innovation_score / 150) * 100}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                    />
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-50 text-[10px] text-zinc-400 group-hover:border-amber-50 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-bold text-zinc-800">{c.patents}+</span>
                    <span>Patents</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-zinc-800">{c.startups_incubated}+</span>
                    <span>Startups</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-zinc-800">{c.hackathons_won}+</span>
                    <span>Wins</span>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* View All Card */}
            <Link 
              href="/rankings"
              className="flex-shrink-0 w-72 snap-start flex flex-col items-center justify-center p-6 rounded-3xl border-2 border-dashed border-zinc-100 hover:border-amber-200 hover:bg-amber-50/10 transition-all group/all"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-4 group-hover/all:bg-amber-50 group-hover/all:border-amber-200 transition-all">
                <ArrowRight className="w-5 h-5 text-zinc-400 group-hover/all:text-amber-500 transition-all" />
              </div>
              <span className="font-bold text-zinc-400 group-hover/all:text-amber-600 transition-colors">View Full Rankings</span>
              <span className="text-[10px] text-zinc-300 mt-1">Explore all 20+ institutions</span>
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function HeroPage() {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const API_URL_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

  // Auto-advance slides
  useEffect(() => {
    const id = setInterval(() => setSlideIndex((c) => (c + 1) % SLIDES.length), 4000);
    return () => clearInterval(id);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setAttachedFile(f);
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If a file is attached → upload first, then navigate to /chat with file metadata
    if (attachedFile) {
      setIsUploading(true);
      setUploadProgress(0);
      let uploadedFileUrl = "";
      const uploadedFileName = attachedFile.name;
      try {
        const formData = new FormData();
        formData.append("file", attachedFile);
        const res = await fetch(`${API_URL_BASE}/upload`, { method: "POST", body: formData });
        if (!res.body) throw new Error("No body");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        while (!done) {
          const { done: d, value } = await reader.read();
          if (d) break;
          const lines = decoder.decode(value).split("\n");
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            try {
              const parsed = JSON.parse(line.replace("data: ", "").trim());
              if (parsed.status === "started") {
                setUploadProgress(50);
              } else if (parsed.status === "embedding") {
                setUploadProgress(50 + Math.round((parsed.progress / parsed.total) * 50));
              } else if (parsed.status === "done") {
                setUploadProgress(100);
                uploadedFileUrl = parsed.fileUrl ?? "";
                done = true;
              } else if (parsed.status === "error") {
                done = true;
              }
            } catch {}
          }
        }
      } catch (err) {
        console.error("Upload error:", err);
      } finally {
        setIsUploading(false);
      }

      // Pass file info to /chat — PDF mode
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      params.set("file", uploadedFileName);
      if (uploadedFileUrl) params.set("fileUrl", uploadedFileUrl);
      params.set("mode", "pdf");
      window.location.href = `/chat?${params.toString()}`;
      return;
    }

    // Text-only search → web mode
    if (query.trim()) {
      window.location.href = `/chat?q=${encodeURIComponent(query)}&mode=web`;
    }
  };

  const SUGGESTIONS = [
    "IIT Bombay CS cutoff 2025",
    "NIT Trichy placements",
    "Top MBA colleges India",
    "BITS Pilani fees structure",
    "JEE Advanced eligibility",
  ];


  return (
    <div className="relative min-h-screen bg-white overflow-x-hidden selection:bg-zinc-200 font-sans">

      {/* ── Navigation ────────────────────────────────────────────── */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2.5"
        >
          <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center shadow shadow-black/10">
            <GraduationCap className="text-white w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-black">CampusAI</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-6"
        >
          <Link href="/news" className="text-black/60 hover:text-black text-sm font-medium transition-colors">
            News
          </Link>
           <Link href="/rankings" className="text-black/60 hover:text-black text-sm font-medium transition-colors">
            Rankings
          </Link>
          <Link
            href="/chat"
            className="flex items-center gap-1.5 px-4 py-2 bg-black text-white text-sm font-bold rounded-full hover:bg-zinc-800 transition-all active:scale-95"
          >
            Open Chat <ArrowUpRight size={14} />
          </Link>
        </motion.div>
      </nav>

      {/* ── Hero Section ──────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-4 text-center overflow-hidden">
        <HeroBackground current={slideIndex} />

        {/* Badge */}
        {/* <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 mb-8"
        >
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-white/20 text-white/80 bg-white/10 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI-Powered College Intelligence
          </span>
        </motion.div> */}

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] mb-6 max-w-5xl text-black"
        >
          <CycleWord />{" "}
          <span className="text-black">Every College,</span>
          <br />
          <span className="text-black/40">Instantly.</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 text-base md:text-lg text-zinc-600 max-w-xl mb-12 leading-relaxed font-medium"
        >
          Ask about admissions, fees, placements, and rankings across India's top institutions — powered by live data and verified sources.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-2xl"
        >
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Attached file pill */}
          {attachedFile && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex items-center gap-2 mb-3 w-fit mx-auto px-3 py-2 rounded-xl bg-white/15 backdrop-blur-sm border border-white/25"
            >
              <FileText className="w-4 h-4 text-black flex-shrink-0" />
              <span className="text-black text-xs font-medium max-w-[200px] truncate">{attachedFile.name}</span>
              <button
                type="button"
                onClick={() => { setAttachedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                className="ml-1 text-black/40 hover:text-black transition-colors"
                aria-label="Remove file"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="relative group">
            <div className="relative flex flex-col bg-zinc-50 border border-zinc-200 group-focus-within:border-black rounded-2xl transition-all duration-300 overflow-hidden shadow-2xl shadow-black/5">

              {/* Progress bar */}
              {isUploading && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/20 z-10">
                  <motion.div
                    className="h-full bg-black"
                    initial={{ width: "0%" }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}

              <div className="flex items-center">
                <Search className="absolute left-5 w-5 h-5 text-zinc-400 pointer-events-none flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  disabled={isUploading}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={isUploading ? `Indexing document… ${uploadProgress}%` : "Ask about any college, exam, or course…"}
                  className="w-full bg-transparent pl-14 pr-4 py-5 text-base md:text-lg text-black placeholder:text-zinc-400 outline-none font-medium disabled:opacity-60"
                />

                {/* Paperclip */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  aria-label="Attach document"
                  className="flex-shrink-0 p-2 mr-1 text-zinc-400 hover:text-black transition-colors rounded-xl hover:bg-zinc-100 disabled:opacity-40"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-shrink-0 m-2 px-6 py-3 bg-black text-white font-bold text-sm rounded-xl hover:bg-zinc-800 transition-all active:scale-95 whitespace-nowrap disabled:opacity-60"
                >
                  {isUploading ? "Uploading…" : attachedFile ? "Upload & Chat" : "Search"}
                </button>
              </div>
            </div>
          </form>

          {/* Suggestion chips */}
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  window.location.href = `/chat?q=${encodeURIComponent(s)}&mode=web`;
                }}
                className="px-3.5 py-1.5 rounded-full border border-zinc-200 bg-white text-xs font-medium text-zinc-500 hover:text-black hover:bg-zinc-50 hover:border-zinc-300 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </motion.div>


        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="relative z-10 flex items-center divide-x divide-zinc-200 mt-16"
        >
          {[
            { value: "6,000+", label: "Colleges" },
            { value: "500+", label: "Exams" },
            { value: "Live", label: "Data" },
            { value: "AI", label: "Powered" },
          ].map((stat) => (
            <div key={stat.label} className="px-6 text-center first:pl-0 last:pr-0">
              <div className="text-lg font-bold text-black">{stat.value}</div>
              <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-widest mt-0.5">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Slide dots */}
        <SliderDots current={slideIndex} total={SLIDES.length} onSelect={setSlideIndex} />
      </section>

      {/* ── Top Study Places ────────────────────────────────────────────── */}
      <section className="relative z-10">
        <TopStudyPlaces />
      </section>

      {/* ── News Strip ────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-16">
        <LatestNewsStrip />
      </section>

      {/* ── Rankings Strip ────────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-32">
        <CollegeRankingsStrip />
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-zinc-100 bg-white py-10 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
                <GraduationCap className="text-white w-4 h-4" />
              </div>
              <span className="text-base font-bold tracking-tight text-black">CampusAI</span>
            </div>
            <p className="text-zinc-400 text-xs">
              © {new Date().getFullYear()} CampusAI. Built for researchers.
            </p>
          </div>
          <div className="flex items-center gap-8">
            <Link href="/chat" className="text-zinc-400 hover:text-black text-xs transition-colors font-medium">Chat</Link>
            <Link href="/news" className="text-zinc-400 hover:text-black text-xs transition-colors font-medium">News</Link>
            <Link href="#" className="text-zinc-400 hover:text-black text-xs transition-colors font-medium">Privacy</Link>
            <Link href="#" className="text-zinc-400 hover:text-black text-xs transition-colors font-medium">Terms</Link>
            <span className="flex items-center gap-1.5 text-zinc-400 text-xs ml-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              System Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
