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
  GN("IIT Delhi admission courses campus placements 2026", "IIT Delhi"),
  GN("IIT Bombay admission courses placements research 2026", "IIT Bombay"),
  GN("IIT Madras admission courses research placements 2026", "IIT Madras"),
  GN("IIT Kanpur admission courses research BTech 2026", "IIT Kanpur"),
  GN("IIT Kharagpur admission placements BTech courses 2026", "IIT Kharagpur"),
  GN("IIT Roorkee admission research placements 2026", "IIT Roorkee"),
  GN("IIT Guwahati admission BTech courses research 2026", "IIT Guwahati"),
  GN("IIT Hyderabad admission BTech research 2026", "IIT Hyderabad"),
  GN("IIT BHU Varanasi admission placements 2026", "IIT BHU"),
  GN("IIT Dhanbad ISM admission courses mining 2026", "IIT (ISM) Dhanbad"),

  // ── 🏛️ NITs & Deemed ─────────────────────────────────────────────────────
  GN("NIT Trichy admission courses placements 2026", "NIT Trichy"),
  GN("NIT Surathkal admission courses placements 2026", "NIT Surathkal"),
  GN("NIT Warangal admission BTech placements 2026", "NIT Warangal"),
  GN("NIT Calicut admission BTech courses 2026", "NIT Calicut"),
  GN("BITS Pilani admission campus placements 2026", "BITS Pilani"),
  GN("VIT Vellore admission placements BTech 2026", "VIT Vellore"),
  GN("SRM University admission placements BTech 2026", "SRM University"),
  GN("Manipal University admission courses 2026", "Manipal University"),
  GN("IIIT Hyderabad admission CSE courses placements 2026", "IIIT Hyderabad"),
  GN("DTU Delhi Technological University admission 2026", "DTU Delhi"),
  GN("NSUT IGDTU Delhi admission BTech 2026", "NSUT Delhi"),
  GN("Thapar Institute admission BTech courses 2026", "Thapar University"),

  // ── 💻 Engineering: Hackathons & Competitions ────────────────────────────
  GN("hackathon India engineering students 2026 winner", "Engineering Hackathons"),
  GN("Smart India Hackathon 2026 winner engineering", "Smart India Hackathon"),
  GN("robocon India robotics competition college 2026", "Robocon India"),
  GN("ICPC programming contest India college 2026", "ICPC India"),
  GN("IEEE student competition India engineering 2026", "IEEE Competitions"),
  GN("ACM student chapter India coding competition 2026", "ACM Coding"),
  GN("Formula Student India SAE competition engineering 2026", "Formula Student India"),
  GN("drone competition aeronautics engineering India 2026", "Drone Competitions"),
  GN("IIT tech fest hackathon competition 2026", "IIT Tech Fests"),
  GN("Techfest Kurukshetra Cognizance engineering fest India 2026", "Engineering Fests"),

  // ── 🩺 Medical ─────────────────────────────────────────────────────────────
  GN("NEET 2026 result cutoff counselling admission", "NEET 2026"),
  GN("AIIMS Delhi admission MBBS courses 2026", "AIIMS"),
  GN("NEET UG PG 2026 India medical admission", "Medical Admission"),
  GN("MBBS BDS admission India medical college 2026", "MBBS Admission"),
  GN("medical college India entrance exam 2026", "Medical Colleges"),
  GN("AIIMS Jodhpur Bhopal Rishikesh admission 2026", "AIIMS Regional"),
  GN("nursing ANM GNM admission India 2026", "Nursing Admission"),

  // ── 🩺 Medical: Competitions & Research ──────────────────────────────────
  GN("medical student research competition India 2026", "Medical Research Competitions"),
  GN("AIIMS medical quiz symposium competition 2026", "Medical Symposiums"),
  GN("nursing healthcare student competition India 2026", "Healthcare Competitions"),

  // ── 🎨 Design & Architecture ─────────────────────────────────────────────
  GN("NIFT entrance exam 2026 admission fashion design", "NIFT"),
  GN("NID admission design entrance exam 2026", "NID"),
  GN("architecture entrance exam NATA B.Arch 2026", "Architecture NATA"),
  GN("fashion design college India admission 2026", "Design Colleges"),
  GN("Pearl Academy Symbiosis design admission 2026", "Pearl Symbiosis Design"),

  // ── 🎨 Design: Hackathons & Competitions ─────────────────────────────────
  GN("design hackathon India college 2026 competition", "Design Hackathons"),
  GN("NIFT design competition fashion student India 2026", "NIFT Design Contest"),
  GN("UI UX design challenge India students 2026", "UI UX Competitions"),
  GN("architecture design competition India students 2026", "Architecture Competitions"),
  GN("graphic design competition college India 2026", "Graphic Design Contests"),

  // ── 💼 Management & MBA ──────────────────────────────────────────────────
  GN("IIM CAT 2026 MBA admission placements", "IIM CAT MBA"),
  GN("CAT 2026 exam registration result cutoff", "CAT Exam"),
  GN("MBA admission India business school ranking 2026", "MBA Admission"),
  GN("XLRI IIFT FMS JBIMS MBA admission 2026", "Top MBA Colleges"),
  GN("BBA admission management college India 2026", "BBA Admission"),
  GN("IMT MDI SP Jain MBA admission 2026", "MBA Colleges Tier 2"),

  // ── 💼 Management: Competitions ──────────────────────────────────────────
  GN("business case study competition India college 2026", "Business Case Competitions"),
  GN("IIM B-school management fest competition 2026", "B-School Fests"),
  GN("marketing business plan competition India students 2026", "Marketing Competitions"),
  GN("startup competition India college entrepreneur 2026", "Startup Competitions"),
  GN("CFA institute research challenge India 2026", "CFA Research Challenge"),

  // ── 🔬 Science & Research ────────────────────────────────────────────────
  GN("BSc MSc admission science college India 2026", "BSc MSc"),
  GN("IISER IISc admission research BTech BSc 2026", "IISER IISc"),
  GN("ISRO DRDO science research India 2026", "ISRO DRDO"),
  GN("GATE 2026 result cutoff admission MTech", "GATE 2026"),
  GN("JAM 2026 IIT admission MSc science", "IIT JAM"),

  // ── 🔬 Science: Olympiads & Competitions ─────────────────────────────────
  GN("science olympiad India students 2026 chemistry physics", "Science Olympiads"),
  GN("India INMO INPHO INCHO science olympiad 2026", "National Olympiads"),
  GN("KVPY scholarship science research students India 2026", "KVPY"),
  GN("research internship India science students IIT 2026", "Research Internships"),
  GN("physics chemistry biology competition India college 2026", "Science Competitions"),

  // ── 💰 Commerce & Finance ─────────────────────────────────────────────────
  GN("BCom MCom commerce college India admission 2026", "BCom MCom"),
  GN("CA ICAI chartered accountant exam 2026 result", "CA ICAI"),
  GN("economics finance college India admission 2026", "Commerce Finance"),
  GN("CMA CS institute exam India 2026", "CMA CS Exams"),

  // ── 💰 Commerce: Competitions ────────────────────────────────────────────
  GN("CA ICAI quiz competition students India 2026", "ICAI Competitions"),
  GN("finance stock market competition college India 2026", "Finance Competitions"),
  GN("commerce economics quiz competition India 2026", "Commerce Quiz"),

  // ── 📝 Entrance Exams & Results ──────────────────────────────────────────
  GN("JEE Advanced 2026 result cutoff counselling", "JEE Advanced"),
  GN("JEE Main 2026 result session cutoff rank", "JEE Main"),
  GN("CUET 2026 admission central university entrance", "CUET"),
  GN("CLAT 2026 law college NLU admission entrance", "CLAT Law"),
  GN("NEET PG 2026 postgraduate medical exam result", "NEET PG"),
  GN("UPSC civil services exam 2026 result prelims", "UPSC"),
  GN("SNAP XAT IIFT 2026 MBA entrance exam", "MBA Entrance Exams"),
  GN("India board exam CBSE ICSE result 2026", "Board Results"),
  GN("admit card 2026 India entrance exam download", "Admit Cards"),

  // ── 🎮 Tech & Coding Competitions (all fields) ───────────────────────────
  GN("Google Summer of Code India students 2026", "Google Summer of Code"),
  GN("Microsoft Imagine Cup India 2026 competition", "Microsoft Imagine Cup"),
  GN("Meta hackathon India students competition 2026", "Meta Hackathon"),
  GN("GitHub student competition India open source 2026", "GitHub Competitions"),
  GN("Flipkart Grid Amazon ML challenge India 2026", "Industry Challenges"),
  GN("coding competition contest Codeforces Leetcode India 2026", "Coding Contests"),
  GN("data science AI ML competition India students 2026", "AI ML Competitions"),

  GN("university exam results 2026 India result link notification", "Exam Results"),
  GN("top colleges in India ranking NIRF infrastructure campus news 2026", "Colleges News"),
  GN("higher education news India 2026 college university", "India Education"),
  GN("educational technology AI in education learning tools 2026", "EdTech News"),
  GN("student entrepreneurship startup news college funding 2026", "Campus Startups"),
  GN("university sports tournament cricket football India 2026", "College Sports"),
  GN("college entertainment movie culture student life 2026", "Campus Culture"),
  GN("student health wellness mental health university India 2026", "Student Wellness"),
  GN("internship for college students India 2026 recruitment stipend", "Student Internships"),
  GN("government scholarship for college students India 2026 application", "Scholarships India"),
  GN("college scholarship merit fellowship financial aid India 2026", "Campus Scholarships"),
  GN("summer internship engineering medical management India 2026", "Summer Internships"),
  GN("Indian college university admission placements 2026", "Indian Colleges"),
  GN("UGC AICTE India higher education policy 2026", "UGC AICTE"),
  GN("NIRF India college ranking 2026", "NIRF Rankings"),
  GN("college campus placements salary package India 2026", "Campus Placements"),
];
