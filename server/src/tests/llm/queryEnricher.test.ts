/**
 * Tests: generatePdfAwareSearchQuery (queryEnricher.ts)
 * Strategy: Mock `fetch` to avoid real API calls.
 * Covers:
 *   1. Success — returns the LLM-generated enriched query
 *   2. Returns OUT_OF_DOMAIN signal unchanged
 *   3. Falls back to userQuestion on API error (non-200)
 *   4. Falls back to userQuestion when fetch throws
 *   5. Strips surrounding quotes from the query
 *   6. Truncates pdfContext to 3000 chars in the prompt
 *   7. Includes the user question and pdf excerpt in the prompt
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { generatePdfAwareSearchQuery } from "../../llm/queryEnricher.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

function mockSuccess(content: string) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      choices: [{ message: { content } }],
    }),
    text: async () => content,
  } as any);
}

function mockApiError() {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status: 500,
    text: async () => "Server Error",
  } as any);
}

function mockFetchThrows() {
  global.fetch = vi.fn().mockRejectedValue(new Error("Network failure"));
}

afterEach(() => {
  vi.restoreAllMocks();
  process.env.OPENROUTER_API_KEY = "test-key";
});

const SAMPLE_PDF_CONTEXT =
  "This document is from MIT (Massachusetts Institute of Technology). " +
  "It covers the undergraduate program rules for B.Tech in Computer Science.";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Success
// ─────────────────────────────────────────────────────────────────────────────
describe("generatePdfAwareSearchQuery — success", () => {
  it("returns the LLM-generated enriched query", async () => {
    mockSuccess("MIT B.Tech Computer Science admission 2024 official");
    const result = await generatePdfAwareSearchQuery(
      "What are the admission requirements?",
      SAMPLE_PDF_CONTEXT
    );
    expect(result).toBe("MIT B.Tech Computer Science admission 2024 official");
  });

  it("calls the OpenRouter API once", async () => {
    mockSuccess("some query");
    await generatePdfAwareSearchQuery("How many programs?", SAMPLE_PDF_CONTEXT);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("uses gpt-4o-mini model", async () => {
    mockSuccess("query");
    await generatePdfAwareSearchQuery("test", SAMPLE_PDF_CONTEXT);
    const body = JSON.parse((fetch as any).mock.calls[0][1].body);
    expect(body.model).toBe("openai/gpt-4o-mini");
  });

  it("limits to 60 max_tokens", async () => {
    mockSuccess("query");
    await generatePdfAwareSearchQuery("test", SAMPLE_PDF_CONTEXT);
    const body = JSON.parse((fetch as any).mock.calls[0][1].body);
    expect(body.max_tokens).toBe(60);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. OUT_OF_DOMAIN passthrough
// ─────────────────────────────────────────────────────────────────────────────
describe("generatePdfAwareSearchQuery — OUT_OF_DOMAIN", () => {
  it("returns the OUT_OF_DOMAIN string when LLM returns it", async () => {
    mockSuccess("OUT_OF_DOMAIN");
    const result = await generatePdfAwareSearchQuery(
      "What is the best cryptocurrency to buy?",
      SAMPLE_PDF_CONTEXT
    );
    expect(result).toBe("OUT_OF_DOMAIN");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Falls back to userQuestion on API error
// ─────────────────────────────────────────────────────────────────────────────
describe("generatePdfAwareSearchQuery — API error fallback", () => {
  it("returns the original user question on API error", async () => {
    mockApiError();
    const question = "What scholarship programs are available?";
    const result = await generatePdfAwareSearchQuery(question, SAMPLE_PDF_CONTEXT);
    expect(result).toBe(question);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Falls back to userQuestion when fetch throws
// ─────────────────────────────────────────────────────────────────────────────
describe("generatePdfAwareSearchQuery — network error fallback", () => {
  it("returns the original user question when fetch throws", async () => {
    mockFetchThrows();
    const question = "Tell me about the campus facilities.";
    const result = await generatePdfAwareSearchQuery(question, SAMPLE_PDF_CONTEXT);
    expect(result).toBe(question);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Quote stripping
// ─────────────────────────────────────────────────────────────────────────────
describe("generatePdfAwareSearchQuery — quote stripping", () => {
  it("strips leading and trailing double quotes from the query", async () => {
    mockSuccess('"MIT CS admission requirements 2024"');
    const result = await generatePdfAwareSearchQuery("admission?", SAMPLE_PDF_CONTEXT);
    expect(result).not.toMatch(/^"/);
    expect(result).not.toMatch(/"$/);
    expect(result).toBe("MIT CS admission requirements 2024");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Context truncation to 3000 chars
// ─────────────────────────────────────────────────────────────────────────────
describe("generatePdfAwareSearchQuery — PDF context truncation", () => {
  it("truncates pdfContext to 3000 characters in the prompt", async () => {
    mockSuccess("truncated query");

    const longContext = "X".repeat(5000);
    await generatePdfAwareSearchQuery("test question", longContext);

    const body = JSON.parse((fetch as any).mock.calls[0][1].body);
    const systemPrompt = body.messages[0].content as string;

    // The first 3000 X's should be in the prompt
    expect(systemPrompt).toContain("X".repeat(3000));
    // The 3001st character onward should NOT be in the prompt
    expect(systemPrompt).not.toContain("X".repeat(3001));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Prompt structure
// ─────────────────────────────────────────────────────────────────────────────
describe("generatePdfAwareSearchQuery — prompt structure", () => {
  it("includes the user question as the user message", async () => {
    mockSuccess("query");
    const userQuestion = "What are the graduation requirements?";
    await generatePdfAwareSearchQuery(userQuestion, SAMPLE_PDF_CONTEXT);

    const body = JSON.parse((fetch as any).mock.calls[0][1].body);
    const userMsg = body.messages.find((m: any) => m.role === "user");
    expect(userMsg.content).toBe(userQuestion);
  });

  it("includes the PDF excerpt in the system prompt", async () => {
    mockSuccess("query");
    await generatePdfAwareSearchQuery("test", SAMPLE_PDF_CONTEXT);

    const body = JSON.parse((fetch as any).mock.calls[0][1].body);
    const systemMsg = body.messages.find((m: any) => m.role === "system");
    expect(systemMsg.content).toContain(SAMPLE_PDF_CONTEXT.slice(0, 100));
  });
});
