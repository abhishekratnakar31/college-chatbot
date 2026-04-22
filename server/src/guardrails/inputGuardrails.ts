/**
 * Input Guardrails
 * ─────────────────────────────────────────────────────────────────
 * Run before the LLM is ever called. These are fast, deterministic
 * checks that protect the pipeline from:
 *   1. Prompt injection / jailbreak attempts
 *   2. PII leakage into the LLM
 *   3. Token-stuffing via oversized inputs
 *   4. Blatantly off-topic queries (no LLM API cost)
 *   5. Repetitive flooding
 */

// ── Types ─────────────────────────────────────────────────────────

export type GuardrailResult =
  | { pass: true; sanitizedInput: string; piiDetected: boolean }
  | { pass: false; code: GuardrailCode; message: string };

export type GuardrailCode =
  | "PROMPT_INJECTION"
  | "INPUT_TOO_LONG"
  | "DOMAIN_VIOLATION"
  | "REPETITION_DETECTED";

// ── Constants ─────────────────────────────────────────────────────

const MAX_INPUT_CHARS = 2000;

/**
 * Common prompt-injection / jailbreak patterns.
 * Deliberately broad to catch creative rephrasing.
 */
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|context)/i,
  /forget\s+(everything|all|previous|what\s+you)/i,
  /you\s+are\s+now\s+(a|an|the)/i,
  /act\s+as\s+(if\s+you\s+are|a|an|the)\s+\w/i,
  /pretend\s+(you\s+are|to\s+be|that\s+you)/i,
  /jailbreak/i,
  /dan\s+mode/i,
  /developer\s+mode/i,
  /bypass\s+(your\s+)?(filter|safety|guardrail|restriction)/i,
  /override\s+(your\s+)?(instructions?|system\s+prompt)/i,
  /disregard\s+(your\s+)?(previous|prior|all)\s+(instructions?|rules)/i,
  /reveal\s+(your\s+)?(system\s+prompt|instructions?|prompt)/i,
  /print\s+your\s+(system\s+prompt|instructions?)/i,
  /what\s+(is|are)\s+your\s+(system\s+prompt|instructions?)/i,
  /repeat\s+the\s+(above|system|initial)\s+(prompt|instructions?)/i,
];

/**
 * Blatantly off-topic keywords – zero college relevance.
 * Only triggers on very clear non-academic topics to avoid false positives.
 */
const OFF_TOPIC_KEYWORDS: RegExp[] = [
  /\b(recipe|ingredients?|cook(ing)?|bake|baking)\b/i,
  /\b(box\s*office|movie\s*review|film\s*critic)\b/i,
  /\b(stock\s*market|crypto(currency)?|bitcoin|forex\s*trade)\b/i,
  /\b(horoscope|astrology|zodiac\s*sign)\b/i,
  /\b(sports?\s*bet|gambling|casino|poker)\b/i,
];

/**
 * PII patterns – these are scrubbed silently before the LLM sees them.
 */
const PII_PATTERNS: { regex: RegExp; replacement: string }[] = [
  // Email addresses
  {
    regex: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
    replacement: "[EMAIL REDACTED]",
  },
  // Indian mobile numbers (10-digit starting with 6-9, optionally with +91 / 0)
  {
    regex: /(?:\+91|0)?[6-9]\d{9}/g,
    replacement: "[PHONE REDACTED]",
  },
  // US-style phone numbers (e.g. 123-456-7890 / (123) 456-7890)
  {
    regex: /(\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4})/g,
    replacement: "[PHONE REDACTED]",
  },
  // Aadhaar (12-digit number groups)
  {
    regex: /\b\d{4}\s?\d{4}\s?\d{4}\b/g,
    replacement: "[ID REDACTED]",
  },
  // US SSN (XXX-XX-XXXX)
  {
    regex: /\b\d{3}-\d{2}-\d{4}\b/g,
    replacement: "[SSN REDACTED]",
  },
];

// ── In-memory repetition tracker ──────────────────────────────────
// Tracks last N messages per session key (IP-based or sessionId)
const repetitionTracker = new Map<string, string[]>();
const MAX_RECENT = 5;
const MAX_REPEAT_COUNT = 3;

// ── Guardrail runner ──────────────────────────────────────────────

/**
 * Run all input guardrails against the current user message.
 *
 * @param input      The raw user message text
 * @param sessionKey Typically the client IP; used for repetition tracking
 */
export function runInputGuardrails(
  input: string,
  sessionKey: string = "default"
): GuardrailResult {
  // ── 1. Length check ──────────────────────────────────────────────
  if (input.length > MAX_INPUT_CHARS) {
    return {
      pass: false,
      code: "INPUT_TOO_LONG",
      message: `Your message is too long (${input.length} chars). Please keep it under ${MAX_INPUT_CHARS} characters.`,
    };
  }

  // ── 2. Prompt injection check ────────────────────────────────────
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      console.warn(
        `[GUARDRAIL][INJECTION] Blocked pattern "${pattern}" from session ${sessionKey}`
      );
      return {
        pass: false,
        code: "PROMPT_INJECTION",
        message:
          "Your message contains patterns that cannot be processed. Please rephrase your question.",
      };
    }
  }

  // ── 3. Off-topic domain check (fast, no LLM cost) ────────────────
  for (const pattern of OFF_TOPIC_KEYWORDS) {
    if (pattern.test(input)) {
      console.warn(
        `[GUARDRAIL][DOMAIN] Blocked off-topic keyword for session ${sessionKey}`
      );
      return {
        pass: false,
        code: "DOMAIN_VIOLATION",
        message:
          "I'm a College Assistant and can only answer questions related to colleges, admissions, academic programs, and campus life. Please ask a college-related question!",
      };
    }
  }

  // ── 4. Repetition check ──────────────────────────────────────────
  const history = repetitionTracker.get(sessionKey) ?? [];
  const repeatCount = history.filter((h) => h === input.trim()).length;

  if (repeatCount >= MAX_REPEAT_COUNT) {
    console.warn(
      `[GUARDRAIL][REPETITION] Repeated message detected for session ${sessionKey}`
    );
    return {
      pass: false,
      code: "REPETITION_DETECTED",
      message:
        "It looks like you've sent the same message several times. If you're having trouble, try rephrasing your question.",
    };
  }

  // Update repetition history
  history.push(input.trim());
  if (history.length > MAX_RECENT) history.shift();
  repetitionTracker.set(sessionKey, history);

  // ── 5. PII scrubbing (mutates a copy of input) ───────────────────
  let sanitized = input;
  let piiDetected = false;

  for (const { regex, replacement } of PII_PATTERNS) {
    if (regex.test(sanitized)) {
      piiDetected = true;
      console.warn(
        `[GUARDRAIL][PII] Redacting PII pattern for session ${sessionKey}`
      );
    }
    regex.lastIndex = 0; // reset stateful regex
    sanitized = sanitized.replace(regex, replacement);
  }

  // ── All checks passed ─────────────────────────────────────────────
  return { pass: true, sanitizedInput: sanitized, piiDetected };
}

/**
 * Clear the repetition tracker for a given session (e.g., on new conversation).
 */
export function clearRepetitionHistory(sessionKey: string): void {
  repetitionTracker.delete(sessionKey);
}
