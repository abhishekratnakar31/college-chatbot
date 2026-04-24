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
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

const SUGGESTED_QUESTIONS = [
  "What are the admission requirements?",
  "Tell me about the campus life.",
  "What scholarships are available?",
  "How do I apply for financial aid?",
];

function ChatContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q");
  const initialFile = searchParams.get("file");      // filename from hero upload
  const initialFileUrl = searchParams.get("fileUrl"); // server path from hero upload
  const initialMode = (searchParams.get("mode") as "pdf" | "web" | "compare") ?? "pdf";
  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
  const API_BASE_URL = rawApiUrl.replace("localhost", "127.0.0.1");
  const resolveUrl = (path: string) =>
    path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  // Seed initial messages: if a file was uploaded from the hero page, show the
  // attachment card + bot confirmation right away.
  const buildInitialMessages = (): Message[] => {
    const base: Message[] = [
      {
        role: "assistant",
        content: "Hello! I'm your College Assistant. How can I help you today?",
      },
    ];
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

  // --- States ---
  const [messages, setMessages] = useState<Message[]>(buildInitialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [chatMode, setChatMode] = useState<"pdf" | "web" | "compare">(initialMode);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Web-mode PDF context (ephemeral — not indexed into Qdrant)
  const [webPdfContext, setWebPdfContext] = useState<string | null>(null);
  const [webPdfFilename, setWebPdfFilename] = useState<string | null>(null);
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [webPdfScanned, setWebPdfScanned] = useState(false); // true = OCR was needed / text may be limited

  // --- Refs ---
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Web-mode PDF attachment handler.
   * Sends the PDF to /extract-text (lightweight, no Qdrant indexing)
   * and stores the text snippet in webPdfContext state.
   */
  const handleWebPdfAttach = async (selectedFile: File) => {
    setIsExtractingPdf(true);
    setWebPdfFilename(selectedFile.name);  // Set filename immediately so badge appears
    setWebPdfContext(null);
    setWebPdfScanned(false);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch(`${API_BASE_URL}/extract-text`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        // Endpoint failed — keep the filename so the backend can still use it as a hint
        console.error(`[WebPDF] /extract-text returned ${res.status}`);
        setWebPdfContext(""); // empty string = filename-only fallback mode
        return;
      }

      const data = await res.json();
      const extractedText: string = data.text || "";
      setWebPdfContext(extractedText);
      setWebPdfScanned(!!data.scanned || extractedText.length === 0);
      console.log(
        `[WebPDF] Extracted ${extractedText.length} chars from ${selectedFile.name}` +
        (data.scanned ? " (OCR used)" : "") +
        (data.empty ? " ⚠️ EMPTY" : "")
      );
    } catch (err) {
      // Network error — keep the filename so the backend can still use it as a hint
      console.error("[WebPDF] Text extraction failed:", err);
      setWebPdfContext(""); // empty string = filename-only fallback mode
    } finally {
      setIsExtractingPdf(false);
    }
  };

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUpload = async (newFiles?: File | File[]) => {
    let filesToUpload: File[] = [];
    if (newFiles) {
      filesToUpload = Array.isArray(newFiles) ? newFiles : [newFiles];
    } else if (file) {
      filesToUpload = [file];
    }

    if (!filesToUpload.length) return;

    setIsUploading(true);
    setTotalFiles(filesToUpload.length);
    const batchResults: { name: string; url: string }[] = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const currentFile = filesToUpload[i];
      setCurrentFileIndex(i + 1);

      setUploadProgress(0);

      const formData = new FormData();
      formData.append("file", currentFile);

      try {
        const res = await fetch(`${API_BASE_URL}/upload`, {
          method: "POST",
          body: formData,
        });

        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let isFinished = false;

        while (!isFinished) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data:")) continue;

            const json = line.replace("data: ", "").trim();
            if (!json) continue;

            try {
              const parsed = JSON.parse(json);
              const prefix =
                filesToUpload.length > 1
                  ? `(${i + 1}/${filesToUpload.length}) `
                  : "";

              if (parsed.status === "ocr_converting") {
                setUploadProgress(10);
              } else if (parsed.status === "ocr_processing") {
                const percent = Math.round(
                  (parsed.progress / parsed.total) * 100,
                );

                setUploadProgress(10 + percent * 0.4);
              } else if (parsed.status === "started") {
                setUploadProgress(50);
              } else if (parsed.status === "embedding") {
                const percent = Math.round(
                  (parsed.progress / parsed.total) * 100,
                );

                setUploadProgress(50 + percent * 0.5);
              } else if (parsed.status === "done") {
                setUploadProgress(100);

                // Buffer this file's result
                batchResults.push({
                  name: currentFile.name,
                  url: parsed.fileUrl,
                });
                isFinished = true;
              } else if (parsed.status === "error") {
                isFinished = true;
              }
            } catch {}
          }
        }
      } catch (err) {
        console.error(`Upload failed for ${currentFile.name}`, err);
      }
    }

    // Once ALL files are done, update the chat history ONCE
    if (batchResults.length > 0) {
      const attachmentMessages = batchResults.map((res) => ({
        role: "user" as const,
        content: `ATTACHMENT|${res.name}|${res.url}`,
      }));

      const confirmationMsg = {
        role: "assistant" as const,
        content:
          batchResults.length > 1
            ? `I've finished indexing **${batchResults.length} documents**. You can now ask me questions about them!`
            : `I've finished indexing **${batchResults[0].name}**. You can now ask me questions about its content!`,
      };

      setMessages((prev) => [...prev, ...attachmentMessages, confirmationMsg]);
    }

    setIsUploading(false);

    setUploadProgress(0);
    setFile(null);
    setCurrentFileIndex(0);
    setTotalFiles(0);
  };

  /** Abort the current streaming response. */
  const handleStop = () => {
    abortControllerRef.current?.abort();
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const currentInput = text;
    const userMessage: Message = {
      role: "user",
      content: currentInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploadProgress(0);
    setIsLoading(true);

    // Create a new AbortController for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          mode: chatMode,
          // In web mode with a PDF attached, always send the filename.
          // Send pdfContext only when we have actual extracted text.
          ...(chatMode === "web" && webPdfFilename
            ? {
                pdfFilename: webPdfFilename,
                ...(webPdfContext ? { pdfContext: webPdfContext } : {}),
              }
            : {}),
        }),
      });

      if (!response.ok) {
        let errMsg = `HTTP error! status: ${response.status}`;
        try {
          const errBody = await response.json();
          if (errBody.error) errMsg = errBody.error;
        } catch {}

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `⚠️ **Server Error:** ${errMsg}` },
        ]);
        setIsLoading(false);
        return;
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let assistantText = "";
      let buffer = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        // Stop reading if the request was aborted
        if (controller.signal.aborted) break;

        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine.startsWith("data:")) continue;

          const json = trimmedLine.replace("data: ", "").trim();
          if (json === "[DONE]") continue;

          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;

            if (content) {
              assistantText += content;

              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: assistantText,
                };
                return updated;
              });
            }
          } catch {}
        }
      }

      // If stopped mid-stream, mark the truncated message
      if (controller.signal.aborted && assistantText) {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: assistantText + " *(stopped)*",
          };
          return updated;
        });
      }
    } catch (error: unknown) {
      // AbortError is expected when the user clicks stop — don't show an error message
      if (error instanceof Error && error.name === "AbortError") {
        console.info("[Stream] Request aborted by user.");
      } else {
        console.error("Streaming error:", error);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I'm having trouble connecting to the server.",
          },
        ]);
      }
    } finally {
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  // Handle initial query from URL (works whether messages were seeded or not)
  const didFireInitial = useRef(false);
  useEffect(() => {
    if (initialQuery && !didFireInitial.current && !isLoading) {
      didFireInitial.current = true;
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  // --- Helper Functions ---

  // Helper to render source chips inline within text
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderWithSources = (children: any, fullContent: string) => {
    if (!children) return null;

    if (typeof children !== "string") {
      if (Array.isArray(children)) {
        return children.map((child, i) => (
          <span key={i}>
            {typeof child === "string"
              ? renderWithSources(child, fullContent)
              : child}
          </span>
        ));
      }
      return children;
    }

    // Extract sources from the full content block
    const parts_meta = fullContent.split("\n\n---\n**Sources:**");
    const sourceBlock = parts_meta[1] || "";
    
    // Parse intelligent metadata if present (base64-encoded)
    let sourceMap = new Map();
    const metadataMatch = sourceBlock.match(/\[SOURCE_META:([A-Za-z0-9+/=]+)\]/);
    if (metadataMatch) {
      try {
        const decoded = atob(metadataMatch[1]);
        const metadata = JSON.parse(decoded);
        metadata.forEach((m: any) => {
          sourceMap.set(m.id.toString(), m);
        });
      } catch (e) {
        console.error("Failed to parse source metadata", e);
      }
    }

    // Fallback to basic parsing if no metadata or metadata failed
    if (sourceMap.size === 0) {
      const sourceLines = sourceBlock
        .split("\n")
        .filter((l) => l.trim().startsWith("•") || l.trim().startsWith("-"));
      
      sourceLines.forEach((line, idx) => {
        const content = line.replace(/^[•-]\s*/, "").trim();
        const isUrl = content.startsWith("http");
        sourceMap.set((idx + 1).toString(), {
          id: idx + 1,
          name: isUrl ? new URL(content).hostname : content,
          url: isUrl ? content : null,
          type: isUrl ? "web" : "pdf",
        });
      });
    }

    // Replace [Source ID: X] or [X] with chips
    const parts = children.split(/(\[Source ID:\s*\d+\]|\[\s*\d+\s*\]|\[\d+\])/gi);
    
    return parts.map((part, i) => {
      const match = part.match(/\[(?:Source ID:\s*)?(\s*\d+\s*)\]/i);
      if (match) {
        const id = match[1].trim();
        const source = sourceMap.get(id);
        if (source) {
          return (
            <span key={i} className="relative group inline-block">
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  if (source.url) {
                    window.open(source.url, "_blank");
                  } else {
                    const fileName = source.name.split(", page")[0].split(" (section")[0].trim();
                    setPreviewUrl(resolveUrl(`/uploads/${encodeURIComponent(fileName)}`));
                  }
                }}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/30 rounded-md text-[11px] font-bold text-red-700 dark:text-red-400 mx-0.5 cursor-pointer transition-all active:scale-95 shadow-sm align-middle leading-none"
              >
                {source.type === "web" ? (
                  <Globe size={11} className="text-blue-500" />
                ) : (
                  <FileText size={11} className="text-red-500" />
                )}
                {source.page ? `Page ${source.page}` : id}
              </span>
              
              {/* Tooltip / Highlight Preview */}
              {source.snippet && (
                <span style={{display:"block"}} className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 text-[12px] leading-relaxed text-zinc-600 dark:text-zinc-300 backdrop-blur-sm">
                  <span style={{display:"flex"}} className="font-bold text-zinc-900 dark:text-zinc-100 mb-1 items-center gap-2">
                    {source.type === "pdf" ? <FileText size={12} /> : <Globe size={12} />}
                    {source.name.split(",")[0].slice(0, 30)}
                  </span>
                  <span style={{display:"block"}} className="line-clamp-4 italic">
                    &ldquo;{source.snippet}...&rdquo;
                  </span>
                  <span style={{display:"block"}} className="mt-2 text-[10px] text-red-500 font-bold uppercase tracking-wider">
                    Click to view {source.type === "pdf" ? "document" : "source"}
                  </span>
                  <span style={{display:"block"}} className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white dark:border-t-[#1a1a1a]" />
                </span>
              )}
            </span>
          );
        }
        return part;
      }
      return part;
    });
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex h-screen bg-white text-black font-sans selection:bg-blue-50 overflow-hidden">

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className="flex-shrink-0 w-14 h-full bg-white border-r border-zinc-100 flex flex-col items-center py-4 gap-1 z-50">
        {/* Logo */}
        <Link
          href="/"
          className="w-9 h-9 bg-white rounded-xl flex items-center justify-center mb-4 hover:scale-110 transition-transform shadow shadow-white/10"
          title="Home"
        >
          <GraduationCap className="text-black w-5 h-5" />
        </Link>

        <div className="w-6 h-px bg-zinc-100 mb-2" />

        {/* Chat */}
        <Link
          href="/chat"
          title="Chat"
          className="group relative w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all hover:bg-blue-100 hover:scale-105"
        >
          <Brain className="w-5 h-5" />
          <span className="absolute left-full ml-3 px-2.5 py-1 bg-black text-white text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-1 group-hover:translate-x-0 shadow-lg">
            Chat
          </span>
        </Link>

        {/* News */}
        <Link
          href="/news"
          title="News"
          className="group relative w-10 h-10 flex items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-50 hover:text-black transition-all hover:scale-105"
        >
          <Newspaper className="w-5 h-5" />
          <span className="absolute left-full ml-3 px-2.5 py-1 bg-black text-white text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-1 group-hover:translate-x-0 shadow-lg">
            News
          </span>
        </Link>

        {/* Rankings */}
        <Link
          href="/rankings"
          title="Rankings"
          className="group relative w-10 h-10 flex items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-50 hover:text-black transition-all hover:scale-105"
        >
          <Trophy className="w-5 h-5" />
          <span className="absolute left-full ml-3 px-2.5 py-1 bg-black text-white text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-1 group-hover:translate-x-0 shadow-lg">
            Rankings
          </span>
        </Link>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-white transition-colors">
        {/* Modern GPT Header */}
        <header className="absolute top-0 w-full z-20 bg-transparent">
          <div className="px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-[15px] font-semibold text-black hover:bg-black/5 transition-colors">
                College Assistant
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar pt-14 pb-36 md:pb-48">
          {messages.filter((m) => !m.content.startsWith("ATTACHMENT")).length <=
            1 &&
            !isLoading &&
            !isUploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                <h1 className="text-2xl md:text-3xl tracking-tight font-medium text-center text-zinc-300 mb-64 px-4">
                  Which college are you exploring today?
                </h1>
              </div>
            )}

          {/* Centered Content Container */}
          <div className="max-w-3xl mx-auto px-4 md:px-6 space-y-6 md:space-y-10 relative z-10 w-full pt-6 md:pt-10">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) =>
                // Skip rendering the hardcoded first assistant message
                idx === 0 &&
                msg.role === "assistant" &&
                msg.content.includes("How can I help you today?") ? null : (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex flex-col group w-full",
                      msg.role === "user" ? "items-end" : "items-start",
                    )}
                  >
                    <div
                      className={cn(
                        "relative min-w-0 text-[14px] md:text-[15px] leading-6 md:leading-7",
                        msg.role === "user"
                          ? msg.content.startsWith("ATTACHMENT|")
                            ? "" // No background for the card itseld
                            : "bg-zinc-50 px-3 md:px-4 py-2 rounded-2xl max-w-[90%] md:max-w-[85%] text-black border border-zinc-100"
                          : "text-black w-full",
                      )}
                    >
                      {msg.content.startsWith("ATTACHMENT|") ? (
                        (() => {
                          const [, name, url] = msg.content.split("|");
                          return (
                            <div
                              onClick={() => setPreviewUrl(resolveUrl(url))}
                              className="bg-zinc-50 border border-zinc-100 rounded-xl p-2.5 flex items-center gap-3 w-full max-w-[280px] cursor-pointer hover:bg-zinc-100 transition-all group active:scale-[0.98] shadow-sm ml-auto"
                            >
                              <div className="w-10 h-10 bg-[#ef4444] rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                                <FileText size={20} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-semibold text-zinc-900 flex items-center justify-between">
                                  <span className="truncate pr-2">{name}</span>
                                  <ExternalLink
                                    size={12}
                                    className="text-zinc-400 opacity-50 group-hover:opacity-100"
                                  />
                                </div>
                                <div className="text-zinc-400 text-[10px] font-medium uppercase tracking-widest mt-0.5">
                                  PDF Document
                                </div>
                              </div>
                            </div>
                          );
                        })()
                      ) : !msg.content &&
                        msg.role === "assistant" &&
                        isLoading ? (
                        <div className="flex gap-1 items-center py-2 text-gray-400 italic text-xs animate-pulse">
                          {chatMode === "pdf" ? "Searching knowledge base..." : "Searching live web..."}
                        </div>
                      ) : msg.content.includes("\n\n---\n**Sources:**") ? (
                        <div className="space-y-4 md:space-y-6">
                          <div
                            className="prose prose-base md:prose-lg max-w-none 
                          prose-headings:text-black 
                          prose-h1:text-3xl md:prose-h1:text-4xl prose-h1:font-extrabold prose-h1:tracking-tight prose-h1:mt-8 md:prose-h1:mt-12 prose-h1:mb-6 md:prose-h1:mb-8
                          prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:font-bold prose-h2:tracking-tight prose-h2:mt-8 md:prose-h2:mt-10 prose-h2:mb-4 md:prose-h2:mb-6 prose-h2:border-b prose-h2:border-zinc-100 prose-h2:pb-2 md:prose-h2:pb-3
                          prose-h3:text-xl md:prose-h3:text-2xl prose-h3:font-semibold prose-h3:tracking-tight prose-h3:mt-6 md:prose-h3:mt-8 prose-h3:mb-3 md:prose-h3:mb-4
                          prose-p:text-[15px] md:prose-p:text-[16px] prose-p:leading-7 md:prose-p:leading-8 prose-p:text-zinc-700 prose-p:mb-4 md:prose-p:mb-6
                          prose-li:text-[15px] md:prose-li:text-[16px] prose-li:leading-7 md:prose-li:leading-8 prose-li:text-zinc-700 prose-li:mb-1.5 md:prose-li:mb-2
                          prose-strong:text-black prose-strong:font-bold
                          prose-table:w-full prose-table:my-6 md:prose-table:my-10 prose-table:border prose-table:border-zinc-100 prose-table:rounded-xl md:prose-table:rounded-2xl prose-table:block prose-table:overflow-x-auto md:prose-table:table
                          prose-th:bg-zinc-50 prose-th:px-3 md:prose-th:px-5 prose-th:py-3 md:prose-th:py-4 prose-th:font-bold prose-th:text-left prose-th:text-sm md:prose-th:text-base
                          prose-td:px-3 md:prose-td:px-5 prose-td:py-3 md:prose-td:py-4 prose-td:border-t prose-td:border-zinc-100 prose-td:text-sm md:prose-td:text-base
                        "
                          >
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({ children }) => (
                                  <p className="mb-6">
                                    {renderWithSources(children, msg.content)}
                                  </p>
                                ),
                                li: ({ children }) => (
                                  <li className="mb-2 leading-relaxed">
                                    {renderWithSources(children, msg.content)}
                                  </li>
                                ),
                                td: ({ children }) => (
                                  <td>
                                    {renderWithSources(children, msg.content)}
                                  </td>
                                ),
                              }}
                            >
                              {msg.content.split("\n\n---\n**Sources:**")[0]}
                            </ReactMarkdown>
                          </div>

                          {/* Hidden source block to keep it in the DOM but rely on inline chips */}
                          <div className="hidden">
                            {msg.content.split("\n\n---\n**Sources:**")[1]}
                          </div>
                        </div>
                      ) : (
                        <div className="prose prose-sm md:prose-base max-w-none prose-p:text-[15px] md:prose-p:text-[16px] prose-p:leading-7 md:prose-p:leading-8 prose-p:text-zinc-700 prose-li:text-[15px] md:prose-li:text-[16px] prose-li:leading-7 md:prose-li:leading-8 prose-li:text-zinc-700 shadow-none border-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => (
                                <p className="mb-4">
                                  {renderWithSources(children, msg.content)}
                                </p>
                              ),
                              li: ({ children }) => (
                                <li className="mb-2 leading-relaxed">
                                  {renderWithSources(children, msg.content)}
                                </li>
                              ),
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ),
              )}
            </AnimatePresence>

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex w-full mt-4"
              >
                <div className="flex gap-1.5 items-center py-2 text-gray-500">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} className="h-4" />
          </div>
        </main>

        {/* Input Dock - Centered Floating Pod when empty, fixed to bottom when chatting */}
        <div className={cn(
          "absolute left-0 right-0 p-2 sm:p-4 md:p-8 z-30 transition-all duration-700 ease-in-out pointer-events-none",
          messages.filter(m => !m.content.startsWith("ATTACHMENT")).length <= 1 && !isLoading && !isUploading
            ? "bottom-1/2 translate-y-1/2" 
            : "bottom-0 translate-y-0"
        )}>
          <div className="max-w-3xl mx-auto w-full pointer-events-auto">
                    <div className="relative rounded-[30px] bg-zinc-50 border border-zinc-200 focus-within:ring-0 transition-all shadow-none flex flex-col">
              {/* Plus Menu Dropdown (Moved outside overflow-hidden) */}
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    ref={menuRef}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: -8, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute bottom-full left-1 md:left-4 mb-2 w-60 md:w-64 bg-white rounded-[24px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-zinc-100 p-2 z-50 flex flex-col gap-0.5 overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        fileInputRef.current?.click();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-zinc-50 transition-colors text-left"
                    >
                      <Paperclip size={18} className="text-zinc-500" />
                      <div>
                        <span className="text-[14px] font-medium text-zinc-900 block">
                          {chatMode === "web" ? "Add PDF for context" : "Upload PDF"}
                        </span>
                        {chatMode === "web" && (
                          <span className="text-[11px] text-zinc-400">Enriches your web search query</span>
                        )}
                      </div>
                    </button>
                    
                    <div className="h-px bg-zinc-100 my-1 mx-2" />

                    <button
                      onClick={() => {
                        setChatMode("pdf");
                        setIsMenuOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors text-left",
                        chatMode === "pdf" ? "bg-red-50" : "hover:bg-zinc-50"
                      )}
                    >
                      <FileText size={18} className={chatMode === "pdf" ? "text-red-500" : "text-zinc-500"} />
                      <span className="text-[14px] font-medium text-zinc-900">PDF Mode</span>
                    </button>

                    <button
                      onClick={() => {
                        setChatMode("web");
                        setIsMenuOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors text-left",
                        chatMode === "web" ? "bg-blue-50" : "hover:bg-zinc-50"
                      )}
                    >
                      <Globe size={18} className={chatMode === "web" ? "text-blue-500" : "text-zinc-500"} />
                      <span className="text-[14px] font-medium text-zinc-900">Web Search Mode</span>
                    </button>

                    <button
                      onClick={() => {
                        setChatMode("compare");
                        setIsMenuOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors text-left",
                        chatMode === "compare" ? "bg-amber-50" : "hover:bg-zinc-50"
                      )}
                    >
                      <GitCompare size={18} className={chatMode === "compare" ? "text-amber-500" : "text-zinc-500"} />
                      <span className="text-[14px] font-medium text-zinc-900">Compare Mode</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative overflow-hidden rounded-[30px] flex flex-col">

                {/* Web-mode PDF context badge */}
                <AnimatePresence>
                  {chatMode === "web" && (webPdfFilename || isExtractingPdf) && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="px-4 pt-3"
                    >
                      <div className={cn(
                        "flex items-center gap-2 w-fit max-w-full md:max-w-[340px] px-3 py-2 rounded-xl border",
                        webPdfScanned && !isExtractingPdf
                          ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/40"
                          : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/40"
                      )}>
                        {isExtractingPdf ? (
                          <div className="w-3 h-3 rounded-full border-2 border-blue-400 border-t-transparent animate-spin flex-shrink-0" />
                        ) : webPdfScanned ? (
                          <span className="text-amber-500 flex-shrink-0 text-[13px]">⚠️</span>
                        ) : (
                          <Globe size={13} className="text-blue-500 flex-shrink-0" />
                        )}
                        <span className={cn(
                          "text-[12px] font-semibold truncate max-w-[160px]",
                          webPdfScanned && !isExtractingPdf
                            ? "text-amber-700 dark:text-amber-300"
                            : "text-blue-700 dark:text-blue-300"
                        )}>
                          {isExtractingPdf ? "Reading PDF..." : webPdfFilename}
                        </span>
                        {!isExtractingPdf && webPdfContext && !webPdfScanned && (
                          <span className="text-[10px] text-blue-500 font-medium whitespace-nowrap bg-blue-100 dark:bg-blue-800/40 px-1.5 py-0.5 rounded-full">Context ready</span>
                        )}
                        {!isExtractingPdf && webPdfScanned && (
                          <span className="text-[10px] text-amber-600 font-medium whitespace-nowrap bg-amber-100 dark:bg-amber-800/40 px-1.5 py-0.5 rounded-full" title="This PDF appears to be scanned. Search will use the filename as context.">Scanned PDF</span>
                        )}
                        {!isExtractingPdf && (
                          <button
                            onClick={() => { setWebPdfContext(null); setWebPdfFilename(null); setWebPdfScanned(false); }}
                            className={cn(
                              "ml-1 transition-colors flex-shrink-0",
                              webPdfScanned ? "text-amber-400 hover:text-amber-600" : "text-blue-400 hover:text-blue-600"
                            )}
                          >
                            <X size={11} strokeWidth={3} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Qdrant upload progress card (PDF mode only) */}
                <AnimatePresence>
                  {chatMode === "pdf" && (isUploading || file) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="px-4 pt-4"
                    >
                      <div className="relative w-fit min-w-0 md:min-w-[220px] max-w-full md:max-w-[300px] p-2.5 rounded-2xl bg-white dark:bg-[#212121] border border-[#e5e7eb] dark:border-[#404040] flex items-center gap-3 shadow-sm group">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden",
                            uploadProgress === 100
                              ? "bg-green-500"
                              : "bg-red-500",
                          )}
                        >
                          {uploadProgress === 100 ? (
                            <Check
                              size={20}
                              className="text-white"
                              strokeWidth={3}
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-white/80" />
                          )}
                          {isUploading && uploadProgress < 100 && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${uploadProgress}%` }}
                              className="absolute bottom-0 left-0 w-full bg-white/30"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="text-[13px] font-semibold text-[#0d0d0d] dark:text-[#ececec] truncate">
                            {file?.name || "Processing..."}
                          </div>
                          <div className="text-[12px] text-gray-500 font-medium">
                            {uploadProgress === 100
                              ? "Ready"
                              : `${Math.round(uploadProgress)}%`}
                          </div>
                        </div>

                        {!isUploading && (
                          <button
                            onClick={() => setFile(null)}
                            className="absolute -top-2 -right-2 p-1 bg-white dark:bg-[#404040] border border-gray-200 dark:border-gray-600 rounded-full text-[#0d0d0d] dark:text-[#ececec] hover:scale-110 transition-transform shadow-md"
                          >
                            <X size={10} strokeWidth={3} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-end gap-1 p-2">
                <input
                  type="file"
                  id="pdf-upload"
                  accept=".pdf"
                  multiple
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const selectedFiles = Array.from(e.target.files || []);
                    if (selectedFiles.length > 0) {
                      if (chatMode === "web") {
                        // Web mode: extract text only, don’t index into Qdrant
                        handleWebPdfAttach(selectedFiles[0]!);
                      } else {
                        // PDF mode: full Qdrant indexing pipeline
                        setFile(selectedFiles[0]!);
                        handleUpload(selectedFiles);
                      }
                    }
                    // Reset so same file can be re-selected
                    e.target.value = "";
                  }}
                />

                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  disabled={isUploading}
                  className={cn(
                    "p-3 mb-1 ml-1 text-gray-500 hover:text-black dark:hover:text-white transition-all disabled:opacity-30 rounded-full hover:bg-black/5 dark:hover:bg-white/10",
                    isMenuOpen && "bg-black/5 dark:bg-white/10 text-black dark:text-white rotate-45"
                  )}
                  title="Options"
                >
                  <Plus size={22} className="transition-transform duration-200" />
                </button>

                <textarea
                  rows={1}
                  className="flex-1 max-h-[200px] min-h-[48px] py-3 px-3 md:py-3.5 md:px-4 mb-1 bg-transparent text-[14px] md:text-[15px] resize-none outline-none overflow-y-auto leading-6 scrollbar-hide text-[#0d0d0d] dark:text-[#ECECEC] placeholder-gray-500 disabled:opacity-50"
                  placeholder={
                    isUploading
                      ? `Processing ${currentFileIndex || 1} of ${totalFiles || 1}...`
                      : isExtractingPdf
                        ? "Reading PDF context..."
                        : chatMode === "pdf"
                          ? "Ask about your uploaded PDFs..."
                          : webPdfContext
                          ? "Ask anything — I’ll search the web using your PDF as context..."
                          : chatMode === "compare"
                            ? "Compare colleges (e.g. IIT Delhi vs NIT Trichy)..."
                            : "Search the web for college info..."
                  }
                  value={input}
                  disabled={isLoading || isUploading}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />

                {/* Send / Stop button */}
                <AnimatePresence mode="wait" initial={false}>
                  {isLoading ? (
                    <motion.button
                      key="stop"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      onClick={handleStop}
                      className="p-2.5 mb-1.5 mr-1.5 rounded-full bg-black dark:bg-white text-white dark:text-black shadow-sm active:scale-90 transition-all duration-200 flex items-center justify-center"
                      title="Stop generating"
                    >
                      {/* Stop icon — filled square */}
                      <span className="w-[14px] h-[14px] rounded-[3px] bg-current block" />
                    </motion.button>
                  ) : (
                    <motion.button
                      key="send"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => handleSend()}
                      disabled={!input.trim()}
                      className={cn(
                        "p-2.5 mb-1.5 mr-1.5 rounded-full transition-all duration-200 flex items-center justify-center",
                        input.trim() && !isUploading
                          ? "bg-black dark:bg-[#ffffff] text-white dark:text-[#171717] shadow-sm active:scale-90"
                          : "bg-[#e5e5e5] dark:bg-[#404040] text-[#a3a3a3] dark:text-[#212121]",
                      )}
                    >
                      <ArrowUp size={18} strokeWidth={2.5} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <p className="mt-2 text-center text-[10px] text-gray-500 font-medium">
              College Assistant can make mistakes. Check important info.
            </p>
          </div>
        </div>

        {/* PDF Preview Overlay */}
        <AnimatePresence>
          {previewUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-0 md:p-10"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-[#1a1a1a] w-full h-full max-w-6xl rounded-none md:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              >
                <div className="h-12 md:h-14 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 md:px-6 bg-white dark:bg-[#1a1a1a]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500 rounded-lg">
                      <FileText size={16} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold truncate max-w-[200px]">
                      Previewing Document
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <ExternalLink size={20} />
                    </a>
                    <button
                      onClick={() => setPreviewUrl(null)}
                      className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>
                <div className="flex-1 bg-gray-100 dark:bg-black relative">
                  <iframe
                    src={previewUrl}
                    className="w-full h-full border-none"
                    title="PDF Preview"
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="w-8 h-8 border-4 border-zinc-700 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
