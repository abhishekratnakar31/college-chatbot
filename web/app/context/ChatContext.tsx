"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type ChatMode = "pdf" | "web" | "compare";

interface ChatContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  chatMode: ChatMode;
  setChatMode: React.Dispatch<React.SetStateAction<ChatMode>>;
  webPdfFilename: string | null;
  setWebPdfFilename: React.Dispatch<React.SetStateAction<string | null>>;
  selectedLanguage: string;
  setSelectedLanguage: React.Dispatch<React.SetStateAction<string>>;
  isInitialized: boolean;
  setIsInitialized: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatMode, setChatMode] = useState<ChatMode>("web");
  const [webPdfFilename, setWebPdfFilename] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("auto");
  const [isInitialized, setIsInitialized] = useState(false);

  return (
    <ChatContext.Provider
      value={{
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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
