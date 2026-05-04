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
                    : "hover:bg-zinc-800",
                )}
              >
                <mode.icon
                  size={18}
                  className={cn(
                    chatMode === mode.id
                      ? "text-black"
                      : "text-zinc-500 group-hover:text-white",
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
                          : "hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200",
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
          <div className="flex items-center p-1.5 sm:p-3 relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                "p-3 sm:p-4 transition-all rounded-xl sm:rounded-2xl",
                isMenuOpen
                  ? "bg-white text-black"
                  : "text-zinc-600 hover:text-white hover:bg-zinc-800",
              )}
            >
              <LayoutGrid size={20} className="sm:w-6 sm:h-6" />
            </button>
            {chatMode !== "compare" && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 sm:p-4 text-zinc-600 hover:text-white hover:bg-zinc-800 transition-all rounded-xl sm:rounded-2xl flex items-center justify-center"
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
              className="flex-1 bg-transparent py-3 sm:py-4 text-sm sm:text-lg font-medium text-white placeholder:text-zinc-700 outline-none"
              disabled={isUploading}
            />

            {chatMode === "compare" && (
              <button
                onClick={() => setIsFocusMenuOpen(!isFocusMenuOpen)}
                className={cn(
                  "p-3 sm:p-4 transition-all rounded-xl sm:rounded-2xl mr-1 sm:mr-2",
                  isFocusMenuOpen ||
                    selectedCriteria.length > 0 ||
                    otherCriteria
                    ? "bg-white text-black"
                    : "text-zinc-600 hover:text-white hover:bg-zinc-800",
                )}
              >
                <SlidersHorizontal size={20} className="sm:w-6 sm:h-6" />
              </button>
            )}

            {isLoading ? (
              <button
                onClick={() => abortControllerRef.current?.abort()}
                className="p-3 sm:p-4 text-white hover:scale-110 transition-transform"
              >
                <StopCircle size={20} className="sm:w-6 sm:h-6" />
              </button>
            ) : (
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isUploading}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-white text-black rounded-xl sm:rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-20 transition-all"
              >
                <ArrowUp size={18} className="sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MessageBubble = ({ msg }: { msg: Message }) => {
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
        "max-w-[95%] sm:max-w-[85%] rounded-2xl sm:rounded-3xl text-sm sm:text-[15px] leading-relaxed",
        msg.role === "user"
          ? "bg-zinc-900 border border-zinc-800 px-4 sm:px-6 py-3 sm:py-4 text-white font-medium"
          : "w-full text-zinc-300",
      )}
    >
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
                  className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group w-fit max-w-[280px]"
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

function ChatContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q");
  const initialFile = searchParams.get("file");
  const initialFileUrl = searchParams.get("fileUrl");
  const initialMode =
    (searchParams.get("mode") as "pdf" | "web" | "compare") ?? "web";
  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4005";
  const API_BASE_URL = rawApiUrl.replace("localhost", "127.0.0.1");

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
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);
  const [showCompareInputs, setShowCompareInputs] = useState(true);
  const [otherCriteria, setOtherCriteria] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [isFocusMenuOpen, setIsFocusMenuOpen] = useState(false);

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
      const res = await fetch(`${API_BASE_URL}/upload`, {
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
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, apiMessage],
          mode: chatMode,
          ...(webPdfFilename ? { pdfFilename: webPdfFilename } : {}),
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
                  : "text-zinc-600 hover:bg-zinc-900 hover:text-white",
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
                : "space-y-8 sm:space-y-12 pt-8 sm:pt-12 pb-24 sm:pb-32",
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
                      : `${API_BASE_URL.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
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
                                className="text-[10px] uppercase tracking-wider text-blue-400 hover:text-blue-300 mt-1 flex items-center gap-1 w-fit"
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
                      <MessageBubble msg={msg} />
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
                />
              </div>
            )}
            <div ref={bottomRef} className="h-4" />
          </div>
        </div>

        {(messages.length > 0 || chatMode !== "compare") && (
          <div
            className={cn(
              "absolute bottom-16 md:bottom-0 left-0 right-0 p-2 sm:p-4 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-6 sm:pt-10 z-50",
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
