/**
 * Language Detector
 * ─────────────────────────────────────────────────────────────────
 * Fast, zero-API-cost language detection using Unicode script range
 * analysis. Supports 20 languages across Indian and global scripts.
 *
 * How it works:
 *  - Counts characters in each Unicode block (Devanagari, Tamil, etc.)
 *  - The script with the highest character count wins
 *  - Falls back to "en" if no non-Latin script has ≥3 characters
 *  - For ambiguous scripts (Devanagari → Hindi vs Marathi,
 *    Arabic → Arabic vs Urdu), applies word-list disambiguation
 *
 * Runs in O(n) time, ~0ms — no network calls, no LLM cost.
 */

// ── Types ─────────────────────────────────────────────────────────

export type SupportedLang =
  | "en" | "hi" | "mr" | "ta" | "te" | "kn" | "ml" | "bn" | "gu" | "pa" | "ur"  // Indian
  | "ar" | "fr" | "es" | "pt" | "de" | "zh" | "ja" | "ko" | "ru" | "el";         // Global

export interface LangMeta {
  code: SupportedLang;
  name: string;       // English name
  native: string;     // Name in the script itself
  region: "indian" | "global";
}

// ── Language Registry ─────────────────────────────────────────────
// Shown in UI in this order.

export const SUPPORTED_LANGUAGES: LangMeta[] = [
  { code: "en", name: "English",    native: "English",    region: "global" },
  // ── Indian ──────────────────────────────────────────────────────
  { code: "hi", name: "Hindi",      native: "हिंदी",       region: "indian" },
  { code: "mr", name: "Marathi",    native: "मराठी",       region: "indian" },
  { code: "ta", name: "Tamil",      native: "தமிழ்",       region: "indian" },
  { code: "te", name: "Telugu",     native: "తెలుగు",      region: "indian" },
  { code: "kn", name: "Kannada",    native: "ಕನ್ನಡ",       region: "indian" },
  { code: "ml", name: "Malayalam",  native: "മലയാളം",     region: "indian" },
  { code: "bn", name: "Bengali",    native: "বাংলা",       region: "indian" },
  { code: "gu", name: "Gujarati",   native: "ગુજરાતી",     region: "indian" },
  { code: "pa", name: "Punjabi",    native: "ਪੰਜਾਬੀ",      region: "indian" },
  { code: "ur", name: "Urdu",       native: "اردو",        region: "indian" },
  // ── Global ──────────────────────────────────────────────────────
  { code: "ar", name: "Arabic",     native: "العربية",     region: "global" },
  { code: "fr", name: "French",     native: "Français",    region: "global" },
  { code: "es", name: "Spanish",    native: "Español",     region: "global" },
  { code: "pt", name: "Portuguese", native: "Português",   region: "global" },
  { code: "de", name: "German",     native: "Deutsch",     region: "global" },
  { code: "zh", name: "Chinese",    native: "中文",         region: "global" },
  { code: "ja", name: "Japanese",   native: "日本語",       region: "global" },
  { code: "ko", name: "Korean",     native: "한국어",        region: "global" },
  { code: "ru", name: "Russian",    native: "Русский",     region: "global" },
  { code: "el", name: "Greek",      native: "Ελληνικά",    region: "global" },
];

// ── Disambiguation word lists ─────────────────────────────────────
// Both Marathi and Hindi use Devanagari. Marathi has unique common words.
const MARATHI_MARKERS = ["आहे", "आणि", "करणे", "होते", "माझ्या", "त्याचे", "यांना", "नाही", "आहेत", "म्हणजे", "करतो", "म्हणून"];

// Urdu uses Arabic script but has characteristic words not found in Arabic.
const URDU_MARKERS = ["ہے", "اور", "کا", "کی", "میں", "نے", "کو", "سے", "پر", "ہیں", "تھا", "والا"];

// ── Core counting helper ──────────────────────────────────────────

function countChars(text: string, pattern: RegExp): number {
  return (text.match(pattern) ?? []).length;
}

// ── Main detector ─────────────────────────────────────────────────

/**
 * Detect the dominant written language in a text string.
 * Returns a SupportedLang code. Falls back to "en" if detection
 * is inconclusive (< 3 non-Latin script characters found).
 */
export function detectLanguage(text: string): SupportedLang {
  if (!text || text.trim().length === 0) return "en";

  const devanagari     = countChars(text, /[\u0900-\u097F]/g);
  const tamil          = countChars(text, /[\u0B80-\u0BFF]/g);
  const telugu         = countChars(text, /[\u0C00-\u0C7F]/g);
  const kannada        = countChars(text, /[\u0C80-\u0CFF]/g);
  const malayalam      = countChars(text, /[\u0D00-\u0D7F]/g);
  const bengali        = countChars(text, /[\u0980-\u09FF]/g);
  const gujarati       = countChars(text, /[\u0A80-\u0AFF]/g);
  const gurmukhi       = countChars(text, /[\u0A00-\u0A7F]/g);
  const arabicFamily   = countChars(text, /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g);
  const cjk            = countChars(text, /[\u4E00-\u9FFF\u3400-\u4DBF]/g);
  const japaneseKana   = countChars(text, /[\u3040-\u30FF]/g);
  const hangul         = countChars(text, /[\uAC00-\uD7AF\u1100-\u11FF]/g);
  const cyrillic       = countChars(text, /[\u0400-\u04FF]/g);
  const greek          = countChars(text, /[\u0370-\u03FF]/g);

  // Build a scored list — resolver functions for ambiguous scripts
  const candidates: [number, () => SupportedLang][] = [
    [devanagari,   () => MARATHI_MARKERS.some(w => text.includes(w)) ? "mr" : "hi"],
    [tamil,        () => "ta"],
    [telugu,       () => "te"],
    [kannada,      () => "kn"],
    [malayalam,    () => "ml"],
    [bengali,      () => "bn"],
    [gujarati,     () => "gu"],
    [gurmukhi,     () => "pa"],
    [arabicFamily, () => URDU_MARKERS.some(w => text.includes(w)) ? "ur" : "ar"],
    [cjk + japaneseKana, () => japaneseKana > 0 ? "ja" : "zh"],
    [hangul,       () => "ko"],
    [cyrillic,     () => "ru"],
    [greek,        () => "el"],
  ];

  // Pick the highest-scoring candidate
  let topScore = 0;
  let topResolver: () => SupportedLang = () => "en";

  for (const [score, resolver] of candidates) {
    if (score > topScore) {
      topScore = score;
      topResolver = resolver;
    }
  }

  // Require at least 3 non-Latin chars to be confident
  if (topScore < 3) return "en";

  return topResolver();
}

// ── Response instruction generator ───────────────────────────────

/**
 * Returns an instruction string to inject into the LLM system prompt,
 * telling it to respond in the user's detected language.
 * Returns an empty string for English (no instruction needed).
 */
export function getRespondInInstruction(lang: SupportedLang): string {
  if (lang === "en") return "";

  const meta = SUPPORTED_LANGUAGES.find(l => l.code === lang);
  const langFull = meta ? `${meta.name} (${meta.native})` : lang;

  return [
    `LANGUAGE INSTRUCTION: The user is communicating in ${langFull}.`,
    `You MUST respond entirely in ${meta?.name ?? lang}.`,
    `Keep all of the following in their original form (do NOT translate):`,
    `- College and university names (e.g. IIT Bombay, Anna University)`,
    `- Acronyms and abbreviations (e.g. NIRF, IIT, NIT, BTech, MTech, MBA)`,
    `- Numbers, percentages, fee amounts, and package figures`,
    `- Source citations like [Source ID: 1]`,
  ].join(" ");
}

/**
 * Validate whether a string is a recognized SupportedLang code.
 * Used to safely accept user-supplied language codes from the request body.
 */
export function isValidLangCode(code: string): code is SupportedLang {
  return SUPPORTED_LANGUAGES.some(l => l.code === code);
}
