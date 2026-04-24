/**
 * Tests: Embedding (embedding.ts)
 * Strategy: Mock `fetch` to avoid real API calls.
 * Covers:
 *   1. getEmbedding — successful single embedding
 *   2. getEmbeddings — successful batch embeddings
 *   3. getEmbeddings — API error (non-200) → returns zero vectors
 *   4. getEmbeddings — API returns empty data → returns zero vectors
 *   5. getEmbeddings — fetch throws (network error) → returns zero vectors
 *   6. getEmbedding — delegates correctly to getEmbeddings and returns [0]
 *   7. getEmbeddings — preserves correct dimensionality (1536)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getEmbedding, getEmbeddings } from "../../llm/embedding.js";

const DIMENSIONS = 1536;
const ZERO_VECTOR = new Array(DIMENSIONS).fill(0);

function makeEmbedVector(seed = 1): number[] {
  return Array.from({ length: DIMENSIONS }, (_, i) => (i + seed) / DIMENSIONS);
}

function mockFetchSuccess(embeddings: number[][]) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      data: embeddings.map((embedding) => ({ embedding })),
    }),
    text: async () => "OK",
  } as any);
}

function mockFetchError(status = 500) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status,
    text: async () => "Internal Server Error",
  } as any);
}

function mockFetchEmptyData() {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ data: [] }),
    text: async () => "OK",
  } as any);
}

function mockFetchThrows() {
  global.fetch = vi.fn().mockRejectedValue(new Error("Network failure"));
}

beforeEach(() => {
  process.env.OPENROUTER_API_KEY = "test-key";
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. getEmbedding — successful
// ─────────────────────────────────────────────────────────────────────────────
describe("getEmbedding — success", () => {
  it("returns a 1536-dimensional vector", async () => {
    mockFetchSuccess([makeEmbedVector(1)]);
    const result = await getEmbedding("What courses are offered?");
    expect(result).toHaveLength(DIMENSIONS);
  });

  it("returns the correct embedding values", async () => {
    const expected = makeEmbedVector(42);
    mockFetchSuccess([expected]);
    const result = await getEmbedding("What is the fee?");
    expect(result).toEqual(expected);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. getEmbeddings — successful batch
// ─────────────────────────────────────────────────────────────────────────────
describe("getEmbeddings — success batch", () => {
  it("returns embeddings for multiple texts in order", async () => {
    const emb1 = makeEmbedVector(1);
    const emb2 = makeEmbedVector(2);
    const emb3 = makeEmbedVector(3);
    mockFetchSuccess([emb1, emb2, emb3]);

    const results = await getEmbeddings(["text1", "text2", "text3"]);
    expect(results).toHaveLength(3);
    expect(results[0]).toEqual(emb1);
    expect(results[1]).toEqual(emb2);
    expect(results[2]).toEqual(emb3);
  });

  it("calls fetch with correct model and input", async () => {
    mockFetchSuccess([makeEmbedVector(1)]);
    await getEmbeddings(["hello world"]);

    expect(fetch).toHaveBeenCalledOnce();
    const callArgs = JSON.parse((fetch as any).mock.calls[0][1].body);
    expect(callArgs.model).toBe("openai/text-embedding-3-small");
    expect(callArgs.input).toEqual(["hello world"]);
  });

  it("sends the Authorization header", async () => {
    mockFetchSuccess([makeEmbedVector(1)]);
    await getEmbeddings(["test"]);
    const headers = (fetch as any).mock.calls[0][1].headers;
    expect(headers["Authorization"]).toBe("Bearer test-key");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. API Error → zero vectors
// ─────────────────────────────────────────────────────────────────────────────
describe("getEmbeddings — API error", () => {
  it("returns zero vectors on 500 error", async () => {
    mockFetchError(500);
    const results = await getEmbeddings(["text1", "text2"]);
    expect(results).toHaveLength(2);
    expect(results[0]).toEqual(ZERO_VECTOR);
    expect(results[1]).toEqual(ZERO_VECTOR);
  });

  it("returns zero vectors on 402 error (insufficient credits)", async () => {
    mockFetchError(402);
    const results = await getEmbeddings(["text"]);
    expect(results[0]).toEqual(ZERO_VECTOR);
  });

  it("returns one zero vector per input text", async () => {
    mockFetchError(500);
    const inputs = ["a", "b", "c", "d", "e"];
    const results = await getEmbeddings(inputs);
    expect(results).toHaveLength(inputs.length);
    for (const r of results) {
      expect(r).toHaveLength(DIMENSIONS);
      expect(r.every((v: number) => v === 0)).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. API returns empty data → zero vectors
// ─────────────────────────────────────────────────────────────────────────────
describe("getEmbeddings — empty data", () => {
  it("returns zero vectors when API returns empty data array", async () => {
    mockFetchEmptyData();
    const results = await getEmbeddings(["text1"]);
    expect(results[0]).toEqual(ZERO_VECTOR);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Network Error → zero vectors
// ─────────────────────────────────────────────────────────────────────────────
describe("getEmbeddings — network error", () => {
  it("returns zero vectors when fetch throws", async () => {
    mockFetchThrows();
    const results = await getEmbeddings(["text1", "text2"]);
    expect(results).toHaveLength(2);
    expect(results[0]).toEqual(ZERO_VECTOR);
    expect(results[1]).toEqual(ZERO_VECTOR);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. getEmbedding — zero vector fallback
// ─────────────────────────────────────────────────────────────────────────────
describe("getEmbedding — fallback to zero vector", () => {
  it("returns zero vector (not error) when API fails", async () => {
    mockFetchError(500);
    const result = await getEmbedding("test");
    expect(result).toEqual(ZERO_VECTOR);
    expect(result).toHaveLength(DIMENSIONS);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Dimensionality check
// ─────────────────────────────────────────────────────────────────────────────
describe("Dimensionality", () => {
  it("always returns 1536-dimensional vectors on success", async () => {
    const vec = makeEmbedVector(99);
    expect(vec).toHaveLength(DIMENSIONS);
    mockFetchSuccess([vec]);
    const result = await getEmbedding("check dimensions");
    expect(result).toHaveLength(DIMENSIONS);
  });

  it("always returns 1536-dimensional zero vectors on failure", async () => {
    mockFetchError();
    const result = await getEmbedding("fail case");
    expect(result).toHaveLength(DIMENSIONS);
  });
});
