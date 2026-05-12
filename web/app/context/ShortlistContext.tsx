"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface College {
  id: number;
  college?: string;
  city?: string;
  state: string;
  nirf_rank?: number | null;
  avg_package?: number;
  nirf_category?: string;
  logo?: string;
}

interface ShortlistContextType {
  shortlist: College[];
  addToShortlist: (college: College) => void;
  removeFromShortlist: (collegeId: number) => void;
  isInShortlist: (collegeId: number) => boolean;
}

const ShortlistContext = createContext<ShortlistContextType | undefined>(undefined);

export function ShortlistProvider({ children }: { children: React.ReactNode }) {
  const [shortlist, setShortlist] = useState<College[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('academia_shortlist');
    if (saved) {
      try {
        setShortlist(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse shortlist", e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('academia_shortlist', JSON.stringify(shortlist));
  }, [shortlist]);

  const addToShortlist = (college: College) => {
    setShortlist((prev) => {
      if (prev.find((c) => c.id === college.id)) return prev;
      return [...prev, college];
    });
  };

  const removeFromShortlist = (collegeId: number) => {
    setShortlist((prev) => prev.filter((c) => c.id !== collegeId));
  };

  const isInShortlist = (collegeId: number) => {
    return shortlist.some((c) => c.id === collegeId);
  };

  return (
    <ShortlistContext.Provider value={{ shortlist, addToShortlist, removeFromShortlist, isInShortlist }}>
      {children}
    </ShortlistContext.Provider>
  );
}

export function useShortlist() {
  const context = useContext(ShortlistContext);
  if (context === undefined) {
    throw new Error('useShortlist must be used within a ShortlistProvider');
  }
  return context;
}
