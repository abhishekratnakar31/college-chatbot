/**
 * Trusted news sources for Indian colleges.
 * We use Google News RSS (free, stable, no scraping required).
 *
 * Google News RSS format: https://news.google.com/rss/search?q=QUERY&hl=en-IN&gl=IN&ceid=IN:en
 */
export interface FeedSource {
  name: string;
  url: string;
  scrape?: boolean;
  baseUrl?: string;
}

const GN = (query: string, name: string): FeedSource => ({
  name,
  url: `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`,
});

export const RSS_FEEDS: FeedSource[] = [

  // ── 🏛️ IITs ──────────────────────────────────────────────────────────────
  GN("IIT Delhi admission courses campus placements 2025", "IIT Delhi"),
  GN("IIT Bombay admission courses placements research 2025", "IIT Bombay"),
  GN("IIT Madras admission courses research placements 2025", "IIT Madras"),
  GN("IIT Kanpur admission courses research BTech 2025", "IIT Kanpur"),
  GN("IIT Kharagpur admission placements BTech courses 2025", "IIT Kharagpur"),
  GN("IIT Roorkee admission research placements 2025", "IIT Roorkee"),
  GN("IIT Guwahati admission BTech courses research 2025", "IIT Guwahati"),
  GN("IIT Hyderabad admission BTech research 2025", "IIT Hyderabad"),
  GN("IIT BHU Varanasi admission placements 2025", "IIT BHU"),
  GN("IIT Dhanbad ISM admission courses mining 2025", "IIT (ISM) Dhanbad"),

  // ── 🏛️ NITs & Deemed ─────────────────────────────────────────────────────
  GN("NIT Trichy admission courses placements 2025", "NIT Trichy"),
  GN("NIT Surathkal admission courses placements 2025", "NIT Surathkal"),
  GN("NIT Warangal admission BTech placements 2025", "NIT Warangal"),
  GN("NIT Calicut admission BTech courses 2025", "NIT Calicut"),
  GN("BITS Pilani admission campus placements 2025", "BITS Pilani"),
  GN("VIT Vellore admission placements BTech 2025", "VIT Vellore"),
  GN("SRM University admission placements BTech 2025", "SRM University"),
  GN("Manipal University admission courses 2025", "Manipal University"),
  GN("IIIT Hyderabad admission CSE courses placements 2025", "IIIT Hyderabad"),
  GN("DTU Delhi Technological University admission 2025", "DTU Delhi"),
  GN("NSUT IGDTU Delhi admission BTech 2025", "NSUT Delhi"),
  GN("Thapar Institute admission BTech courses 2025", "Thapar University"),

  // ── 💻 Engineering: Hackathons & Competitions ────────────────────────────
  GN("hackathon India engineering students 2025 winner", "Engineering Hackathons"),
  GN("Smart India Hackathon 2025 winner engineering", "Smart India Hackathon"),
  GN("robocon India robotics competition college 2025", "Robocon India"),
  GN("ICPC programming contest India college 2025", "ICPC India"),
  GN("IEEE student competition India engineering 2025", "IEEE Competitions"),
  GN("ACM student chapter India coding competition 2025", "ACM Coding"),
  GN("Formula Student India SAE competition engineering 2025", "Formula Student India"),
  GN("drone competition aeronautics engineering India 2025", "Drone Competitions"),
  GN("IIT tech fest hackathon competition 2025", "IIT Tech Fests"),
  GN("Techfest Kurukshetra Cognizance engineering fest India 2025", "Engineering Fests"),

  // ── 🩺 Medical ─────────────────────────────────────────────────────────────
  GN("NEET 2025 result cutoff counselling admission", "NEET 2025"),
  GN("AIIMS Delhi admission MBBS courses 2025", "AIIMS"),
  GN("NEET UG PG 2025 India medical admission", "Medical Admission"),
  GN("MBBS BDS admission India medical college 2025", "MBBS Admission"),
  GN("medical college India entrance exam 2025", "Medical Colleges"),
  GN("AIIMS Jodhpur Bhopal Rishikesh admission 2025", "AIIMS Regional"),
  GN("nursing ANM GNM admission India 2025", "Nursing Admission"),

  // ── 🩺 Medical: Competitions & Research ──────────────────────────────────
  GN("medical student research competition India 2025", "Medical Research Competitions"),
  GN("AIIMS medical quiz symposium competition 2025", "Medical Symposiums"),
  GN("nursing healthcare student competition India 2025", "Healthcare Competitions"),

  // ── 🎨 Design & Architecture ─────────────────────────────────────────────
  GN("NIFT entrance exam 2025 admission fashion design", "NIFT"),
  GN("NID admission design entrance exam 2025", "NID"),
  GN("architecture entrance exam NATA B.Arch 2025", "Architecture NATA"),
  GN("fashion design college India admission 2025", "Design Colleges"),
  GN("Pearl Academy Symbiosis design admission 2025", "Pearl Symbiosis Design"),

  // ── 🎨 Design: Hackathons & Competitions ─────────────────────────────────
  GN("design hackathon India college 2025 competition", "Design Hackathons"),
  GN("NIFT design competition fashion student India 2025", "NIFT Design Contest"),
  GN("UI UX design challenge India students 2025", "UI UX Competitions"),
  GN("architecture design competition India students 2025", "Architecture Competitions"),
  GN("graphic design competition college India 2025", "Graphic Design Contests"),

  // ── 💼 Management & MBA ──────────────────────────────────────────────────
  GN("IIM CAT 2025 MBA admission placements", "IIM CAT MBA"),
  GN("CAT 2025 exam registration result cutoff", "CAT Exam"),
  GN("MBA admission India business school ranking 2025", "MBA Admission"),
  GN("XLRI IIFT FMS JBIMS MBA admission 2025", "Top MBA Colleges"),
  GN("BBA admission management college India 2025", "BBA Admission"),
  GN("IMT MDI SP Jain MBA admission 2025", "MBA Colleges Tier 2"),

  // ── 💼 Management: Competitions ──────────────────────────────────────────
  GN("business case study competition India college 2025", "Business Case Competitions"),
  GN("IIM B-school management fest competition 2025", "B-School Fests"),
  GN("marketing business plan competition India students 2025", "Marketing Competitions"),
  GN("startup competition India college entrepreneur 2025", "Startup Competitions"),
  GN("CFA institute research challenge India 2025", "CFA Research Challenge"),

  // ── 🔬 Science & Research ────────────────────────────────────────────────
  GN("BSc MSc admission science college India 2025", "BSc MSc"),
  GN("IISER IISc admission research BTech BSc 2025", "IISER IISc"),
  GN("ISRO DRDO science research India 2025", "ISRO DRDO"),
  GN("GATE 2025 result cutoff admission MTech", "GATE 2025"),
  GN("JAM 2025 IIT admission MSc science", "IIT JAM"),

  // ── 🔬 Science: Olympiads & Competitions ─────────────────────────────────
  GN("science olympiad India students 2025 chemistry physics", "Science Olympiads"),
  GN("India INMO INPHO INCHO science olympiad 2025", "National Olympiads"),
  GN("KVPY scholarship science research students India 2025", "KVPY"),
  GN("research internship India science students IIT 2025", "Research Internships"),
  GN("physics chemistry biology competition India college 2025", "Science Competitions"),

  // ── 💰 Commerce & Finance ─────────────────────────────────────────────────
  GN("BCom MCom commerce college India admission 2025", "BCom MCom"),
  GN("CA ICAI chartered accountant exam 2025 result", "CA ICAI"),
  GN("economics finance college India admission 2025", "Commerce Finance"),
  GN("CMA CS institute exam India 2025", "CMA CS Exams"),

  // ── 💰 Commerce: Competitions ────────────────────────────────────────────
  GN("CA ICAI quiz competition students India 2025", "ICAI Competitions"),
  GN("finance stock market competition college India 2025", "Finance Competitions"),
  GN("commerce economics quiz competition India 2025", "Commerce Quiz"),

  // ── 📝 Entrance Exams & Results ──────────────────────────────────────────
  GN("JEE Advanced 2025 result cutoff counselling", "JEE Advanced"),
  GN("JEE Main 2025 result session cutoff rank", "JEE Main"),
  GN("CUET 2025 admission central university entrance", "CUET"),
  GN("CLAT 2025 law college NLU admission entrance", "CLAT Law"),
  GN("NEET PG 2025 postgraduate medical exam result", "NEET PG"),
  GN("UPSC civil services exam 2025 result prelims", "UPSC"),
  GN("SNAP XAT IIFT 2025 MBA entrance exam", "MBA Entrance Exams"),
  GN("India board exam CBSE ICSE result 2025", "Board Results"),
  GN("admit card 2025 India entrance exam download", "Admit Cards"),

  // ── 🎮 Tech & Coding Competitions (all fields) ───────────────────────────
  GN("Google Summer of Code India students 2025", "Google Summer of Code"),
  GN("Microsoft Imagine Cup India 2025 competition", "Microsoft Imagine Cup"),
  GN("Meta hackathon India students competition 2025", "Meta Hackathon"),
  GN("GitHub student competition India open source 2025", "GitHub Competitions"),
  GN("Flipkart Grid Amazon ML challenge India 2025", "Industry Challenges"),
  GN("coding competition contest Codeforces Leetcode India 2025", "Coding Contests"),
  GN("data science AI ML competition India students 2025", "AI ML Competitions"),

  // ── 📰 General Higher Education ──────────────────────────────────────────
  GN("Indian college university admission placements 2025", "Indian Colleges"),
  GN("UGC AICTE India higher education policy 2025", "UGC AICTE"),
  GN("NIRF India college ranking 2025", "NIRF Rankings"),
  GN("college campus placements salary package India 2025", "Campus Placements"),
];
