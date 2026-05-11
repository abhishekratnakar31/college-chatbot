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
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto border border-white/10">
          <Building2 size={32} className="text-white/20" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-serif font-bold text-white">College Not Found</h2>
          <p className="text-white/40 text-sm">
            We couldn't find <strong className="text-white/70">{slug?.replace(/-/g, " ")}</strong> in our database.
          </p>
        </div>
        <div className="flex justify-center pt-4">
          <Link href="/rankings" className="px-8 py-3 bg-white text-black text-sm font-black rounded-2xl hover:scale-105 transition-transform">
            Browse All Institutions
          </Link>
        </div>
      </div>
    </div>
  );
}
