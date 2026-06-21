"use client";

import { useState, useRef, useEffect, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import {
  FileText,
  Check,
  Globe,
  ExternalLink,
  ArrowUp,
  X,
  Plus,
  Brain,
  Search,
  Lightbulb,
  Telescope,
  GraduationCap,
  Newspaper,
  House,
  GitCompare,
  Trophy,
  StopCircle,
  FileSearch,
  LayoutGrid,
  FileUp,
  Loader2,
  SlidersHorizontal,
  Mic,
  Square,
  Volume2,
  VolumeX,
  Paperclip,
  Activity, 
  Bookmark,
  ShieldCheck
} from "lucide-react";
import { useChat } from "../context/ChatContext";
import { BarVisualizer } from "../components/ui/bar-visualizer";

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(" ");

type Message = {
  role: "user" | "assistant";
  content: string;
};

const COMPARISON_CRITERIA = [
  "Fees",
  "Placement",
  "Rankings",
  "Campus Life",
  "Hostel",
  "Alumni",
  "Courses & Programs",
  "Research & Innovation",
  "Location & Infrastructure",
];

const MAX_COMPARE_COLLEGES = 5;

// ── Language Registry (mirrors server/src/lib/languageDetector.ts) ────────
const LANGUAGES = [
  { code: "auto", name: "Auto-detect", native: "Auto", region: "meta" },
  // –– Indian ––
  { code: "hi", name: "Hindi", native: "हिंदी", region: "indian" },
  { code: "mr", name: "Marathi", native: "मराठी", region: "indian" },
  { code: "ta", name: "Tamil", native: "தமிழ்", region: "indian" },
  { code: "te", name: "Telugu", native: "తెలుగు", region: "indian" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", region: "indian" },
  { code: "ml", name: "Malayalam", native: "മലയാളം", region: "indian" },
  { code: "bn", name: "Bengali", native: "বাংলা", region: "indian" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી", region: "indian" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ", region: "indian" },
  { code: "ur", name: "Urdu", native: "اردو", region: "indian" },
  // –– Global ––
  { code: "ar", name: "Arabic", native: "العربية", region: "global" },
  { code: "fr", name: "French", native: "Français", region: "global" },
  { code: "es", name: "Spanish", native: "Español", region: "global" },
  { code: "pt", name: "Portuguese", native: "Português", region: "global" },
  { code: "de", name: "German", native: "Deutsch", region: "global" },
  { code: "zh", name: "Chinese", native: "中文", region: "global" },
  { code: "ja", name: "Japanese", native: "日本語", region: "global" },
  { code: "ko", name: "Korean", native: "한국어", region: "global" },
  { code: "ru", name: "Russian", native: "Русский", region: "global" },
  { code: "el", name: "Greek", native: "Ελληνικά", region: "global" },
] as const;

type LangCode = (typeof LANGUAGES)[number]["code"];

const ChatInput = ({
  input,
  setInput,
  handleSend,
  isLoading,
  isUploading,
  uploadProgressText,
  uploadProgress,
  chatMode,
  setChatMode,
  isMenuOpen,
  setIsMenuOpen,
  fileInputRef,
  abortControllerRef,
  colleges,
  setColleges,
  selectedCriteria,
  setSelectedCriteria,
  otherCriteria,
  setOtherCriteria,
  showOtherInput,
  setShowOtherInput,
  isFocusMenuOpen,
  setIsFocusMenuOpen,
  menuSide = "top",
  hasMessages = false,
  showCompareInputs = true,
  setShowCompareInputs,
  selectedLanguage,
  setSelectedLanguage,
  isLangMenuOpen,
  setIsLangMenuOpen,
  isRecordingVoice,
  startVoiceRecording,
  isSpeaking,
}: any) => {
  const [collegeInput, setCollegeInput] = useState("");
  const visualizerState = isRecordingVoice 
    ? "listening" 
    : isSpeaking 
    ? "speaking" 
    : "connecting";

  const MenuContent = () => (
    <AnimatePresence>
      {isMenuOpen && (
        <motion.div
          initial={{
            opacity: 0,
            y: menuSide === "top" ? -10 : 10,
            scale: 0.95,
          }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: menuSide === "top" ? -10 : 10, scale: 0.95 }}
          className={cn(
            "absolute left-0 bg-white border-2 border-black p-4 rounded-lg w-64 max-w-sm z-[110] shadow-[4px_4px_0px_0px_#000000] text-black",
            menuSide === "top" ? "bottom-full mb-2" : "top-full mt-2",
          )}
        >
          <h3 className="px-4 pt-2 pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#b69cc4]">
            Switch Mode
          </h3>
          <div className="space-y-2">
            {[
              {
                id: "research",
                label: "Research",
                icon: Search,
                desc: "Web search + PDF analysis",
              },
              {
                id: "compare",
                label: "Compare",
                icon: GitCompare,
                desc: "Side-by-side college analysis",
              },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => {
                  setChatMode(mode.id as any);
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-4 p-3 rounded-lg border-2 transition-all text-left group hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]",
                  chatMode === mode.id
                    ? "bg-[#b69cc4] text-black border-black font-extrabold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-white border-black text-zinc-600 hover:text-black hover:border-black shadow-none",
                )}
              >
                <mode.icon
                  size={18}
                  className={cn(
                    chatMode === mode.id
                      ? "text-black"
                      : "text-zinc-600 group-hover:text-black",
                  )}
                />
                <div>
                  <p className="text-xs font-black">{mode.label}</p>
                  <p
                    className={cn(
                      "text-[9px] font-bold mt-0.5",
                      chatMode === mode.id ? "text-black/80" : "text-zinc-500",
                    )}
                  >
                    {mode.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="w-full">
      <div className="w-full relative group">
        <MenuContent />

        {/* Language Picker Dropdown */}
        <AnimatePresence>
          {isLangMenuOpen && (
            <motion.div
              initial={{
                opacity: 0,
                y: menuSide === "top" ? -10 : 10,
                scale: 0.95,
              }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                y: menuSide === "top" ? -10 : 10,
                scale: 0.95,
              }}
              className={cn(
                "absolute right-0 bg-white border-2 border-black p-3 rounded-lg w-64 z-[110] shadow-[4px_4px_0px_0px_#000000] text-black",
                menuSide === "top" ? "bottom-full mb-2" : "top-full mt-2",
              )}
            >
              <h3 className="px-3 pt-2 pb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#b69cc4]">
                Response Language
              </h3>
              <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
                {/* Auto option */}
                {LANGUAGES.filter((l) => l.region === "meta").map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLanguage("auto");
                      setIsLangMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg border-2 transition-all text-left hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]",
                      selectedLanguage === "auto" || !selectedLanguage
                        ? "bg-[#b69cc4] text-black border-black font-extrabold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-white border-black text-zinc-600 hover:text-black hover:border-black shadow-none",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Globe size={13} />
                      <span className="text-xs font-black">{lang.name}</span>
                    </div>
                    {(selectedLanguage === "auto" || !selectedLanguage) && (
                      <Check size={12} />
                    )}
                  </button>
                ))}

                {/* Indian languages */}
                <p className="px-3 pt-3 pb-1 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  🇮🇳 Indian
                </p>
                {LANGUAGES.filter((l) => l.region === "indian").map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLanguage(lang.code);
                      setIsLangMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg border-2 transition-all text-left hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]",
                      selectedLanguage === lang.code
                        ? "bg-[#b69cc4] text-black border-black font-extrabold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-white border-black text-zinc-600 hover:text-black hover:border-black shadow-none",
                    )}
                  >
                    <div>
                      <p className="text-xs font-black">{lang.native}</p>
                      <p
                        className={cn(
                          "text-[9px] font-bold mt-0.5",
                          selectedLanguage === lang.code
                            ? "text-black/80"
                            : "text-zinc-500",
                        )}
                      >
                        {lang.name}
                      </p>
                    </div>
                    {selectedLanguage === lang.code && <Check size={12} />}
                  </button>
                ))}

                {/* Global languages */}
                <p className="px-3 pt-3 pb-1 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  🌍 Global
                </p>
                {LANGUAGES.filter((l) => l.region === "global").map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLanguage(lang.code);
                      setIsLangMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg border-2 transition-all text-left hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]",
                      selectedLanguage === lang.code
                        ? "bg-[#b69cc4] text-black border-black font-extrabold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-white border-black text-zinc-600 hover:text-black hover:border-black shadow-none",
                    )}
                  >
                    <div>
                      <p className="text-xs font-black">{lang.native}</p>
                      <p
                        className={cn(
                          "text-[9px] font-bold mt-0.5",
                          selectedLanguage === lang.code
                            ? "text-black/80"
                            : "text-zinc-500",
                        )}
                      >
                        {lang.name}
                      </p>
                    </div>
                    {selectedLanguage === lang.code && <Check size={12} />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {chatMode === "compare" && isFocusMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={cn(
                "absolute left-10 w-72 p-4 bg-white border-2 border-black rounded-lg z-50 shadow-[4px_4px_0px_0px_#000000] text-black",
                "top-full mt-2"
              )}
            >
              <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                <div className="flex items-center justify-between px-2 pt-1 pb-3">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b69cc4]">
                    Comparison Categories
                  </h3>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setSelectedCriteria([...COMPARISON_CRITERIA])}
                      className="text-[8px] font-black uppercase tracking-wider px-2 py-1 bg-[#b69cc4] border border-black rounded hover:opacity-80 transition-opacity"
                    >
                      All
                    </button>
                    <button
                      onClick={() => setSelectedCriteria([])}
                      className="text-[8px] font-black uppercase tracking-wider px-2 py-1 bg-white border border-black rounded hover:bg-zinc-100 transition-colors"
                    >
                      None
                    </button>
                  </div>
                </div>
                {COMPARISON_CRITERIA.map((c) => {
                  const isSelected = selectedCriteria.includes(c);
                  return (
                    <button
                      key={c}
                      onClick={() => {
                        setSelectedCriteria((prev: string[]) =>
                          isSelected
                            ? prev.filter((x: string) => x !== c)
                            : [...prev, c],
                        );
                      }}
                      className={cn(
                        "flex items-center gap-3 w-full p-2.5 rounded-lg border-2 transition-all text-left group hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]",
                        isSelected
                          ? "bg-[#b69cc4] border-black text-black font-extrabold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                          : "bg-white border-black text-zinc-600 hover:text-black hover:border-black shadow-none",
                      )}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded flex items-center justify-center border-2 transition-colors shrink-0",
                          isSelected
                            ? "bg-black border-black text-white"
                            : "border-zinc-600 group-hover:border-zinc-400 text-transparent",
                        )}
                      >
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span className="text-xs font-bold">{c}</span>
                    </button>
                  );
                })}

                <button
                  onClick={() => setShowOtherInput(!showOtherInput)}
                  className={cn(
                    "flex items-center gap-3 w-full p-2.5 rounded-lg border-2 transition-all text-left group hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]",
                    showOtherInput
                      ? "bg-[#b69cc4] border-black text-black font-extrabold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      : "bg-white border-black text-zinc-600 hover:text-black hover:border-black shadow-none",
                  )}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded flex items-center justify-center border-2 transition-colors shrink-0",
                      showOtherInput
                        ? "bg-black border-black text-white"
                        : "border-zinc-600 group-hover:border-zinc-400 text-transparent",
                    )}
                  >
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-bold">Other (Custom)</span>
                </button>

                {showOtherInput && (
                  <div className="p-2 mt-1">
                    <input
                      value={otherCriteria}
                      onChange={(e) => setOtherCriteria(e.target.value)}
                      placeholder="Enter custom category..."
                      className="w-full bg-white border-2 border-black rounded-lg px-3 py-2 text-xs font-semibold text-black outline-none focus:shadow-[4px_4px_0px_0px_#b69cc4] transition-all placeholder:text-zinc-400"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 space-y-3"
          >
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-black animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black">
                  {uploadProgressText || "Processing Document"}
                </span>
              </div>
              <span className="text-[10px] font-black tabular-nums text-zinc-500">
                {uploadProgress}%
              </span>
            </div>
            <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden border-2 border-black">
              <motion.div
                className="h-full bg-[#b69cc4]"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ type: "spring", bounce: 0, duration: 0.5 }}
              />
            </div>
          </motion.div>
        )}

        <div className="bg-white border-2 border-black group-focus-within:shadow-[4px_4px_0px_0px_#b69cc4] rounded-lg transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden px-2 sm:px-4 py-1.5 sm:py-2">
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Left Action: Plus Menu & Attach */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={cn(
                  "p-2 rounded-lg border-2 transition-all shrink-0 hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                  isMenuOpen 
                    ? "bg-black text-white border-black" 
                    : "bg-white border-black text-black hover:bg-[#b69cc4]"
                )}
              >
                <Plus size={18} />
              </button>
              {chatMode === "compare" && (
                <button
                  onClick={() => setIsFocusMenuOpen(!isFocusMenuOpen)}
                  className={cn(
                    "p-2 rounded-lg border-2 transition-all shrink-0 hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                    isFocusMenuOpen || selectedCriteria.length > 0
                      ? "bg-[#b69cc4] text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      : "bg-white border-black text-black hover:bg-[#b69cc4] shadow-none"
                  )}
                  title="Focus Parameters"
                >
                  <SlidersHorizontal size={18} />
                </button>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-white border-2 border-black text-black hover:bg-[#b69cc4] rounded-lg transition-all shrink-0 hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <Paperclip size={18} />
              </button>
            </div>

            {/* Main Input — College tags in compare mode, text input otherwise */}
            {chatMode === "compare" ? (
              <div className="flex-1 flex flex-col gap-1.5 py-1.5 min-w-0">
                {/* College tags */}
                {colleges && colleges.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {colleges.map((c: string, i: number) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#b69cc4] border border-black rounded-md text-[10px] font-black text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                      >
                        {c}
                        <button
                          onClick={() => setColleges((prev: string[]) => prev.filter((_: string, idx: number) => idx !== i))}
                          className="ml-0.5 hover:text-red-700 transition-colors"
                          aria-label={`Remove ${c}`}
                        >
                          <X size={9} strokeWidth={3} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {/* Add college input row */}
                <div className="flex items-center gap-1.5">
                  <input
                    value={collegeInput}
                    onChange={(e) => setCollegeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && collegeInput.trim()) {
                        e.preventDefault();
                        if ((colleges || []).length < MAX_COMPARE_COLLEGES) {
                          setColleges((prev: string[]) => [...(prev || []), collegeInput.trim()]);
                          setCollegeInput("");
                        }
                      }
                    }}
                    placeholder={
                      (colleges || []).length >= MAX_COMPARE_COLLEGES
                        ? `Max ${MAX_COMPARE_COLLEGES} colleges reached`
                        : `Add college name... (${(colleges || []).length}/${MAX_COMPARE_COLLEGES})`
                    }
                    disabled={(colleges || []).length >= MAX_COMPARE_COLLEGES}
                    className="flex-1 min-w-0 bg-transparent py-1 text-sm font-semibold text-black placeholder:text-zinc-400 outline-none disabled:opacity-40"
                  />
                  {collegeInput.trim() && (colleges || []).length < MAX_COMPARE_COLLEGES && (
                    <button
                      onClick={() => {
                        setColleges((prev: string[]) => [...(prev || []), collegeInput.trim()]);
                        setCollegeInput("");
                      }}
                      className="shrink-0 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-black text-white rounded border border-black hover:bg-zinc-800 transition-colors"
                    >
                      Add
                    </button>
                  )}
                </div>
                {/* Question input */}
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={
                    (colleges || []).length < 2
                      ? "Add at least 2 colleges above, then ask your question..."
                      : "Ask a comparison question... (or press Enter to compare)"
                  }
                  className="flex-1 min-w-0 bg-transparent py-1 text-sm font-semibold text-black placeholder:text-zinc-400 outline-none"
                />
              </div>
            ) : isRecordingVoice || isSpeaking ? (
              <div className="flex-1 flex items-center justify-center h-[44px]">
                <BarVisualizer
                  state={visualizerState}
                  barCount={20}
                  className="w-full max-w-[200px]"
                />
              </div>
            ) : (
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={
                  isUploading
                    ? uploadProgressText || "Indexing..."
                    : "Ask anything..."
                }
                className="flex-1 min-w-0 bg-transparent py-2 sm:py-3 text-sm sm:text-base font-semibold text-black placeholder:text-zinc-400 outline-none ml-1"
                disabled={isUploading}
              />
            )}

            {/* Right Action Group */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Language Selector */}
              <button
                onClick={() => {
                  setIsLangMenuOpen(!isLangMenuOpen);
                  setIsMenuOpen(false);
                  setIsFocusMenuOpen(false);
                }}
                className={cn(
                  "p-2 rounded-lg border-2 transition-all shrink-0 relative hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                  isLangMenuOpen || (selectedLanguage && selectedLanguage !== "auto")
                    ? "bg-[#b69cc4] text-black border-black"
                    : "bg-white border-black text-black hover:bg-[#b69cc4]"
                )}
              >
                <Globe size={18} />
                {selectedLanguage && selectedLanguage !== "auto" && (
                  <span className="absolute -top-1 -right-1 bg-white text-black text-[8px] font-black px-1 rounded-md border-2 border-black">
                    {selectedLanguage.toUpperCase()}
                  </span>
                )}
              </button>

              {/* Dynamic Action Button: Mic or Send/Stop */}
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.button
                    key="stop"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    onClick={() => abortControllerRef.current?.abort()}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-white text-black border-2 border-black rounded-lg flex items-center justify-center hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all shrink-0 ml-1"
                  >
                    <StopCircle size={18} />
                  </motion.button>
                ) : isRecordingVoice ? (
                  <motion.button
                    key="voice-active"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    onClick={startVoiceRecording}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-rose-500 text-black border-2 border-black rounded-lg flex items-center justify-center animate-pulse shrink-0 ml-1 hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    <Mic size={18} />
                  </motion.button>
                ) : input.trim() ? (
                  <motion.button
                    key="send"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    onClick={() => handleSend()}
                    disabled={isUploading}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-[#b69cc4] text-black border-2 border-black rounded-lg flex items-center justify-center hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all shrink-0 ml-1 font-extrabold"
                  >
                    <ArrowUp size={18} strokeWidth={3} />
                  </motion.button>
                ) : (
                  <motion.button
                    key="voice-idle"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    onClick={startVoiceRecording}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-white border-2 border-black text-black hover:bg-[#b69cc4] rounded-lg flex items-center justify-center hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all shrink-0 ml-1"
                  >
                    <Mic size={18} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
import { ShimmeringText } from "../components/ui/shimmering-text";

const LOADING_PHRASES = [
  "Searching for top colleges...",
  "Analyzing fees and placements...",
  "Checking latest NIRF rankings...",
  "Comparing university details...",
  "Reading campus insights...",
  "Preparing your academic report...",
  "Almost ready with your answer...",
];

const MessageBubble = ({
  msg,
  index,
  onSpeak,
  isSpeaking,
  chatMode,
}: {
  msg: Message;
  index: number;
  onSpeak: (text: string, idx: number) => void;
  isSpeaking: boolean;
  chatMode?: string;
}) => {
  const [loadingIndex, setLoadingIndex] = useState(0);

  const isCompare = chatMode === "compare";

  const parsedCollegeSections = useMemo(() => {
    if (!isCompare || !msg.content) return null;
    const lines = msg.content.split("\n");
    const sections: { heading: string; lines: string[] }[] = [];
    let current: { heading: string; lines: string[] } | null = null;

    for (const line of lines) {
      const match = line.match(/^###\s+(.+)/);
      if (match) {
        if (current) sections.push(current);
        current = { heading: match[1].trim(), lines: [line] };
      } else if (current) {
        current.lines.push(line);
      }
    }
    if (current) sections.push(current);

    const introLines: string[] = [];
    const introEndIndex = msg.content.indexOf("\n### ");
    const introText = introEndIndex === -1 ? "" : msg.content.substring(0, introEndIndex);
    const restText = introEndIndex === -1 ? msg.content : msg.content.substring(introEndIndex);

    const intro = introEndIndex === -1 ? msg.content : msg.content.substring(0, introEndIndex);
    const collegeSections = sections.map((s) => ({ heading: s.heading, content: s.lines.join("\n") }));

    const restEndIndex = restText.search(/\n##\s+/);
    const rest = restEndIndex === -1 ? "" : restText.substring(restEndIndex);

    return { intro, colleges: collegeSections, rest };
  }, [msg.content, isCompare]);

  useEffect(() => {
    if (!msg.content && msg.role === "assistant") {
      const interval = setInterval(() => {
        setLoadingIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [msg.content, msg.role]);

  let mainContent = msg.content;
  let sourcesMeta: any[] | null = null;

  const metaMatch = mainContent.match(/\[SOURCE_META:(.*?)\]/);
  if (metaMatch) {
    try {
      sourcesMeta = JSON.parse(atob(metaMatch[1]));
      const splitIdx = mainContent.indexOf("\n\n---\n**Sources:**");
      if (splitIdx !== -1) {
        mainContent = mainContent.substring(0, splitIdx);
      } else {
        mainContent = mainContent.replace(metaMatch[0], "");
      }
    } catch (e) {
      console.error("Failed to parse sources metadata", e);
    }
  }

  return (
    <div
      className={cn(
        "max-w-[95%] sm:max-w-[90%] rounded-lg text-base sm:text-[18px] leading-relaxed group/msg relative transition-all",
        msg.role === "user"
          ? "bg-white border-2 border-black px-5 sm:px-8 py-4 sm:py-5 text-black font-semibold self-end shadow-[4px_4px_0px_0px_#b69cc4]"
          : "bg-white border-2 border-black px-5 sm:px-8 py-4 sm:py-5 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] w-full",
      )}
    >
      {msg.role === "assistant" && mainContent && (
        <button
          onClick={() => onSpeak(mainContent, index)}
          className={cn(
            "absolute -right-12 top-2 p-2.5 rounded-lg border-2 transition-all shrink-0 hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]",
            isSpeaking
              ? "bg-[#b69cc4] border-black text-black animate-pulse shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              : "bg-white border-black text-black hover:bg-[#b69cc4] shadow-none opacity-0 group-hover/msg:opacity-100",
          )}
          title={isSpeaking ? "Stop speaking" : "Read aloud"}
        >
          {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      )}
      <div className="flex flex-col gap-5 w-full">
        <div className="prose prose-neutral max-w-none prose-premium prose-base sm:prose-lg lg:prose-xl text-black">
          {mainContent ? (
            isCompare && parsedCollegeSections?.colleges.length ? (
              <div className="flex flex-col gap-6">
                {parsedCollegeSections.intro && (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {parsedCollegeSections.intro}
                  </ReactMarkdown>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
                  {parsedCollegeSections.colleges.map((college, i) => (
                    <div
                      key={i}
                      className="border-2 border-black rounded-lg p-5 bg-white shadow-[4px_4px_0px_0px_#b69cc4]"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <GraduationCap className="w-5 h-5 text-black shrink-0" />
                        <h3 className="text-lg font-black text-black m-0">
                          {college.heading}
                        </h3>
                      </div>
                      <div className="prose prose-neutral max-w-none prose-premium prose-sm text-black">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {college.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
                {parsedCollegeSections.rest && (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {parsedCollegeSections.rest}
                  </ReactMarkdown>
                )}
              </div>
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {mainContent}
              </ReactMarkdown>
            )
          ) : (
            <div className="flex flex-col gap-4 py-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-[#b69cc4] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-[#b69cc4]/80 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-[#b69cc4]/60 rounded-full animate-bounce"></div>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={loadingIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ShimmeringText 
                      text={LOADING_PHRASES[loadingIndex]} 
                      className="text-sm sm:text-base text-black"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {sourcesMeta && sourcesMeta.length > 0 && (
          <div className="mt-2 pt-4 border-t-2 border-black flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-black">
              <Globe className="w-3 h-3 text-black" />
              Sources Analyzed
            </div>
            <div className="flex flex-wrap gap-2">
              {sourcesMeta.map((s: any, idx: number) => (
                <a
                  key={idx}
                  href={s.url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white border-2 border-black hover:bg-[#b69cc4] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all group w-fit max-w-[280px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black"
                >
                  <div className="w-8 h-8 rounded-md bg-[#f3f4f6] border border-black flex items-center justify-center shrink-0">
                    {s.type === "pdf" ? (
                      <FileText className="w-4 h-4 text-black" />
                    ) : (
                      <Globe className="w-4 h-4 text-black" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-black truncate">
                      {s.name || s.url}
                    </p>
                    <p className="text-[10px] text-zinc-600 truncate mt-0.5 font-bold">
                      {s.type === "pdf"
                        ? `Page ${s.page || 1}`
                        : (s.url || "").replace(/^https?:\/\/(www\.)?/, "")}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4006"
).replace("localhost", "127.0.0.1");

function ChatContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q");
  const initialFile = searchParams.get("file");
  const initialFileUrl = searchParams.get("fileUrl");
  const initialMode =
    (searchParams.get("mode") as "research" | "compare") ?? "research";

  const buildInitialMessages = (): Message[] => {
    const base: Message[] = [];
    if (initialFile) {
      base.push({
        role: "user",
        content: `ATTACHMENT|${initialFile}|${initialFileUrl ?? ""}`,
      });
      base.push({
        role: "assistant",
        content: `I've finished indexing **${initialFile}**. You can now ask me questions about its content!`,
      });
    }
    return base;
  };

  const {
    messages,
    setMessages,
    chatMode,
    setChatMode,
    webPdfFilename,
    setWebPdfFilename,
    selectedLanguage,
    setSelectedLanguage,
    isInitialized,
    setIsInitialized,
  } = useChat();

  const { user, token, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [colleges, setColleges] = useState<string[]>([]);
  const [currentlySpeaking, setCurrentlySpeaking] = useState<number | null>(
    null,
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speakMessage = async (text: string, index: number) => {
    if (currentlySpeaking === index) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      window.speechSynthesis.cancel();
      setCurrentlySpeaking(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();

    setCurrentlySpeaking(index);

    try {
      const res = await fetch(`${API_URL}/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("TTS failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setCurrentlySpeaking(null);
      audio.play();
    } catch (err) {
      console.warn("ElevenLabs fallback to browser TTS:", err);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setCurrentlySpeaking(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([...COMPARISON_CRITERIA]);
  const [showCompareInputs, setShowCompareInputs] = useState(true);
  const [otherCriteria, setOtherCriteria] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [isFocusMenuOpen, setIsFocusMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef("");

  // Restore hero chat messages from localStorage after login
  useEffect(() => {
    try {
      const saved = localStorage.getItem("hero_chat_messages");
      if (saved) {
        const parsed = JSON.parse(saved) as Message[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
        localStorage.removeItem("hero_chat_messages");
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const startVoiceRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    if (isRecordingVoice && recognitionRef.current) {
      shouldSubmitOnEndRef.current = true; // Mark that we want to send the message now
      recognitionRef.current.stop();
      setIsRecordingVoice(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    shouldSubmitOnEndRef.current = false;
    finalTranscriptRef.current = "";

    recognition.onstart = () => setIsRecordingVoice(true);

    recognition.onresult = (event: any) => {
      const results = event.results;
      const transcriptSegments: string[] = [];

      // Build an array of all current results
      for (let i = 0; i < results.length; i++) {
        transcriptSegments.push(results[i][0].transcript.trim());
      }

      /**
       * DEDUPLICATION LOGIC for Mobile Chrome:
       * Mobile Chrome often returns segments like ["tell", "tell me", "tell me about"].
       * We filter out any segment that is a prefix of a later (longer) segment.
       */
      const uniqueSegments = transcriptSegments.filter((segment, index) => {
        for (let j = index + 1; j < transcriptSegments.length; j++) {
          if (transcriptSegments[j].startsWith(segment)) return false;
        }
        return true;
      });

      const fullTranscript = uniqueSegments.join(" ");
      if (fullTranscript) {
        setInput(fullTranscript);
        finalTranscriptRef.current = fullTranscript;
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecordingVoice(false);
    };

    recognition.onend = () => {
      // Only submit if the user manually clicked STOP
      if (shouldSubmitOnEndRef.current) {
        const textToSubmit = finalTranscriptRef.current;
        if (textToSubmit && textToSubmit.trim() !== "") {
          handleSend(textToSubmit, undefined, true); // Pass isVoice=true
          finalTranscriptRef.current = "";
        }
        shouldSubmitOnEndRef.current = false;
      }
      setIsRecordingVoice(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const shouldSubmitOnEndRef = useRef(false);

  // Keep a ref in sync so handleSend always reads the LATEST language
  // even if the user switches and sends before the re-render completes.
  const selectedLanguageRef = useRef<any>("auto");
  useEffect(() => {
    selectedLanguageRef.current = selectedLanguage;
  }, [selectedLanguage]);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isInitialized) {
      setChatMode(initialMode);
      if (initialFile) {
        setMessages(buildInitialMessages());
        setWebPdfFilename(initialFile);
      }
      if (initialQuery) {
        handleSend(initialQuery);
      }
      setIsInitialized(true);
    }
  }, [initialQuery, isInitialized, initialMode, initialFile]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setIsMenuOpen(false);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let uploadedUrl = "";
      while (true) {
        const { done, value } = await (reader?.read() || {
          done: true,
          value: undefined,
        });
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data:")) {
            try {
              const parsed = JSON.parse(line.replace("data: ", "").trim());
              if (parsed.status === "verifying") {
                setUploadProgressText("Verifying relevance...");
                setUploadProgress(5);
              } else if (parsed.status === "started") {
                setUploadProgressText(`Embedding (0/${parsed.total})...`);
                setUploadProgress(10);
              } else if (parsed.status === "embedding") {
                const pct =
                  Math.floor((parsed.progress / parsed.total) * 90) + 10;
                setUploadProgressText(
                  `Embedding (${parsed.progress}/${parsed.total})...`,
                );
                setUploadProgress(pct);
              } else if (parsed.status === "done") {
                uploadedUrl = parsed.fileUrl ?? "";
                setUploadProgress(100);
              } else if (parsed.status === "ocr_converting") {
                setUploadProgressText("Preparing document...");
                setUploadProgress(2);
              } else if (parsed.status === "ocr_processing") {
                const pct = Math.floor((parsed.progress / parsed.total) * 50);
                setUploadProgressText(
                  `Reading page ${parsed.progress}/${parsed.total}...`,
                );
                setUploadProgress(pct);
              } else if (parsed.page) {
                setUploadProgressText(`Reading page ${parsed.page}...`);
              }
            } catch (e) {}
          }
        }
      }
      setWebPdfFilename(file.name);
      setChatMode("research");
      setMessages((prev) => [
        ...prev,
        { role: "user", content: `ATTACHMENT|${file.name}|${uploadedUrl}` },
        {
          role: "assistant",
          content: `Successfully indexed **${file.name}**. I'm now in **Research mode** — I'll use both this document and live web search to answer your questions about it.`,
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
      setUploadProgressText("");
      setUploadProgress(0);
    }
  };

  const handleSend = async (
    text: string = input,
    hiddenPrefix?: string,
    isVoice: boolean = false,
  ) => {
    if (!text.trim() || isLoading) return;

    if (!user) {
      const count = parseInt(localStorage.getItem("guest_questions_asked") || "0", 10);
      if (count >= 3) {
        setShowAuthModal(true);
        return;
      }
      localStorage.setItem("guest_questions_asked", (count + 1).toString());
    }

    let displayedText = text;
    let finalHiddenPrefix = hiddenPrefix;
    if (chatMode === "compare" && !hiddenPrefix) {
      const combined = [...selectedCriteria];
      if (showOtherInput && otherCriteria.trim())
        combined.push(otherCriteria.trim());

      const collegeList = colleges.slice(0, MAX_COMPARE_COLLEGES);

      if (combined.length > 0) {
        const formattedCriteria =
          combined.length === 1
            ? combined[0]
            : combined.slice(0, -1).join(", ") +
              " and " +
              combined[combined.length - 1];
        displayedText = `${text} based on ${formattedCriteria.toLowerCase()}`;
      }

      const criteriaStr =
        combined.length > 0
          ? `Compare ONLY on these categories: ${combined.join(", ")}.`
          : "Provide a comprehensive comparison on all standard metrics (fees, placements, rankings, campus life, research, hostel, courses, alumni).";

      const collegesStr = collegeList.length > 0
        ? `Colleges to compare: ${collegeList.join(" | ")}.`
        : "";

      finalHiddenPrefix = `SYSTEM: Compare these educational institutions side-by-side. ${collegesStr} ${criteriaStr} After the table, MUST include a '## 🏆 Our Recommendation' section picking the best overall college and best college per goal (placements, research, budget, campus life).`;
    }

    const userMessage: Message = { role: "user", content: displayedText };
    const apiMessage: Message = {
      role: "user",
      content: finalHiddenPrefix ? `${finalHiddenPrefix}\n\n${text}` : text,
    };

    // Use functional state updates to ensure we have the absolute latest history
    let currentHistory: Message[] = [];
    setMessages((prev) => {
      currentHistory = [...prev];
      return [...prev, userMessage, { role: "assistant", content: "" }];
    });
    
    setInput("");
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          messages: [...currentHistory, apiMessage],
          mode: chatMode as "research" | "compare",
          ...(webPdfFilename ? { pdfFilename: webPdfFilename } : {}),
          ...(chatMode === "compare" && colleges.length > 0 ? { colleges: colleges.slice(0, MAX_COMPARE_COLLEGES) } : {}),
          ...(selectedLanguageRef.current &&
          selectedLanguageRef.current !== "auto"
            ? { language: selectedLanguageRef.current }
            : {}),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "The server encountered an error. Please try again.");
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
            updated[updated.length - 1].content = `⚠️ **Error:** ${err.message || "Failed to connect to the intelligence engine."}`;
          }
          return updated;
        });
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="flex h-screen bg-[#f3f4f6] text-black selection:bg-black selection:text-white overflow-hidden font-sans">
      <aside className="hidden md:flex w-16 border-r-2 border-black flex-col items-center py-6 gap-6 z-[100] bg-white">
        <Link
          href="/"
          className="w-10 h-10 bg-white rounded-lg border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          <GraduationCap className="text-black w-5 h-5" />
        </Link>
        <div className="flex flex-col gap-4">
          {[
            { icon: Brain, href: "/chat", active: true },
            { icon: Bookmark, href: "/shortlist", label: "Saved Colleges" },
            { icon: LayoutGrid, href: "/tools", label: "Tools" },
          ].map((item, i) => (
            <Link
              key={i}
              href={item.href}
              title={(item as any).label}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all",
                item.active
                  ? "bg-black border-black text-white shadow-[2px_2px_0px_0px_#b69cc4]"
                  : "border-transparent text-zinc-500 hover:border-black hover:text-black",
              )}
            >
              <item.icon size={18} />
            </Link>
          ))}
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-white border-2 border-black rounded-xl px-2 py-2 flex items-center gap-1 shadow-[4px_4px_0px_0px_#000000] text-black">
        {[
          { icon: GraduationCap, href: "/", label: "Home" },
          { icon: Brain, href: "/chat", active: true, label: "Chat" },
          { icon: Bookmark, href: "/shortlist", label: "Saved" },
          { icon: LayoutGrid, href: "/tools", label: "Apps" },
        ].map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300",
              item.active
                ? "bg-[#b69cc4] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                : "text-zinc-500 hover:text-black rounded-lg",
            )}
          >
            <item.icon size={20} />
            {item.active && (
              <span className="text-[13px] font-black">{item.label}</span>
            )}
          </Link>
        ))}
      </nav>

      <main className="flex-1 flex flex-col relative bg-[#f3f4f6]">
        {/* Floating Profile/Sign In */}
        <div className="absolute top-6 right-6 z-50">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-8 h-8 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-white border-2 border-black flex items-center justify-center text-xs font-extrabold text-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {user.displayName ? user.displayName[0] : (user.email ? user.email[0] : "U")}
                  </div>
                )}
              </button>
              {profileDropdownOpen && (
                <div className="absolute right-0 top-[45px] w-48 bg-white border-2 border-black rounded-lg p-2 z-[300] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black">
                  <div className="px-3 py-2 border-b-2 border-zinc-100 mb-1">
                    <p className="text-[11px] font-black text-black truncate">
                      {user.displayName || "User"}
                    </p>
                    <p className="text-[9px] text-[#b69cc4] font-bold truncate mt-0.5">
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
                    className="w-full text-left px-3 py-2 text-xs font-black text-red-600 hover:bg-red-50 border border-transparent rounded-lg transition-all"
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
        </div>

        <div
          className={cn(
            "flex-1 overflow-y-auto custom-scrollbar flex flex-col",
            messages.length === 0
              ? "items-center justify-center md:justify-center py-12 md:py-0"
              : "pb-20 md:pb-0",
          )}
        >
          <div
            className={cn(
              "max-w-3xl w-full mx-auto px-4 sm:px-6",
              messages.length === 0
                ? "space-y-10 sm:space-y-16"
                : "space-y-8 sm:space-y-12 pt-8 sm:pt-12 pb-32 sm:pb-32",
            )}
          >
            {messages.length === 0 && !isLoading && (
              <div className="text-center space-y-6 pt-12 md:pt-0">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-black px-4">
                  {chatMode === "compare"
                    ? "Compare up to 5 institutions"
                    : "What shall we research today?"}
                </h1>
              </div>
            )}

            {messages.length > 0 && (
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => {
                  if (msg.content.startsWith("ATTACHMENT|")) {
                    const parts = msg.content.split("|");
                    const filename = parts[1] || "Document.pdf";
                    const url = parts[2] || "";
                    const fullUrl = url.startsWith("http")
                      ? url
                      : `${API_URL.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-end mb-4"
                      >
                        <div className="bg-white border-2 border-black px-4 sm:px-6 py-3 sm:py-4 rounded-lg flex items-center gap-4 text-black max-w-[85%] shadow-[4px_4px_0px_0px_#b69cc4]">
                          <FileText className="w-8 h-8 text-black shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <p className="text-sm font-black truncate">
                              {filename}
                            </p>
                            {url && (
                              <a
                                href={fullUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] uppercase tracking-wider text-black hover:text-[#b69cc4] mt-1 flex items-center gap-1 w-fit font-extrabold"
                              >
                                Preview PDF <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  }
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex flex-col mb-4",
                        msg.role === "user" ? "items-end" : "items-start",
                      )}
                    >
                      <MessageBubble
                        msg={msg}
                        index={i}
                        onSpeak={speakMessage}
                        isSpeaking={currentlySpeaking === i}
                        chatMode={chatMode}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}

            {messages.length === 0 && (
              <div
                className={cn(
                  "w-full relative",
                  chatMode !== "compare" && "hidden md:block",
                )}
              >
                <ChatInput
                  input={input}
                  setInput={setInput}
                  handleSend={handleSend}
                  isLoading={isLoading}
                  isUploading={isUploading}
                  uploadProgressText={uploadProgressText}
                  uploadProgress={uploadProgress}
                  chatMode={chatMode}
                  setChatMode={setChatMode}
                  isMenuOpen={isMenuOpen}
                  setIsMenuOpen={setIsMenuOpen}
                  fileInputRef={fileInputRef}
                  abortControllerRef={abortControllerRef}
                  colleges={colleges}
                  setColleges={setColleges}
                  selectedCriteria={selectedCriteria}
                  setSelectedCriteria={setSelectedCriteria}
                  otherCriteria={otherCriteria}
                  setOtherCriteria={setOtherCriteria}
                  showOtherInput={showOtherInput}
                  setShowOtherInput={setShowOtherInput}
                  isFocusMenuOpen={isFocusMenuOpen}
                  setIsFocusMenuOpen={setIsFocusMenuOpen}
                  menuSide="bottom"
                  hasMessages={messages.length > 0}
                  showCompareInputs={showCompareInputs}
                  setShowCompareInputs={setShowCompareInputs}
                  selectedLanguage={selectedLanguage}
                  setSelectedLanguage={setSelectedLanguage}
                  isLangMenuOpen={isLangMenuOpen}
                  setIsLangMenuOpen={setIsLangMenuOpen}
                  isRecordingVoice={isRecordingVoice}
                  startVoiceRecording={startVoiceRecording}
                  isSpeaking={currentlySpeaking !== null}
                />
              </div>
            )}
            <div ref={bottomRef} className="h-4" />
          </div>
        </div>

        {(messages.length > 0 || chatMode !== "compare") && (
          <div
            className={cn(
              "fixed bottom-16 md:bottom-0 left-0 md:left-20 right-0 p-2 sm:p-4 bg-gradient-to-t from-[#f3f4f6] via-[#f3f4f6] to-transparent pt-6 sm:pt-10 z-50",
              messages.length === 0 && chatMode !== "compare" && "md:hidden",
              messages.length === 0 && chatMode === "compare" && "hidden",
            )}
          >
            <div className="max-w-3xl mx-auto relative">
              <ChatInput
                input={input}
                setInput={setInput}
                handleSend={handleSend}
                isLoading={isLoading}
                isUploading={isUploading}
                uploadProgressText={uploadProgressText}
                uploadProgress={uploadProgress}
                chatMode={chatMode}
                setChatMode={setChatMode}
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
                fileInputRef={fileInputRef}
                abortControllerRef={abortControllerRef}
                colleges={colleges}
                setColleges={setColleges}
                selectedCriteria={selectedCriteria}
                setSelectedCriteria={setSelectedCriteria}
                otherCriteria={otherCriteria}
                setOtherCriteria={setOtherCriteria}
                showOtherInput={showOtherInput}
                setShowOtherInput={setShowOtherInput}
                isFocusMenuOpen={isFocusMenuOpen}
                setIsFocusMenuOpen={setIsFocusMenuOpen}
                menuSide="top"
                hasMessages={messages.length > 0}
                showCompareInputs={showCompareInputs}
                setShowCompareInputs={setShowCompareInputs}
                selectedLanguage={selectedLanguage}
                setSelectedLanguage={setSelectedLanguage}
                isLangMenuOpen={isLangMenuOpen}
                setIsLangMenuOpen={setIsLangMenuOpen}
                isRecordingVoice={isRecordingVoice}
                startVoiceRecording={startVoiceRecording}
                isSpeaking={currentlySpeaking !== null}
              />
            </div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileUpload}
          accept=".pdf"
        />
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #000000;
          border: 1px solid #f3f4f6;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #1f1f1f;
        }
      `}</style>

      {/* Auth Limit Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={() => setShowAuthModal(false)}
          />
          <div className="relative z-10 w-full max-w-md bg-white border-2 border-black rounded-lg p-8 shadow-[6px_6px_0px_0px_#000000] flex flex-col items-center text-center space-y-6 text-black">
            <div className="w-16 h-16 bg-[#f3f4f6] border-2 border-black rounded-lg flex items-center justify-center text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <Brain size={32} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-serif font-black uppercase text-black">
                Sign in to continue exploring
              </h3>
              <p className="text-sm text-zinc-700 leading-relaxed font-semibold">
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
                  window.location.href = "/login?continue=/chat";
                }}
                className="w-full py-3 border-2 border-black bg-white text-black hover:bg-[#f3f4f6] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-extrabold text-sm rounded-lg transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                Sign Up to Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] text-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <Suspense>
      <ChatContent />
    </Suspense>
  );
}
