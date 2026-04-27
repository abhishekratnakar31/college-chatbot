"use client";

import React from "react";
import { motion } from "framer-motion";
import { notFound } from "next/navigation";
import { Cpu, Database, Network, Search, Zap, Code } from "lucide-react";

const DOCS_CONTENT: Record<string, { title: string, subtitle: string, icon: any, content: React.ReactNode }> = {
  "platform-overview": {
    title: "Platform Overview",
    subtitle: "High-level vision and capabilities of the AcademiaAI intelligence layer.",
    icon: Network,
    content: (
      <div className="space-y-12 text-zinc-500 leading-relaxed text-lg">
        <p>
          AcademiaAI is designed to be the definitive intelligence layer for Indian higher education. By aggregating live data from thousands of institutional sources, we provide a unified search and analysis interface that goes beyond traditional rankings.
        </p>
        <div className="grid gap-8 p-8 bg-zinc-900/20 rounded-3xl border border-zinc-800">
          <h3 className="text-white font-serif font-bold italic text-xl">Core Value Pillars</h3>
          <ul className="space-y-4">
            <li className="flex gap-4">
              <span className="text-white font-bold">01. Accuracy:</span>
              Verified data directly from university portals and government records.
            </li>
            <li className="flex gap-4">
              <span className="text-white font-bold">02. Speed:</span>
              Real-time monitoring of admission news and academic events.
            </li>
            <li className="flex gap-4">
              <span className="text-white font-bold">03. Intelligence:</span>
              AI-driven insights that synthesize complex placement and research metrics.
            </li>
          </ul>
        </div>
      </div>
    )
  },
  "core-architecture": {
    title: "Core Architecture",
    subtitle: "The distributed systems and data pipelines powering the platform.",
    icon: Database,
    content: (
      <div className="space-y-12 text-zinc-500 leading-relaxed text-lg">
        <p>
          The platform follows a modern microservices architecture built on Next.js 15 and Node.js. Our data persistence strategy is split between relational and vector stores to handle different types of academic intelligence.
        </p>
        <div className="space-y-6">
          <h3 className="text-white font-serif font-bold italic text-2xl">Infrastructure Stack</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 border border-zinc-900 rounded-2xl">
              <p className="text-white font-bold mb-2 uppercase tracking-widest text-[10px]">Primary Storage</p>
              <p className="text-sm">PostgreSQL for institutional metadata and historical rankings.</p>
            </div>
            <div className="p-6 border border-zinc-900 rounded-2xl">
              <p className="text-white font-bold mb-2 uppercase tracking-widest text-[10px]">Intelligence Layer</p>
              <p className="text-sm">Qdrant Vector Database for semantic search and AI context retrieval.</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  "data-sourcing": {
    title: "Data Sourcing",
    subtitle: "Our methodology for accurate and unbiased data aggregation.",
    icon: Search,
    content: (
      <div className="space-y-12 text-zinc-500 leading-relaxed text-lg">
        <p>
          Integrity is our primary metric. We utilize a proprietary "Verification Pipeline" that cross-references data from three primary layers:
        </p>
        <div className="space-y-8">
          <div className="flex gap-6 items-start">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 text-black font-black text-xs">L1</div>
            <div>
              <h4 className="text-white font-bold mb-1">Official University Portals</h4>
              <p className="text-sm">Direct ingestion of fees, admission notices, and placement reports.</p>
            </div>
          </div>
          <div className="flex gap-6 items-start">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 text-white font-black text-xs">L2</div>
            <div>
              <h4 className="text-white font-bold mb-1">Government Databases</h4>
              <p className="text-sm">Verification against NIRF, AISHE, and NACC accreditation records.</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  "vector-search": {
    title: "Vector Search",
    subtitle: "Advanced semantic retrieval for unstructured academic data.",
    icon: Zap,
    content: (
      <div className="space-y-12 text-zinc-500 leading-relaxed text-lg">
        <p>
          Traditional keyword search is insufficient for academic discovery. We leverage high-dimensional vector embeddings to understand the "intent" behind your queries.
        </p>
        <div className="p-8 bg-zinc-900/30 rounded-3xl border border-zinc-800 space-y-4">
          <h3 className="text-white font-bold uppercase tracking-widest text-[10px]">Technical Implementation</h3>
          <code className="block text-emerald-500 text-sm font-mono">
            query_embedding = model.encode("Top IITs for AI research")<br />
            results = qdrant.search(collection="academia", vector=query_embedding)
          </code>
        </div>
      </div>
    )
  },
  "llm-integration": {
    title: "LLM Integration",
    subtitle: "How we synthesize responses using Large Language Models.",
    icon: Cpu,
    content: (
      <div className="space-y-12 text-zinc-500 leading-relaxed text-lg">
        <p>
          AcademiaAI uses a state-of-the-art RAG (Retrieval-Augmented Generation) pipeline. This ensures our AI responses are grounded in verified institutional facts rather than general training data.
        </p>
        <div className="space-y-6">
          <h3 className="text-white font-serif font-bold italic text-2xl">The RAG Process</h3>
          <p className="text-sm">
            1. Retrieve relevant context from our verified vector store.<br />
            2. Pass context and user query to our specialized academic LLM.<br />
            3. Synthesize a response with direct citations to university portals.
          </p>
        </div>
      </div>
    )
  },
  "embedding-strategy": {
    title: "Embedding Strategy",
    subtitle: "Our approach to representing academic concepts in high-dimensional space.",
    icon: Code,
    content: (
      <div className="space-y-12 text-zinc-500 leading-relaxed text-lg">
        <p>
          We use custom-trained embedding models that understand the nuances of Indian academia—identifying that "CSE" and "Computer Science Engineering" represent the same concept across different universities.
        </p>
        <div className="grid gap-6">
          <div className="p-6 border border-zinc-900 rounded-2xl flex justify-between items-center">
            <span className="text-white font-bold italic">Vocabulary Size</span>
            <span className="text-zinc-700 font-mono">50,000+ Academic Terms</span>
          </div>
          <div className="p-6 border border-zinc-900 rounded-2xl flex justify-between items-center">
            <span className="text-white font-bold italic">Dimensions</span>
            <span className="text-zinc-700 font-mono">768-dim Vectors</span>
          </div>
        </div>
      </div>
    )
  }
};

export default function DocSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const doc = DOCS_CONTENT[slug];

  if (!doc) return notFound();

  const Icon = doc.icon;

  return (
    <div className="space-y-24">
      <header className="space-y-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.1)]"
        >
          <Icon className="text-black w-8 h-8" />
        </motion.div>
        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif font-bold tracking-tighter"
          >
            {doc.title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-500 text-xl md:text-2xl font-medium max-w-2xl leading-relaxed"
          >
            {doc.subtitle}
          </motion.p>
        </div>
      </header>

      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="pt-16 border-t border-zinc-900"
      >
        {doc.content}
      </motion.section>
    </div>
  );
}
