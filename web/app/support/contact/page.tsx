"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Mail, Send, CheckCircle2, AlertCircle, Clock, ShieldCheck, ChevronRight } from "lucide-react";

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
    <div className="min-h-screen bg-[#f3f4f6] text-black font-sans selection:bg-[#b69cc4]/30">
      {/* ── Header & Breadcrumbs ── */}
      <nav className="p-8 md:p-12 border-b-2 border-black">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            <Link href="/" className="hover:text-[#b69cc4] transition-colors">Home</Link>
            <ChevronRight size={10} />
            <span>Support</span>
            <ChevronRight size={10} />
            <span className="text-black">Contact Support</span>
          </div>
          <div className="hidden md:flex items-center gap-4 px-4 py-2 rounded-lg bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Support Systems Online</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-24 grid lg:grid-cols-[1fr_500px] gap-24 items-start">
        {/* Left Column: Context & Branding */}
        <div className="space-y-16">
          <header className="space-y-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-20 h-20 bg-white border-2 border-black rounded-xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <Mail className="text-black w-10 h-10" />
            </motion.div>
            <div className="space-y-6">
              <h1 className="text-7xl md:text-9xl font-serif font-black tracking-tighter leading-[0.85]">
                Contact <br />
                <span className="text-zinc-400 italic">Support</span>
              </h1>
              <p className="text-zinc-600 text-xl md:text-2xl font-bold max-w-xl leading-relaxed">
                Connect with our specialized intelligence team for technical inquiries, data discrepancies, or error reporting.
              </p>
            </div>
          </header>

          <div className="grid sm:grid-cols-2 gap-12 pt-12 border-t-2 border-black">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">01 / Issue Categorization</h3>
              <ul className="space-y-2 text-xs text-zinc-600 font-bold">
                <li>• <span className="text-black">Critical:</span> Platform downtime or prediction failures.</li>
                <li>• <span className="text-black">Data:</span> Discrepancies in college rankings or cutoffs.</li>
                <li>• <span className="text-black">Feature:</span> Integration requests for new institutional tools.</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">02 / Technical Requirements</h3>
              <p className="text-zinc-600 text-xs leading-relaxed font-medium">
                When reporting errors, please include the <span className="text-black font-black">Neural-V8</span> version number and the specific query path utilized.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: The Form */}
        <section>
          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-16 bg-white border-2 border-black rounded-xl text-center space-y-8 h-full flex flex-col justify-center shadow-[6px_6px_0px_0px_#b69cc4]"
              >
                <div className="w-24 h-24 bg-[#b69cc4]/20 border-2 border-black rounded-full flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <CheckCircle2 className="text-black w-12 h-12" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-4xl font-serif font-black text-black tracking-tight">Transmission Received</h2>
                  <p className="text-zinc-600 text-lg font-bold">Your report has been successfully ingested into our support pipeline.</p>
                </div>
                <button 
                  onClick={() => setStatus("idle")}
                  className="px-10 py-5 bg-[#b69cc4] text-black font-black uppercase tracking-widest text-[10px] rounded-lg border-2 border-black hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
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
                className="space-y-10 bg-white border-2 border-black p-10 md:p-14 rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-2">Identify</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white border-2 border-black rounded-lg py-5 px-8 outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all text-sm placeholder:text-zinc-400 font-medium" 
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
                      className="w-full bg-white border-2 border-black rounded-lg py-5 px-8 outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all text-sm placeholder:text-zinc-400 font-medium" 
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
                      className="w-full bg-white border-2 border-black rounded-lg py-6 px-8 outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all text-sm resize-none placeholder:text-zinc-400 font-medium" 
                      placeholder="Detailed description of the issue..." 
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <button 
                    disabled={status === "sending"}
                    className="w-full py-6 bg-[#b69cc4] text-black font-black uppercase tracking-[0.4em] text-[11px] rounded-lg border-2 border-black hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-4 group/btn disabled:opacity-50"
                  >
                    {status === "sending" ? "Processing..." : "Dispatch Report"}
                    <Send size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </button>

                  {status === "error" && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 text-rose-600 justify-center text-[10px] font-black uppercase tracking-widest"
                    >
                      <AlertCircle size={14} />
                      Connection Interrupted
                    </motion.div>
                  )}
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Footer Decoration */}
      <div className="border-t-2 border-black mt-24">
        <div className="max-w-7xl mx-auto px-6 py-12 flex justify-between items-center">
          <div className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-500">Secure Transmission Layer 1.0</div>
          <div className="w-12 h-[2px] bg-black" />
          <div className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-500">AcademiaAI Intelligence</div>
        </div>
      </div>
    </div>
  );
}
