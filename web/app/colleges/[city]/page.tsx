import CollegeDetailView from "./CollegeDetailView";
import { notFound } from "next/navigation";
import { Building2 } from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4006";

export default async function Page({ params }: { params: Promise<{ city: string }> }) {
  const { city: slug } = await params;
  
  if (!slug) notFound();

  // 1. Fetch College Data (Server-Side)
  let college = null;
  try {
    const res = await fetch(`${API_URL}/colleges/${encodeURIComponent(slug)}`, {
      cache: 'no-store' // Ensure we get fresh data for now, can optimize later
    });
    if (res.ok) {
      const data = await res.json();
      college = data.college;
    }
  } catch (err) {
    console.error("Failed to fetch college on server", err);
  }

  if (!college) {
    return <NotFoundView slug={slug} />;
  }

  // 2. Fetch News Data (Server-Side)
  let newsData = [];
  try {
    const res = await fetch(`${API_URL}/news?source=${encodeURIComponent(college.college)}&limit=3`, {
      next: { revalidate: 3600 } // Cache news for 1 hour
    });
    if (res.ok) {
      const data = await res.json();
      newsData = data.articles || [];
    }
  } catch (err) {
    console.error("Failed to fetch news on server", err);
  }

  return <CollegeDetailView college={college} newsData={newsData} />;
}

function NotFoundView({ slug }: { slug: string }) {
  return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-8 text-black">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-white border-2 border-black rounded-xl flex items-center justify-center mx-auto shadow-[2px_2px_0px_0px_#000000]">
          <Building2 size={32} className="text-black" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-serif font-black text-black">College Not Found</h2>
          <p className="text-zinc-600 text-sm font-medium">
            We couldn't find <strong className="text-black font-extrabold">{slug?.replace(/-/g, " ")}</strong> in our database.
          </p>
        </div>
        <div className="flex justify-center pt-4">
          <Link href="/rankings" className="px-8 py-3 bg-[#b69cc4] hover:bg-[#a387b3] border-2 border-black text-black text-sm font-black uppercase tracking-widest rounded-xl hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all">
            Browse All Institutions
          </Link>
        </div>
      </div>
    </div>
  );
}
