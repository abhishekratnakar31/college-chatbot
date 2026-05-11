/**
 * HTTP Keep-Alive Agent
 * ─────────────────────────────────────────────────────────────────
 * Node.js's global fetch() is built on undici. By default, each
 * fetch() call can open a fresh TCP connection. Setting a global
 * undici Agent with keepAlive enables persistent connection pooling,
 * removing ~50–150ms of TCP handshake overhead per LLM call.
 *
 * Call `initHttpAgent()` once at server startup (before routes are hit).
 * After that, all global fetch() calls automatically use this pool.
 */

import { Agent, setGlobalDispatcher } from "undici";

let initialized = false;

export function initHttpAgent(): void {
  if (initialized) return;

  const agent = new Agent({
    // Keep idle connections alive for 30 seconds
    keepAliveTimeout: 30_000,
    // Maximum time a connection can be kept alive (10 min)
    keepAliveMaxTimeout: 600_000,
    // Pool of 10 concurrent connections to OpenRouter
    connections: 10,
    // Pipelining disabled for compatibility with OpenAI SSE streams
    pipelining: 0,
  });

  setGlobalDispatcher(agent);
  initialized = true;
  console.log("[HTTP Agent] Global keep-alive dispatcher initialized (connections: 10)");
}
