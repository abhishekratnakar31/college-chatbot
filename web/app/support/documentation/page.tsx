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
    <div className="min-h-screen bg-[#f3f4f6] text-black font-sans selection:bg-[#b69cc4]/30">
      {/* ── Header & Breadcrumbs ── */}
      <nav className="p-8 md:p-12 border-b-2 border-black">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            <Link href="/" className="hover:text-[#b69cc4] transition-colors">Home</Link>
            <ChevronRight size={10} />
            <span>Support</span>
            <ChevronRight size={10} />
            <span className="text-black">System Documentation</span>
          </div>
          <Link 
            href="/support/contact" 
            className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#b69cc4] transition-colors px-4 py-2 border-2 border-black rounded-lg"
          >
            Open Ticket →
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-24">
        {/* Hero Section */}
        <header className="space-y-12 mb-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-20 h-20 bg-white border-2 border-black rounded-xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <Book className="text-black w-10 h-10" />
          </motion.div>
          <div className="space-y-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-7xl md:text-9xl font-serif font-black tracking-tighter leading-none"
            >
              System <br />
              <span className="text-zinc-400 italic">Architecture</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-600 text-2xl md:text-3xl font-bold max-w-3xl leading-tight"
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
                <Box className="text-[#b69cc4] w-5 h-5" />
                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#b69cc4]">01 / Project Core</h2>
              </div>
              <h3 className="text-5xl font-serif font-black text-black italic">The Intelligence Hub Philosophy</h3>
              <div className="space-y-6 text-zinc-600 text-lg leading-relaxed font-medium">
                <p>
                  AcademiaAI is not just a chatbot; it is a unified **Intelligence Operating System** for the academic world. Built on the principle of "Data-First Decision Making," the platform consolidates millions of disparate data points from thousands of institutions into a singular, actionable interface.
                </p>
                <p>
                  Our architecture is designed to solve the "Stale Data Problem" prevalent in higher education portals. By combining high-frequency scraping with a neural reasoning layer, we provide students with information that is not only accurate but contextually relevant to their unique academic profile.
                </p>
              </div>
            </div>
            <div>
              <img 
                src="/docs/architecture.png" 
                alt="Architecture Overview" 
                className="rounded-xl border-2 border-black shadow-[6px_6px_0px_0px_#b69cc4]"
              />
              <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">Fig 1.0: Global Intelligence Flow Architecture</p>
            </div>
          </div>
        </section>

        {/* ── 02. Neural-V8 Engine ── */}
        <section className="space-y-24 mb-48">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src="/docs/neural_engine.png" 
                alt="Neural Engine" 
                className="rounded-xl border-2 border-black shadow-[6px_6px_0px_0px_#b69cc4]"
              />
              <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">Fig 2.0: Neural-V8 Inference & Correlation Node</p>
            </div>
            <div className="space-y-10 order-1 lg:order-2">
              <div className="flex items-center gap-3">
                <Cpu className="text-[#b69cc4] w-5 h-5" />
                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#b69cc4]">02 / Neural Processing</h2>
              </div>
              <h3 className="text-5xl font-serif font-black text-black italic">Neural-V8: Reasoning Over Static Data</h3>
              <div className="space-y-6 text-zinc-600 text-lg leading-relaxed font-medium">
                <p>
                  At the heart of AcademiaAI lies **Neural-V8**, our proprietary inference engine. Unlike standard LLMs that merely retrieve text, Neural-V8 performs dynamic correlation between historical cutoffs, real-time news trends, and user-provided academic metrics.
                </p>
                <p>
                  When a user asks a question, the engine performs a **multi-hop retrieval**:
                </p>
                <ul className="space-y-4 pt-4">
                  <li className="flex gap-4 items-start">
                    <div className="w-6 h-6 rounded-lg bg-white border-2 border-black flex items-center justify-center shrink-0 mt-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                      <span className="text-[10px] font-black text-black">1</span>
                    </div>
                    <div>
                      <p className="text-black font-black text-sm">Intent Extraction</p>
                      <p className="text-xs text-zinc-600 font-medium">Dissecting the user's query into technical constraints (rank, category, budget).</p>
                    </div>
                  </li>
                  <li className="flex gap-4 items-start">
                    <div className="w-6 h-6 rounded-lg bg-white border-2 border-black flex items-center justify-center shrink-0 mt-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                      <span className="text-[10px] font-black text-black">2</span>
                    </div>
                    <div>
                      <p className="text-black font-black text-sm">Vector Retrieval</p>
                      <p className="text-xs text-zinc-600 font-medium">Searching our Qdrant vector store for semantic matches in our 1M+ article corpus.</p>
                    </div>
                  </li>
                  <li className="flex gap-4 items-start">
                    <div className="w-6 h-6 rounded-lg bg-white border-2 border-black flex items-center justify-center shrink-0 mt-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                      <span className="text-[10px] font-black text-black">3</span>
                    </div>
                    <div>
                      <p className="text-black font-black text-sm">Deterministic Fusion</p>
                      <p className="text-xs text-zinc-600 font-medium">Merging vector results with hard facts from our PostgreSQL institutional database.</p>
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
                <Activity className="text-[#b69cc4] w-5 h-5" />
                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#b69cc4]">03 / Autonomous Sync</h2>
              </div>
              <h3 className="text-5xl font-serif font-black text-black italic">Real-Time Data Ingestion</h3>
              <div className="space-y-6 text-zinc-600 text-lg leading-relaxed font-medium">
                <p>
                  Our scraper network is a distributed cluster of micro-agents that perform perpetual surveillance on the academic web. This isn't just basic scraping; it's **Intelligent Extraction**.
                </p>
                <p>
                  **The Pipeline:**
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                  <div className="p-8 bg-white border-2 border-black rounded-xl space-y-4 shadow-[4px_4px_0px_0px_#b69cc4]">
                    <Globe className="text-black w-5 h-5" />
                    <h4 className="text-sm font-black text-black">Institutional Watchdog</h4>
                    <p className="text-xs text-zinc-600 font-medium leading-relaxed">Scans 2,500+ official university notice boards every 60 minutes for admission changes.</p>
                  </div>
                  <div className="p-8 bg-white border-2 border-black rounded-xl space-y-4 shadow-[4px_4px_0px_0px_#b69cc4]">
                    <Newspaper className="text-black w-5 h-5" />
                    <h4 className="text-sm font-black text-black">Media Intelligence</h4>
                    <p className="text-xs text-zinc-600 font-medium leading-relaxed">Aggregates academic news from mainstream media outlets and niche educational forums.</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <img 
                src="/docs/data_pipeline.png" 
                alt="Data Pipeline" 
                className="rounded-xl border-2 border-black shadow-[6px_6px_0px_0px_#b69cc4]"
              />
              <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">Fig 3.0: High-Frequency Synchronization Tunnel</p>
            </div>
          </div>
        </section>

        {/* ── 04. Tech Stack ── */}
        <section className="space-y-24 mb-48">
          <div className="text-center space-y-6">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500">04 / Technology Stack</h2>
            <h3 className="text-5xl font-serif font-black text-black italic">Built for the Next Generation</h3>
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
              <div key={i} className="p-10 bg-white border-2 border-black rounded-xl space-y-8 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="space-y-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#b69cc4]">{stack.category}</p>
                  <div className="flex flex-wrap gap-2">
                    {stack.techs.map((t, j) => (
                      <span key={j} className="px-3 py-1.5 bg-white border-2 border-black rounded-lg text-[10px] font-black text-zinc-600 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">{t}</span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed italic font-medium">{stack.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <footer className="pt-24 border-t-2 border-black text-center space-y-12">
          <div className="space-y-4">
            <h4 className="text-3xl font-serif font-black text-black italic">Ready to integrate?</h4>
            <p className="text-zinc-600 text-lg max-w-xl mx-auto leading-relaxed font-bold">
              Our engineering team is expanding the public API beta. Join the waitlist for institutional access to the Neural-V8 engine.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/support/contact" className="px-12 py-6 bg-[#b69cc4] text-black font-black uppercase tracking-widest text-[11px] rounded-lg border-2 border-black hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all">
              Contact Engineering
            </Link>
            <Link href="/" className="px-12 py-6 bg-white text-black font-black uppercase tracking-widest text-[11px] border-2 border-black rounded-lg hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all">
              Return to Portal
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
