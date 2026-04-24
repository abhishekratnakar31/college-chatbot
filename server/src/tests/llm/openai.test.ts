/**
 * Tests: generateSearchQuery & generateStream (openai.ts)
 * Strategy: Mock `fetch` to avoid real API calls.
 * Covers:
 *   1. generateSearchQuery — success → returns optimized query
 *   2. generateSearchQuery — falls back to last user message on API error
 *   3. generateSearchQuery — falls back to last user message on JSON parse error
 *   4. generateSearchQuery — strips quotes from the result
 *   5. generateStream — success → returns a ReadableStream body
 *   6. generateStream — throws on API error (non-200)
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  generateSearchQuery,
  generateStream,
} from "../../llm/openai.js";
import type { ChatMessage } from "../../types/chat.js";

// ─── Helpers ───────────────────────────────────────────────────────────────

function mockFetchJson(json: any, ok = true) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: async () => json,
    text: async () => JSON.stringify(json),
    body: new ReadableStream(),
  } as any);
}

function mockFetchErrorText(text: string) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status: 402,
    text: async () => text,
    json: async () => { throw new Error("not json"); },
  } as any);
}

function makeHistory(lastUserMessage: string): ChatMessage[] {
  return [
    { role: "system", content: "You are a college assistant." },
    { role: "user", content: lastUserMessage },
  ];
}

afterEach(() => {
  vi.restoreAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. generateSearchQuery — success
// ─────────────────────────────────────────────────────────────────────────────
describe("generateSearchQuery — success", () => {
  it("returns the LLM-generated query string", async () => {
    mockFetchJson({
      choices: [{ message: { content: "MIT Computer Science admission requirements 2024" } }],
    });
    const history = makeHistory("How do I get into MIT CS?");
    const result = await generateSearchQuery(history);
    expect(result).toBe("MIT Computer Science admission requirements 2024");
  });

  it("calls the correct OpenRouter endpoint", async () => {
    mockFetchJson({
      choices: [{ message: { content: "query" } }],
    });
    await generateSearchQuery(makeHistory("test question"));
    expect((fetch as any).mock.calls[0][0]).toContain("openrouter.ai");
  });

  it("sends gpt-4o-mini as the model", async () => {
    mockFetchJson({ choices: [{ message: { content: "q" } }] });
    await generateSearchQuery(makeHistory("test"));
    const body = JSON.parse((fetch as any).mock.calls[0][1].body);
    expect(body.model).toBe("openai/gpt-4o-mini");
  });

  it("limits response to 50 max_tokens", async () => {
    mockFetchJson({ choices: [{ message: { content: "q" } }] });
    await generateSearchQuery(makeHistory("test"));
    const body = JSON.parse((fetch as any).mock.calls[0][1].body);
    expect(body.max_tokens).toBe(50);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. generateSearchQuery — API error fallback
// ─────────────────────────────────────────────────────────────────────────────
describe("generateSearchQuery — API error fallback", () => {
  it("returns last user message on non-200 response", async () => {
    mockFetchErrorText("Payment required");
    const history = makeHistory("What programs does Harvard offer?");
    const result = await generateSearchQuery(history);
    expect(result).toBe("What programs does Harvard offer?");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. generateSearchQuery — JSON parse error fallback
// ─────────────────────────────────────────────────────────────────────────────
describe("generateSearchQuery — JSON parse error fallback", () => {
  it("returns last user message when response JSON is unparseable", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => { throw new SyntaxError("Unexpected token"); },
      text: async () => "Not JSON",
    } as any);
    const history = makeHistory("What is the fee structure?");
    const result = await generateSearchQuery(history);
    expect(result).toBe("What is the fee structure?");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. generateSearchQuery — strips quotes
// ─────────────────────────────────────────────────────────────────────────────
describe("generateSearchQuery — quote stripping", () => {
  it("strips double quotes from the returned query", async () => {
    mockFetchJson({
      choices: [{ message: { content: '"IIT Delhi BTech admissions 2024"' } }],
    });
    const result = await generateSearchQuery(makeHistory("IIT Delhi?"));
    expect(result).not.toContain('"');
    expect(result).toBe("IIT Delhi BTech admissions 2024");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. generateStream — success
// ─────────────────────────────────────────────────────────────────────────────
describe("generateStream — success", () => {
  it("returns a body (ReadableStream) on success", async () => {
    const mockBody = new ReadableStream();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: mockBody,
      text: async () => "",
    } as any);

    const messages: ChatMessage[] = [
      { role: "system", content: "You are a college assistant." },
      { role: "user", content: "What courses does MIT offer?" },
    ];
    const result = await generateStream(messages);
    expect(result).toBe(mockBody);
  });

  it("sends stream: true in request body", async () => {
    const mockBody = new ReadableStream();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: mockBody,
    } as any);
    await generateStream([{ role: "user", content: "hello" }]);
    const body = JSON.parse((fetch as any).mock.calls[0][1].body);
    expect(body.stream).toBe(true);
  });

  it("sends the messages array to the API", async () => {
    const mockBody = new ReadableStream();
    global.fetch = vi.fn().mockResolvedValue({ ok: true, body: mockBody } as any);
    const messages: ChatMessage[] = [
      { role: "system", content: "sys" },
      { role: "user", content: "user question" },
    ];
    await generateStream(messages);
    const body = JSON.parse((fetch as any).mock.calls[0][1].body);
    expect(body.messages).toEqual(messages);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. generateStream — throws on API error
// ─────────────────────────────────────────────────────────────────────────────
describe("generateStream — API error throws", () => {
  it("throws an error containing the API error message", async () => {
    const errText = '{"error":{"message":"insufficient credits","code":402}}';
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 402,
      text: async () => errText,
    } as any);

    await expect(
      generateStream([{ role: "user", content: "test" }])
    ).rejects.toThrow("OpenRouter Error");
  });

  it("throws containing the raw error text", async () => {
    const errText = "something went wrong";
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => errText,
    } as any);

    await expect(
      generateStream([{ role: "user", content: "test" }])
    ).rejects.toThrow(errText);
  });
});
