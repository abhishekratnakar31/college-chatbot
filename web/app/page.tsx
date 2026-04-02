"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  Send,
  Bot,
  User,
  Sparkles,
  ArrowRight,
  MessageSquare,
  RefreshCw,
  Info,
  Plus,
  Trash2,
  FileText,
  Pencil,
  Edit3,
  Check,
  X,
  Globe,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Paperclip,
  Clock,
  Calendar,
  ArrowUp,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Conversation = {
  id: string;
  title: string;
  created_at: string;
};

const SUGGESTED_QUESTIONS = [
  "What are the admission requirements?",
  "Tell me about the campus life.",
  "What scholarships are available?",
  "How do I apply for financial aid?",
];

export default function ChatPage() {
  // --- States ---
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your College Assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  // --- Refs ---
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // --- Persistence & Initialization ---
  useEffect(() => {
    const savedId = localStorage.getItem("currentConversationId");
    if (savedId) {
      setCurrentConversationId(savedId);
    } else {
      setCurrentConversationId(crypto.randomUUID());
    }
    loadConversations();
  }, []);

  useEffect(() => {
    if (currentConversationId) {
      localStorage.setItem("currentConversationId", currentConversationId);
      loadConversationHistory(currentConversationId);
    }
  }, [currentConversationId]);

  // --- API Functions ---
  const loadConversations = async () => {
    try {
      const res = await fetch("http://localhost:4000/conversations");
      const data = await res.json();
      setConversations(data);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  };

  const loadConversationHistory = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:4000/conversations/${id}`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        setMessages(data);
      } else {
        setMessages([
          {
            role: "assistant",
            content: "Hello! I'm your College Assistant. How can I help you today?",
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  };

  const createNewChat = () => {
    const newId = crypto.randomUUID();
    setCurrentConversationId(newId);
    setMessages([
      {
        role: "assistant",
        content: "Hello! This is a new chat. How can I help you today?",
      },
    ]);
  };

  const deleteConversation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this conversation?")) return;

    try {
      await fetch(`http://localhost:4000/conversations/${id}`, {
        method: "DELETE",
      });
      
      if (currentConversationId === id) {
        createNewChat();
      }
      loadConversations();
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  const renameConversation = async (id: string) => {
    if (!editingTitle.trim()) {
      setEditingId(null);
      return;
    }

    try {
      await fetch(`http://localhost:4000/conversations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editingTitle }),
      });
      setEditingId(null);
      loadConversations();
    } catch (err) {
      console.error("Failed to rename conversation:", err);
    }
  };

  const handleUpload = async (newFile?: File) => {
    const fileToUpload = newFile || file;
    if (!fileToUpload) return;
    
    setIsUploading(true);
    setUploadStatus("Uploading & parsing PDF...");
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append("file", fileToUpload);

    try {
      const res = await fetch("http://localhost:4000/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
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
            if (parsed.status === "started") {
              setUploadStatus(`Generating embeddings for ${parsed.total} chunks...`);
              setUploadProgress(5);
            } else if (parsed.status === "embedding") {
              setUploadStatus(`Vectorizing chunk ${parsed.progress} of ${parsed.total}...`);
              setUploadProgress((parsed.progress / parsed.total) * 100);
            } else if (parsed.status === "done") {
              setUploadStatus(`Successfully indexed ${parsed.chunksCount} chunks!`);
              setUploadProgress(100);
            } else if (parsed.status === "error") {
              setUploadStatus(`Error: ${parsed.message}`);
            }
          } catch {
          }
        }
      }
    } catch (err) {
      setUploadStatus(`Failed to upload and index PDF`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    let activeConvId = currentConversationId;
    if (!activeConvId) {
      activeConvId = crypto.randomUUID();
      setCurrentConversationId(activeConvId);
    }

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

    try {
      const response = await fetch("http://localhost:4000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: currentInput, conversationId: activeConvId }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let assistantText = "";
      let buffer = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
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
          } catch {
          }
        }
      }
      loadConversations();
    } catch (error) {
      console.error("Streaming error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting to the server.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Date Grouping Logic ---
  const groupedConversations = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);

    const groups: { [key: string]: Conversation[] } = {
      Today: [],
      Yesterday: [],
      "Previous 7 Days": [],
      Older: [],
    };

    conversations.forEach((conv) => {
      const date = new Date(conv.created_at);
      if (date >= today) groups.Today.push(conv);
      else if (date >= yesterday) groups.Yesterday.push(conv);
      else if (date >= last7Days) groups["Previous 7 Days"].push(conv);
      else groups.Older.push(conv);
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [conversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex h-screen bg-[#ffffff] dark:bg-[#212121] text-[#0d0d0d] dark:text-[#ececec] font-sans selection:bg-orange-500/30 overflow-hidden">
      {/* Sidebar - Modern GPT style */}
      <AnimatePresence mode="popLayout" initial={false}>
        {isSidebarVisible && (
          <motion.aside
            initial={{ width: 0 }}
            animate={{ width: 260 }}
            exit={{ width: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-full bg-[#f9f9f9] dark:bg-[#171717] flex flex-col relative z-30 overflow-hidden whitespace-nowrap"
          >
            <div className="p-3 flex items-center gap-1">
              <button 
                onClick={() => setIsSidebarVisible(false)}
                className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-white transition-colors"
                title="Close Sidebar"
              >
                <PanelLeftClose size={20} />
              </button>
              <button
                onClick={createNewChat}
                className="flex-1 flex items-center justify-between px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all text-sm font-medium border border-transparent"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white dark:bg-[#212121] flex items-center justify-center flex-shrink-0">
                     <Bot size={16} />
                  </div>
                  New chat
                </div>
                <Edit3 size={16} className="text-gray-500 opacity-0 group-hover:opacity-100" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 space-y-6 custom-scrollbar pb-10">
              {groupedConversations.map(([group, items]) => (
                <div key={group} className="space-y-1">
                  <div className="px-3 py-2 text-[11px] font-bold text-white uppercase tracking-widest">{group}</div>
                  {items.map((conv) => (
                    <div
                      key={conv.id}
                      className={cn(
                        "group relative flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-all cursor-pointer",
                        currentConversationId === conv.id
                          ? "bg-[#e5e7eb] dark:bg-[#262626] text-white dark:text-[#ECECEC] font-medium"
                          : "text-white hover:bg-black/5 dark:hover:bg-white/5"
                      )}
                      onClick={() => editingId !== conv.id && setCurrentConversationId(conv.id)}
                    >
                      <div className="truncate flex-1">
                        {editingId === conv.id ? (
                          <input
                            autoFocus
                            className="bg-transparent border-none outline-none w-full py-0"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") renameConversation(conv.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            onBlur={() => renameConversation(conv.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          conv.title || "New Chat"
                        )}
                      </div>

                      <div className={cn(
                        "flex items-center gap-1 transition-opacity",
                        currentConversationId === conv.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      )}>
                         {editingId === conv.id ? (
                            <button onClick={(e) => { e.stopPropagation(); renameConversation(conv.id); }} className="p-1 hover:text-green-500">
                               <Check size={14} />
                            </button>
                         ) : (
                            <button onClick={(e) => { e.stopPropagation(); setEditingId(conv.id); setEditingTitle(conv.title || "New Chat"); }} className="p-1 hover:text-gray-900 dark:hover:text-white">
                               <Pencil size={14} />
                            </button>
                         )}
                         <button onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }} className="p-1 hover:text-red-500">
                            <Trash2 size={14} />
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="p-3 bg-[#f9f9f9] dark:bg-[#171717]">
               <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-sm font-medium">
                  <div className="w-7 h-7 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-bold">
                    AR
                  </div>
                  <div className="flex-1 truncate">
                    Student User
                  </div>
               </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-white dark:bg-[#212121] transition-colors">
        {/* Modern GPT Header */}
        <header className="absolute top-0 w-full z-20 bg-transparent">
           <div className="px-4 h-14 flex items-center justify-between">
              <div className="flex items-center gap-2">
                 {!isSidebarVisible && (
                   <button onClick={() => setIsSidebarVisible(true)} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 transition-colors" title="Open Sidebar">
                      <PanelLeftOpen size={20} />
                   </button>
                 )}
                 
                 <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-[15px] font-semibold text-[#0d0d0d] dark:text-[#ececec] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    College Assistant 
                    
                   
                 </button>
              </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar pt-14 pb-48">
          {messages.length <= 1 && !isLoading && !file && !isUploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
               <h1 className="text-3xl tracking-tight font-medium text-[#0d0d0d] dark:text-[#ececec] mb-8">Which college are you exploring today?</h1>
            </div>
          )}

          {/* Centered Content Container */}
          <div className="max-w-3xl mx-auto px-4 md:px-6 space-y-10 relative z-10 w-full pt-10">
            
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                // Skip rendering the hardcoded first assistant message
                (idx === 0 && msg.role === "assistant" && msg.content.includes("How can I help you today?")) ? null : (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex flex-col group w-full",
                    msg.role === "user" ? "items-end" : "items-start"
                  )}
                >

                  <div className={cn(
                    "relative min-w-0 text-[15px] leading-7",
                    msg.role === "user" 
                      ? "bg-[#f4f4f4] dark:bg-[#2f2f2f] px-5 py-2.5 rounded-3xl max-w-[70%] text-[#0d0d0d] dark:text-[#ececec]" 
                      : "text-[#0d0d0d] dark:text-[#ececec] w-full"
                  )}>
                    {!msg.content && msg.role === "assistant" && isLoading ? (
                       <div className="flex gap-1 items-center py-2 text-gray-400 italic text-xs animate-pulse">
                          Searching knowledge base and web...
                       </div>
                    ) : msg.content.includes("\n\n---\n**Sources:**") ? (
                      <div className="space-y-6">
                        <div className="prose dark:prose-invert prose-sm max-w-none">
                          <ReactMarkdown>{msg.content.split("\n\n---\n**Sources:**")[0]}</ReactMarkdown>
                        </div>
                        
                        {/* Source Shelf - Modern UI */}
                        <div className="pt-4 mt-6">
                           <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                              <Sparkles size={14} />
                              Verified Sources
                           </div>
                           <div className="flex flex-wrap gap-2">
                              {msg.content.split("\n\n---\n**Sources:**")[1]?.split("\n").filter(l => l.trim().startsWith("•")).map((source, sIdx) => {
                                const sourceContent = source.replace("• ", "").trim();
                                const isUrl = sourceContent.startsWith("http");
                                
                                return (
                                  <div key={sIdx} className="group/chip flex items-center gap-2 px-3 py-1.5 bg-[#f9f9f9] dark:bg-[#2f2f2f] rounded-xl text-[12px] font-medium transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 border-none">
                                    {isUrl ? <Globe size={14} className="text-blue-500" /> : <FileText size={14} className="text-orange-500" />}
                                    <span className="max-w-[150px] truncate underline decoration-dotted decoration-gray-300 underline-offset-4">
                                      {isUrl ? new URL(sourceContent).hostname : sourceContent}
                                    </span>
                                    {isUrl && (
                                       <a href={sourceContent} target="_blank" rel="noreferrer" className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-50 group-hover/chip:opacity-100 transition-opacity">
                                          <ExternalLink size={10} />
                                       </a>
                                    )}
                                  </div>
                                );
                              })}
                           </div>
                        </div>
                      </div>
                    ) : (
                      <div className="prose dark:prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </motion.div>
                )
              ))}
            </AnimatePresence>

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-full mt-4">
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

        {/* Input Dock - Centered Floating Pod */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 z-30 pointer-events-none">
          <div className="max-w-3xl mx-auto w-full pointer-events-auto">
            
            {/* Starter Prompts */}
            {messages.length === 1 && !isLoading && !file && !isUploading && (
              <div className="flex flex-wrap gap-2 mb-8 justify-center">
                 {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleSend(q)}
                      className="px-4 py-2 bg-white dark:bg-[#262626] border border-[#e5e7eb] dark:border-[#404040] rounded-xl text-xs font-semibold text-[#171717] dark:text-[#ECECEC] hover:bg-black/5 dark:hover:bg-white/10 transition-all shadow-sm active:scale-95"
                    >
                      {q}
                    </button>
                 ))}
              </div>
            )}

            <div className="relative overflow-hidden rounded-[30px] bg-[#f4f4f4] dark:bg-[#2f2f2f] focus-within:ring-0 transition-all shadow-none flex flex-col">
              
              {/* Inline Upload Progress inside Input */}
              <AnimatePresence>
                 {(isUploading || file) && (
                   <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="px-4 pt-4"
                   >
                     <div className="relative w-fit min-w-[220px] max-w-[300px] p-2.5 rounded-2xl bg-white dark:bg-[#212121] border border-[#e5e7eb] dark:border-[#404040] flex items-center gap-3 shadow-sm group">
                        <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                           <div className="w-5 h-5 rounded-full border-2 border-white/80" />
                           {isUploading && (
                              <motion.div initial={{ height: 0 }} animate={{ height: `${uploadProgress}%` }} className="absolute bottom-0 left-0 w-full bg-white/30" />
                           )}
                        </div>
                        <div className="flex-1 min-w-0 pr-4">
                           <div className="text-[13px] font-semibold text-[#0d0d0d] dark:text-[#ececec] truncate">
                             {file?.name || "Processing..."}
                           </div>
                           <div className="text-[12px] text-gray-500 font-medium">
                              {isUploading ? `${Math.round(uploadProgress)}%` : "PDF"}
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

              <div className="flex items-end gap-1 p-2">
                <input 
                  type="file" 
                  id="pdf-upload" 
                  accept=".pdf" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={(e) => {
                    const selected = e.target.files?.[0] || null;
                    setFile(selected);
                    if (selected) {
                      handleUpload(selected);
                    }
                  }} 
                />
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-3 mb-1 ml-1 text-gray-500 hover:text-black dark:hover:text-white transition-colors disabled:opacity-30 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                  title="Attach PDF"
                >
                   <Plus size={22} />
                </button>
                
                <textarea
                  rows={1}
                  className="flex-1 max-h-[200px] min-h-[48px] py-3.5 px-3 mb-1 bg-transparent text-[15px] resize-none outline-none overflow-y-auto leading-6 scrollbar-hide text-[#0d0d0d] dark:text-[#ECECEC] placeholder-gray-500"
                  placeholder="Message College Assistant"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className={cn(
                    "p-2.5 mb-1.5 mr-1.5 rounded-full transition-all duration-200 flex items-center justify-center",
                    input.trim() 
                      ? "bg-black dark:bg-[#ffffff] text-white dark:text-[#171717] shadow-sm active:scale-90" 
                      : "bg-[#e5e5e5] dark:bg-[#404040] text-[#a3a3a3] dark:text-[#212121]"
                  )}
                >
                  <ArrowUp size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>
            
            <p className="mt-2 text-center text-[10px] text-gray-500 font-medium">
               College Assistant can make mistakes. Check important info.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
