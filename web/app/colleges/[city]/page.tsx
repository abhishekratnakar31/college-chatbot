"use client";

import { 
  GraduationCap, 
  Trophy, 
  Landmark, 
  ArrowLeft,
  Search,
  Building2,
  ChevronRight,
  ArrowUpDown,
  MapPin,
  Newspaper,
  Brain
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

interface College {
  id: number;
  college: string;
  nirf_category: string;
  state: string;
  city: string;
  nirf_rank: number | null;
  innovation_score: number;
  avg_package: number;
}

export default function CityCollegesPage() {
  const { city: cityParam } = useParams();
  const city = cityParam ? (Array.isArray(cityParam) ? cityParam[0] : cityParam) : "";
  const decodedCity = city ? decodeURIComponent(city.replace(/-/g, " ")) : "";
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("nirf_rank");

  const fetchColleges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/rankings?city=${encodeURIComponent(decodedCity)}&sort=${sortBy}`);
      const data = await res.json();
      setColleges(data.colleges || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [decodedCity, sortBy]);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  const cityNameDisplay = decodedCity 
    ? decodedCity.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') 
    : "City";

  return (
    <div className="flex h-screen bg-white text-black font-sans selection:bg-blue-50 overflow-hidden">
      
      {/* Sidebar */}
      <aside className="flex-shrink-0 w-14 h-full bg-white border-r border-zinc-100 flex flex-col items-center py-4 gap-1 z-50">
        <Link href="/" className="w-9 h-9 bg-white rounded-xl flex items-center justify-center mb-4 hover:scale-105 transition-transform shadow shadow-white/10">
          <GraduationCap className="text-black w-5 h-5" />
        </Link>
        <div className="w-6 h-px bg-zinc-900 mb-2" />
        <Link href="/chat" className="group relative w-10 h-10 flex items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-50 hover:text-black transition-all">
          <Brain className="w-5 h-5" />
        </Link>
        <Link href="/news" className="group relative w-10 h-10 flex items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-50 hover:text-black transition-all">
          <Newspaper className="w-5 h-5" />
        </Link>
        <Link href="/rankings" className="group relative w-10 h-10 flex items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-50 hover:text-black transition-all">
          <Trophy className="w-5 h-5" />
        </Link>
      </aside>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <main className="p-10 lg:p-16 max-w-7xl mx-auto">
          
          <div className="mb-12">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-zinc-400 hover:text-black transition-colors text-xs font-black uppercase tracking-widest mb-8"
            >
              <ArrowLeft size={14} /> Back to Home
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-zinc-50 border border-zinc-200 text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-blue-600" /> {cityNameDisplay}
                  </span>
                </div>
                <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none text-white">
                  Colleges in <span className="text-zinc-200">{cityNameDisplay}</span>
                </h1>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 px-4 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center gap-3">
                  <ArrowUpDown className="w-3.5 h-3.5 text-zinc-700" />
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-xs font-bold text-zinc-400 focus:outline-none appearance-none cursor-pointer pr-4"
                  >
                    <option value="nirf_rank">NIRF Rank</option>
                    <option value="innovation_score">Innovation Score</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-32 bg-zinc-50 border border-zinc-100 rounded-3xl animate-pulse" />)}
            </div>
          ) : colleges.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-zinc-100 rounded-3xl">
              <Building2 className="w-12 h-12 text-zinc-900 mx-auto mb-4" />
              <p className="text-zinc-500 font-bold">No institutions found in {cityNameDisplay}.</p>
              <Link href="/rankings" className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-black mt-4 inline-block underline underline-offset-8">Explore All India</Link>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {colleges.map((college, idx) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={college.id}
                    className="group bg-white border border-zinc-100 p-6 rounded-3xl hover:bg-zinc-50 hover:border-blue-100 transition-all duration-300 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden"
                  >
                    {/* Rank */}
                    <div className="flex items-center gap-6 flex-shrink-0">
                      <div className="w-12 h-12 bg-white rounded-2xl border border-zinc-100 flex items-center justify-center group-hover:rotate-6 transition-transform shadow-sm group-hover:shadow-blue-500/10">
                        <Building2 className="text-blue-600/80 w-6 h-6" strokeWidth={1.5} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">NIRF Rank</span>
                        <span className="text-2xl font-black text-black italic">#{college.nirf_rank || "--"}</span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-grow min-w-0">
                      <h3 className="text-lg font-bold text-zinc-800 mb-1 group-hover:text-black transition-colors truncate">
                        {college.college}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black uppercase text-zinc-400 border border-zinc-100 px-2 py-0.5 rounded-full">
                          {college.nirf_category}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-tight flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {college.city}, {college.state}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-8 md:gap-12 flex-shrink-0 w-full md:w-auto pt-4 md:pt-0 border-t md:border-0 border-zinc-100">
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-1">Innovation</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, college.innovation_score)}%` }} />
                          </div>
                          <span className="text-xs font-black text-zinc-800 italic">{college.innovation_score}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end min-w-[80px]">
                        <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-1">Avg Package</span>
                        <span className="text-sm font-black text-zinc-800 italic">₹{college.avg_package}L</span>
                      </div>

                      <button className="h-10 w-10 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center hover:bg-black hover:text-white transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Decoration */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>

        <footer className="mt-20 py-10 border-t border-zinc-100 text-center">
          <p className="text-zinc-800 text-[10px] font-black uppercase tracking-[0.3em]">© 2024 CAMPUSAI INTELLIGENCE</p>
        </footer>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f4f4f5; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #27272a; }
      `}</style>
    </div>
  );
}
