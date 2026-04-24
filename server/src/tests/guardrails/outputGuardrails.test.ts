/**
 * Tests: Output Guardrails
 * Covers every check in runOutputGuardrails:
 *   1. Empty / too-short response (EMPTY_RESPONSE)
 *   2. Profanity / toxicity filter (PROFANITY)
 *   3. Hallucination signal detection (HALLUCINATION_SIGNAL)
 *   4. Low-confidence annotation (LOW_CONFIDENCE / contextChunksFound === 0)
 *   5. Clean pass-through (no guardrail triggered)
 *   6. Interaction between hallucination + low-confidence
 */
import { describe, it, expect } from "vitest";
import { runOutputGuardrails } from "../../guardrails/outputGuardrails.js";

const BASE_OPTS = { mode: "pdf" as const, contextChunksFound: 5 };

// ─────────────────────────────────────────────────────────────────────────────
// 1. Empty / Too-Short Response
// ─────────────────────────────────────────────────────────────────────────────
describe("Empty / Too-Short Response", () => {
  it("triggers EMPTY_RESPONSE for an empty string", () => {
    const result = runOutputGuardrails({ ...BASE_OPTS, response: "" });
    expect(result.triggered).toContain("EMPTY_RESPONSE");
    expect(result.wasModified).toBe(true);
    expect(result.wasBlocked).toBe(false);
    expect(result.finalResponse.length).toBeGreaterThan(0);
  });

  it("triggers EMPTY_RESPONSE for a whitespace-only string", () => {
    const result = runOutputGuardrails({ ...BASE_OPTS, response: "    " });
    expect(result.triggered).toContain("EMPTY_RESPONSE");
  });

  it("triggers EMPTY_RESPONSE for a 9-char string (below MIN=10)", () => {
    const result = runOutputGuardrails({ ...BASE_OPTS, response: "123456789" });
    expect(result.triggered).toContain("EMPTY_RESPONSE");
  });

  it("does NOT trigger EMPTY_RESPONSE for exactly 10 chars", () => {
    const result = runOutputGuardrails({ ...BASE_OPTS, response: "1234567890" });
    expect(result.triggered).not.toContain("EMPTY_RESPONSE");
  });

  it("returns the fallback response text", () => {
    const result = runOutputGuardrails({ ...BASE_OPTS, response: "" });
    expect(result.finalResponse).toContain("I'm sorry");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Profanity / Toxicity Filter
// ─────────────────────────────────────────────────────────────────────────────
describe("Profanity Filter", () => {
  const profaneWords = ["fuck", "shit", "asshole", "bitch", "bastard", "cunt", "damn", "bullshit"];

  for (const word of profaneWords) {
    it(`blocks response containing "${word}"`, () => {
      const result = runOutputGuardrails({
        ...BASE_OPTS,
        response: `Here is your answer with ${word} in it.`,
      });
      expect(result.triggered).toContain("PROFANITY");
      expect(result.wasBlocked).toBe(true);
      expect(result.wasModified).toBe(true);
      expect(result.finalResponse).not.toContain(word);
    });
  }

  it("blocks case-insensitive profanity (FUCK)", () => {
    const result = runOutputGuardrails({
      ...BASE_OPTS,
      response: "This is FUCK content.",
    });
    expect(result.triggered).toContain("PROFANITY");
    expect(result.wasBlocked).toBe(true);
  });

  it("does not flag a response without profanity", () => {
    const result = runOutputGuardrails({
      ...BASE_OPTS,
      response: "The college offers a Bachelor of Science in Computer Science.",
    });
    expect(result.triggered).not.toContain("PROFANITY");
    expect(result.wasBlocked).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Hallucination Signal Detection
// ─────────────────────────────────────────────────────────────────────────────
describe("Hallucination Signal Detection", () => {
  const hallucinationSignals = [
    "As of my knowledge cut-off, I cannot confirm the fees.",
    "I believe that the college offers 3 programs.",
    "I think the admission deadline is March.",
    "I'm not entirely sure about this answer.",
    "I am not completely sure this is correct.",
    "I cannot guarantee the accuracy of this information.",
    "This information may have changed recently.",
    "It's possible that the program was discontinued.",
    "To the best of my knowledge, the college accepts 500 students.",
    "I don't have access to real-time data.",
    "I do not have live information.",
    "My training data may not reflect recent changes.",
    "As far as I know, the application is due in December.",
  ];

  for (const signal of hallucinationSignals) {
    it(`appends disclaimer for: "${signal.slice(0, 60)}..."`, () => {
      const result = runOutputGuardrails({
        ...BASE_OPTS,
        response: signal,
      });
      expect(result.triggered).toContain("HALLUCINATION_SIGNAL");
      expect(result.wasModified).toBe(true);
      expect(result.wasBlocked).toBe(false);
      expect(result.finalResponse).toContain("Disclaimer");
    });
  }

  it("only appends the hallucination disclaimer once even if multiple signals are present", () => {
    const response =
      "I believe this is correct. To the best of my knowledge, as far as I know.";
    const result = runOutputGuardrails({ ...BASE_OPTS, response });
    const disclaimerCount = (result.finalResponse.match(/Disclaimer/g) || []).length;
    expect(disclaimerCount).toBe(1);
  });

  it("does not flag a confident response", () => {
    const result = runOutputGuardrails({
      ...BASE_OPTS,
      response: "MIT offers 5 undergraduate engineering programs as documented in [Source ID: 1].",
    });
    expect(result.triggered).not.toContain("HALLUCINATION_SIGNAL");
    expect(result.wasModified).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Low-Confidence Annotation
// ─────────────────────────────────────────────────────────────────────────────
describe("Low-Confidence Annotation", () => {
  it("appends low-confidence note when contextChunksFound is 0 (PDF mode)", () => {
    const result = runOutputGuardrails({
      response: "Here is some general information about college admissions.",
      contextChunksFound: 0,
      mode: "pdf",
    });
    expect(result.triggered).toContain("LOW_CONFIDENCE");
    expect(result.wasModified).toBe(true);
    expect(result.finalResponse).toContain("No relevant information was found");
  });

  it("appends low-confidence note when contextChunksFound is 0 (web mode)", () => {
    const result = runOutputGuardrails({
      response: "Here is some general information about college admissions.",
      contextChunksFound: 0,
      mode: "web",
    });
    expect(result.triggered).toContain("LOW_CONFIDENCE");
  });

  it("does NOT append low-confidence note when chunks are found", () => {
    const result = runOutputGuardrails({
      response: "Based on the document, the college offers 10 programs.",
      contextChunksFound: 3,
      mode: "pdf",
    });
    expect(result.triggered).not.toContain("LOW_CONFIDENCE");
    expect(result.wasModified).toBe(false);
  });

  it("does not duplicate low-confidence when hallucination disclaimer already present", () => {
    const response =
      "I believe this is correct general information. " +
      "\n\n> ⚠️ **Disclaimer**: Some parts of this response may not be fully verified against the source documents. Please cross-check important details with official college sources.";
    const result = runOutputGuardrails({
      response,
      contextChunksFound: 0,
      mode: "pdf",
    });
    // LOW_CONFIDENCE is skipped because hallucination disclaimer already present
    expect(result.triggered).not.toContain("LOW_CONFIDENCE");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Clean Pass-Through
// ─────────────────────────────────────────────────────────────────────────────
describe("Clean Pass-Through", () => {
  it("returns the response unmodified when all checks pass", () => {
    const response =
      "| Program | Duration | Fees |\n|---------|----------|------|\n| B.Tech CS | 4 years | ₹1,50,000/year |";
    const result = runOutputGuardrails({
      response,
      contextChunksFound: 5,
      mode: "pdf",
    });
    expect(result.wasModified).toBe(false);
    expect(result.wasBlocked).toBe(false);
    expect(result.triggered).toHaveLength(0);
    expect(result.finalResponse).toBe(response);
  });

  it("returns correct structure on clean response", () => {
    const result = runOutputGuardrails({
      response: "The admission deadline is January 15th. [Source ID: 1]",
      contextChunksFound: 2,
      mode: "pdf",
    });
    expect(result).toMatchObject({
      wasModified: false,
      wasBlocked: false,
      triggered: [],
    });
  });
});
