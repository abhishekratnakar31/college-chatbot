/**
 * Output Guardrails
 * ─────────────────────────────────────────────────────────────────
 * Run AFTER the LLM has streamed its response. These checks:
 *   1. Detect hallucination signals and append a disclaimer
 *   2. Filter out any profanity / toxic content in the response
 *   3. Annotate low-confidence responses (no retrieval context found)
 *   4. Provide a graceful fallback if the response is empty / too short
 */

// ── Types ─────────────────────────────────────────────────────────

export interface OutputGuardrailOptions {
  /** The full assistant response text after streaming is complete */
  response: string;
  /** Number of RAG context chunks that were found (0 = no context) */
  contextChunksFound: number;
  /** The active mode ("pdf" | "web" | "compare") */
  mode: "pdf" | "web" | "compare";
}

export interface OutputGuardrailResult {
  /** Possibly-modified final response text */
  finalResponse: string;
  /** Whether the response was modified by any guardrail */
  wasModified: boolean;
  /** Whether the response was blocked entirely */
  wasBlocked: boolean;
  /** Human-readable list of guardrails that fired */
  triggered: string[];
}

// ── Constants ─────────────────────────────────────────────────────

const MIN_RESPONSE_LENGTH = 10;

/**
 * Phrases that signal the LLM is guessing / hallucinating.
 * If found, we append a disclaimer rather than blocking (responses can
 * still be partially correct).
 */
const HALLUCINATION_SIGNALS: RegExp[] = [
  /as of my (knowledge )?cut[\s-]?off/i,
  /I (believe|think|suppose|assume|imagine) (that )?/i,
  /I('m| am) not (entirely |completely |100% )?sure/i,
  /I cannot (guarantee|confirm|verify)/i,
  /this (information )?may (be |have )?changed/i,
  /it('s| is) possible that/i,
  /to the best of my knowledge/i,
  /I (don't|do not) have (access to |real-?time|current|live)/i,
  /my training data/i,
  /as (far|much) as I know/i,
];

/**
 * Basic English profanity list – intentionally short.
 * Extend as needed. All entries are checked case-insensitively.
 */
const PROFANITY_LIST: string[] = [
  "fuck",
  "shit",
  "asshole",
  "bitch",
  "bastard",
  "cunt",
  "damn",
  "bullshit",
];

const PROFANITY_REGEX = new RegExp(
  `\\b(${PROFANITY_LIST.join("|")})\\b`,
  "i"  // No 'g' flag — .test() must not be stateful
);

// Disclaimer messages
const HALLUCINATION_DISCLAIMER =
  "\n\n> ⚠️ **Disclaimer**: Some parts of this response may not be fully verified against the source documents. Please cross-check important details with official college sources.";

const LOW_CONFIDENCE_DISCLAIMER =
  "\n\n> ℹ️ **Note**: No relevant information was found in the uploaded documents or web search for this query. The response above is based on general knowledge and may not be accurate for your specific institution.";

const FALLBACK_RESPONSE =
  "I'm sorry, I wasn't able to generate a proper response for that question. Please try rephrasing, or check if a relevant document has been uploaded.";

// ── Guardrail runner ──────────────────────────────────────────────

/**
 * Run all output guardrails against the completed LLM response.
 */
export function runOutputGuardrails(
  opts: OutputGuardrailOptions
): OutputGuardrailResult {
  const triggered: string[] = [];
  let text = opts.response;
  let wasModified = false;
  let wasBlocked = false;

  // ── 1. Empty / too-short response (refusal safety net) ───────────
  if (!text || text.trim().length < MIN_RESPONSE_LENGTH) {
    console.warn("[GUARDRAIL][OUTPUT] Response too short — using fallback");
    triggered.push("EMPTY_RESPONSE");
    return {
      finalResponse: FALLBACK_RESPONSE,
      wasModified: true,
      wasBlocked: false,
      triggered,
    };
  }

  // ── 2. Profanity / toxicity filter ───────────────────────────────
  if (PROFANITY_REGEX.test(text)) {
    console.warn(
      "[GUARDRAIL][OUTPUT] Profanity detected in LLM response — blocking"
    );
    triggered.push("PROFANITY");
    wasBlocked = true;
    return {
      finalResponse:
        "I'm sorry, I wasn't able to provide a suitable response to that question. Please try a different question.",
      wasModified: true,
      wasBlocked: true,
      triggered,
    };
  }

  // ── 3. Hallucination signal detection ────────────────────────────
  for (const pattern of HALLUCINATION_SIGNALS) {
    if (pattern.test(text)) {
      console.warn(
        `[GUARDRAIL][OUTPUT] Hallucination signal detected: "${pattern}"`
      );
      triggered.push("HALLUCINATION_SIGNAL");
      text += HALLUCINATION_DISCLAIMER;
      wasModified = true;
      break; // Only append disclaimer once
    }
  }

  // ── 4. Low-confidence annotation ─────────────────────────────────
  if (opts.contextChunksFound === 0) {
    const alreadyHasDisclaimer = text.includes(HALLUCINATION_DISCLAIMER);
    if (!alreadyHasDisclaimer) {
      console.warn(
        "[GUARDRAIL][OUTPUT] No RAG context found — appending low-confidence annotation"
      );
      triggered.push("LOW_CONFIDENCE");
      text += LOW_CONFIDENCE_DISCLAIMER;
      wasModified = true;
    }
  }

  return {
    finalResponse: text,
    wasModified,
    wasBlocked,
    triggered,
  };
}
