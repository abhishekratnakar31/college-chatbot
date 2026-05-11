"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import {
  FileText,
  Check,
  Globe,
  ExternalLink,
  Paperclip,
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
} from "lucide-react";

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(" ");

type Message = {
  role: "user" | "assistant";
  content: string;
};

const COMPARISON_CRITERIA = [
  "Fees",
  "Placement",
  "Hostel",
  "Rankings",
  "Campus Life",
  "Alumni",
];

// ── Language Registry (mirrors server/src/lib/languageDetector.ts) ────────
const LANGUAGES = [
  { code: "auto",  name: "Auto-detect",  native: "Auto",       region: "meta"   },
  // –– Indian ––
  { code: "hi",    name: "Hindi",        native: "हिंदी",        region: "indian" },
  { code: "mr",    name: "Marathi",      native: "मराठी",        region: "indian" },
  { code: "ta",    name: "Tamil",        native: "தமிழ்",        region: "indian" },
  { code: "te",    name: "Telugu",       native: "తెలుగు",       region: "indian" },
  { code: "kn",    name: "Kannada",      native: "ಕನ್ನಡ",        region: "indian" },
  { code: "ml",    name: "Malayalam",   native: "മലയാളം",      region: "indian" },
  { code: "bn",    name: "Bengali",      native: "বাংলা",        region: "indian" },
  { code: "gu",    name: "Gujarati",     native: "ગુજરાતી",      region: "indian" },
  { code: "pa",    name: "Punjabi",      native: "ਪੰਜਾਬੀ",       region: "indian" },
  { code: "ur",    name: "Urdu",         native: "اردو",         region: "indian" },
  // –– Global ––
  { code: "ar",    name: "Arabic",       native: "العربية",      region: "global" },
  { code: "fr",    name: "French",       native: "Français",     region: "global" },
  { code: "es",    name: "Spanish",      native: "Español",      region: "global" },
  { code: "pt",    name: "Portuguese",   native: "Português",    region: "global" },
  { code: "de",    name: "German",       native: "Deutsch",      region: "global" },
  { code: "zh",    name: "Chinese",      native: "中文",          region: "global" },
  { code: "ja",    name: "Japanese",     native: "日本語",         region: "global" },
  { code: "ko",    name: "Korean",       native: "한국어",          region: "global" },
  { code: "ru",    name: "Russian",      native: "Русский",      region: "global" },
  { code: "el",    name: "Greek",        native: "Ελληνικά",     region: "global" },
] as const;

type LangCode = typeof LANGUAGES[number]["code"];

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
  comp1,
  setComp1,
  comp2,
  setComp2,
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
}: any) => {
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
            "absolute left-0 liquid-glass-card p-4 shadow-2xl shadow-black w-64 max-w-sm z-[110]",
            menuSide === "top" ? "bottom-full mb-2" : "top-full mt-2",
          )}
        >
          <h3 className="px-4 pt-2 pb-4 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-700">
            Switch Mode
          </h3>
          <div className="space-y-1">
            {[
              {
                id: "web",
                label: "Web Search",
                icon: Globe,
                desc: "Live internet intelligence",
              },
              {
                id: "pdf",
                label: "PDF Analysis",
                icon: FileSearch,
                desc: "Study uploaded documents",
              },
              {
                id: "compare",
                label: "Compare",
                icon: GitCompare,
                desc: "Side-by-side analysis",
              },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => {
                  setChatMode(mode.id as any);
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left group",
                  chatMode === mode.id
                    ? "bg-white text-black"
                    : "hover:bg-blue-500/10 hover:text-blue-400",
                )}
              >
                <mode.icon
                  size={18}
                  className={cn(
                    chatMode === mode.id
                      ? "text-black"
                      : "text-zinc-500 group-hover:text-blue-400",
                  )}
                />
                <div>
                  <p className="text-xs font-bold">{mode.label}</p>
                  <p
                    className={cn(
                      "text-[9px] font-medium",
                      chatMode === mode.id ? "text-black/60" : "text-zinc-500",
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
              initial={{ opacity: 0, y: menuSide === "top" ? -10 : 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: menuSide === "top" ? -10 : 10, scale: 0.95 }}
              className={cn(
                "absolute right-0 liquid-glass-card p-3 shadow-2xl shadow-black w-64 z-[110]",
                menuSide === "top" ? "bottom-full mb-2" : "top-full mt-2",
              )}
            >
              <h3 className="px-3 pt-2 pb-3 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Response Language
              </h3>
              <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-0.5 pr-1">
                {/* Auto option */}
                {LANGUAGES.filter(l => l.region === "meta").map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { setSelectedLanguage("auto"); setIsLangMenuOpen(false); }}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl transition-all text-left",
                      (selectedLanguage === "auto" || !selectedLanguage)
                        ? "bg-white text-black"
                        : "hover:bg-blue-500/10 text-zinc-300 hover:text-blue-400",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Globe size={13} />
                      <span className="text-xs font-bold">{lang.name}</span>
                    </div>
                    {(selectedLanguage === "auto" || !selectedLanguage) && <Check size={12} />}
                  </button>
                ))}

                {/* Indian languages */}
                <p className="px-3 pt-3 pb-1 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600">🇮🇳 Indian</p>
                {LANGUAGES.filter(l => l.region === "indian").map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { setSelectedLanguage(lang.code); setIsLangMenuOpen(false); }}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-2xl transition-all text-left",
                      selectedLanguage === lang.code
                        ? "bg-white text-black"
                        : "hover:bg-blue-500/10 text-zinc-300 hover:text-blue-400",
                    )}
                  >
                    <div>
                      <p className="text-xs font-semibold">{lang.native}</p>
                      <p className={cn("text-[10px]", selectedLanguage === lang.code ? "text-black/60" : "text-zinc-500")}>{lang.name}</p>
                    </div>
                    {selectedLanguage === lang.code && <Check size={12} />}
                  </button>
                ))}

                {/* Global languages */}
                <p className="px-3 pt-3 pb-1 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600">🌍 Global</p>
                {LANGUAGES.filter(l => l.region === "global").map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { setSelectedLanguage(lang.code); setIsLangMenuOpen(false); }}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-2xl transition-all text-left",
                      selectedLanguage === lang.code
                        ? "bg-white text-black"
                        : "hover:bg-blue-500/10 text-zinc-300 hover:text-blue-400",
                    )}
                  >
                    <div>
                      <p className="text-xs font-semibold">{lang.native}</p>
                      <p className={cn("text-[10px]", selectedLanguage === lang.code ? "text-black/60" : "text-zinc-500")}>{lang.name}</p>
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
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={cn(
                "absolute right-0 w-64 p-4 bg-zinc-900 border border-zinc-800 rounded-3xl z-50 shadow-2xl",
                menuSide === "top" ? "bottom-full mb-4" : "top-full mt-4",
              )}
            >
              <div className="flex flex-col gap-1 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                <h3 className="px-2 pt-1 pb-3 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Focus Parameters
                </h3>
                {COMPARISON_CRITERIA.map((c) => {
                  const isSelected = selectedCriteria.includes(c);
                  return (
                    <button
                      key={c}
                      onClick={() => {
                        setSelectedCriteria((prev: string[]) =>
                          isSelected
                            ? prev.filter((x) => x !== c)
                            : [...prev, c],
                        );
                      }}
                      className={cn(
                        "flex items-center gap-3 w-full p-3 rounded-2xl transition-all text-left group",
                        isSelected
                          ? "bg-white/10 text-white"
                          : "hover:bg-blue-500/10 text-zinc-400 hover:text-blue-400",
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0",
                          isSelected
                            ? "bg-white border-white text-black"
                            : "border-zinc-600 group-hover:border-zinc-400 text-transparent",
                        )}
                      >
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-sm font-medium">{c}</span>
                    </button>
                  );
                })}

                <button
                  onClick={() => setShowOtherInput(!showOtherInput)}
                  className={cn(
                    "flex items-center gap-3 w-full p-3 rounded-2xl transition-all text-left group",
                    showOtherInput
                      ? "bg-white/10 text-white"
                      : "hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200",
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0",
                      showOtherInput
                        ? "bg-white border-white text-black"
                        : "border-zinc-600 group-hover:border-zinc-400 text-transparent",
                    )}
                  >
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-sm font-medium">Other (Custom)</span>
                </button>

                {showOtherInput && (
                  <div className="p-3 mt-1">
                    <input
                      value={otherCriteria}
                      onChange={(e) => setOtherCriteria(e.target.value)}
                      placeholder="Enter custom focus..."
                      className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-medium text-white outline-none focus:border-white/20 transition-all placeholder:text-zinc-600"
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
                <Loader2 className="w-4 h-4 text-white animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                  {uploadProgressText || "Processing Document"}
                </span>
              </div>
              <span className="text-[10px] font-black tabular-nums text-zinc-500">
                {uploadProgress}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50">
              <motion.div 
                className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ type: "spring", bounce: 0, duration: 0.5 }}
              />
            </div>
          </motion.div>
        )}

        <div className="bg-zinc-900 border-2 border-zinc-800 group-focus-within:border-white group-focus-within:bg-black rounded-3xl sm:rounded-[2.5rem] transition-all duration-500 shadow-2xl shadow-black/5 overflow-hidden">
          <div className="flex items-center p-1 sm:p-3 pr-1.5 sm:pr-3 relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                "p-2 sm:p-4 transition-all rounded-xl sm:rounded-2xl shrink-0",
                isMenuOpen
                  ? "bg-white text-black"
                  : "text-zinc-600 hover:text-blue-400 hover:bg-blue-500/10",
              )}
            >
              <LayoutGrid size={20} className="sm:w-6 sm:h-6" />
            </button>
            {chatMode !== "compare" && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 sm:p-4 text-zinc-600 hover:text-blue-400 hover:bg-blue-500/10 transition-all rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0"
              >
                <FileUp size={20} className="sm:w-6 sm:h-6" />
              </button>
            )}
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={
                isUploading ? (uploadProgressText || "Indexing...") : `Ask in ${chatMode}...`
              }
              className="flex-1 min-w-0 bg-transparent py-3 sm:py-4 text-sm sm:text-lg font-medium text-white placeholder:text-zinc-700 outline-none"
              disabled={isUploading}
            />

            {/* Language selector button — always visible */}
            <button
              onClick={() => { setIsLangMenuOpen(!isLangMenuOpen); setIsMenuOpen(false); setIsFocusMenuOpen(false); }}
              title="Response language"
              className={cn(
                "p-2 sm:p-4 transition-all rounded-xl sm:rounded-2xl flex items-center gap-1 mr-0.5 shrink-0",
                isLangMenuOpen || (selectedLanguage && selectedLanguage !== "auto")
                  ? "bg-white text-black"
                  : "text-zinc-600 hover:text-blue-400 hover:bg-blue-500/10",
              )}
            >
              <Globe size={18} className="sm:w-5 sm:h-5" />
              {selectedLanguage && selectedLanguage !== "auto" && (
                <span className="text-[10px] font-black">
                  {LANGUAGES.find(l => l.code === selectedLanguage)?.native?.slice(0, 4) ?? selectedLanguage.toUpperCase()}
                </span>
              )}
            </button>

            {/* Voice Dictation Toggle */}
            <button
              onClick={startVoiceRecording}
              title={isRecordingVoice ? "Stop Recording" : "Start Dictation"}
              className={cn(
                "p-2 sm:p-4 transition-all rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 mr-1",
                isRecordingVoice
                  ? "bg-rose-500/20 text-rose-500 hover:bg-rose-500/30 animate-pulse"
                  : "text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10"
              )}
            >
              {isRecordingVoice ? (
                <Square size={18} className="sm:w-5 sm:h-5 fill-current" />
              ) : (
                <Mic size={18} className="sm:w-5 sm:h-5" />
              )}
            </button>


            {chatMode === "compare" && (
              <button
                onClick={() => setIsFocusMenuOpen(!isFocusMenuOpen)}
                className={cn(
                  "p-3 sm:p-4 transition-all rounded-xl sm:rounded-2xl mr-1 sm:mr-2",
                  isFocusMenuOpen ||
                    selectedCriteria.length > 0 ||
                    otherCriteria
                    ? "bg-white text-black"
                    : "text-zinc-600 hover:text-blue-400 hover:bg-blue-500/10",
                )}
              >
                <SlidersHorizontal size={20} className="sm:w-6 sm:h-6" />
              </button>
            )}

            <AnimatePresence>
              {isLoading ? (
                <motion.button
                  key="stop-button"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  onClick={() => abortControllerRef.current?.abort()}
                  className="p-3 sm:p-4 text-white hover:scale-110 transition-transform shrink-0"
                >
                  <StopCircle size={20} className="sm:w-6 sm:h-6" />
                </motion.button>
              ) : (
                input.trim() && !isRecordingVoice && (
                  <motion.button
                    key="send-button"
                    initial={{ scale: 0.5, opacity: 0, x: 10 }}
                    animate={{ scale: 1, opacity: 1, x: 0 }}
                    exit={{ scale: 0.5, opacity: 0, x: 10 }}
                    onClick={() => handleSend()}
                    disabled={isUploading}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-white text-black rounded-xl sm:rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shrink-0 ml-1 sm:ml-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  >
                    <ArrowUp size={18} className="sm:w-5 sm:h-5" />
                  </motion.button>
                )
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

const MessageBubble = ({ 
  msg, 
  index, 
  onSpeak, 
  isSpeaking 
}: { 
  msg: Message; 
  index: number;
  onSpeak: (text: string, idx: number) => void;
  isSpeaking: boolean;
}) => {
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
        "max-w-[95%] sm:max-w-[85%] rounded-2xl sm:rounded-3xl text-sm sm:text-[15px] leading-relaxed group/msg relative",
        msg.role === "user"
          ? "bg-zinc-900 border border-zinc-800 px-4 sm:px-6 py-3 sm:py-4 text-white font-medium self-end"
          : "w-full text-zinc-300",
      )}
    >
      {msg.role === "assistant" && mainContent && (
        <button
          onClick={() => onSpeak(mainContent, index)}
          className={cn(
            "absolute -right-12 top-2 p-2.5 rounded-xl transition-all border shrink-0",
            isSpeaking 
              ? "bg-white border-white text-black animate-pulse" 
              : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700 opacity-0 group-hover/msg:opacity-100"
          )}
          title={isSpeaking ? "Stop speaking" : "Read aloud"}
        >
          {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      )}
      <div className="flex flex-col gap-4 w-full">
        <div className="prose prose-invert max-w-none prose-premium prose-sm sm:prose-base">
          {mainContent ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {mainContent}
            </ReactMarkdown>
          ) : (
            <div className="flex items-center h-6 px-2 text-zinc-400 text-sm font-medium">
              <div className="flex items-center space-x-1.5 mt-1">
                <div
                  className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
              <span className="ml-3 animate-pulse">
                Retrieving intelligence...
              </span>
            </div>
          )}
        </div>

        {sourcesMeta && sourcesMeta.length > 0 && (
          <div className="mt-2 pt-4 border-t border-white/5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
              <Globe className="w-3 h-3" />
              Sources Analyzed
            </div>
            <div className="flex flex-wrap gap-2">
              {sourcesMeta.map((s: any, idx: number) => (
                <a
                  key={idx}
                  href={s.url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 border border-white/5 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all group w-fit max-w-[280px]"
                >
                  <div className="w-8 h-8 rounded-lg bg-black/50 flex items-center justify-center shrink-0">
                    {s.type === "pdf" ? (
                      <FileText className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                    ) : (
                      <Globe className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors truncate">
                      {s.name || s.url}
                    </p>
                    <p className="text-[10px] text-zinc-500 truncate mt-0.5">
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

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4006").replace("localhost", "127.0.0.1");

function ChatContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q");
  const initialFile = searchParams.get("file");
  const initialFileUrl = searchParams.get("fileUrl");
  const initialMode =
    (searchParams.get("mode") as "pdf" | "web" | "compare") ?? "web";

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

  const [messages, setMessages] = useState<Message[]>(buildInitialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [chatMode, setChatMode] = useState<"pdf" | "web" | "compare">(
    initialMode,
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [webPdfFilename, setWebPdfFilename] = useState<string | null>(
    initialFile,
  );
  const [comp1, setComp1] = useState("");
  const [comp2, setComp2] = useState("");
  const [currentlySpeaking, setCurrentlySpeaking] = useState<number | null>(null);
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

  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);
  const [showCompareInputs, setShowCompareInputs] = useState(true);
  const [otherCriteria, setOtherCriteria] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [isFocusMenuOpen, setIsFocusMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LangCode>("auto");
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef("");

  const startVoiceRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    if (isRecordingVoice && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecordingVoice(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep listening until manual stop
    recognition.interimResults = true;
    recognition.lang = "en-US";

    finalTranscriptRef.current = "";

    recognition.onstart = () => setIsRecordingVoice(true);

    let finalTranscript = "";

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const displayTranscript = finalTranscript + interimTranscript;
      if (displayTranscript.trim()) {
        setInput(displayTranscript);
        finalTranscriptRef.current = displayTranscript;
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecordingVoice(false);
    };

    recognition.onend = () => {
      // Submission happens here when stop() is called manually
      const textToSubmit = finalTranscriptRef.current;
      if (textToSubmit && textToSubmit.trim() !== "") {
        handleSend(textToSubmit);
        finalTranscriptRef.current = ""; // Clear for next time
      }
      setIsRecordingVoice(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Keep a ref in sync so handleSend always reads the LATEST language
  // even if the user switches and sends before the re-render completes.
  const selectedLanguageRef = useRef<LangCode>("auto");
  useEffect(() => {
    selectedLanguageRef.current = selectedLanguage;
  }, [selectedLanguage]);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (initialQuery && messages.length === buildInitialMessages().length) {
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

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
        const { done, value } = await (reader?.read() || { done: true, value: undefined });
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
                const pct = Math.floor((parsed.progress / parsed.total) * 90) + 10;
                setUploadProgressText(`Embedding (${parsed.progress}/${parsed.total})...`);
                setUploadProgress(pct);
              } else if (parsed.status === "done") {
                uploadedUrl = parsed.fileUrl ?? "";
                setUploadProgress(100);
              } else if (parsed.status === "ocr_converting") {
                setUploadProgressText("Preparing document...");
                setUploadProgress(2);
              } else if (parsed.status === "ocr_processing") {
                const pct = Math.floor((parsed.progress / parsed.total) * 50);
                setUploadProgressText(`Reading page ${parsed.progress}/${parsed.total}...`);
                setUploadProgress(pct);
              } else if (parsed.page) {
                setUploadProgressText(`Reading page ${parsed.page}...`);
              }
            } catch (e) {}
          }
        }
      }
      setWebPdfFilename(file.name);
      setChatMode("pdf");
      setMessages((prev) => [
        ...prev,
        { role: "user", content: `ATTACHMENT|${file.name}|${uploadedUrl}` },
        {
          role: "assistant",
          content: `Successfully indexed **${file.name}**. Switched to PDF analysis mode.`,
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

  const handleSend = async (text: string = input, hiddenPrefix?: string) => {
    if (!text.trim() || isLoading) return;

    let displayedText = text;
    let finalHiddenPrefix = hiddenPrefix;
    if (chatMode === "compare" && !hiddenPrefix) {
      const combined = [...selectedCriteria];
      if (showOtherInput && otherCriteria.trim())
        combined.push(otherCriteria.trim());

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
          ? `STRICT INSTRUCTION: You must ONLY compare the institutions based on these specific factors: ${combined.join(", ")}. DO NOT provide information about any other factors.`
          : "Provide a comprehensive general comparison including all standard academic metrics (fees, placements, campus life, academics, infrastructure, etc).";

      finalHiddenPrefix = `SYSTEM: YOU ARE AN ACADEMIC INTELLIGENCE ENGINE. You must ONLY compare educational institutions. Be permissive. Provide a high-fidelity side-by-side comparison. ${criteriaStr}`;
    }

    const userMessage: Message = { role: "user", content: displayedText };
    const apiMessage: Message = {
      role: "user",
      content: finalHiddenPrefix ? `${finalHiddenPrefix}\n\n${text}` : text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, apiMessage],
          mode: chatMode,
          ...(webPdfFilename ? { pdfFilename: webPdfFilename } : {}),
          ...(selectedLanguageRef.current && selectedLanguageRef.current !== "auto"
            ? { language: selectedLanguageRef.current }
            : {}),
        }),
      });

      if (!response.ok) throw new Error("Server error");
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

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
              const json = JSON.parse(line.replace("data: ", ""));
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
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white selection:bg-white selection:text-black overflow-hidden font-sans">
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
      <aside className="hidden md:flex w-20 border-r border-zinc-900 flex-col items-center py-8 gap-8 z-[100] bg-black">
        <Link
          href="/"
          className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform"
        >
          <GraduationCap className="text-black w-6 h-6" />
        </Link>
        <div className="flex flex-col gap-4">
          {[
            { icon: Brain, href: "/chat", active: true },
            { icon: Newspaper, href: "/news" },
            { icon: Trophy, href: "/rankings" },
          ].map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                item.active
                  ? "bg-white text-black shadow-xl shadow-white/10"
                  : "text-zinc-600 hover:bg-blue-500/10 hover:text-blue-400",
              )}
            >
              <item.icon size={20} />
            </Link>
          ))}
        </div>
      </aside>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-lg border-t border-zinc-900 flex items-center justify-around z-[200] px-6">
        {[
          { icon: GraduationCap, href: "/" },
          { icon: Brain, href: "/chat", active: true },
          { icon: Newspaper, href: "/news" },
          { icon: Trophy, href: "/rankings" },
        ].map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className={cn(
              "p-3 rounded-xl transition-all",
              item.active ? "bg-white text-black" : "text-zinc-600",
            )}
          >
            <item.icon size={20} />
          </Link>
        ))}
      </nav>

      <main className="flex-1 flex flex-col relative bg-[#0a0a0a]">
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
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold tracking-tight text-zinc-500 px-4">
                  {chatMode === "compare"
                    ? "Compare your institutions"
                    : "What shall we analyze today?"}
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
                        <div className="bg-zinc-900 border border-zinc-800 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-3xl flex items-center gap-4 text-white max-w-[85%]">
                          <FileText className="w-8 h-8 text-zinc-400 shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <p className="text-sm font-bold truncate">{filename}</p>
                            {url && (
                              <a
                                href={fullUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] uppercase tracking-wider text-zinc-400 hover:text-blue-400 mt-1 flex items-center gap-1 w-fit"
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
                  comp1={comp1}
                  setComp1={setComp1}
                  comp2={comp2}
                  setComp2={setComp2}
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
                />
              </div>
            )}
            <div ref={bottomRef} className="h-4" />
          </div>
        </div>

        {(messages.length > 0 || chatMode !== "compare") && (
          <div
            className={cn(
              "fixed bottom-16 md:bottom-0 left-0 md:left-20 right-0 p-2 sm:p-4 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-6 sm:pt-10 z-50",
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
                comp1={comp1}
                setComp1={setComp1}
                comp2={comp2}
                setComp2={setComp2}
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
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #18181b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #fff;
        }
      `}</style>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatContent />
    </Suspense>
  );
}
