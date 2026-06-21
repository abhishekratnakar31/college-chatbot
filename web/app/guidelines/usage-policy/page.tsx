"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, ShieldAlert, Shield, ChevronRight } from "lucide-react";

export default function UsagePolicyPage() {
  return (
    <div className="min-h-screen bg-[#f3f4f6] text-black font-sans selection:bg-[#b69cc4]/30">
      {/* ── Header & Breadcrumbs ── */}
      <nav className="p-8 md:p-12 border-b-2 border-black">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            <Link href="/" className="hover:text-[#b69cc4] transition-colors">Home</Link>
            <ChevronRight size={10} />
            <span>Guidelines</span>
            <ChevronRight size={10} />
            <span className="text-black">Usage Policy</span>
          </div>
          <Link 
            href="/support/contact" 
            className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#b69cc4] transition-colors"
          >
            Technical Support →
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-24">
        <header className="space-y-12 mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-16 h-16 bg-white border-2 border-black rounded-lg flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          >
            <ShieldCheck className="text-black w-8 h-8" />
          </motion.div>
          <div className="space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-serif font-black tracking-tighter"
            >
              Usage <span className="text-zinc-400 italic">Policy</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-600 text-xl md:text-2xl font-bold max-w-2xl leading-relaxed"
            >
              Platform operational standards for ensuring high-fidelity intelligence synchronization and ethical AI utilization.
            </motion.p>
          </div>
        </header>

        <div className="grid lg:grid-cols-[1fr_300px] gap-24">
          <section className="space-y-24">
            <div className="space-y-8">
              <h2 className="text-3xl font-serif font-black text-black italic">01. Data Integrity & Sourcing</h2>
              <div className="space-y-6">
                <p className="text-zinc-600 leading-relaxed text-lg font-medium">
                  AcademiaAI utilizes a multi-layered data ingestion pipeline. Institutional rankings, achievement records, and campus updates are sourced directly from verified university portals and government databases (NIRF/QS).
                </p>
                <div className="p-8 bg-white border-2 border-black rounded-xl space-y-4 shadow-[4px_4px_0px_0px_#b69cc4]">
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Technical Standard</h3>
                  <p className="text-sm text-zinc-600 font-medium">All external data is validated through our <span className="text-black font-black">Neural-V8</span> verification engine before being committed to the global intelligence index.</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-3xl font-serif font-black text-black italic">02. AI Interaction Ethics</h2>
              <div className="space-y-6">
                <p className="text-zinc-600 leading-relaxed text-lg font-medium">
                  Our LLM-driven chat and prediction systems are designed for academic guidance. Users are prohibited from utilizing the platform for:
                </p>
                <ul className="space-y-4 text-sm text-zinc-600 list-disc pl-6 font-medium">
                  <li>Generating fraudulent academic documents or applications.</li>
                  <li>Reverse-engineering proprietary prediction algorithms.</li>
                  <li>Automated high-frequency querying that disrupts platform stability.</li>
                </ul>
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-3xl font-serif font-black text-black italic">03. API & Scraping Restrictions</h2>
              <div className="space-y-6">
                <p className="text-zinc-600 leading-relaxed text-lg font-medium">
                  Direct database access and automated scraping of the AcademiaAI frontend are strictly monitored. We employ sophisticated rate-limiting and behavioral analysis to protect our proprietary intelligence layers.
                </p>
              </div>
            </div>
          </section>

          <aside className="space-y-12">
            <div className="p-8 bg-white border-2 border-black rounded-xl space-y-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Policy Update</h3>
              <div className="space-y-2">
                <p className="text-2xl font-serif font-black text-black">V1.4.0</p>
                <p className="text-xs text-zinc-500 font-bold">Last Revised: May 2026</p>
              </div>
              <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                Platform protocols are audited quarterly to align with evolving AI safety standards.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 pl-2">Compliance</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-4 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Shield className="text-black w-4 h-4" />
                  <span className="text-xs font-black text-zinc-600">GDPR Compliant</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <ShieldAlert className="text-black w-4 h-4" />
                  <span className="text-xs font-black text-zinc-600">SOC2 Type II</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <footer className="pt-24 mt-24 border-t-2 border-black">
          <div className="p-12 bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#b69cc4] flex flex-col md:flex-row gap-12 items-center justify-between">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-black uppercase tracking-[0.2em]">Institutional Inquiry?</p>
              <p className="text-sm text-zinc-600 font-bold">Connect with our data governance team.</p>
            </div>
            <div className="flex gap-4">
              <Link href="/support/contact" className="px-10 py-5 bg-[#b69cc4] text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-lg border-2 border-black hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all">
                Open Support Ticket
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
