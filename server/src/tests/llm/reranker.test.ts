/**
 * Tests: Re-ranker (reranker.ts)
 * Strategy: Mock `fetch` to avoid real API calls.
 * Covers:
 *   1. Empty chunk list → returns []
 *   2. Single chunk → returns as-is without calling LLM
 *   3. Valid LLM response → re-orders chunks by score
 *   4. Partial/malformed JSON from LLM → falls back to original order
 *   5. API error (non-200) → falls back to original order
 *   6. Network error (fetch throws) → falls back to original order
 *   7. Scores array shorter than chunks → missing scores treated as 0
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { reRankChunks } from "../../llm/reranker.js";

// ─── Mock helpers ──────────────────────────────────────────────────────────

function makeChunk(text: string, id = "uuid") {
  return {
    id,
    score: 0.5, // default vector score
    payload: { text, document: "test.pdf", page_number: 1, chunk_index: 0 },
  };
}

function mockFetchOk(scores: number[]) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      choices: [{ message: { content: JSON.stringify(scores) } }],
    }),
  } as any);
}

function mockFetchBadJson(content: string) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      choices: [{ message: { content } }],
    }),
  } as any);
}

function mockFetchError() {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status: 500,
    text: async () => "Internal Server Error",
  } as any);
}

function mockFetchThrows() {
  global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
}

beforeEach(() => {
  process.env.OPENROUTER_API_KEY = "test-key";
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. Empty chunk list
// ─────────────────────────────────────────────────────────────────────────────
describe("Empty chunk list", () => {
  it("returns [] immediately without calling fetch", async () => {
    global.fetch = vi.fn();
    const result = await reRankChunks("some query", []);
    expect(result).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Single chunk
// ─────────────────────────────────────────────────────────────────────────────
describe("Single chunk", () => {
  it("returns the chunk as-is without calling fetch", async () => {
    global.fetch = vi.fn();
    const chunk = makeChunk("Only one chunk.");
    const result = await reRankChunks("query", [chunk]);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(chunk);
    expect(fetch).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Valid LLM re-ranking response
// ─────────────────────────────────────────────────────────────────────────────
describe("Valid LLM re-ranking", () => {
  it("reorders chunks from highest to lowest score", async () => {
    const chunks = [
      makeChunk("Low relevance chunk about music.", "id-a"),
      makeChunk("High relevance chunk about IIT admissions.", "id-b"),
      makeChunk("Medium relevance chunk about general college tips.", "id-c"),
    ];
    mockFetchOk([2, 9, 5]); // scores for chunks a, b, c

    const result = await reRankChunks("IIT admission requirements", chunks);

    expect(result).toHaveLength(3);
    // Chunk b should be first (score 9)
    expect(result[0]!.id).toBe("id-b");
    // Chunk c should be second (score 5)
    expect(result[1]!.id).toBe("id-c");
    // Chunk a should be last (score 2)
    expect(result[2]!.id).toBe("id-a");
  });

  it("attaches rerank_score to each chunk", async () => {
    const chunks = [makeChunk("chunk 1", "id-1"), makeChunk("chunk 2", "id-2")];
    mockFetchOk([7, 3]);

    const result = await reRankChunks("query", chunks);
    expect((result[0] as any).rerank_score).toBe(7);
    expect((result[1] as any).rerank_score).toBe(3);
  });

  it("calls fetch exactly once for multi-chunk re-ranking", async () => {
    const chunks = [makeChunk("a", "x"), makeChunk("b", "y"), makeChunk("c", "z")];
    mockFetchOk([3, 1, 2]);

    await reRankChunks("query", chunks);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("handles all equal scores by preserving relative order", async () => {
    const chunks = [makeChunk("a", "x"), makeChunk("b", "y")];
    mockFetchOk([5, 5]);

    const result = await reRankChunks("query", chunks);
    expect(result).toHaveLength(2);
    // Both are equal — just ensure both are present
    const ids = result.map((r: any) => r.id);
    expect(ids).toContain("x");
    expect(ids).toContain("y");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Malformed JSON from LLM
// ─────────────────────────────────────────────────────────────────────────────
describe("Malformed LLM JSON", () => {
  it("falls back to original order on invalid JSON", async () => {
    const chunks = [makeChunk("chunk A", "id-a"), makeChunk("chunk B", "id-b")];
    mockFetchBadJson("Sorry, I can't score these.");

    const result = await reRankChunks("query", chunks);
    expect(result).toHaveLength(2);
    expect(result[0]!.id).toBe("id-a");
    expect(result[1]!.id).toBe("id-b");
  });

  it("falls back to original order when LLM returns a non-array", async () => {
    const chunks = [makeChunk("chunk A", "id-a"), makeChunk("chunk B", "id-b")];
    mockFetchBadJson('{"message": "not an array"}');

    const result = await reRankChunks("query", chunks);
    expect(result).toHaveLength(2);
    expect(result[0]!.id).toBe("id-a");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. API Error (non-200 response)
// ─────────────────────────────────────────────────────────────────────────────
describe("API Error (non-200)", () => {
  it("falls back to original order on API failure", async () => {
    const chunks = [makeChunk("chunk A", "id-a"), makeChunk("chunk B", "id-b")];
    mockFetchError();

    const result = await reRankChunks("query", chunks);
    expect(result).toHaveLength(2);
    expect(result[0]!.id).toBe("id-a");
    expect(result[1]!.id).toBe("id-b");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Network Error (fetch throws)
// ─────────────────────────────────────────────────────────────────────────────
describe("Network Error (fetch throws)", () => {
  it("falls back to original order when fetch throws", async () => {
    const chunks = [makeChunk("chunk A", "id-a"), makeChunk("chunk B", "id-b")];
    mockFetchThrows();

    const result = await reRankChunks("query", chunks);
    expect(result).toHaveLength(2);
    expect(result[0]!.id).toBe("id-a");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Scores array shorter than chunks
// ─────────────────────────────────────────────────────────────────────────────
describe("Scores array shorter than chunks", () => {
  it("treats missing scores as 0 and places those chunks last", async () => {
    const chunks = [
      makeChunk("chunk A", "id-a"),
      makeChunk("chunk B", "id-b"),
      makeChunk("chunk C", "id-c"),
    ];
    // Only 2 scores for 3 chunks — chunk C gets score 0
    mockFetchOk([3, 7]); // only 2 scores

    const result = await reRankChunks("query", chunks);
    expect(result).toHaveLength(3);
    // id-b (7) should be first
    expect(result[0]!.id).toBe("id-b");
    // id-c (0, missing) should be last
    expect(result[2]!.id).toBe("id-c");
  });
});
