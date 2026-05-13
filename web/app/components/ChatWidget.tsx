"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, 
  X, 
  Send, 
  Loader2, 
  Bot, 
  User, 
  ArrowUp,
  Volume2,
  VolumeX,
  ChevronDown,
  Mic,
  Crosshair
} from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4006").replace("localhost", "127.0.0.1");
const cn = (...inputs: any[]) => inputs.filter(Boolean).join(" ");

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatWidgetProps {
  collegeName: string;
  collegeId?: string;
  logo?: string;
}

export function ChatWidget({ collegeName, collegeId, logo }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi! I'm your **${collegeName} AI Assistant**. Ask me anything about admissions, placements, or campus life at ${collegeName}!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef("");
  const shouldSubmitOnEndRef = useRef(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (textToUse?: string) => {
    const text = textToUse || input;
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          mode: "web",
          contextHint: collegeName,
        }),
      });

      if (!response.ok) throw new Error("Failed to connect to assistant");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantReply = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.replace("data: ", "").trim();
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  assistantReply += content;
                  setMessages((prev) => {
                    const last = prev[prev.length - 1];
                    if (last && last.role === "assistant") {
                      return [...prev.slice(0, -1), { ...last, content: assistantReply }];
                    }
                    return prev;
                  });
                }
              } catch (e) {}
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again later." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    if (isRecordingVoice && recognitionRef.current) {
      shouldSubmitOnEndRef.current = true;
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
      for (let i = 0; i < results.length; i++) {
        transcriptSegments.push(results[i][0].transcript.trim());
      }

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
      if (shouldSubmitOnEndRef.current) {
        const textToSubmit = finalTranscriptRef.current;
        if (textToSubmit && textToSubmit.trim() !== "") {
          handleSend(textToSubmit);
          finalTranscriptRef.current = "";
        }
        shouldSubmitOnEndRef.current = false;
      }
      setIsRecordingVoice(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSpeak = async (text: string, index: number) => {
    if (isSpeaking === index) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    window.speechSynthesis.cancel();
    setIsSpeaking(index);

    const cleanText = text.replace(/\[SOURCE_META:.*?\]/g, "").replace(/\*\*/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => setIsSpeaking(null);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[300]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "mb-4 bg-[#050505]/95 backdrop-blur-3xl border border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col transition-all duration-500",
              "fixed inset-4 bottom-24 sm:inset-auto sm:relative sm:w-[420px] sm:h-[620px] sm:rounded-[2.5rem] rounded-3xl"
            )}
          >
            {/* Header */}
            <div className="p-5 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 relative group">
                  <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {logo ? (
                    <img src={logo} alt={collegeName} className="w-full h-full object-cover" />
                  ) : (
                    <Bot className="text-white/40" size={24} />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">AI COUNSELOR</p>
                  </div>
                  <p className="text-base font-bold text-white truncate max-w-[150px] sm:max-w-[200px] tracking-tight">{collegeName}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-3 hover:bg-white/5 rounded-2xl text-white/20 hover:text-white transition-all group"
                >
                  <ChevronDown size={22} className="group-hover:translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-white"
            >
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={cn(
                    "max-w-[85%] relative group px-5 py-3.5 text-sm transition-all",
                    msg.role === "user" 
                      ? "bg-white text-black rounded-[1.5rem] rounded-tr-none font-semibold shadow-xl shadow-white/5" 
                      : "text-zinc-300 bg-white/5 border border-white/5 rounded-[1.5rem] rounded-tl-none"
                  )}>
                    {msg.role === "assistant" && (
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content || "..."}
                        </ReactMarkdown>
                        {msg.content && (
                          <div className="mt-4 flex items-center gap-2">
                            <button
                              onClick={() => handleSpeak(msg.content, idx)}
                              className={cn(
                                "p-2 rounded-xl border transition-all flex items-center gap-2",
                                isSpeaking === idx 
                                  ? "bg-blue-500/10 border-blue-500/30 text-blue-400" 
                                  : "bg-white/5 border-white/10 text-white/30 hover:text-white hover:bg-white/10"
                              )}
                            >
                              {isSpeaking === idx ? <VolumeX size={14} /> : <Volume2 size={14} />}
                              <span className="text-[10px] font-bold uppercase tracking-widest">
                                {isSpeaking === idx ? "Stop" : "Listen"}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {msg.role === "user" && msg.content}
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1].role === "user" && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/5 rounded-2xl px-4 py-3 flex items-center gap-3">
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Analyzing Data...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-5 border-t border-white/5 bg-gradient-to-t from-white/5 to-transparent">
              <div className="relative flex items-center gap-3">
                <div className="relative flex-1 group">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder={isRecordingVoice ? "Listening to signal..." : "Ask me anything..."}
                    className={cn(
                      "w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 px-6 pr-14 text-sm text-white placeholder:text-white/20 outline-none transition-all",
                      "focus:border-blue-500/30 focus:bg-zinc-900 focus:ring-4 focus:ring-blue-500/5",
                      isRecordingVoice && "border-rose-500/50 bg-rose-500/5"
                    )}
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2.5 top-2.5 w-11 h-11 bg-white text-black rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-20 transition-all shadow-lg"
                  >
                    <ArrowUp size={20} strokeWidth={3} />
                  </button>
                </div>
                
                <button
                  onClick={startVoiceRecording}
                  className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all border",
                    isRecordingVoice 
                      ? "bg-rose-500 border-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse" 
                      : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Mic size={22} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 border",
          isOpen 
            ? "bg-white border-white text-black rotate-90" 
            : "bg-black border-white/10 text-white",
          isOpen && "hidden sm:flex"
        )}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>
    </div>
  );
}
