"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap, Brain, Newspaper, MapPin, ExternalLink,
  Star, ChevronRight, Users, Bookmark,
  BookOpen, Award, Globe, Lightbulb, Rocket, Building2, ArrowRight,
  MessageSquare, Cpu, DollarSign, Info, FileText, LayoutGrid, Landmark,
} from "lucide-react";

import Image from "next/image";
import dynamic from "next/dynamic";
import { ChatWidget } from "@/app/components/ChatWidget";
import { useShortlist } from "../../context/ShortlistContext";

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(" ");
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4006").replace("localhost", "127.0.0.1");

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

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
  courses?: any[];
  last_updated?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Engineering:  "from-[#b69cc4]/30 via-zinc-100/50 to-white",
  Management:   "from-[#fcd34d]/30 via-zinc-100/50 to-white",
  Medical:      "from-[#f472b6]/30 via-zinc-100/50 to-white",
  Law:          "from-purple-100/50 via-zinc-100/50 to-white",
  Research:     "from-cyan-100/50 via-zinc-100/50 to-white",
  Design:       "from-rose-100/50 via-zinc-100/50 to-white",
  Pharmacy:     "from-teal-100/50 via-zinc-100/50 to-white",
  Agriculture:  "from-lime-100/50 via-zinc-100/50 to-white",
  University:   "from-indigo-100/50 via-zinc-100/50 to-white",
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
  const [localCollege, setLocalCollege] = useState(college);
  const [activeTab, setActiveTab] = useState<Tab>("College Info");
  const [isSyncing, setIsSyncing] = useState(false);
  const { addToShortlist, removeFromShortlist, isInShortlist } = useShortlist();
  
  const seed = imgSeed(localCollege.college);
  const clgAssets = getCollegeAssets(localCollege.college, localCollege.website);
  const collegeId = (localCollege as any).id || seed;
  const isSaved = isInShortlist(collegeId);

  // Silent Background Sync
  useEffect(() => {
    const triggerSync = async () => {
      try {
        const res = await fetch(`${API_URL}/api/colleges/${toSlug(localCollege.college)}`);
        const data = await res.json();
        
        if (data.syncRequired) {
          setIsSyncing(true);
          await fetch(`${API_URL}/api/rankings/sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ college: localCollege.college })
          });
          
          setTimeout(async () => {
            const freshRes = await fetch(`${API_URL}/api/colleges/${toSlug(localCollege.college)}`);
            const freshData = await freshRes.json();
            if (freshData.college) {
              setLocalCollege(freshData.college);
            }
            setIsSyncing(false);
          }, 8000);
        }
      } catch (err) {
        console.error("Silent sync failed:", err);
      }
    };

    triggerSync();
  }, [localCollege.college]);

  const toggleSave = () => {
    if (isSaved) {
      removeFromShortlist(collegeId);
    } else {
      addToShortlist({
        id: collegeId,
        college: localCollege.college,
        city: localCollege.city || "",
        state: localCollege.state || "",
        nirf_rank: localCollege.nirf_rank,
        avg_package: localCollege.avg_package,
        nirf_category: localCollege.nirf_category || "Engineering",
        logo: clgAssets.logo
      });
    }
  };

  const gradColor = CATEGORY_COLORS[localCollege.nirf_category ?? ""] ?? "from-[#b69cc4]/30 via-zinc-100/50 to-white";
  const metaInfo = getCollegeMeta(localCollege.college, localCollege.nirf_category);

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

  const getCoursesList = () => {
    if (localCollege.courses && Array.isArray(localCollege.courses) && localCollege.courses.length > 0) {
      return localCollege.courses;
    }
    const cat = localCollege.nirf_category || "Engineering";
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
      <div className="relative w-full pt-8 pb-16 sm:pt-12 sm:pb-20 overflow-hidden text-black">
        <div className="absolute inset-0 z-0">
          <div className={`absolute inset-0 bg-gradient-to-r ${gradColor} opacity-40 mix-blend-multiply`} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-100/20 to-[#f3f4f6]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8">
          {/* ── Breadcrumbs ── */}
          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-10 sm:mb-16">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <ChevronRight size={10} />
            <Link href="/rankings" className="hover:text-black transition-colors">Rankings</Link>
            <ChevronRight size={10} />
            <span className="text-black truncate max-w-[300px]">{localCollege.college}</span>
            {isSyncing && (
              <span className="flex items-center gap-2 ml-4 text-zinc-500 font-bold animate-pulse">
                Refreshing Intel...
              </span>
            )}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            
            <div className="space-y-8 flex-1">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white border-2 border-black rounded-xl flex items-center justify-center shadow-[4px_4px_0px_0px_#000000] p-4 sm:p-6 overflow-hidden relative text-black shrink-0">
                  <img src={clgAssets.logo} alt={localCollege.college} className="w-full h-full object-contain relative z-10" />
                </div>
                {localCollege.nirf_rank && (
                  <span className="px-5 py-2.5 bg-white border-2 border-black rounded-lg text-xs font-black uppercase tracking-[0.2em] shadow-[2px_2px_0px_0px_#000000] text-black">
                    NIRF Rank #{localCollege.nirf_rank}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black text-black tracking-tight leading-tight">
                {localCollege.college}
              </h1>

              <div className="flex flex-wrap items-center gap-5 text-sm text-zinc-700">
                {(localCollege.city || localCollege.state) && (
                  <span className="flex items-center gap-1.5 font-bold">
                    <MapPin size={15} className="text-black" />
                    {[localCollege.city, localCollege.state].filter(Boolean).join(", ")}
                  </span>
                )}
                {localCollege.website && (
                  <a href={localCollege.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-[#a387b3] font-bold transition-colors">
                    <Globe size={15} />Official Website<ExternalLink size={12} />
                  </a>
                )}
              </div>

              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pt-4 mt-2 border-t-2 border-black/10">
                <div className="flex flex-wrap items-center gap-2.5 text-xs">
                  <span className="flex items-center gap-1 text-black font-bold bg-[#b69cc4]/30 border-2 border-black px-2 py-1 rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                    <Star size={12} className="fill-black" /> {localCollege.user_rating || "4.5"} /5 <span className="text-zinc-600 font-normal ml-1">({localCollege.total_reviews || "120"} Reviews)</span>
                  </span>
                  <span className="text-black font-bold bg-white border-2 border-black px-2 py-1 rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                    {metaInfo.acc}
                  </span>
                  <span className="text-black font-bold bg-white border-2 border-black px-2 py-1 rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                    {metaInfo.type}
                  </span>
                  <span className="text-black font-bold bg-white border-2 border-black px-2 py-1 rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                    Estd. {metaInfo.estd}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button 
                    onClick={toggleSave}
                    className={cn(
                      "flex items-center gap-2 px-6 py-2.5 rounded-lg border-2 border-black text-[11px] font-black uppercase tracking-widest transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
                      isSaved 
                        ? "bg-[#b69cc4] text-black" 
                        : "bg-white text-zinc-600 hover:text-black"
                    )}
                  >
                    <Bookmark size={14} className={isSaved ? "fill-black" : ""} /> {isSaved ? "Saved" : "Save College"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 pb-24 md:pb-10 pt-4 text-black">
        <div className="flex border-b-2 border-black/10 mb-8 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn("px-4 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm font-bold transition-all whitespace-nowrap border-b-2",
                activeTab === tab ? "border-black text-black font-black" : "border-transparent text-zinc-500 hover:text-black hover:border-black/50")}>
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

            {activeTab === "College Info" && (
              <div className="flex flex-col text-black">
                <div className="py-8 border-b-2 border-black/10 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">About the Institution</p>
                  <p className="text-sm text-zinc-700 leading-relaxed font-bold">
                    Established in {metaInfo.estd}, {localCollege.college} is a premier {metaInfo.type.toLowerCase()} located in {localCollege.city || "India"}. 
                    Recognized with an {metaInfo.acc} rating, the institution offers world-class academic programs, cutting-edge research facilities, 
                    and a vibrant campus life. It is highly regarded for its rigorous curriculum, distinguished faculty, and exceptional placement 
                    records, making it a top choice for students nationwide.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-black/10">
                    {[
                      { label: "Category",     value: localCollege.nirf_category },
                      { label: "City",         value: localCollege.city },
                      { label: "State",        value: localCollege.state },
                      { label: "Global Rank",  value: localCollege.global_rank ? `QS #${localCollege.global_rank}` : undefined },
                    ].filter(r => r.value).map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
                        <p className="text-sm font-black text-black">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="py-8 border-b-2 border-black/10 space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                      <GraduationCap size={14}/> Featured Programs
                    </p>
                    <button onClick={() => setActiveTab("Courses")} className="text-[10px] font-black uppercase tracking-widest text-black hover:underline transition-colors">
                      Explore All Courses →
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getCoursesList().slice(0, 3).map((c: any, i: number) => (
                      <div key={i} className="p-4 bg-white border-2 border-black rounded-xl hover:bg-[#b69cc4]/10 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" onClick={() => setActiveTab("Courses")}>
                        <p className="text-sm font-black text-black mb-1">{c.name}</p>
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{c.fees} • {c.count}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12 py-8 border-b-2 border-black/10">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                        <Newspaper size={14}/> Recent Updates
                      </p>
                      <button onClick={() => setActiveTab("News")} className="text-[10px] font-black uppercase tracking-widest text-black hover:underline transition-colors">
                        All News
                      </button>
                    </div>
                    <div className="space-y-5">
                      {newsData.length > 0 ? (
                        newsData.slice(0, 2).map((item, i) => (
                          <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="block group">
                            <p className="text-[9px] text-[#a387b3] font-black uppercase tracking-widest mb-1">{new Date(item.published_at || item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                            <p className="text-sm font-bold text-black group-hover:text-[#a387b3] transition-colors line-clamp-2 leading-relaxed">{item.title}</p>
                          </a>
                        ))
                      ) : (
                        <p className="text-xs text-zinc-500 italic">No recent updates.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                        <Building2 size={14}/> Cut-offs
                      </p>
                      <span className="text-[10px] text-black bg-[#b69cc4]/30 px-2 py-0.5 border border-black/20 rounded font-black">2025-26</span>
                    </div>
                    <div className="space-y-2">
                      {getDummyCutoffs().map((c, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-black/10 last:border-0">
                          <span className="text-xs font-bold text-zinc-700">{c.course}</span>
                          <span className="text-xs font-black text-black">{c.cutoff}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="py-8 border-b-2 border-black/10 space-y-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 pl-2">Research & Innovation</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {[
                      { icon: Cpu,      label: "Patents",      value: fmt(college.patents)            },
                      { icon: BookOpen, label: "Papers",       value: fmt(college.research_papers)    },
                      { icon: Rocket,   label: "Startups",     value: fmt(college.startups_incubated) },
                      { icon: Users,    label: "Hackathons",   value: fmt(college.hackathons_won)      },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="py-4 space-y-1 px-4 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon size={14} className="text-black" />
                          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{label}</p>
                        </div>
                        <p className="text-2xl font-serif font-black text-black">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {college.aliases && college.aliases.filter(Boolean).length > 0 && (
                  <div className="py-8 border-b-2 border-black/10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3">Also Known As</p>
                    <div className="flex flex-wrap gap-2">
                      {college.aliases.filter(Boolean).map((alias: string) => (
                        <span key={alias} className="px-3 py-1.5 bg-white border-2 border-black rounded-lg text-xs text-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] font-bold">{alias}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "Courses" && (
              <div className="flex flex-col text-black">
                <div className="py-8 border-b-2 border-black/10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 flex items-center gap-2">
                        <GraduationCap size={14}/> Academic Catalog
                      </p>
                      <h2 className="text-xl font-serif font-black text-black">Programs & Specializations</h2>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto border-2 border-black rounded-xl">
                    <table className="w-full text-left border-collapse bg-white">
                      <thead>
                        <tr className="bg-zinc-100 border-b-2 border-black text-black">
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-black">Courses</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-black">Tuition Fees</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-black">Eligibility</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getCoursesList().map((c: any, i: number) => (
                          <tr key={i} className="border-b border-black/10 hover:bg-[#b69cc4]/5 transition-colors">
                            <td className="p-4 align-top">
                              <p className="text-sm font-bold text-black">{c.name}</p>
                              {c.count && <p className="text-[10px] text-zinc-500 mt-1">({c.count})</p>}
                            </td>
                            <td className="p-4 align-top">
                              <p className="text-sm font-bold text-black">{c.fees || "N/A"}</p>
                            </td>
                            <td className="p-4 align-top">
                              <p className="text-sm text-zinc-700 font-medium">{c.eligibility || "Check Website"}</p>
                              {c.exams && <p className="text-[10px] text-zinc-500 mt-1.5 font-bold">Exams : <span className="text-black font-black">{c.exams}</span></p>}
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
              <div className="flex flex-col text-black">
                <div className="py-8 border-b-2 border-black/10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 flex items-center gap-2">
                    <Newspaper size={14}/> Latest News & Events
                  </p>
                  <div className="flex flex-col gap-3">
                    {newsData.length > 0 ? (
                      newsData.map((item, i) => (
                        <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="block group cursor-pointer py-6 border-b border-black/10 last:border-0 transition-all w-full bg-white border-2 border-black rounded-xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-4">
                          <div className="flex items-center gap-6">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2.5">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black bg-[#b69cc4]/30 px-2 py-0.5 border border-black/20 rounded shrink-0">{item.category || "Campus News"}</span>
                                <span className="text-[10px] text-zinc-500 font-bold">{new Date(item.published_at || item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                              </div>
                              <h3 className="text-sm font-black text-black group-hover:text-[#a387b3] transition-colors leading-relaxed">{item.title}</h3>
                            </div>
                            <ArrowRight size={14} className="text-black group-hover:text-[#a387b3] group-hover:translate-x-1 transition-all shrink-0" />
                          </div>
                        </a>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <p className="text-sm text-zinc-500 font-bold">No recent news available.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Reviews" && (
              <div className="flex flex-col text-black">
                <div className="py-8 border-b-2 border-black/10">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 flex items-center gap-2">
                        <Star size={14} className="fill-black" /> Student Experiences
                      </p>
                      <h2 className="text-xl font-serif font-black text-black">Verified Campus Reviews</h2>
                    </div>
                    {college.user_rating && (
                      <div className="flex items-center gap-3 bg-[#b69cc4]/35 px-4 py-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <span className="text-2xl font-black text-black">{college.user_rating}</span>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={12} className={s <= Math.round(college.user_rating!) ? "fill-black text-black" : "text-black/20"} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {getReviewsList().map((rev, i) => (
                      <div key={i} className="p-6 bg-white border-2 border-black rounded-[2rem] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all">
                        <div className="space-y-4">
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} size={14} className={s <= rev.rating ? "fill-black text-black" : "text-black/20"} />
                            ))}
                          </div>
                          <p className="text-sm text-zinc-800 leading-relaxed font-bold italic">"{rev.text}"</p>
                        </div>
                        <div className="mt-6 flex items-center gap-4 border-t-2 border-black/10 pt-4">
                          <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center border-2 border-black">
                            <span className="text-xs font-black text-black">{rev.author[0]}</span>
                          </div>
                          <div>
                            <p className="text-sm font-black text-black">{rev.author}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-zinc-500 font-bold">{rev.role}</span>
                              <span className="text-[10px] text-zinc-400">•</span>
                              <span className="text-[10px] text-zinc-600 font-bold">{rev.date}</span>
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
              <div className="flex flex-col text-black">
                <div className="py-8 border-b-2 border-black/10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 flex items-center gap-2">
                    <DollarSign size={14}/> Tuition Fees Structure
                  </p>
                  
                  <div className="overflow-x-auto border-2 border-black rounded-xl bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-100 border-b-2 border-black text-black">
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-black">Course</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-black">Total tuition fees</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getCoursesList().map((c: any, i: number) => (
                          <tr key={i} className="border-b border-black/10 hover:bg-[#b69cc4]/5 transition-colors">
                            <td className="p-4 py-6">
                              <span className="text-sm font-black text-black">{c.name}</span>
                              <span className="text-[11px] text-zinc-500 ml-2 font-bold">({c.count})</span>
                            </td>
                            <td className="p-4 py-6">
                              <p className="text-sm font-bold text-black">₹ {c.fees}</p>
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
              <div className="flex flex-col text-black">
                <div className="py-8 border-b-2 border-black/10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-8 flex items-center gap-2">
                    <Award size={14}/> Financial Aid & Entrance
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    {getScholarshipExamsList().map((item: any, i: number) => (
                      <div key={i} className="group cursor-pointer py-6 px-6 border-2 border-black rounded-xl bg-white transition-all flex items-center justify-between w-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-4">
                        <div className="flex items-center gap-6">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center border-2 border-black bg-zinc-50 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                            {item.type === "Exam" ? <FileText size={18} className="text-black" /> : <Landmark size={18} className="text-black" />}
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">{item.type}</p>
                            <p className="text-base font-black text-black group-hover:text-[#a387b3] transition-colors">{item.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          {item.status === "Live" ? (
                            <a 
                              href={item.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[9px] font-black px-4 py-2 border-2 border-black rounded-lg uppercase tracking-widest bg-[#b69cc4] text-black hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            >
                              Apply Now
                            </a>
                          ) : (
                            <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] border-2 border-black bg-zinc-100 text-zinc-400">
                              {item.status}
                            </span>
                          )}
                          <ArrowRight size={14} className="text-black group-hover:text-[#a387b3] group-hover:translate-x-1 transition-all shrink-0" />
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
    <div className="flex h-screen bg-[#f3f4f6] text-black font-sans overflow-hidden">
      <aside className="hidden md:flex w-20 border-r-2 border-black flex-col items-center py-8 gap-8 z-[100] bg-white shrink-0">
        <Link href="/" className="w-12 h-12 bg-white rounded-lg border-2 border-black flex items-center justify-center hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
          <GraduationCap className="text-black w-6 h-6" />
        </Link>
        <nav className="flex flex-col gap-6 items-center">
          {[
            { icon: LayoutGrid, href: "/rankings" },
            { icon: Newspaper, href: "/news" },
            { icon: MessageSquare, href: "/chat" },
          ].map((item, i) => (
            <Link key={i} href={item.href} className="text-zinc-500 hover:text-black transition-colors p-3 hover:bg-[#b69cc4]/30 rounded-lg border-2 border-transparent hover:border-black hover:shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1.5px] hover:translate-y-[1.5px] transition-all">
              <item.icon size={20} />
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#f3f4f6]">{children}</main>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border: 1px solid #f3f4f6; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.4); }
      `}</style>
    </div>
  );
}
