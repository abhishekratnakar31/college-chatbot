"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Mail, Send, CheckCircle2, AlertCircle, Clock, ShieldCheck } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const FORMSPREE_ID = "xqewveag";
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black overflow-x-hidden">
      {/* Cinematic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/[0.03] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/[0.02] blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
      </div>

      <nav className="relative z-10 p-8 md:p-12">
        <Link 
          href="/" 
          className="inline-flex items-center gap-4 text-zinc-500 hover:text-white transition-all group"
        >
          <div className="w-10 h-10 rounded-full border border-zinc-900 flex items-center justify-center group-hover:border-zinc-700 transition-colors">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Back to Portal</span>
        </Link>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-24 grid lg:grid-cols-[1fr_500px] gap-24 items-start">
        {/* Left Column: Context & Branding */}
        <div className="space-y-16">
          <header className="space-y-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-[0_0_80px_rgba(255,255,255,0.15)]"
            >
              <Mail className="text-black w-10 h-10" />
            </motion.div>
            <div className="space-y-6">
              <h1 className="text-7xl md:text-9xl font-serif font-bold tracking-tighter leading-[0.85]">
                Contact <br />
                <span className="text-zinc-800 italic">Support</span>
              </h1>
              <p className="text-zinc-500 text-xl md:text-2xl font-medium max-w-xl leading-relaxed">
                Connect with our specialized intelligence team for technical inquiries or error reporting.
              </p>
            </div>
          </header>

          <div className="grid sm:grid-cols-2 gap-8 pt-12 border-t border-zinc-900/50">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white font-bold text-sm">
                <Clock size={16} className="text-zinc-600" />
                Response SLA
              </div>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Our intelligence engineers typically respond to high-priority error reports within 2-4 hours.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white font-bold text-sm">
                <ShieldCheck size={16} className="text-zinc-600" />
                Secure Data
              </div>
              <p className="text-zinc-600 text-sm leading-relaxed">
                All communications are encrypted and handled strictly within our academic integrity guidelines.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: The Form */}
        <section className="relative group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent rounded-[3.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />
          
          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-16 bg-zinc-900/40 backdrop-blur-3xl border border-emerald-500/30 rounded-[3.5rem] text-center space-y-8 h-full flex flex-col justify-center"
              >
                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="text-emerald-500 w-12 h-12" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-4xl font-serif font-bold text-white tracking-tight">Transmission Received</h2>
                  <p className="text-zinc-500 text-lg">Your report has been successfully ingested into our support pipeline.</p>
                </div>
                <button 
                  onClick={() => setStatus("idle")}
                  className="px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-zinc-200 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                >
                  Send Another Report
                </button>
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleSubmit}
                className="space-y-10 bg-zinc-900/30 backdrop-blur-3xl p-10 md:p-14 rounded-[3.5rem] border border-zinc-800/50 shadow-2xl overflow-hidden relative"
              >
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-2">Identify</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-black/40 border border-zinc-800 rounded-2xl py-5 px-8 outline-none focus:border-white focus:bg-black transition-all text-sm placeholder:text-zinc-700 shadow-inner" 
                      placeholder="Your Full Name" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-2">Communication</label>
                    <input 
                      required
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-black/40 border border-zinc-800 rounded-2xl py-5 px-8 outline-none focus:border-white focus:bg-black transition-all text-sm placeholder:text-zinc-700 shadow-inner" 
                      placeholder="your@email.com" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-2">Manifest</label>
                    <textarea 
                      required
                      rows={6} 
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full bg-black/40 border border-zinc-800 rounded-3xl py-6 px-8 outline-none focus:border-white focus:bg-black transition-all text-sm resize-none placeholder:text-zinc-700 shadow-inner" 
                      placeholder="Detailed description of the issue..." 
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <button 
                    disabled={status === "sending"}
                    className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.4em] text-[11px] rounded-2xl hover:bg-zinc-200 active:scale-[0.98] transition-all flex items-center justify-center gap-4 group/btn shadow-[0_30px_60px_rgba(255,255,255,0.1)] disabled:opacity-50"
                  >
                    {status === "sending" ? "Processing..." : "Dispatch Report"}
                    <Send size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </button>

                  {status === "error" && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 text-rose-500 justify-center text-[10px] font-black uppercase tracking-widest"
                    >
                      <AlertCircle size={14} />
                      Connection Interrupted
                    </motion.div>
                  )}
                </div>

                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-white/[0.01] rounded-full blur-[80px] pointer-events-none" />
              </motion.form>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Footer Decoration */}
      <div className="max-w-7xl mx-auto px-6 py-12 flex justify-between items-center opacity-30">
        <div className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-600">Secure Transmission Layer 1.0</div>
        <div className="w-12 h-[1px] bg-zinc-800" />
        <div className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-600">AcademiaAI Intelligence</div>
      </div>
    </div>
  );
}
