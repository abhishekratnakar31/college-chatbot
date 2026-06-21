"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  ArrowLeft, 
  Search,
  Zap,
  Loader2,
  Info,
  TrendingUp,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
  Globe,
  Users,
  MapPin,
  Target,
  Clock,
  Mic,
  Volume2,
  Menu,
  X,
  Brain,
  Newspaper,
  Trophy,
  Bookmark,
  LayoutGrid
} from "lucide-react";

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(" ");

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4006"
).replace("localhost", "127.0.0.1");

// ── Components ──────────────────────────────────────────────────────────────

function Reveal({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.19, 1, 0.22, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ── Prediction Result Item ────────────────────────────────────────────────
function PredictionResultItem({ res, i }: { res: any, i: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const prob = res.overall_probability || res.probability || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 }}
      className="py-6 first:pt-0 group border-b-2 border-black last:border-0"
    >
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex flex-col md:flex-row md:items-center justify-between gap-8 cursor-pointer hover:bg-[#b69cc4]/10 transition-all px-4 rounded-xl py-4"
      >
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-black px-2 py-0.5 bg-[#b69cc4]/30 border border-black rounded">{res.exam}</span>
            <div className="h-0.5 w-4 bg-black" />
            <span className="text-[9px] font-bold text-black uppercase tracking-widest">2024-25 Data</span>
            <div className="h-0.5 w-4 bg-black" />
            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{res.location || "Multiple Locations"}</span>
          </div>
          <h4 className="text-2xl font-bold text-black group-hover:text-[#a387b3] transition-colors flex items-center gap-4">
            {res.college}
            <ChevronRight size={18} className={cn("text-black transition-transform", isExpanded && "rotate-90")} />
          </h4>
          <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            <div className="flex items-center gap-2">
              <GraduationCap size={12} className="text-black" />
              <span>{res.courses?.length || 1} Available Courses</span>
            </div>
            <div className={cn(
              "px-2 py-0.5 rounded border border-black font-extrabold",
              res.status === "High" ? "bg-[#b69cc4] text-black" : "bg-white text-zinc-600"
            )}>
              {res.status}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-12 text-right">
          <div className="space-y-1">
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Institution Fit</p>
            <div className="flex items-baseline justify-end gap-1">
              <span className={cn(
                "text-5xl font-black tracking-tighter transition-colors text-black"
              )}>
                {prob}
                <span className="text-xl text-black ml-1">%</span>
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center relative bg-white shadow-[2px_2px_0px_0px_#000000]">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="18"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="3"
                className="text-zinc-100"
              />
              <motion.circle
                cx="24"
                cy="24"
                r="18"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeDasharray="113.1"
                initial={{ strokeDashoffset: 113.1 }}
                animate={{ strokeDashoffset: 113.1 - (113.1 * prob) / 100 }}
                transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                className="text-[#b69cc4]"
              />
            </svg>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-8 pb-4 px-4 space-y-12 border-t-2 border-black mt-4">
              {/* Courses Grid */}
              <div className="space-y-6">
                <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#a387b3]">Qualified Courses & Probabilities</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(res.courses || [{ name: res.branch, probability: res.probability, cutoff: res.cutoff, course_highlights: res.course_details }]).map((course: any, ci: number) => (
                    <div key={ci} className="p-5 rounded-xl bg-white border-2 border-black hover:bg-[#b69cc4]/10 transition-all group/course shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <div className="flex justify-between items-start mb-3">
                        <h6 className="text-sm font-bold text-black group-hover/course:text-[#a387b3] transition-colors">{course.name}</h6>
                        <span className="text-[10px] font-black text-black bg-[#b69cc4]/20 border border-black px-2 py-0.5 rounded">{course.probability}%</span>
                      </div>
                      <p className="text-xs text-zinc-600 leading-relaxed mb-4">{course.course_highlights || "Detailed curriculum covering core principles and industry-aligned specializations."}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-black uppercase">
                          <Target size={10} />
                          <span>Cutoff: ~{course.cutoff}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Institutional Intel</h5>
                    <p className="text-sm text-zinc-700 leading-relaxed font-medium">
                      {res.placements || "Strong industry ties with recruiters like Google, Microsoft, and Amazon. Avg Package: ₹22-28 LPA."}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Est. Budget</h5>
                      <p className="text-sm font-bold text-black">{res.fees || "₹2.5L - 3.2L / year"}</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Location</h5>
                      <p className="text-sm font-bold text-black">{res.location || "Main Campus"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Eligibility Protocol</h5>
                    <div className="p-4 rounded-xl bg-zinc-100 border-2 border-black">
                      <p className="text-xs text-zinc-700 leading-relaxed">
                        {res.eligibility || "Valid rank in entrance exam, 75%+ in 10+2 Boards, and mandatory completion of required stream."}
                      </p>
                    </div>
                  </div>
                  {res.citations && res.citations.length > 0 && (
                    <div className="space-y-3">
                      <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Verified Sources</h5>
                      <div className="flex flex-wrap gap-2">
                        {res.citations.map((cite: any, ci: number) => (
                          <a 
                            key={ci}
                            href={cite.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border-2 border-black text-[9px] font-bold text-black hover:bg-[#b69cc4] transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                          >
                            {cite.source}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Predictor Page ──────────────────────────────────────────────────────────

const CAREER_PATHWAYS = [
  { 
    id: "engineering", 
    label: "Engineering & Tech", 
    icon: Zap,
    exams: ["JEE Main", "JEE Adv", "BITSAT", "VITEEE", "WBJEE", "MHTCET", "KCET", "COMEDK", "GATE"]
  },
  { 
    id: "medical", 
    label: "Medical Sciences", 
    icon: ShieldCheck,
    exams: ["NEET UG", "INI CET", "NEET PG", "AIAPGET"]
  },
  { 
    id: "management", 
    label: "Management / MBA", 
    icon: Users,
    exams: ["CAT", "XAT", "NMAT", "SNAP", "CMAT", "MAT"]
  },
  { 
    id: "law", 
    label: "Legal Studies", 
    icon: Target,
    exams: ["CLAT", "AILET", "LSAT India", "SLAT", "MH CET Law"]
  },
  { 
    id: "design", 
    label: "Design & Fashion", 
    icon: Globe,
    exams: ["NID DAT", "UCEED", "CEED", "NIFT"]
  }
];

const CATEGORIES = ["General", "OBC-NCL", "SC", "ST", "EWS", "PwD"];

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", 
  "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", 
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", 
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", 
  "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export default function PredictorPage() {
  const [pathway, setPathway] = useState(CAREER_PATHWAYS[0]);
  const [exam, setExam] = useState("JEE Main");
  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("General");
  const [gender, setGender] = useState("Gender-Neutral");
  const [domicile, setDomicile] = useState("Maharashtra");
  const [quota, setQuota] = useState("Other State");
  const [boardPercentage, setBoardPercentage] = useState("");
  const [budget, setBudget] = useState(5000000); // 50 Lakh default
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState<any>(null);
  const [isEditingQuery, setIsEditingQuery] = useState(false);
  const [textQuery, setTextQuery] = useState("");

  const handlePredict = async (overrides?: any) => {
    if (overrides?.preventDefault) overrides.preventDefault();
    
    const finalRank = overrides?.rank || rank;
    if (!finalRank) return;

    const finalParams = {
      rank: parseInt(finalRank),
      category: overrides?.category || category,
      examType: overrides?.exam || exam,
      field: overrides?.pathwayId || pathway.id,
      gender: overrides?.gender || gender,
      state: overrides?.quota || quota,
      domicile: overrides?.domicile || domicile,
      budget: overrides?.budget || budget,
      boardPercentage: overrides?.boardPercentage || (boardPercentage ? parseFloat(boardPercentage) : null)
    };

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/cutoff/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalParams)
      });

      if (!res.ok) throw new Error("Failed to fetch predictions");
      const data = await res.json();
      setResults(data.predictions);
    } catch (error) {
      console.error("LLM Prediction Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseTranscript = (text: string) => {
    const cleanText = text.toLowerCase();
    const updates: any = {};

    if (cleanText.includes("neet") || cleanText.includes("medical") || cleanText.includes("doctor")) {
      const p = CAREER_PATHWAYS.find(p => p.id === "medical");
      if (p) {
        updates.pathwayId = p.id;
        updates.exam = "NEET UG";
        setPathway(p);
        setExam("NEET UG");
      }
    } else if (cleanText.includes("engineering") || cleanText.includes("jee") || cleanText.includes("iit")) {
      const p = CAREER_PATHWAYS.find(p => p.id === "engineering");
      if (p) {
        updates.pathwayId = p.id;
        setPathway(p);
        if (cleanText.includes("advanced")) { updates.exam = "JEE Adv"; setExam("JEE Adv"); }
        else { updates.exam = "JEE Main"; setExam("JEE Main"); }
      }
    }

    if (cleanText.includes("obc")) { updates.category = "OBC-NCL"; setCategory("OBC-NCL"); }
    else if (cleanText.includes("sc")) { updates.category = "SC"; setCategory("SC"); }
    else if (cleanText.includes("st")) { updates.category = "ST"; setCategory("ST"); }
    else if (cleanText.includes("general")) { updates.category = "General"; setCategory("General"); }
    else if (cleanText.includes("ews")) { updates.category = "EWS"; setCategory("EWS"); }

    const numbers = cleanText.match(/\d+(\.\d+)?/g);
    if (numbers) {
      numbers.forEach(numStr => {
        const num = parseFloat(numStr);
        
        if (cleanText.includes("board") || cleanText.includes("percentage") || cleanText.includes("percent")) {
          if (num > 35 && num <= 100) {
            updates.boardPercentage = num;
            setBoardPercentage(num.toString());
          }
        }
        
        if (cleanText.includes("budget") || cleanText.includes("fees") || cleanText.includes("lakh") || cleanText.includes("crore")) {
          let budgetValue = num;
          if (cleanText.includes("lakh")) budgetValue = num * 100000;
          if (cleanText.includes("crore") || cleanText.includes(" cr")) budgetValue = num * 10000000;
          
          if (budgetValue > 10000) {
            updates.budget = budgetValue;
            setBudget(budgetValue);
          }
        }

        if (cleanText.includes("rank") || cleanText.includes("score")) {
          updates.rank = numStr;
          setRank(numStr);
        } else if (!updates.rank && !updates.boardPercentage && !updates.budget) {
          updates.rank = numStr;
          setRank(numStr);
        }
      });
    }
    
    if (cleanText.includes("female")) { updates.gender = "Female-Only"; setGender("Female-Only"); }
    else if (cleanText.includes("male") || cleanText.includes("neutral")) { updates.gender = "Gender-Neutral"; setGender("Gender-Neutral"); }

    return updates;
  };

  const toggleListening = () => {
    if (isListening && recognition) {
      recognition.stop();
      setIsListening(false);
      
      if (transcript && transcript !== "Listening for signal...") {
        const finalUpdates = parseTranscript(transcript);
        handlePredict(finalUpdates);
      }
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Voice recognition not supported in this browser.");

    const newRecognition = new SpeechRecognition();
    newRecognition.continuous = true;
    newRecognition.interimResults = true;
    newRecognition.lang = "en-IN";

    newRecognition.onstart = () => {
      setIsListening(true);
      setIsEditingQuery(false);
      setTranscript("Listening for signal...");
    };
    
    newRecognition.onend = () => setIsListening(false);
    
    newRecognition.onresult = (event: any) => {
      let currentTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
      setTextQuery(currentTranscript);
      parseTranscript(currentTranscript);
    };

    newRecognition.start();
    setRecognition(newRecognition);
  };

  const speakAnalysis = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => v.name.includes("Google UK English Male") || v.name.includes("Samantha"));
    if (premiumVoice) utterance.voice = premiumVoice;

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f3f4f6] text-black font-sans selection:bg-[#b69cc4]/30">

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-white border-2 border-black rounded-xl px-2 py-2 flex items-center gap-1 shadow-[4px_4px_0px_0px_#000000] text-black">
        {[
          { icon: GraduationCap, href: "/", label: "Home" },
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
                item.href === "/tools"
                  ? "bg-[#b69cc4] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  : "text-zinc-600 hover:text-black rounded-lg",
              )}
            >
              <Icon size={20} />
              {item.href === "/tools" && (
                <span className="text-[13px] font-black">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapsible Sidebar (Manual Tuning) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[400px] bg-white border-r-2 border-black z-[120] overflow-y-auto p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold tracking-tight text-black">Manual Tuning</h2>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Assessment Parameters</p>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-10 h-10 border-2 border-black rounded-lg bg-white flex items-center justify-center hover:bg-[#b69cc4] transition-all hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]"
                >
                  <ArrowLeft size={16} />
                </button>
              </div>

              <form onSubmit={handlePredict} className="space-y-8">
                {/* Academic Intelligence Field */}
                <div className="space-y-6">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Academic Intelligence Field</label>
                  <div className="flex flex-wrap gap-2">
                    {CAREER_PATHWAYS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setPathway(p);
                          setExam(p.exams[0]);
                        }}
                        className={cn(
                          "px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border-2 border-black flex items-center gap-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]",
                          pathway.id === p.id 
                            ? "bg-[#b69cc4] text-black" 
                            : "bg-white text-zinc-600 hover:text-black"
                        )}
                      >
                        <p.icon size={12} />
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {pathway.exams.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => setExam(e)}
                        className={cn(
                          "py-3 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all border-2 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]",
                          exam === e 
                            ? "bg-[#b69cc4]/30 text-black font-extrabold" 
                            : "bg-white text-zinc-500 hover:text-black"
                        )}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Core Parameters */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Rank</label>
                    <input
                      type="number"
                      value={rank}
                      onChange={(e) => setRank(e.target.value)}
                      className="w-full bg-white border-2 border-black rounded-lg px-4 py-3.5 text-sm font-bold text-black focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all placeholder:text-zinc-400"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-white border-2 border-black rounded-lg px-4 py-3.5 text-[10px] font-black uppercase focus:outline-none appearance-none"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Domicile</label>
                    <select
                      value={domicile}
                      onChange={(e) => setDomicile(e.target.value)}
                      className="w-full bg-white border-2 border-black rounded-lg px-4 py-3.5 text-[10px] font-black uppercase focus:outline-none appearance-none"
                    >
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Quota</label>
                    <select
                      value={quota}
                      onChange={(e) => setQuota(e.target.value)}
                      className="w-full bg-white border-2 border-black rounded-lg px-4 py-3.5 text-[10px] font-black uppercase focus:outline-none appearance-none"
                    >
                      <option value="Other State">All India</option>
                      <option value="Home State">Home State</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Budget</label>
                    <span className="text-[10px] font-black text-black bg-[#b69cc4]/30 px-2 py-0.5 border border-black rounded">₹{(budget/100000).toFixed(1)}L</span>
                  </div>
                  <input
                    type="range"
                    min="50000"
                    max="10000000"
                    step="50000"
                    value={budget}
                    onChange={(e) => setBudget(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-zinc-200 rounded-full appearance-none cursor-pointer accent-black"
                  />
                </div>

                <button
                  id="predict-btn"
                  className="w-full py-4 bg-[#b69cc4] text-black border-2 border-black rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-[#a387b3] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                >
                  Analyze Institutional Signal
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Navigation */}
      <nav className="sticky top-0 left-0 w-full z-[100] border-b-2 border-black bg-white/95 backdrop-blur-md text-black">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="w-10 h-10 border-2 border-black rounded-lg bg-white flex items-center justify-center hover:bg-[#b69cc4] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-black"
            >
              <Menu size={20} />
            </button>
            <Link href="/" className="text-zinc-600 hover:text-black transition-colors text-[10px] font-black uppercase tracking-widest">Dashboard</Link>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 px-3 py-1.5 rounded-lg bg-[#b69cc4]/30 border-2 border-black text-black">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse border border-black" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Neural-V8 Active</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-12 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* ── Breadcrumbs ── */}
          <div className="mb-12">
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
              <Link href="/" className="hover:text-black transition-colors">Home</Link>
              <ChevronRight size={10} />
              <Link href="/tools" className="hover:text-black transition-colors">Tools</Link>
              <ChevronRight size={10} />
              <span className="text-black">Neural Predictor 2026</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Left side: Neural Voice Intelligence */}
            <div className="lg:col-span-5 space-y-12">
              <div className="space-y-6">
                <Reveal>
                  <h1 className="text-5xl md:text-6xl font-black tracking-tight text-black leading-[1.1]">
                    Neural <br />
                    <span className="text-[#a387b3]">Predictor.</span>
                  </h1>
                </Reveal>
                <Reveal delay={0.1}>
                  <p className="text-zinc-600 text-lg max-w-md leading-relaxed font-medium">
                    Dictate your academic profile to initiate institutional analysis across national and regional pathways.
                  </p>
                </Reveal>
              </div>

              <Reveal delay={0.2}>
                <div className="relative aspect-square max-w-[400px] mx-auto lg:mx-0 flex items-center justify-center">
                  <div className="absolute inset-0 border-2 border-black rounded-full animate-[spin_20s_linear_infinite]" />
                  <div className="absolute inset-8 border-2 border-black rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                  <div className="absolute inset-16 border-2 border-[#b69cc4] rounded-full" />
                  
                  {/* Main Interaction Core */}
                  <button
                    onClick={toggleListening}
                    className={cn(
                      "relative w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all duration-700 group border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
                      isListening 
                        ? "bg-red-500 text-black animate-pulse" 
                        : "bg-white text-black hover:bg-[#b69cc4]"
                    )}
                  >
                    <div className="relative z-10 flex flex-col items-center gap-4">
                      <Mic size={48} className={cn(
                        "transition-all duration-500",
                        isListening ? "text-black scale-110" : "text-zinc-400 group-hover:text-black"
                      )} />
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-[0.3em] transition-all",
                        isListening ? "text-black" : "text-zinc-600"
                      )}>
                        {isListening ? "Stop Neural Link" : "Tap to Speak"}
                      </span>
                    </div>

                    {isListening && (
                      <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-20 border border-black" />
                      </div>
                    )}
                  </button>

                  {/* Dynamic Indicators & Transcript */}
                  <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-full text-center space-y-4 px-4">
                    <div className="flex justify-center gap-1">
                      {[...Array(24)].map((_, i) => (
                        <div 
                          key={i}
                          className={cn(
                            "w-1 bg-[#b69cc4] rounded-full transition-all duration-300 border border-black",
                            isListening ? "h-6 animate-pulse" : "h-1"
                          )}
                          style={{ animationDelay: `${i * 0.05}s` }}
                        />
                      ))}
                    </div>
                    
                    <AnimatePresence>
                      {(transcript || isEditingQuery) && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="space-y-3"
                        >
                          <div className="flex items-center justify-center gap-4">
                            <p className="text-[9px] font-black text-[#a387b3] uppercase tracking-[0.3em]">Signal Output</p>
                            {!isEditingQuery && (
                              <button 
                                onClick={() => {
                                  setIsEditingQuery(true);
                                  setTextQuery(transcript);
                                }}
                                className="text-[8px] font-bold text-zinc-500 hover:text-black uppercase tracking-widest transition-colors"
                              >
                                [ Click to Edit ]
                              </button>
                            )}
                          </div>

                          {isEditingQuery ? (
                            <div className="relative max-w-md mx-auto group">
                              <textarea
                                value={textQuery}
                                onChange={(e) => setTextQuery(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    const updates = parseTranscript(textQuery);
                                    setTranscript(textQuery);
                                    handlePredict(updates);
                                    setIsEditingQuery(false);
                                  }
                                }}
                                autoFocus
                                className="w-full bg-white border-2 border-black rounded-xl p-4 text-sm text-black placeholder:text-zinc-400 focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-medium italic resize-none h-24"
                                placeholder="Edit your neural signal..."
                              />
                              <div className="absolute bottom-3 right-3 flex gap-2">
                                <button 
                                  onClick={() => setIsEditingQuery(false)}
                                  className="px-3 py-1 rounded-lg border-2 border-zinc-200 bg-white text-[9px] font-bold text-zinc-500 hover:border-black hover:text-black transition-all"
                                >
                                  Cancel
                                </button>
                                <button 
                                  onClick={() => {
                                    const updates = parseTranscript(textQuery);
                                    setTranscript(textQuery);
                                    handlePredict(updates);
                                    setIsEditingQuery(false);
                                  }}
                                  className="px-3 py-1 rounded-lg bg-[#b69cc4] border-2 border-black text-[9px] font-bold text-black hover:bg-[#a387b3] transition-all"
                                >
                                  Sync Signal
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm font-medium text-zinc-800 leading-relaxed italic line-clamp-3 max-w-lg mx-auto bg-white/80 p-3 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                              "{transcript}"
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {isListening && !transcript && (
                      <p className="text-[10px] font-bold text-black uppercase tracking-widest animate-pulse">
                        Listening for Institutional Signal...
                      </p>
                    )}
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Right side: Results Panel */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-[600px] flex flex-col items-center justify-center space-y-6 bg-white border-2 border-black rounded-[2rem] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 border-4 border-zinc-100 rounded-full" />
                      <div className="absolute inset-0 border-4 border-t-[#b69cc4] border-r-[#b69cc4] rounded-full animate-spin" />
                    </div>
                    <p className="text-black text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Analyzing academic signal...</p>
                  </motion.div>
                ) : !results ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-[600px] flex flex-col items-center justify-center text-center p-12 bg-white border-2 border-black rounded-[2rem] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <div className="w-16 h-16 rounded-xl bg-[#b69cc4] border-2 border-black flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_#000000]">
                      <Target size={32} className="text-black" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 tracking-tight text-black">System Ready</h3>
                    <p className="text-zinc-600 text-sm max-w-[280px] leading-relaxed font-medium">
                      Select an academic field and initialize analysis to generate your institutional admission report.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-12"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-black">
                      <div className="space-y-1">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Admission Probability Report</h3>
                        <p className="text-sm text-black font-bold">High-fidelity institutional matches</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#b69cc4]/30 border-2 border-black text-[9px] font-black text-black uppercase tracking-widest">
                          <Clock size={10} />
                          Updated 2024
                        </div>
                        <button
                          onClick={() => {
                            const summary = results.map(r => `${r.college}, with ${r.courses?.length || 0} qualifying courses, overall admission chance ${r.overall_probability || r.probability}%`).join(". ");
                            speakAnalysis(`Found ${results.length} institutional matches. ${summary}`);
                          }}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-black bg-white text-black hover:bg-[#b69cc4] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                          )}
                        >
                          <Volume2 size={12} className={cn(isSpeaking && "animate-pulse")} />
                          <span className="text-[9px] font-black uppercase tracking-widest">
                            {isSpeaking ? "Audio Analysis Active" : "Audio Output"}
                          </span>
                        </button>
                        <span className="text-[9px] font-black text-black bg-white px-3 py-1.5 rounded-lg uppercase tracking-widest border-2 border-black">
                          Engine: Neural-V8
                        </span>
                      </div>
                    </div>

                    <div className="divide-y-2 divide-black bg-white border-2 border-black rounded-[2rem] px-6 py-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      {results.map((res, i) => (
                        <PredictionResultItem key={`${res.college}-${i}`} res={res} i={i} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
