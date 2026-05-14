"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, ShieldAlert, Shield, ChevronRight } from "lucide-react";

export default function UsagePolicyPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black">
      {/* Cinematic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/[0.03] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/[0.02] blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
      </div>
      {/* ── Header & Breadcrumbs ── */}
      <nav className="relative z-10 p-8 md:p-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
            <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
            <ChevronRight size={10} />
            <span className="text-white/40">Guidelines</span>
            <ChevronRight size={10} />
            <span className="text-white/60">Usage Policy</span>
          </div>
          <Link 
            href="/support/contact" 
            className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-blue-400 transition-colors"
          >
            Technical Support →
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-24">
        <header className="space-y-12 mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.1)]"
          >
            <ShieldCheck className="text-black w-8 h-8" />
          </motion.div>
          <div className="space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-serif font-bold tracking-tighter"
            >
              Usage <span className="text-zinc-700 italic">Policy</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-500 text-xl md:text-2xl font-medium max-w-2xl leading-relaxed"
            >
              Platform operational standards for ensuring high-fidelity intelligence synchronization and ethical AI utilization.
            </motion.p>
          </div>
        </header>

        <div className="grid lg:grid-cols-[1fr_300px] gap-24">
          <section className="space-y-24">
            <div className="space-y-8">
              <h2 className="text-3xl font-serif font-bold text-white italic">01. Data Integrity & Sourcing</h2>
              <div className="space-y-6">
                <p className="text-zinc-500 leading-relaxed text-lg">
                  AcademiaAI utilizes a multi-layered data ingestion pipeline. Institutional rankings, achievement records, and campus updates are sourced directly from verified university portals and government databases (NIRF/QS).
                </p>
                <div className="p-8 bg-zinc-900/30 border border-zinc-800 rounded-3xl space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Technical Standard</h3>
                  <p className="text-sm text-zinc-400">All external data is validated through our <span className="text-white font-bold">Neural-V8</span> verification engine before being committed to the global intelligence index.</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-3xl font-serif font-bold text-white italic">02. AI Interaction Ethics</h2>
              <div className="space-y-6">
                <p className="text-zinc-500 leading-relaxed text-lg">
                  Our LLM-driven chat and prediction systems are designed for academic guidance. Users are prohibited from utilizing the platform for:
                </p>
                <ul className="space-y-4 text-sm text-zinc-500 list-disc pl-6">
                  <li>Generating fraudulent academic documents or applications.</li>
                  <li>Reverse-engineering proprietary prediction algorithms.</li>
                  <li>Automated high-frequency querying that disrupts platform stability.</li>
                </ul>
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-3xl font-serif font-bold text-white italic">03. API & Scraping Restrictions</h2>
              <div className="space-y-6">
                <p className="text-zinc-500 leading-relaxed text-lg">
                  Direct database access and automated scraping of the AcademiaAI frontend are strictly monitored. We employ sophisticated rate-limiting and behavioral analysis to protect our proprietary intelligence layers.
                </p>
              </div>
            </div>
          </section>

          <aside className="space-y-12">
            <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Policy Update</h3>
              <div className="space-y-2">
                <p className="text-2xl font-serif font-bold text-white">V1.4.0</p>
                <p className="text-xs text-zinc-600">Last Revised: May 2026</p>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Platform protocols are audited quarterly to align with evolving AI safety standards.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 pl-2">Compliance</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <Shield className="text-zinc-500 w-4 h-4" />
                  <span className="text-xs font-bold text-zinc-400">GDPR Compliant</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <ShieldAlert className="text-zinc-500 w-4 h-4" />
                  <span className="text-xs font-bold text-zinc-400">SOC2 Type II</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <footer className="pt-24 mt-24 border-t border-zinc-900">
          <div className="p-12 bg-zinc-900/30 rounded-[3rem] border border-zinc-800/50 flex flex-col md:flex-row gap-12 items-center justify-between">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Institutional Inquiry?</p>
              <p className="text-sm text-zinc-600 font-medium">Connect with our data governance team.</p>
            </div>
            <div className="flex gap-4">
              <Link href="/support/contact" className="px-10 py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-zinc-200 transition-all shadow-xl">
                Open Support Ticket
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
