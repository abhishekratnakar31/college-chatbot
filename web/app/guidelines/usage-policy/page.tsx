"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, ShieldAlert, Shield } from "lucide-react";

export default function UsagePolicyPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black">
      {/* Cinematic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/[0.03] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/[0.02] blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
      </div>
      <nav className="relative z-10 p-8 flex items-center justify-between">
        <Link 
          href="/" 
          className="inline-flex items-center gap-3 text-zinc-500 hover:text-white transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Portal</span>
        </Link>
        <Link 
          href="/support/contact" 
          className="text-sm font-bold text-zinc-500 hover:text-white transition-colors block"
        >
          Contact Support →
        </Link>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-24 space-y-24">
        <header className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.1)]"
          >
            <ShieldCheck className="text-black w-8 h-8" />
          </motion.div>
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
            Our standards for ensuring a safe, transparent, and accurate intelligence environment for every student.
          </motion.p>
        </header>

        <section className="grid gap-16 pt-16 border-t border-zinc-900">
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-white italic">1. Fair Use & Access</h2>
            <p className="text-zinc-500 leading-relaxed text-lg">
              AcademiaAI is provided as a research and exploration tool for prospective students, parents, and academic researchers. Automated scraping or bulk extraction of platform data is strictly prohibited without explicit API authorization.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-white italic">2. Account Responsibility</h2>
            <p className="text-zinc-500 leading-relaxed text-lg">
              Users are responsible for the queries they submit to the AI engine. We encourage critical thinking and professional conduct when interacting with our community and AI systems.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-white italic">3. Intellectual Property</h2>
            <p className="text-zinc-500 leading-relaxed text-lg">
              The proprietary rankings, news aggregations, and AI models hosted on AcademiaAI are protected. Institutional data remains the property of the respective universities.
            </p>
          </div>
        </section>

        <footer className="pt-24 border-t border-zinc-900">
          <div className="p-8 bg-zinc-900/30 rounded-3xl border border-zinc-800/50 flex flex-col md:flex-row gap-8 items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-2">Need clarification?</p>
              <p className="text-xs text-zinc-600 font-medium">Our legal and ethics team is here to help.</p>
            </div>
            <div className="flex gap-4">
              <Link href="/support/documentation" className="px-8 py-4 bg-zinc-900 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-xl hover:bg-zinc-800 border border-zinc-800 transition-all">
                View Documentation
              </Link>
              <Link href="/support/contact" className="px-8 py-4 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-xl hover:bg-zinc-200 transition-all">
                Contact Support
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
