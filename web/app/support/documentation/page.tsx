"use client";

import React from "react";
import { motion } from "framer-motion";
import { Book, Terminal, Database } from "lucide-react";



export default function DocumentationPage() {
  return (
    <div className="space-y-24">
      <header className="space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.1)]"
        >
          <Book className="text-black w-8 h-8" />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-serif font-bold tracking-tighter"
        >
          Documentation
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-zinc-500 text-xl md:text-2xl font-medium max-w-2xl leading-relaxed"
        >
          Technical guides for understanding and integrating with the AcademiaAI intelligence layer.
        </motion.p>
      </header>

      <section className="space-y-16">
        <div className="space-y-6">
          <h2 className="text-3xl font-serif font-bold text-white italic">Getting Started</h2>
          <p className="text-zinc-500 leading-relaxed text-lg">
            The AcademiaAI platform is built on a distributed microservices architecture, combining a PostgreSQL relational database for structured rankings and a Qdrant vector store for unstructured news and document analysis.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 bg-zinc-900/40 rounded-3xl border border-zinc-800/50 space-y-4">
            <Terminal className="text-white w-6 h-6" />
            <h3 className="text-xl font-bold text-white">System Prerequisites</h3>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Understand the environment requirements for interacting with our live news feeds and institutional API endpoints.
            </p>
          </div>
          <div className="p-8 bg-zinc-900/40 rounded-3xl border border-zinc-800/50 space-y-4">
            <Database className="text-white w-6 h-6" />
            <h3 className="text-xl font-bold text-white">Data Schemas</h3>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Deep dive into how we structure college achievements, NIRF rankings, and academic events.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
