"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Book, Terminal, Database, ChevronRight, 
  Cpu, Layers, Zap, Globe, ShieldCheck, 
  Activity, Search, MessageSquare, Box,
  Newspaper
} from "lucide-react";

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black">
      {/* Cinematic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/[0.03] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/[0.02] blur-[120px] rounded-full" />
      </div>

      {/* ── Header & Breadcrumbs ── */}
      <nav className="relative z-10 p-8 md:p-12 border-b border-white/5 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
            <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
            <ChevronRight size={10} />
            <span className="text-white/40">Support</span>
            <ChevronRight size={10} />
            <span className="text-white/60">System Documentation</span>
          </div>
          <Link 
            href="/support/contact" 
            className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-blue-400 transition-colors px-4 py-2 border border-white/10 rounded-full hover:bg-white/5"
          >
            Open Ticket →
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        {/* Hero Section */}
        <header className="space-y-12 mb-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-[0_0_80px_rgba(255,255,255,0.15)]"
          >
            <Book className="text-black w-10 h-10" />
          </motion.div>
          <div className="space-y-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-7xl md:text-9xl font-serif font-bold tracking-tighter leading-none"
            >
              System <br />
              <span className="text-zinc-800 italic">Architecture</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-500 text-2xl md:text-3xl font-medium max-w-3xl leading-tight"
            >
              A deep-dive into the Neural-V8 intelligence layer, our autonomous scraper network, and the high-fidelity data synchronization pipeline.
            </motion.p>
          </div>
        </header>

        {/* ── 01. Platform Overview ── */}
        <section className="space-y-24 mb-48">
          <div className="grid lg:grid-cols-2 gap-24 items-start">
            <div className="space-y-10">
              <div className="flex items-center gap-3">
                <Box className="text-blue-500 w-5 h-5" />
                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-500">01 / Project Core</h2>
              </div>
              <h3 className="text-5xl font-serif font-bold text-white italic">The Intelligence Hub Philosophy</h3>
              <div className="space-y-6 text-zinc-400 text-lg leading-relaxed">
                <p>
                  AcademiaAI is not just a chatbot; it is a unified **Intelligence Operating System** for the academic world. Built on the principle of "Data-First Decision Making," the platform consolidates millions of disparate data points from thousands of institutions into a singular, actionable interface.
                </p>
                <p>
                  Our architecture is designed to solve the "Stale Data Problem" prevalent in higher education portals. By combining high-frequency scraping with a neural reasoning layer, we provide students with information that is not only accurate but contextually relevant to their unique academic profile.
                </p>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <img 
                src="/docs/architecture.png" 
                alt="Architecture Overview" 
                className="rounded-[3rem] border border-white/10 shadow-2xl relative z-10 hover:scale-[1.02] transition-transform duration-700"
              />
              <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-zinc-600 text-center">Fig 1.0: Global Intelligence Flow Architecture</p>
            </div>
          </div>
        </section>

        {/* ── 02. Neural-V8 Engine ── */}
        <section className="space-y-24 mb-48">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="order-2 lg:order-1 relative group">
              <div className="absolute inset-0 bg-purple-500/10 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <img 
                src="/docs/neural_engine.png" 
                alt="Neural Engine" 
                className="rounded-[3rem] border border-white/10 shadow-2xl relative z-10 hover:scale-[1.02] transition-transform duration-700"
              />
              <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-zinc-600 text-center">Fig 2.0: Neural-V8 Inference & Correlation Node</p>
            </div>
            <div className="space-y-10 order-1 lg:order-2">
              <div className="flex items-center gap-3">
                <Cpu className="text-purple-500 w-5 h-5" />
                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-purple-500">02 / Neural Processing</h2>
              </div>
              <h3 className="text-5xl font-serif font-bold text-white italic">Neural-V8: Reasoning Over Static Data</h3>
              <div className="space-y-6 text-zinc-400 text-lg leading-relaxed">
                <p>
                  At the heart of AcademiaAI lies **Neural-V8**, our proprietary inference engine. Unlike standard LLMs that merely retrieve text, Neural-V8 performs dynamic correlation between historical cutoffs, real-time news trends, and user-provided academic metrics.
                </p>
                <p>
                  When a user asks a question, the engine performs a **multi-hop retrieval**:
                </p>
                <ul className="space-y-4 pt-4">
                  <li className="flex gap-4 items-start">
                    <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                      <span className="text-[10px] font-bold text-white/40">1</span>
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Intent Extraction</p>
                      <p className="text-xs text-zinc-600">Dissecting the user's query into technical constraints (rank, category, budget).</p>
                    </div>
                  </li>
                  <li className="flex gap-4 items-start">
                    <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                      <span className="text-[10px] font-bold text-white/40">2</span>
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Vector Retrieval</p>
                      <p className="text-xs text-zinc-600">Searching our Qdrant vector store for semantic matches in our 1M+ article corpus.</p>
                    </div>
                  </li>
                  <li className="flex gap-4 items-start">
                    <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                      <span className="text-[10px] font-bold text-white/40">3</span>
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Deterministic Fusion</p>
                      <p className="text-xs text-zinc-600">Merging vector results with hard facts from our PostgreSQL institutional database.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── 03. Autonomous Scraper Network ── */}
        <section className="space-y-24 mb-48">
          <div className="grid lg:grid-cols-2 gap-24 items-start">
            <div className="space-y-10">
              <div className="flex items-center gap-3">
                <Activity className="text-emerald-500 w-5 h-5" />
                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-500">03 / Autonomous Sync</h2>
              </div>
              <h3 className="text-5xl font-serif font-bold text-white italic">Real-Time Data Ingestion</h3>
              <div className="space-y-6 text-zinc-400 text-lg leading-relaxed">
                <p>
                  Our scraper network is a distributed cluster of micro-agents that perform perpetual surveillance on the academic web. This isn't just basic scraping; it's **Intelligent Extraction**.
                </p>
                <p>
                  **The Pipeline:**
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                  <div className="p-8 bg-zinc-900/30 border border-zinc-800 rounded-3xl space-y-4">
                    <Globe className="text-zinc-500 w-5 h-5" />
                    <h4 className="text-sm font-bold text-white">Institutional Watchdog</h4>
                    <p className="text-xs text-zinc-600 leading-relaxed">Scans 2,500+ official university notice boards every 60 minutes for admission changes.</p>
                  </div>
                  <div className="p-8 bg-zinc-900/30 border border-zinc-800 rounded-3xl space-y-4">
                    <Newspaper className="text-zinc-500 w-5 h-5" />
                    <h4 className="text-sm font-bold text-white">Media Intelligence</h4>
                    <p className="text-xs text-zinc-600 leading-relaxed">Aggregates academic news from mainstream media outlets and niche educational forums.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <img 
                src="/docs/data_pipeline.png" 
                alt="Data Pipeline" 
                className="rounded-[3rem] border border-white/10 shadow-2xl relative z-10 hover:scale-[1.02] transition-transform duration-700"
              />
              <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-zinc-600 text-center">Fig 3.0: High-Frequency Synchronization Tunnel</p>
            </div>
          </div>
        </section>

        {/* ── 04. Tech Stack ── */}
        <section className="space-y-24 mb-48">
          <div className="text-center space-y-6">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500">04 / Technology Stack</h2>
            <h3 className="text-5xl font-serif font-bold text-white italic">Built for the Next Generation</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                category: "Frontend", 
                techs: ["Next.js 14", "Tailwind CSS", "Framer Motion", "Lucide React"],
                desc: "High-fidelity, reactive interface with motion-driven UX patterns."
              },
              { 
                category: "Backend Engine", 
                techs: ["FastAPI (Python)", "Node.js", "Docker", "Gunicorn"],
                desc: "High-performance microservices architecture with async IO."
              },
              { 
                category: "Intelligence Layer", 
                techs: ["gpt-4o-mini", "Neural-V8", "Sentence Transformers", "LangChain"],
                desc: "Sophisticated RAG pipeline with multi-modal reasoning capabilities."
              },
              { 
                category: "Storage Ops", 
                techs: ["PostgreSQL", "Qdrant Vector DB", "Redis", "Cloudinary"],
                desc: "Hybrid storage model for relational facts and semantic embeddings."
              }
            ].map((stack, i) => (
              <div key={i} className="p-10 bg-zinc-900/30 border border-zinc-800 rounded-[3rem] space-y-8 flex flex-col justify-between hover:border-zinc-700 transition-colors group">
                <div className="space-y-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">{stack.category}</p>
                  <div className="flex flex-wrap gap-2">
                    {stack.techs.map((t, j) => (
                      <span key={j} className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold text-white/70 group-hover:text-white transition-colors">{t}</span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed italic">{stack.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <footer className="pt-24 border-t border-zinc-900 text-center space-y-12">
          <div className="space-y-4">
            <h4 className="text-3xl font-serif font-bold text-white italic">Ready to integrate?</h4>
            <p className="text-zinc-600 text-lg max-w-xl mx-auto leading-relaxed">
              Our engineering team is expanding the public API beta. Join the waitlist for institutional access to the Neural-V8 engine.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/support/contact" className="px-12 py-6 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-2xl hover:scale-105 transition-transform shadow-[0_20px_40px_rgba(255,255,255,0.1)]">
              Contact Engineering
            </Link>
            <Link href="/" className="px-12 py-6 bg-zinc-900 text-white font-black uppercase tracking-widest text-[11px] border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-all">
              Return to Portal
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
