import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AcademiaAI | Academic Intelligence",
  description: "The intelligent platform for exploring Indian academia, research, and institutional rankings.",
  keywords: ["college", "rankings", "NIRF", "India", "admissions", "chatbot", "education", "placements"],
  authors: [{ name: "AcademiaAI Team" }],
  openGraph: {
    title: "AcademiaAI | Academic Intelligence",
    description: "The intelligent platform for exploring Indian academia, research, and institutional rankings.",
    url: "https://academia-ai.example.com", // Replace with real URL
    siteName: "AcademiaAI",
    images: [
      {
        url: "/og-image.png", // Ensure this exists in public/
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AcademiaAI | Academic Intelligence",
    description: "The intelligent platform for exploring Indian academia, research, and institutional rankings.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-white text-zinc-900`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
