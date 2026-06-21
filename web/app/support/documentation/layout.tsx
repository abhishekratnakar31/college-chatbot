"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
const cn = (...inputs: any[]) => inputs.filter(Boolean).join(" ");

const DOCS_NAV = [
  {
    title: "Introduction",
    items: [
      { name: "Platform Overview", href: "/support/documentation/platform-overview" },
      { name: "Core Architecture", href: "/support/documentation/core-architecture" },
      { name: "Data Sourcing", href: "/support/documentation/data-sourcing" },
    ]
  },
  {
    title: "AI Engine",
    items: [
      { name: "Vector Search", href: "/support/documentation/vector-search" },
      { name: "LLM Integration", href: "/support/documentation/llm-integration" },
      { name: "Embedding Strategy", href: "/support/documentation/embedding-strategy" },
    ]
  }
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-black font-sans selection:bg-[#b69cc4]/30">
      <nav className="relative z-50 p-8 border-b-2 border-black sticky top-0 bg-[#f3f4f6]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link 
            href="/" 
            className="inline-flex items-center gap-3 text-zinc-500 hover:text-[#b69cc4] transition-colors group font-black"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Home</span>
          </Link>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
            Documentation / AcademiaAI v1.0
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-[280px_1fr] gap-16 md:gap-24 py-16">
        {/* Sidebar Navigation */}
        <aside className="space-y-12 sticky top-32 h-fit hidden md:block">
          {DOCS_NAV.map((section) => (
            <div key={section.title} className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link 
                        href={item.href}
                        className={cn(
                          "text-sm font-bold transition-all block py-1 border-l-4 pl-3",
                          isActive 
                            ? "text-black border-black translate-x-0" 
                            : "text-zinc-500 border-transparent hover:text-black hover:border-zinc-400 hover:translate-x-1"
                        )}
                      >
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          <div className="pt-12 border-t-2 border-black">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6">Need Help?</h4>
            <Link 
              href="/support/contact" 
              className="text-sm font-black text-zinc-500 hover:text-[#b69cc4] transition-colors block"
            >
              Contact Support →
            </Link>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
