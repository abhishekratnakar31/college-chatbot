/**
 * Tests: Rate Limiter
 * Covers every case in checkRateLimit:
 *   1. First request — new window created
 *   2. Requests within the limit
 *   3. Request exactly at the limit (20th)
 *   4. Request exceeding the limit (21st)
 *   5. Separate IPs don't interfere with each other
 *   6. Window reset after expiry (mocked time)
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { checkRateLimit } from "../../guardrails/rateLimiter.js";

const MAX = 20;

// Helper: unique IP per test to avoid shared state
let counter = 0;
const uniqueIp = () => `192.168.0.${++counter}`;

afterEach(() => {
  vi.useRealTimers();
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. First Request
// ─────────────────────────────────────────────────────────────────────────────
describe("First Request (New Window)", () => {
  it("allows the first request", () => {
    const { allowed } = checkRateLimit(uniqueIp());
    expect(allowed).toBe(true);
  });

  it("returns retryAfterSeconds = 0 on the first request", () => {
    const { retryAfterSeconds } = checkRateLimit(uniqueIp());
    expect(retryAfterSeconds).toBe(0);
  });

  it("returns MAX - 1 remaining after the first request", () => {
    const { remaining } = checkRateLimit(uniqueIp());
    expect(remaining).toBe(MAX - 1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Requests Within the Limit
// ─────────────────────────────────────────────────────────────────────────────
describe("Requests Within the Limit", () => {
  it("allows 10 consecutive requests from the same IP", () => {
    const ip = uniqueIp();
    for (let i = 0; i < 10; i++) {
      const { allowed } = checkRateLimit(ip);
      expect(allowed).toBe(true);
    }
  });

  it("decrements `remaining` with each request", () => {
    const ip = uniqueIp();
    const { remaining: r1 } = checkRateLimit(ip); // 19
    const { remaining: r2 } = checkRateLimit(ip); // 18
    const { remaining: r3 } = checkRateLimit(ip); // 17
    expect(r1).toBe(MAX - 1);
    expect(r2).toBe(MAX - 2);
    expect(r3).toBe(MAX - 3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Request Exactly at the Limit (20th request)
// ─────────────────────────────────────────────────────────────────────────────
describe("Request at the Limit (20th)", () => {
  it("allows the 20th request", () => {
    const ip = uniqueIp();
    let lastResult;
    for (let i = 0; i < MAX; i++) {
      lastResult = checkRateLimit(ip);
    }
    expect(lastResult!.allowed).toBe(true);
    expect(lastResult!.remaining).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Exceeding the Limit (21st request and beyond)
// ─────────────────────────────────────────────────────────────────────────────
describe("Exceeding the Limit", () => {
  it("blocks the 21st request", () => {
    const ip = uniqueIp();
    for (let i = 0; i < MAX; i++) {
      checkRateLimit(ip);
    }
    const { allowed } = checkRateLimit(ip); // 21st
    expect(allowed).toBe(false);
  });

  it("returns remaining = 0 when rate-limited", () => {
    const ip = uniqueIp();
    for (let i = 0; i <= MAX; i++) {
      checkRateLimit(ip);
    }
    const { remaining } = checkRateLimit(ip);
    expect(remaining).toBe(0);
  });

  it("returns a positive retryAfterSeconds when rate-limited", () => {
    const ip = uniqueIp();
    for (let i = 0; i <= MAX; i++) {
      checkRateLimit(ip);
    }
    const { retryAfterSeconds } = checkRateLimit(ip);
    expect(retryAfterSeconds).toBeGreaterThan(0);
    expect(retryAfterSeconds).toBeLessThanOrEqual(60);
  });

  it("blocks all subsequent requests after the 21st", () => {
    const ip = uniqueIp();
    for (let i = 0; i <= MAX; i++) {
      checkRateLimit(ip);
    }
    // 22nd, 23rd, 24th — all should be blocked
    for (let i = 0; i < 3; i++) {
      const { allowed } = checkRateLimit(ip);
      expect(allowed).toBe(false);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. IP Isolation
// ─────────────────────────────────────────────────────────────────────────────
describe("IP Isolation", () => {
  it("separate IPs do not share rate limit state", () => {
    const ip1 = uniqueIp();
    const ip2 = uniqueIp();

    // Exhaust ip1
    for (let i = 0; i <= MAX; i++) {
      checkRateLimit(ip1);
    }
    expect(checkRateLimit(ip1).allowed).toBe(false);

    // ip2 should still be unaffected
    expect(checkRateLimit(ip2).allowed).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Window Reset (mocked time)
// ─────────────────────────────────────────────────────────────────────────────
describe("Window Reset After Expiry", () => {
  it("allows requests again after the 60s window expires", () => {
    vi.useFakeTimers();
    const ip = uniqueIp();

    // Exhaust in the current window
    for (let i = 0; i <= MAX; i++) {
      checkRateLimit(ip);
    }
    expect(checkRateLimit(ip).allowed).toBe(false);

    // Advance time past the window (61 seconds)
    vi.advanceTimersByTime(61 * 1000);

    // Now a new window should start
    const { allowed } = checkRateLimit(ip);
    expect(allowed).toBe(true);
    vi.useRealTimers();
  });
});
