/**
 * In-Memory Rate Limiter
 * ─────────────────────────────────────────────────────────────────
 * A simple sliding-window rate limiter keyed by client IP.
 * No external dependency (Redis) required.
 *
 * Defaults: 20 requests per 60-second window per IP.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

// ── Configuration ─────────────────────────────────────────────────

const MAX_REQUESTS_PER_WINDOW = 20;
const WINDOW_MS = 60 * 1000; // 60 seconds

// ── In-memory store ───────────────────────────────────────────────

interface WindowEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, WindowEntry>();

// Periodically clean up expired entries to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart > WINDOW_MS) {
      store.delete(key);
    }
  }
}, WINDOW_MS);

// ── Core check function ───────────────────────────────────────────

/**
 * Check whether the given IP is within the rate limit.
 * Mutates the store to record this request.
 *
 * @returns `true` if the request is allowed, `false` if rate-limited.
 */
export function checkRateLimit(ip: string): {
  allowed: boolean;
  retryAfterSeconds: number;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    // New window
    const newEntry = { count: 1, windowStart: now };
    store.set(ip, newEntry);
    return {
      allowed: true,
      retryAfterSeconds: 0,
      remaining: MAX_REQUESTS_PER_WINDOW - 1,
      resetAt: Math.ceil((now + WINDOW_MS) / 1000),
    };
  }

  entry.count += 1;

  if (entry.count > MAX_REQUESTS_PER_WINDOW) {
    const retryAfterMs = WINDOW_MS - (now - entry.windowStart);
    const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);
    console.warn(
      `[GUARDRAIL][RATE_LIMIT] IP ${ip} exceeded limit: ${entry.count} requests in window`
    );
    return {
      allowed: false,
      retryAfterSeconds,
      remaining: 0,
      resetAt: Math.ceil((entry.windowStart + WINDOW_MS) / 1000),
    };
  }

  return {
    allowed: true,
    retryAfterSeconds: 0,
    remaining: MAX_REQUESTS_PER_WINDOW - entry.count,
    resetAt: Math.ceil((entry.windowStart + WINDOW_MS) / 1000),
  };
}

// ── Fastify hook ──────────────────────────────────────────────────

/**
 * Register a global preHandler hook that rate-limits all incoming requests.
 * Call this once during server initialization.
 */
export function registerRateLimiter(app: FastifyInstance): void {
  app.addHook(
    "preHandler",
    async (request: FastifyRequest, reply: FastifyReply) => {
      // Extract the real client IP (account for proxies)
      const ip =
        (request.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        request.ip ||
        "unknown";

      const { allowed, retryAfterSeconds, remaining, resetAt } = checkRateLimit(ip);

      // Always set rate-limit headers on successful requests
      void reply.header("X-RateLimit-Limit", MAX_REQUESTS_PER_WINDOW);
      void reply.header("X-RateLimit-Remaining", remaining);
      void reply.header("X-RateLimit-Reset", resetAt);

      if (!allowed) {
        void reply.header("Retry-After", retryAfterSeconds);
        await reply.status(429).send({
          error: "TOO_MANY_REQUESTS",
          message: `Too many requests. Please wait ${retryAfterSeconds} seconds before trying again.`,
          retryAfterSeconds,
        });
      }
    }
  );
}
