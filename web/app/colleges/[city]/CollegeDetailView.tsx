"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap, Brain, Newspaper, MapPin, ExternalLink,
  Star, ChevronLeft, Zap, Users, Bookmark,
  BookOpen, Award, Globe, Lightbulb, Rocket, Building2, ArrowRight,
  MessageSquare, Cpu, DollarSign, Info, FileText, LayoutGrid, Landmark,
} from "lucide-react";

import Image from "next/image";
import dynamic from "next/dynamic";
import { ChatWidget } from "@/app/components/ChatWidget";
import { useShortlist } from "../../context/ShortlistContext";


const cn = (...inputs: any[]) => inputs.filter(Boolean).join(" ");

interface CollegeDetail {
  college: string;
  nirf_rank?: number | null;
  nirf_category?: string;
  global_rank?: number | null;
  city?: string;
  state?: string;
  fees_range?: string;
  avg_package?: number;
  highest_package?: number;
  user_rating?: number;
  total_reviews?: number;
  patents?: number;
  research_papers?: number;
  hackathons_won?: number;
  startups_incubated?: number;
  awards?: string[];
  website?: string;
  innovation_score?: number;
  aliases?: string[];
  logo_url?: string;
  campus_image_url?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Engineering:  "from-zinc-950/90 via-zinc-900/60 to-black/90",
  Management:   "from-amber-950/90 via-amber-900/60 to-black/90",
  Medical:      "from-emerald-950/90 via-emerald-900/60 to-black/90",
  Law:          "from-purple-950/90 via-purple-900/60 to-black/90",
  Research:     "from-cyan-950/90 via-cyan-900/60 to-black/90",
  Design:       "from-rose-950/90 via-rose-900/60 to-black/90",
  Pharmacy:     "from-teal-950/90 via-teal-900/60 to-black/90",
  Agriculture:  "from-lime-950/90 via-lime-900/60 to-black/90",
  University:   "from-indigo-950/90 via-indigo-900/60 to-black/90",
};

const TABS = [
  "College Info", "Courses", "Fees", "Reviews", 
  "Scholarship & Exams", "News"
] as const;
type Tab = typeof TABS[number];

const fmt = (n?: number | null) => n != null ? n.toLocaleString("en-IN") : "—";

function imgSeed(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h) % 900 + 100;
}

function getCollegeMeta(name: string, category?: string) {
  const meta: Record<string, { estd: string, acc: string, type: string }> = {
    "IIT Madras": { estd: "1959", acc: "Institute of National Importance", type: "Public Technical Institute" },
    "IIT Delhi": { estd: "1961", acc: "Institute of National Importance", type: "Public Technical Institute" },
    "IIT Bombay": { estd: "1958", acc: "Institute of National Importance", type: "Public Technical Institute" },
    "IIT Kanpur": { estd: "1959", acc: "Institute of National Importance", type: "Public Technical Institute" },
    "IIT Kharagpur": { estd: "1951", acc: "Institute of National Importance", type: "Public Technical Institute" },
    "IIT Roorkee": { estd: "1847", acc: "Institute of National Importance", type: "Public Technical Institute" },
    "IIT Guwahati": { estd: "1994", acc: "Institute of National Importance", type: "Public Technical Institute" },
    "IIT Hyderabad": { estd: "2008", acc: "Institute of National Importance", type: "Public Technical Institute" },
    "IIT Indore": { estd: "2009", acc: "Institute of National Importance", type: "Public Technical Institute" },
    "BITS Pilani": { estd: "1964", acc: "A NAAC accredited", type: "Private Deemed University" },
    "VIT Vellore": { estd: "1984", acc: "A++ NAAC accredited", type: "Private Deemed University" },
    "NIT Trichy": { estd: "1964", acc: "Institute of National Importance", type: "Public Technical Institute" },
    "NIT Surathkal": { estd: "1960", acc: "Institute of National Importance", type: "Public Technical Institute" },
    "NIT Warangal": { estd: "1959", acc: "Institute of National Importance", type: "Public Technical Institute" },
    "IIM Ahmedabad": { estd: "1961", acc: "Institute of National Importance", type: "Public Business School" },
    "IIM Bangalore": { estd: "1973", acc: "Institute of National Importance", type: "Public Business School" },
    "IIM Calcutta": { estd: "1961", acc: "Institute of National Importance", type: "Public Business School" },
    "AIIMS Delhi": { estd: "1956", acc: "Institute of National Importance", type: "Public Medical College" },
    "IISc Bangalore": { estd: "1909", acc: "A++ NAAC accredited", type: "Public Research University" },
    "Jadavpur University": { estd: "1955", acc: "A NAAC accredited", type: "Public State University" },
    "Anna University": { estd: "1978", acc: "A NAAC accredited", type: "Public State University" },
    "SRM University": { estd: "1985", acc: "A++ NAAC accredited", type: "Private Deemed University" },
    "Manipal University": { estd: "1953", acc: "A++ NAAC accredited", type: "Private Deemed University" },
    "Delhi Technological University": { estd: "1941", acc: "A NAAC accredited", type: "Public State University" },
    "Jawaharlal Nehru University": { estd: "1969", acc: "A++ NAAC accredited", type: "Public Central University" },
    "University of Delhi": { estd: "1922", acc: "A+ NAAC accredited", type: "Public Central University" },
    "Jamia Millia Islamia": { estd: "1920", acc: "A++ NAAC accredited", type: "Public Central University" },
  };

  if (meta[name]) return meta[name];

  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  h = Math.abs(h);

  const estd = (1940 + (h % 70)).toString();
  const isPrivate = h % 3 === 0;
  const isMedical = category === "Medical";
  const isMgmt = category === "Management";
  
  let type = isPrivate ? "Private University" : "Public State University";
  if (name.includes("NIT") || name.includes("IIIT")) type = "Public Technical Institute";
  if (isMedical) type = isPrivate ? "Private Medical College" : "Public Medical College";
  if (isMgmt) type = isPrivate ? "Private Business School" : "Public Business School";

  const acc = (h % 5 === 0) ? "A NAAC accredited" : (h % 2 === 0 ? "A+ NAAC accredited" : "A++ NAAC accredited");

  return { estd, acc, type };
}

function getCollegeAssets(name: string, website?: string) {
  const assets: Record<string, { logo: string, campus: string }> = {
    "IIT Madras": {
      logo: "https://upload.wikimedia.org/wikipedia/en/6/69/IIT_Madras_Logo.svg",
      campus: "https://www.iitm.ac.in/sites/default/files/inline-images/Campus%20Life.jpg"
    },
    "IIT Delhi": {
      logo: "https://upload.wikimedia.org/wikipedia/en/8/86/IIT_Delhi_Logo.svg",
      campus: "https://home.iitd.ac.in/public/storage/uploads/media/slider/1645685861.jpg"
    },
    "IIT Bombay": {
      logo: "https://upload.wikimedia.org/wikipedia/en/5/58/IIT_Bombay_Logo.svg",
      campus: "https://www.iitb.ac.in/sites/default/files/styles/slider/public/news/2022-08/Main-Building.jpg"
    },
    "IIT Kanpur": {
      logo: "https://upload.wikimedia.org/wikipedia/en/a/a3/IIT_Kanpur_Logo.svg",
      campus: "https://www.iitk.ac.in/new/images/page-images/campus.jpg"
    },
    "IIT Kharagpur": {
      logo: "https://upload.wikimedia.org/wikipedia/en/1/1d/IIT_Kharagpur_Logo.svg",
      campus: "https://www.iitkgp.ac.in/assets/images/slides/1.jpg"
    },
    "IIT Roorkee": {
      logo: "https://upload.wikimedia.org/wikipedia/en/1/16/IIT_Roorkee_Logo.svg",
      campus: "https://www.iitr.ac.in/Main/assets/images/slider/slider1.jpg"
    },
    "BITS Pilani": {
      logo: "https://upload.wikimedia.org/wikipedia/en/d/d3/BITS_Pilani-Logo.svg",
      campus: "https://www.bits-pilani.ac.in/wp-content/uploads/2023/01/BITS-Pilani-Campus.jpg"
    },
    "IISc Bangalore": {
      logo: "https://upload.wikimedia.org/wikipedia/en/f/f8/Indian_Institute_of_Science_2019_logo.svg",
      campus: "https://iisc.ac.in/wp-content/uploads/2020/07/IISc-Main-Building.jpg"
    },
    "AIIMS Delhi": {
      logo: "https://upload.wikimedia.org/wikipedia/en/8/86/All_India_Institute_of_Medical_Sciences_Logo.svg",
      campus: "https://www.aiims.edu/images/pdf/aiims-campus.jpg"
    },
    "IIM Ahmedabad": {
      logo: "https://upload.wikimedia.org/wikipedia/en/c/cd/IIM_Ahmedabad_Logo.svg",
      campus: "https://www.iima.ac.in/sites/default/files/2022-06/Campus.jpg"
    },
    "IIM Bangalore": {
      logo: "https://upload.wikimedia.org/wikipedia/en/4/44/IIM_Bangalore_Logo.svg",
      campus: "https://www.iimb.ac.in/sites/default/files/inline-images/campus.jpg"
    },
    "NLSIU Bangalore": {
      logo: "https://upload.wikimedia.org/wikipedia/en/6/6c/NLSIU_Logo.png",
      campus: "https://www.nls.ac.in/wp-content/uploads/2022/06/NLSIU-Campus.jpg"
    }
  };

  const seed = imgSeed(name);
  const mapped = assets[name];
  
  let logo = mapped?.logo || "";
  if (!logo && website) {
    try {
      const hostname = new URL(website).hostname;
      logo = `https://logo.clearbit.com/${hostname}`;
    } catch (e) {}
  }

  return {
    logo,
    campus: mapped?.campus || `https://images.unsplash.com/photo-${1500000000000 + seed}?q=80&w=2070&auto=format&fit=crop`
  };
}

export default function CollegeDetailView({ 
  college, 
  newsData = [] 
}: { 
  college: CollegeDetail; 
  newsData?: any[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("College Info");
  const { addToShortlist, removeFromShortlist, isInShortlist } = useShortlist();
  
  const seed = imgSeed(college.college);
  const clgAssets = getCollegeAssets(college.college, college.website);
  const collegeId = (college as any).id || seed;
  const isSaved = isInShortlist(collegeId);

  const toggleSave = () => {
    if (isSaved) {
      removeFromShortlist(collegeId);
    } else {
      addToShortlist({
        id: collegeId,
        college: college.college,
        city: college.city || "",
        state: college.state || "",
        nirf_rank: college.nirf_rank,
        avg_package: college.avg_package,
        nirf_category: college.nirf_category,
        logo: clgAssets.logo
      });
    }
  };

  const gradColor = CATEGORY_COLORS[college.nirf_category ?? ""] ?? "from-zinc-950/90 via-zinc-900/60 to-black/90";
  const metaInfo = getCollegeMeta(college.college, college.nirf_category);

  // ── Review Data Generator ──
  const getReviewsList = () => {
    const name = college.college;
    const isIIT = name.includes("IIT");
    const isAIIMS = name.includes("AIIMS");
    const isIIM = name.includes("IIM");

    if (isIIT) {
      return [
        { author: "Rahul Sharma", rating: 5, date: "Oct 2024", text: "Exceptional research facilities and a very vibrant campus life. The placement cell is top-notch with top global firms visiting.", role: "B.Tech Student" },
        { author: "Ananya Iyer", rating: 4, date: "Jan 2025", text: "Rigorous academic curriculum but the learning curve is immense. Great exposure to industry projects and internships.", role: "M.Tech Graduate" },
        { author: "Sneha Patel", rating: 5, date: "Dec 2024", text: "The faculty here is world-class. If you're into engineering and innovation, this is definitely the best choice in India.", role: "Research Scholar" }
      ];
    }
    if (isAIIMS) {
      return [
        { author: "Dr. Vikram Seth", rating: 5, date: "Sep 2024", text: "The clinical exposure here is unmatched. You see the rarest of cases which builds immense confidence as a medic.", role: "MBBS Resident" },
        { author: "Megha Rao", rating: 5, date: "Jan 2025", text: "Best medical infrastructure in the country. The peer group is extremely competitive yet helpful.", role: "MD Student" }
      ];
    }
    if (isIIM) {
      return [
        { author: "Kabir Malhotra", rating: 5, date: "Nov 2024", text: "Case-study based learning at its best. The networking opportunities and placement packages are life-changing.", role: "MBA Student" },
        { author: "Ridhi Kapoor", rating: 4, date: "Dec 2024", text: "Intense pressure but totally worth it. The campus ecosystem is designed for leadership development.", role: "Executive MBA" }
      ];
    }
    return [
      { author: "Aman Gupta", rating: 4, date: "Nov 2024", text: "Great campus and good faculty. The infrastructure is modern and well-maintained. Placements are decent for most branches.", role: "B.Tech Student" },
      { author: "Priya Das", rating: 4, date: "Feb 2025", text: "Satisfied with the course curriculum and the placement support provided by the college. Very active student clubs.", role: "B.Com Student" }
    ];
  };

  // ── Scholarship & Exam Data Generator ──
  const getScholarshipExamsList = () => {
    const cat = college.nirf_category || "Engineering";
    const data: any = {
      "Engineering": [
        { type: "Exam", name: "JEE Advanced 2026", status: "Live", url: "https://jeeadv.ac.in/" },
        { type: "Scholarship", name: "Merit-cum-Means (MCM)", status: "Closed", remark: "Application Closed" },
        { type: "Scholarship", name: "Inspire Scholarship", status: "Live", url: "https://online-inspire.gov.in/" },
        { type: "Exam", name: "GATE 2026", status: "Closed", remark: "Registration Over" },
        { type: "Exam", name: "BITSAT 2026", status: "Live", url: "https://www.bitsadmission.com/" }
      ],
      "Medical": [
        { type: "Exam", name: "NEET UG 2026", status: "Live", url: "https://neet.nta.nic.in/" },
        { type: "Scholarship", name: "Central Sector Scheme", status: "Live", url: "https://scholarships.gov.in/" },
        { type: "Exam", name: "NEET PG 2026", status: "Closed", remark: "Application Period Ended" },
        { type: "Scholarship", name: "State Merit Scholarship", status: "Closed", remark: "Next Intake: July 2026" }
      ],
      "Management": [
        { type: "Exam", name: "CAT 2025", status: "Closed", remark: "Exam Conducted" },
        { type: "Exam", name: "GMAT Focus Edition", status: "Live", url: "https://www.mba.com/exams/gmat" },
        { type: "Scholarship", name: "OP Jindal Engineering & Management", status: "Live", url: "https://www.opjems.com/" },
        { type: "Scholarship", name: "Aditya Birla Scholarship", status: "Closed", remark: "Admissions Closed" }
      ],
      "Law": [
        { type: "Exam", name: "CLAT 2026", status: "Live", url: "https://consortiumofnlus.ac.in/" },
        { type: "Exam", name: "AILET 2026", status: "Closed", remark: "Result Awaited" },
        { type: "Scholarship", name: "Inlaks Shivdasani Foundation", status: "Live", url: "https://www.inlaksfoundation.org/" }
      ]
    };
    return data[cat] || [
      { type: "Scholarship", name: "National Scholarship Portal", status: "Live", url: "https://scholarships.gov.in/" },
      { type: "Exam", name: "CUET 2026", status: "Live", url: "https://cuet.samarth.ac.in/" },
      { type: "Scholarship", name: "Reliance Foundation", status: "Closed", remark: "Registration Closed" }
    ];
  };

  // ── Course Data Generator ──
  const getCoursesList = () => {
    const cat = college.nirf_category || "Engineering";
    switch (cat) {
      case "Engineering": return [
        { name: "B.E. / B.Tech", count: "12 courses", fees: "2.1 L - 8.5 L", eligibility: "10+2 : 75 %", exams: "JEE Main, JEE Advanced" },
        { name: "M.E. / M.Tech", count: "25 courses", fees: "1.2 L - 3.5 L", eligibility: "Graduation : 60 %", exams: "GATE" },
        { name: "M.Sc.", count: "5 courses", fees: "0.8 L - 1.5 L", eligibility: "Graduation : 55 %", exams: "IIT JAM" },
        { name: "Ph.D.", count: "18 courses", fees: "0.5 L - 1.2 L", eligibility: "Post Graduation : 65 %", exams: "UGC NET, GATE" },
        { name: "B.Sc.", count: "2 courses", fees: "1.5 L", eligibility: "10+2 : 75 %", exams: "JEE Main" },
      ];
      case "Management": return [
        { name: "MBA / PGDM", count: "7 courses", fees: "15.5 L - 25.0 L", eligibility: "Graduation : 50 %", exams: "CAT, GMAT, XAT" },
        { name: "Executive MBA", count: "3 courses", fees: "18.0 L - 30.0 L", eligibility: "Graduation : 50 %", exams: "Experience + Interview" },
        { name: "Certificate", count: "10 courses", fees: "0.5 L - 5.0 L", eligibility: "Graduation : 50 %", exams: "Merit Based" },
        { name: "Ph.D.", count: "5 courses", fees: "2.0 L", eligibility: "Post Graduation : 60 %", exams: "CAT, GMAT, GRE" },
      ];
      case "Medical": return [
        { name: "MBBS", count: "1 course", fees: "0.5 L - 15.0 L", eligibility: "10+2 : 50 %", exams: "NEET" },
        { name: "MD / MS", count: "22 courses", fees: "2.0 L - 25.0 L", eligibility: "Graduation : 50 %", exams: "NEET PG" },
        { name: "B.Sc. Nursing", count: "1 course", fees: "1.2 L", eligibility: "10+2 : 45 %", exams: "State Level" },
        { name: "M.Sc. Nursing", count: "5 courses", fees: "1.5 L", eligibility: "Graduation : 50 %", exams: "State Level" },
        { name: "BDS", count: "1 course", fees: "3.0 L - 10.0 L", eligibility: "10+2 : 50 %", exams: "NEET" },
      ];
      case "Law": return [
        { name: "LL.B. / B.A. LL.B.", count: "3 courses", fees: "1.5 L - 8.0 L", eligibility: "10+2 : 45 %", exams: "CLAT, AILET" },
        { name: "LL.M.", count: "5 courses", fees: "1.0 L - 2.5 L", eligibility: "Graduation : 50 %", exams: "CLAT PG" },
        { name: "Ph.D. Law", count: "2 courses", fees: "0.8 L", eligibility: "Post Graduation : 55 %", exams: "UGC NET" },
      ];
      case "Design": return [
        { name: "B.Des.", count: "8 courses", fees: "2.5 L - 12.0 L", eligibility: "10+2 : 50 %", exams: "UCEED, NID DAT" },
        { name: "M.Des.", count: "10 courses", fees: "2.0 L - 8.0 L", eligibility: "Graduation : 50 %", exams: "CEED, NID DAT" },
      ];
      default: return [
        { name: "B.A. / B.Sc.", count: "15 courses", fees: "0.2 L - 1.5 L", eligibility: "10+2 : 50 %", exams: "CUET" },
        { name: "M.A. / M.Sc.", count: "20 courses", fees: "0.5 L - 2.0 L", eligibility: "Graduation : 50 %", exams: "CUET PG" },
        { name: "B.Com.", count: "5 courses", fees: "0.3 L - 1.2 L", eligibility: "10+2 : 50 %", exams: "CUET" },
        { name: "Ph.D.", count: "30 courses", fees: "0.4 L - 1.0 L", eligibility: "Post Graduation : 55 %", exams: "UGC NET" },
      ];
    }
  };

  const getDummyCutoffs = () => {
    const courses = getCoursesList();
    return [
      { course: courses[0].name, category: "General", cutoff: "98.5 percentile" },
      { course: courses[1].name, category: "General", cutoff: "96.2 percentile" },
      { course: courses[2]?.name || "Other Courses", category: "General", cutoff: "92.0 percentile" },
    ];
  };



  return (
    <PageShell>
      <div className="relative w-full pt-8 pb-16 sm:pt-12 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className={`absolute inset-0 bg-gradient-to-r ${gradColor} opacity-40 mix-blend-multiply`} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-[#0a0a0a]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8">
          <div className="flex items-center gap-2 text-[11px] text-white/40 mb-10 sm:mb-16">
            <button onClick={() => router.back()} className="flex items-center gap-1 hover:text-blue-400 transition-colors">
              <ChevronLeft size={13} /> Rankings
            </button>
            <span>/</span>
            <span className="text-white/70">{college.nirf_category}</span>
            <span>/</span>
            <span className="text-white truncate">{college.college}</span>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row items-start sm:items-end gap-6 sm:gap-8">
            
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-2xl backdrop-blur-xl group relative overflow-hidden">
              {clgAssets.logo ? (
                <Image 
                  src={clgAssets.logo} 
                  alt="Logo" 
                  fill 
                  className="object-contain p-4 group-hover:scale-110 transition-transform duration-500" 
                />
              ) : (
                <span className="text-5xl sm:text-7xl font-black text-white/80 font-serif shadow-black drop-shadow-xl">
                  {college.college[0]}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-4 pb-1">
              <div className="flex flex-wrap gap-2 items-center">
                {college.nirf_rank && (
                  <span className="px-3 py-1.5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                    NIRF #{college.nirf_rank}
                  </span>
                )}
                <span className="px-3 py-1.5 bg-white/10 text-white/90 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-white/20 backdrop-blur-md">
                  {college.nirf_category}
                </span>
                {college.global_rank && (
                  <span className="px-3 py-1.5 bg-white/5 text-white/70 text-[10px] font-bold rounded-lg border border-white/10 backdrop-blur-md">
                    QS #{college.global_rank} World
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-tight drop-shadow-2xl">
                {college.college}
              </h1>

              <div className="flex flex-wrap items-center gap-5 text-sm text-white/60">
                {(college.city || college.state) && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={15} className="text-white/40" />
                    {[college.city, college.state].filter(Boolean).join(", ")}
                  </span>
                )}
                {college.website && (
                  <a href={college.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                    <Globe size={15} />Official Website<ExternalLink size={12} />
                  </a>
                )}
              </div>

              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pt-4 mt-2 border-t border-white/10">
                <div className="flex flex-wrap items-center gap-2.5 text-xs">
                  <span className="flex items-center gap-1 text-white/60 font-bold bg-white/5 border border-white/10 px-2 py-1 rounded-md backdrop-blur-md">
                    <Star size={12} className="fill-white/40" /> {college.user_rating || "4.5"} /5 <span className="text-white/20 font-normal">({college.total_reviews || "120"} Reviews)</span>
                  </span>
                  <span className="text-white/70 font-bold bg-white/5 border border-white/10 px-2 py-1 rounded-md backdrop-blur-md">
                    {metaInfo.acc}
                  </span>
                  <span className="text-white/70 bg-white/5 border border-white/10 px-2 py-1 rounded-md backdrop-blur-md">
                    {metaInfo.type}
                  </span>
                  <span className="text-white/70 bg-white/5 border border-white/10 px-2 py-1 rounded-md backdrop-blur-md">
                    Estd. {metaInfo.estd}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button 
                    onClick={toggleSave}
                    className={cn(
                      "flex items-center gap-2 px-6 py-2.5 rounded-xl border text-[11px] font-black uppercase tracking-widest backdrop-blur-md transition-all shadow-lg hover:scale-105 active:scale-95",
                      isSaved 
                        ? "bg-amber-500 border-amber-500 text-white shadow-amber-500/20" 
                        : "border-white/20 text-white hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-400/30"
                    )}
                  >
                    <Bookmark size={14} className={isSaved ? "fill-white" : ""} /> {isSaved ? "Saved" : "Save College"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 pb-24 md:pb-10 pt-4">
        <div className="flex border-b border-white/10 mb-8 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn("px-4 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm font-bold transition-all whitespace-nowrap border-b-2",
                activeTab === tab ? "border-white text-white" : "border-transparent text-white/40 hover:text-blue-400 hover:border-blue-500/50")}>
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

            {activeTab === "College Info" && (
              <div className="flex flex-col">
                <div className="py-8 border-b border-white/5 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">About the Institution</p>
                  <p className="text-sm text-white/70 leading-relaxed">
                    Established in {metaInfo.estd}, {college.college} is a premier {metaInfo.type.toLowerCase()} located in {college.city || "India"}. 
                    Recognized with an {metaInfo.acc} rating, the institution offers world-class academic programs, cutting-edge research facilities, 
                    and a vibrant campus life. It is highly regarded for its rigorous curriculum, distinguished faculty, and exceptional placement 
                    records, making it a top choice for students nationwide.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/5">
                    {[
                      { label: "Category",     value: college.nirf_category },
                      { label: "City",         value: college.city },
                      { label: "State",        value: college.state },
                      { label: "Global Rank",  value: college.global_rank ? `QS #${college.global_rank}` : undefined },
                    ].filter(r => r.value).map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{label}</p>
                        <p className="text-sm font-semibold text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="py-8 border-b border-white/5 space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                      <GraduationCap size={14}/> Featured Programs
                    </p>
                    <button onClick={() => setActiveTab("Courses")} className="text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-blue-400 transition-colors">
                      Explore All Courses →
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getCoursesList().slice(0, 3).map((c: any, i: number) => (
                      <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all cursor-pointer" onClick={() => setActiveTab("Courses")}>
                        <p className="text-sm font-bold text-white mb-1">{c.name}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider">{c.fees} • {c.count}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12 py-8 border-b border-white/5">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                        <Newspaper size={14}/> Recent Updates
                      </p>
                      <button onClick={() => setActiveTab("News")} className="text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-blue-400 transition-colors">
                        All News
                      </button>
                    </div>
                    <div className="space-y-5">
                      {newsData.length > 0 ? (
                        newsData.slice(0, 2).map((item, i) => (
                          <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="block group">
                            <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest mb-1">{new Date(item.published_at || item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                            <p className="text-sm font-medium text-white/70 group-hover:text-blue-400 transition-colors line-clamp-2 leading-relaxed">{item.title}</p>
                          </a>
                        ))
                      ) : (
                        <p className="text-xs text-white/20 italic">No recent updates.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                        <Building2 size={14}/> Cut-offs
                      </p>
                      <span className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded">2025-26</span>
                    </div>
                    <div className="space-y-2">
                      {getDummyCutoffs().map((c, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                          <span className="text-xs font-medium text-white/70">{c.course}</span>
                          <span className="text-xs font-bold text-white">{c.cutoff}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="py-8 border-b border-white/5 space-y-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 pl-2">Research & Innovation</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {[
                      { icon: Cpu,      label: "Patents",      value: fmt(college.patents)            },
                      { icon: BookOpen, label: "Papers",       value: fmt(college.research_papers)    },
                      { icon: Rocket,   label: "Startups",     value: fmt(college.startups_incubated) },
                      { icon: Users,    label: "Hackathons",   value: fmt(college.hackathons_won)      },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="py-2 space-y-1 px-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon size={14} className="text-white/30" />
                          <p className="text-[9px] font-black uppercase tracking-widest text-white/40">{label}</p>
                        </div>
                        <p className="text-2xl font-serif font-bold text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {college.aliases && college.aliases.filter(Boolean).length > 0 && (
                  <div className="py-8 border-b border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-3">Also Known As</p>
                    <div className="flex flex-wrap gap-2">
                      {college.aliases.filter(Boolean).map((alias: string) => (
                        <span key={alias} className="px-3 py-1.5 bg-white/5 border border-white/[0.08] rounded-xl text-xs text-white/50">{alias}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "Courses" && (
              <div className="flex flex-col">
                <div className="py-8 border-b border-white/5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 flex items-center gap-2">
                        <GraduationCap size={14}/> Academic Catalog
                      </p>
                      <h2 className="text-xl font-serif font-bold text-white">Programs & Specializations</h2>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/[0.03] border-b border-white/10">
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-white/30">Courses</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-white/30">Tuition Fees</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-white/30">Eligibility</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getCoursesList().map((c: any, i: number) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-blue-500/[0.05] transition-colors">
                            <td className="p-4 align-top">
                              <p className="text-sm font-bold text-white/90">{c.name}</p>
                              <p className="text-[10px] text-white/30 mt-1">({c.count})</p>
                            </td>
                            <td className="p-4 align-top">
                              <p className="text-sm font-medium text-white/80">{c.fees}</p>
                            </td>
                            <td className="p-4 align-top">
                              <p className="text-sm text-white/70">{c.eligibility}</p>
                              <p className="text-[10px] text-white/40 mt-1.5">Exams : <span className="text-white/60 font-medium">{c.exams}</span></p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "News" && (
              <div className="flex flex-col">
                <div className="py-8 border-b border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-6 flex items-center gap-2">
                    <Newspaper size={14}/> Latest News & Events
                  </p>
                  <div className="flex flex-col gap-3">
                    {newsData.length > 0 ? (
                      newsData.map((item, i) => (
                        <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="block group cursor-pointer py-6 border-b border-white/5 last:border-0 transition-all w-full">
                          <div className="flex items-center gap-6">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2.5">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 bg-white/5 px-2 py-0.5 rounded-md border border-white/10 shrink-0">{item.category || "Campus News"}</span>
                                <span className="text-[10px] text-white/20 font-medium">{new Date(item.published_at || item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                              </div>
                              <h3 className="text-sm font-bold text-white/80 group-hover:text-blue-400 transition-colors leading-relaxed">{item.title}</h3>
                            </div>
                            <ArrowRight size={14} className="text-white/10 group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0" />
                          </div>
                        </a>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-white/[0.01] rounded-2xl border border-white/5">
                        <p className="text-sm text-white/40">No recent news available.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Reviews" && (
              <div className="flex flex-col">
                <div className="py-8 border-b border-white/5">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 flex items-center gap-2">
                        <Star size={14} className="fill-white/10" /> Student Experiences
                      </p>
                      <h2 className="text-xl font-serif font-bold text-white">Verified Campus Reviews</h2>
                    </div>
                    {college.user_rating && (
                      <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                        <span className="text-2xl font-bold text-white">{college.user_rating}</span>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={12} className={s <= Math.round(college.user_rating!) ? "fill-white/40 text-white/40" : "fill-white/10 text-white/10"} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {getReviewsList().map((rev, i) => (
                      <div key={i} className="p-6 bg-white/[0.02] border border-white/[0.08] rounded-3xl hover:bg-white/[0.04] transition-all flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="flex items-center gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} size={14} className={s <= rev.rating ? "fill-white/40 text-white/40" : "fill-white/10 text-white/10"} />
                            ))}
                          </div>
                          <p className="text-sm text-white/70 leading-relaxed italic">"{rev.text}"</p>
                        </div>
                        <div className="mt-6 flex items-center gap-4 border-t border-white/5 pt-4">
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                            <span className="text-xs font-bold text-white/60">{rev.author[0]}</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{rev.author}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-white/40 font-medium">{rev.role}</span>
                              <span className="text-[10px] text-white/20">•</span>
                              <span className="text-[10px] text-white/30">{rev.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Fees" && (
              <div className="flex flex-col">
                <div className="py-8 border-b border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-6 flex items-center gap-2">
                    <DollarSign size={14}/> Tuition Fees Structure
                  </p>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/[0.03] border-b border-white/10">
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-white/30">Course</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-white/30">Total tuition fees</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getCoursesList().map((c: any, i: number) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-blue-500/[0.05] transition-colors">
                            <td className="p-4 py-6">
                              <span className="text-sm font-bold text-white/90">{c.name}</span>
                              <span className="text-[11px] text-white/30 ml-2">({c.count})</span>
                            </td>
                            <td className="p-4 py-6">
                              <p className="text-sm font-medium text-white/80">₹ {c.fees}</p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}


            {activeTab === "Scholarship & Exams" && (
              <div className="flex flex-col">
                <div className="py-8 border-b border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-8 flex items-center gap-2">
                    <Award size={14}/> Financial Aid & Entrance
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    {getScholarshipExamsList().map((item: any, i: number) => (
                      <div key={i} className="group cursor-pointer py-6 border-b border-white/5 last:border-0 transition-all flex items-center justify-between w-full">
                        <div className="flex items-center gap-6">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border transition-colors", 
                            "bg-white/5 border-white/10 group-hover:border-white/30")}>
                            {item.type === "Exam" ? <FileText size={18} className="text-white/40" /> : <Landmark size={18} className="text-white/40" />}
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">{item.type}</p>
                            <p className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">{item.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          {item.status === "Live" ? (
                            <a 
                              href={item.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-widest bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/5"
                            >
                              Apply Now
                            </a>
                          ) : (
                            <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] border bg-white/5 text-white/20 border-white/10">
                              {item.status}
                            </span>
                          )}
                          <ArrowRight size={14} className="text-white/10 group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}


          </motion.div>
        </AnimatePresence>

      </div>

      <ChatWidget collegeName={college.college} logo={clgAssets.logo} />
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden">
      <aside className="hidden md:flex w-20 border-r border-white/5 flex-col items-center py-8 gap-8 z-[100] bg-[#0a0a0a]">
        <Link href="/" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-xl">
          <GraduationCap className="text-black w-6 h-6" />
        </Link>
        <nav className="flex flex-col gap-6 items-center">
          {[
            { icon: LayoutGrid, href: "/rankings" },
            { icon: Newspaper, href: "/news" },
            { icon: MessageSquare, href: "/chat" },
          ].map((item, i) => (
            <Link key={i} href={item.href} className="text-white/30 hover:text-blue-400 transition-colors p-3 hover:bg-blue-500/10 rounded-xl">
              <item.icon size={20} />
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto custom-scrollbar">{children}</main>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }

      `}</style>
    </div>
  );
}

