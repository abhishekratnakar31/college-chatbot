import { createRequire } from "node:module";
import { RSS_FEEDS, type FeedSource } from "./newsFeeds.js";
import axios from "axios";
import * as cheerio from "cheerio";

// rss-parser is a CJS module; use createRequire for nodenext ESM compatibility
const _require = createRequire(import.meta.url);
type RssParser = import("rss-parser");
type RssParserConstructor = new (options?: ConstructorParameters<typeof import("rss-parser")>[0]) => RssParser;
const ParserCtor = _require("rss-parser") as RssParserConstructor;

export interface NewsArticle {
  title: string;
  summary: string;
  url: string;
  source: string;
  category: string | null;
  image: string;
  publishedAt: Date | null;
}

const CATEGORY_MAP: Record<string, string[]> = {
  "Admissions": ["admission", "enrolment", "apply now", "application form", "registration", "counselling", "intake", "seat allotment", "merit list", "cutoff", "eligibility"],
  "Results": ["result", "scorecard", "rank", "cutoff", "board result", "entrance result", "merit list", "pass percentage"],
  "Placements": ["placement", "recruitment", "salary package", "job offer", "hiring", "tpo", "campus drive", "highest package", "average package", "ctc", "mnc recruitment", "placement report"],
  "Colleges": ["college", "university", "campus", "institute", "iit", "nit", "iim", "aiims", "bits", "vit", "ranking", "infrastructure", "faculty"],
  "Internships": ["internship", "stipend", "summer intern", "winter intern", "trainee", "industrial training", "vocational training", "intern recruitment"],
  "Scholarships": ["scholarship", "financial aid", "grant", "fellowship", "stipend", "tuition waiver", "fee concession", "merit scholarship", "nsp", "insPIRE"],
  "Tech": ["tech", "ai", "software", "hardware", "coding", "programming", "robotics", "data science", "cybersecurity", "engineering", "btech", "mtech"],
  "Business": ["business", "startup", "economy", "market", "finance", "corporate", "investment", "entrepreneur", "funding", "mba", "iim", "bba", "management"],
  "Science": ["science", "research", "physics", "chemistry", "biology", "astronomy", "scientific", "isro", "iisc", "iiser", "bsc", "msc"],
  "Medical": ["medical", "health", "wellness", "medicine", "doctor", "hospital", "disease", "vaccine", "neet medical", "mbbs", "aiims"],
};

/**
 * Assigns a category based on keywords in title or summary.
 */
function categorizeArticle(title: string, summary: string): string | null {
  const content = `${title} ${summary}`.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some((k) => content.includes(k.toLowerCase()))) {
      return cat;
    }
  }
  return "General";
}

// Instantiate with customFields for media thumbnails
const parser = new ParserCtor({
  customFields: {
    item: [
      ["media:thumbnail", "mediaThumbnail"],
      ["media:content", "mediaContent"],
      ["enclosure", "enclosure"],
    ] as any,
  },
});

const HTTP_TIMEOUT = 4000; // 4s max per article

// Reusable axios instance with a browser-like User-Agent
const httpClient = axios.create({
  timeout: HTTP_TIMEOUT,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
  },
  maxRedirects: 5,
  // Don't throw on non-2xx — just return whatever we got
  validateStatus: () => true,
});

/**
 * Strips HTML tags from a string and trims whitespace.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extracts an image URL from an RSS feed item (best-effort).
 * Only used as a quick pass — most Google News items won't have these.
 */
function extractRssImage(item: any): string {
  if (item.mediaThumbnail?.$.url) return item.mediaThumbnail.$.url;
  if (item.mediaContent?.$.url) return item.mediaContent.$.url;
  if (item.enclosure?.url && item.enclosure.type?.startsWith("image/")) {
    return item.enclosure.url;
  }
  const imgMatch = (item["content:encoded"] || item.content || "").match(
    /<img[^>]+src=["']([^"']+)["']/i
  );
  if (imgMatch?.[1]) return imgMatch[1];
  return "";
}

/**
 * Fetches the article page and extracts the best social-share image.
 * Falls back to empty string on any error.
 */
async function fetchOgImage(url: string): Promise<string> {
  try {
    const { data, status } = await httpClient.get<string>(url);
    if (status < 200 || status >= 400 || typeof data !== "string") return "";

    const $ = cheerio.load(data);

    const img =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      $('meta[property="twitter:image"]').attr("content") ||
      $('meta[itemprop="image"]').attr("content") ||
      "";

    // Validate: must look like an HTTP image URL
    if (img && img.startsWith("http")) return img;
    return "";
  } catch {
    return "";
  }
}

/**
 * Fetches and normalizes articles from a single RSS feed.
 * Then resolves OG images for any article that lacks one from the feed.
 */
async function fetchFeed(feed: FeedSource): Promise<NewsArticle[]> {
  try {
    const result = await parser.parseURL(feed.url);
    const rawArticles: NewsArticle[] = [];

    for (const item of result.items.slice(0, 8)) {
      if (!item.title || !item.link) continue;

      const title = stripHtml(item.title).slice(0, 250);
      const summary = stripHtml(
        item["content:encodedSnippet"] ||
          item.contentSnippet ||
          item.content ||
          item.summary ||
          ""
      ).slice(0, 500) || "No summary available.";

      rawArticles.push({
        title,
        summary,
        url: item.link,
        source: feed.name,
        category: categorizeArticle(title, summary),
        image: extractRssImage(item), // quick check — usually empty for Google News
        publishedAt: item.pubDate ? new Date(item.pubDate) : null,
      });
    }

    // ── OG image resolution ─────────────────────────────────────────────
    // For articles without an RSS image, fetch the page and extract og:image.
    // We do this concurrently (but cap concurrency implicitly via Promise.all).
    const withImages = await Promise.all(
      rawArticles.map(async (article) => {
        if (article.image) return article; // already has an image
        const ogImage = await fetchOgImage(article.url);
        return { ...article, image: ogImage };
      })
    );

    const found = withImages.filter((a) => a.image).length;
    console.log(
      `[News Scraper] ✅ ${feed.name}: ${rawArticles.length} articles (${found} with images)`
    );
    return withImages;
  } catch (err: any) {
    console.error(`[News Scraper] ❌ ${feed.name} failed:`, err.message);
    return [];
  }
}

/**
 * Fetches news from ALL configured RSS feeds concurrently.
 * Uses Promise.allSettled so one failing feed never crashes the rest.
 */
export async function scrapeAllNews(): Promise<NewsArticle[]> {
  console.log(
    `[News Scraper] Starting scrape of ${RSS_FEEDS.length} sources...`
  );

  const results = await Promise.allSettled(RSS_FEEDS.map(fetchFeed));

  const allArticles: NewsArticle[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      allArticles.push(...result.value);
    }
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  const unique = allArticles.filter((a) => {
    if (seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });

  const withImg = unique.filter((a) => a.image).length;
  console.log(
    `[News Scraper] Done. ${unique.length} unique articles (${withImg} with images).`
  );
  return unique;
}
