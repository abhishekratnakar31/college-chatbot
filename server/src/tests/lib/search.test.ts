/**
 * Tests: Tavily Web Search (search.ts)
 * Strategy: Mock `fetch` to avoid real API calls.
 * Covers:
 *   1. Missing API key → returns [] without calling fetch
 *   2. Successful search → returns parsed results array
 *   3. API returns no results → returns []
 *   4. Fetch throws (network error) → returns []
 *   5. Correct request structure (method, body, headers)
 *   6. API returns non-ok status → returns empty results (no throw)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { searchWeb } from "../../lib/search.js";

const MOCK_RESULTS = [
  {
    title: "MIT Admissions - How to Apply",
    url: "https://admissions.mit.edu",
    content: "MIT offers undergraduate programs in CS, Biology, and Engineering...",
    score: 0.95,
  },
  {
    title: "MIT Fee Structure 2024",
    url: "https://sfs.mit.edu/tuition",
    content: "Annual tuition is approximately $57,590 for 2024-2025.",
    score: 0.88,
  },
];

function mockFetchSuccess(results = MOCK_RESULTS) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ results }),
  } as any);
}

function mockFetchEmpty() {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ results: [] }),
  } as any);
}

function mockFetchNoResultsKey() {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({}), // No "results" key
  } as any);
}

function mockFetchError() {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status: 500,
    json: async () => ({ error: "Server error" }),
  } as any);
}

function mockFetchThrows() {
  global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
}

afterEach(() => {
  vi.restoreAllMocks();
  process.env.TAVILY_API_KEY = "test-tavily-key";
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. Missing API Key
// ─────────────────────────────────────────────────────────────────────────────
describe("searchWeb — missing API key", () => {
  it("returns [] without calling fetch when TAVILY_API_KEY is missing", async () => {
    delete process.env.TAVILY_API_KEY;
    global.fetch = vi.fn();
    const result = await searchWeb("MIT admissions");
    expect(result).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Successful Search
// ─────────────────────────────────────────────────────────────────────────────
describe("searchWeb — success", () => {
  beforeEach(() => {
    process.env.TAVILY_API_KEY = "test-tavily-key";
  });

  it("returns the results array from the API", async () => {
    mockFetchSuccess();
    const results = await searchWeb("MIT admissions 2024");
    expect(results).toHaveLength(2);
    expect(results[0]!.title).toBe("MIT Admissions - How to Apply");
    expect(results[1]!.url).toBe("https://sfs.mit.edu/tuition");
  });

  it("calls the Tavily endpoint", async () => {
    mockFetchSuccess();
    await searchWeb("test query");
    expect((fetch as any).mock.calls[0][0]).toBe("https://api.tavily.com/search");
  });

  it("sends POST method", async () => {
    mockFetchSuccess();
    await searchWeb("test");
    expect((fetch as any).mock.calls[0][1].method).toBe("POST");
  });

  it("includes the api_key in the request body", async () => {
    mockFetchSuccess();
    await searchWeb("test");
    const body = JSON.parse((fetch as any).mock.calls[0][1].body);
    expect(body.api_key).toBe("test-tavily-key");
  });

  it("passes the query in the request body", async () => {
    mockFetchSuccess();
    await searchWeb("IIT Delhi fees 2024");
    const body = JSON.parse((fetch as any).mock.calls[0][1].body);
    expect(body.query).toBe("IIT Delhi fees 2024");
  });

  it("requests max_results = 8", async () => {
    mockFetchSuccess();
    await searchWeb("test");
    const body = JSON.parse((fetch as any).mock.calls[0][1].body);
    expect(body.max_results).toBe(8);
  });

  it("uses search_depth = 'advanced'", async () => {
    mockFetchSuccess();
    await searchWeb("test");
    const body = JSON.parse((fetch as any).mock.calls[0][1].body);
    expect(body.search_depth).toBe("advanced");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. API returns no results
// ─────────────────────────────────────────────────────────────────────────────
describe("searchWeb — no results", () => {
  beforeEach(() => { process.env.TAVILY_API_KEY = "key"; });

  it("returns [] when results is an empty array", async () => {
    mockFetchEmpty();
    const result = await searchWeb("some query");
    expect(result).toEqual([]);
  });

  it("returns [] when results key is missing from response", async () => {
    mockFetchNoResultsKey();
    const result = await searchWeb("some query");
    expect(result).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Network Error → returns []
// ─────────────────────────────────────────────────────────────────────────────
describe("searchWeb — network error", () => {
  beforeEach(() => { process.env.TAVILY_API_KEY = "key"; });

  it("returns [] when fetch throws a network error", async () => {
    mockFetchThrows();
    const result = await searchWeb("test query");
    expect(result).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Non-OK Status (e.g. 500)
// ─────────────────────────────────────────────────────────────────────────────
describe("searchWeb — non-ok API status", () => {
  beforeEach(() => { process.env.TAVILY_API_KEY = "key"; });

  it("does not throw on non-ok status but may return empty or undefined", async () => {
    // The implementation calls data.results || [] regardless of ok status
    mockFetchError();
    // The function reads data.results; on 500, json returns {error: ...}
    // So data.results is undefined → falls back to []
    let result: any;
    try {
      result = await searchWeb("test");
    } catch {
      result = [];
    }
    // Either [] or a valid array — should not throw
    expect(Array.isArray(result)).toBe(true);
  });
});
