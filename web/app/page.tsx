"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
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
} from "lucide-react";

// ── Animated cycling word ────────────────────────────────────────────────────
const CYCLE_WORDS = ["Search", "Explore", "Discover", "Analyse"];

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
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block text-black"
        >
          {CYCLE_WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// ── Hero Background ──────────────────────────────────────────────────────────
function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.15 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <img src="/monochrome_hero_abstract_1777281034931.png" alt="" className="w-full h-full object-cover grayscale" draggable={false} />
      </motion.div>
      <div className="absolute inset-0 bg-white/60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,white_100%)]" />
    </div>
  );
}

// ── Reveal Component ────────────────────────────────────────────────────────
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
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
  { name: "Delhi NCR", icon: <Landmark className="w-8 h-8 text-black/40" />, query: "New Delhi" },
  { name: "Bangalore", icon: <Building2 className="w-8 h-8 text-black/40" />, query: "Bangalore" },
  { name: "Hyderabad", icon: <Building className="w-8 h-8 text-black/40" />, query: "Hyderabad" },
  { name: "Pune", icon: <University className="w-8 h-8 text-black/40" />, query: "Pune" },
  { name: "Mumbai", icon: <Building2 className="w-8 h-8 text-black/40" />, query: "Mumbai" },
  { name: "Chennai", icon: <School className="w-8 h-8 text-black/40" />, query: "Chennai" },
  { name: "Kolkata", icon: <Library className="w-8 h-8 text-black/40" />, query: "Kolkata" },
  { name: "Bhopal", icon: <Landmark className="w-8 h-8 text-black/40" />, query: "Bhopal" },
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
    <div className="w-full max-w-6xl mx-auto py-32 px-6">
      <Reveal>
        <div className="flex items-end justify-between mb-16">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-black tracking-tight mb-4">Top Study Places</h2>
            <p className="text-zinc-500 text-lg font-medium">Discover your future academic home in India's leading education hubs.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => scroll("left")} className="w-12 h-12 rounded-full border border-zinc-100 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm"><ChevronLeft size={20} /></button>
            <button onClick={() => scroll("right")} className="w-12 h-12 rounded-full border border-zinc-100 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm"><ChevronRight size={20} /></button>
          </div>
        </div>
      </Reveal>
      <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-12 scrollbar-hide snap-x snap-mandatory">
        {TOP_CITIES.map((city, i) => (
          <Reveal key={city.name} delay={i * 0.05}>
            <Link href={`/chat?q=${encodeURIComponent(city.query)}&mode=web`} className="flex-shrink-0 w-48 aspect-[4/5] snap-start p-8 rounded-[2rem] bg-zinc-50/50 border border-zinc-100 hover:border-black hover:bg-white transition-all group flex flex-col items-center justify-center text-center gap-6">
              <div className="group-hover:scale-110 group-hover:text-black transition-all duration-500">{city.icon}</div>
              <span className="text-sm font-bold tracking-tight text-zinc-500 group-hover:text-black transition-colors">{city.name}</span>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

// ── Section Card ────────────────────────────────────────────────────────────
function SectionCard({ title, desc, href, image, badge, icon: Icon, reverse = false }: any) {
  return (
    <div className={cn("flex flex-col md:flex-row items-center gap-16 lg:gap-24", reverse && "md:flex-row-reverse")}>
      <div className="flex-1 space-y-10">
        <Reveal><div className="inline-flex items-center gap-2.5 px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400"><Icon size={14} />{badge}</div></Reveal>
        <Reveal delay={0.1}><h2 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-black leading-[1.05] tracking-tighter">{title}</h2></Reveal>
        <Reveal delay={0.2}><p className="text-zinc-500 text-xl font-medium leading-relaxed max-w-xl">{desc}</p></Reveal>
        <Reveal delay={0.3}><Link href={href} className="inline-flex items-center gap-4 px-10 py-5 bg-black text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all hover:scale-105 shadow-2xl shadow-black/20 group">Explore <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></Link></Reveal>
      </div>
      <div className="flex-1 w-full">
        <Reveal delay={0.2}><div className="relative aspect-[4/3] rounded-[3.5rem] overflow-hidden shadow-2xl shadow-black/10 group bg-zinc-100 border border-zinc-200">
          <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 grayscale" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div></Reveal>
      </div>
    </div>
  );
}

// ── Quick Actions ────────────────────────────────────────────────────────────
function QuickActions() {
  return (
    <div className="w-full space-y-48 py-48 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <SectionCard badge="Live Intelligence" title={<>Stay ahead with the <span className="text-zinc-300 italic">latest buzz</span></>} desc="Real-time tracking of admissions, cut-offs, and results across 500+ Indian institutions." href="/news" image="/news_section.png" icon={Newspaper} />
      </div>
      <div className="max-w-7xl mx-auto">
        <SectionCard reverse badge="Data-Driven" title={<>Discover your <span className="text-zinc-300 italic">perfect match</span></>} desc="Rankings based on verifiable innovation, placement metrics, and global impact." href="/rankings" image="/rankings_section.png" icon={Trophy} />
      </div>
    </div>
  );
}

// ── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-white border-t border-zinc-100 pt-32 pb-16 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center"><GraduationCap className="text-white w-6 h-6" /></div>
              <span className="text-2xl font-serif font-bold tracking-tight text-black">CampusAI</span>
            </div>
            <p className="text-zinc-500 text-base font-medium leading-relaxed max-w-[240px]">The intelligent platform to explore and discover Indian academia.</p>
          </div>
          {["Platform", "Resources", "Legal"].map((title, i) => (
            <div key={title}>
              <h4 className="text-black font-bold text-[10px] mb-8 uppercase tracking-[0.3em]">{title}</h4>
              <ul className="space-y-4">
                {i === 0 && (
                  <>
                    <li><Link href="/chat" className="text-zinc-400 hover:text-black text-sm transition-colors font-semibold">AI Chatbot</Link></li>
                    <li><Link href="/news" className="text-zinc-400 hover:text-black text-sm transition-colors font-semibold">Latest News</Link></li>
                    <li><Link href="/rankings" className="text-zinc-400 hover:text-black text-sm transition-colors font-semibold">Rankings</Link></li>
                  </>
                )}
                {i !== 0 && (
                  <>
                    <li><Link href="#" className="text-zinc-400 hover:text-black text-sm transition-colors font-semibold">Privacy Policy</Link></li>
                    <li><Link href="#" className="text-zinc-400 hover:text-black text-sm transition-colors font-semibold">Terms</Link></li>
                  </>
                )}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-12 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-zinc-300 text-[10px] font-black uppercase tracking-[0.3em]">© {new Date().getFullYear()} CAMPUSAI.</p>
          <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-400">
            <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />Systems Operational
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_URL_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

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
        const res = await fetch(`${API_URL_BASE}/upload`, { method: "POST", body: formData });
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
      } catch (err) { console.error(err); } finally { setIsUploading(false); }
      
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

  const SUGGESTIONS = ["IIT Bombay CS cutoff", "NIT Trichy placements", "Top MBA colleges", "JEE Advanced eligibility"];

  return (
    <div className="relative min-h-screen bg-white overflow-x-hidden selection:bg-black selection:text-white font-sans">
      <nav className="fixed top-0 w-full z-[100] glass-morphism border-b border-zinc-100">
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><GraduationCap className="text-white w-6 h-6" /></div>
            <span className="text-2xl font-serif font-bold tracking-tight text-black">CampusAI</span>
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/news" className="text-zinc-500 hover:text-black text-xs font-black uppercase tracking-widest transition-colors">News</Link>
            <Link href="/rankings" className="text-zinc-500 hover:text-black text-xs font-black uppercase tracking-widest transition-colors">Rankings</Link>
            <Link href="/chat" className="px-6 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-all uppercase tracking-widest">Open Chat</Link>
          </div>
        </div>
      </nav>

      <section className="relative flex flex-col items-center justify-center min-h-screen px-4 pt-20 text-center">
        <HeroBackground />
        <div className="relative z-10 max-w-5xl mx-auto">
          <Reveal><h1 className="text-7xl md:text-8xl lg:text-9xl font-serif font-bold tracking-tighter leading-[0.95] mb-10 text-black"><CycleWord /> <br /><span className="text-zinc-300">Every College.</span></h1></Reveal>
          <Reveal delay={0.2}><p className="text-xl md:text-2xl text-zinc-500 max-w-2xl mx-auto mb-16 leading-relaxed font-medium">Live admissions, placements, and academic intelligence across India's top institutions.</p></Reveal>
          <Reveal delay={0.4}><div className="w-full max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative group">
              <div className="relative flex items-center bg-white border-2 border-zinc-100 group-focus-within:border-black rounded-[2.5rem] transition-all duration-500 overflow-hidden shadow-2xl shadow-black/5 p-2">
                <Search className="absolute left-8 w-6 h-6 text-zinc-300 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask anything about colleges..."
                  className="w-full bg-transparent pl-16 pr-4 py-8 text-2xl text-black placeholder:text-zinc-300 outline-none font-serif font-medium"
                />
                <button type="button" onClick={() => fileInputRef.current?.click()} className={cn("p-4 mr-2 text-zinc-300 hover:text-black transition-colors", attachedFile && "text-black")}>
                  <Paperclip size={24} />
                </button>
                <button type="submit" disabled={isUploading} className="px-10 py-6 bg-black text-white font-bold text-lg rounded-[1.8rem] hover:bg-zinc-800 transition-all active:scale-95 shadow-xl disabled:opacity-50">
                  {isUploading ? "Indexing..." : "Search"}
                </button>
              </div>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept=".pdf" />
            </form>
            {attachedFile && (
              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-black bg-zinc-50 py-2 px-4 rounded-full mx-auto w-fit">
                <FileText size={14} /> {attachedFile.name}
                <button onClick={() => setAttachedFile(null)} className="ml-2 hover:text-zinc-400"><X size={14} /></button>
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {SUGGESTIONS.map(s => <button key={s} onClick={() => window.location.href = `/chat?q=${encodeURIComponent(s)}&mode=web`} className="px-5 py-2 rounded-full border border-zinc-100 bg-white text-[11px] font-black uppercase tracking-widest text-zinc-400 hover:text-black hover:border-black transition-all">{s}</button>)}
            </div>
          </div></Reveal>
        </div>
      </section>

      <TopStudyPlaces />
      <QuickActions />
      <Footer />
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(" ");
