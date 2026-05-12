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
  Mic
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4006").replace("localhost", "127.0.0.1");

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
    <div className="fixed bottom-6 right-6 z-[200]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden">
                  {logo ? (
                    <img src={logo} alt={collegeName} className="w-full h-full object-cover" />
                  ) : (
                    <Bot className="text-white/60" size={20} />
                  )}
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-white/40">AI Counselor</p>
                  <p className="text-sm font-bold text-white truncate max-w-[180px]">{collegeName}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"
              >
                <ChevronDown size={20} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-white"
            >
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] relative group ${
                    msg.role === "user" 
                      ? "bg-white text-black rounded-2xl rounded-tr-none px-4 py-2 text-sm font-medium" 
                      : "text-zinc-300"
                  }`}>
                    {msg.role === "assistant" && (
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content || "..."}
                        </ReactMarkdown>
                        {msg.content && (
                          <button
                            onClick={() => handleSpeak(msg.content, idx)}
                            className={`mt-2 p-1 rounded-md border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-all ${
                              isSpeaking === idx ? "text-blue-400 border-blue-400/30" : ""
                            }`}
                          >
                            {isSpeaking === idx ? <VolumeX size={12} /> : <Volume2 size={12} />}
                          </button>
                        )}
                      </div>
                    )}
                    {msg.role === "user" && msg.content}
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1].role === "user" && (
                <div className="flex justify-start">
                  <div className="bg-white/5 rounded-2xl p-3 flex items-center gap-2">
                    <Loader2 className="w-3 h-3 text-white/40 animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Searching...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/5 bg-white/5">
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder={isRecordingVoice ? "Listening..." : "Ask a question..."}
                    className={`w-full bg-[#121212] border border-white/5 rounded-full py-3 px-5 pr-12 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/20 transition-all ${
                      isRecordingVoice ? "border-blue-500/50 ring-2 ring-blue-500/20" : ""
                    }`}
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-1.5 p-2 bg-white text-black rounded-full hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
                  >
                    <ArrowUp size={16} strokeWidth={3} />
                  </button>
                </div>
                
                <button
                  onClick={startVoiceRecording}
                  className={`p-3 rounded-full transition-all ${
                    isRecordingVoice 
                      ? "bg-rose-500 text-white animate-pulse" 
                      : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Mic size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
          isOpen ? "bg-white text-black rotate-90" : "bg-black text-white border border-white/10"
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>
    </div>
  );
}
