import { FileText } from "lucide-react";

interface CollegeDetail {
  college: string;
  nirf_rank?: number | null;
  nirf_category?: string;
  city?: string;
  state?: string;
  fees_range?: string;
  avg_package?: number;
  highest_package?: number;
}

export default function PrintableBrochure({ 
  college, 
  courses, 
  meta 
}: { 
  college: CollegeDetail; 
  courses: any[]; 
  meta: any;
}) {
  return (
    <div id="printable-brochure" className="hidden p-12 text-black bg-white min-h-screen">
      <div className="flex justify-between items-start border-b-4 border-black pb-8 mb-10">
        <div>
          <h1 className="text-4xl font-serif font-black uppercase tracking-tight mb-2">{college.college}</h1>
          <p className="text-xl font-bold text-zinc-500 uppercase tracking-widest">{college.nirf_category} • {college.city}, {college.state}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-black uppercase tracking-widest bg-black text-white px-4 py-2 rounded">NIRF #{college.nirf_rank}</p>
          <p className="text-xs text-zinc-400 mt-2 italic">ACADEMIA AI REPORT</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-12">
        <div className="space-y-6">
          <h2 className="text-xl font-black uppercase border-b-2 border-zinc-100 pb-2 flex items-center gap-2">
            <FileText size={18} /> Official Course Catalog
          </h2>
          <div className="space-y-8">
            {courses.map((c, i) => (
              <div key={i} className="space-y-1">
                <p className="text-lg font-black leading-tight">{c.name}</p>
                <p className="text-sm font-bold text-zinc-500 mb-1">{c.count}</p>
                <div className="text-sm space-y-0.5">
                  <p><span className="font-bold">Tuition Fees:</span> {c.fees}</p>
                  <p><span className="font-bold">Eligibility:</span> {c.eligibility}</p>
                  <p><span className="font-bold">Accepted Exams:</span> {c.exams}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
            <h3 className="text-sm font-black uppercase tracking-widest mb-4">Placement Overview</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-400">Average Package</p>
                <p className="text-2xl font-black">{college.avg_package ? `${college.avg_package} LPA` : "—"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-400">Highest Package</p>
                <p className="text-2xl font-black">{college.highest_package ? `${college.highest_package} LPA` : "—"}</p>
              </div>
            </div>
          </div>

          <div className="p-6 border border-dashed border-zinc-200 rounded-2xl">
            <h3 className="text-sm font-black uppercase tracking-widest mb-4">Institutional Quality</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-[10px] uppercase font-bold text-zinc-400">Established</p><p className="font-bold">Estd. {meta.estd}</p></div>
              <div><p className="text-[10px] uppercase font-bold text-zinc-400">Accreditation</p><p className="font-bold">{meta.acc}</p></div>
            </div>
          </div>

          <div className="pt-8 text-center border-t border-zinc-100">
            <p className="text-[10px] text-zinc-400 font-medium">Generated dynamically by AcademiaAI Research Engine</p>
            <p className="text-[9px] text-zinc-300 mt-1 uppercase tracking-widest">Confidential • For Personal Use Only</p>
          </div>
        </div>
      </div>
    </div>
  );
}
