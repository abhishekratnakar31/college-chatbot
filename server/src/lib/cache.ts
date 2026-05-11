/**
 * In-Memory TTL Cache
 * ─────────────────────────────────────────────────────────────────
 * A lightweight, size-bounded, time-to-live cache used to skip
 * repeated embedding + vector search + reranking for identical queries.
 *
 * - Max 200 entries (LRU-style: oldest entry evicted when full)
 * - Each entry has an individual TTL (default 5 minutes)
 * - Zero external dependencies
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const MAX_SIZE = 200;
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Using insertion-ordered Map for cheap O(1) LRU eviction (delete first key)
const store = new Map<string, CacheEntry<unknown>>();

// ── Periodic cleanup of expired entries ──────────────────────────
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.expiresAt) {
      store.delete(key);
    }
  }
}, 60_000); // run every minute

// ── Public API ────────────────────────────────────────────────────

/**
 * Get a cached value. Returns `null` if the key is missing or expired.
 */
export function getCache<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }

  // Move to end of Map to refresh LRU position
  store.delete(key);
  store.set(key, entry);

  return entry.value as T;
}

/**
 * Store a value in the cache.
 * @param key     Cache key
 * @param value   Value to store
 * @param ttlMs   Time-to-live in milliseconds (default: 5 minutes)
 */
export function setCache<T>(key: string, value: T, ttlMs = DEFAULT_TTL_MS): void {
  // Evict the oldest (first inserted) entry when at capacity
  if (store.size >= MAX_SIZE) {
    const oldestKey = store.keys().next().value;
    if (oldestKey) {
      store.delete(oldestKey);
    }
  }

  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

/**
 * Clear cache entries.
 * @param keyPrefix  If provided, only entries whose keys start with this prefix are cleared.
 *                   If omitted, the entire cache is cleared.
 */
export function clearCache(keyPrefix?: string): void {
  if (!keyPrefix) {
    store.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key.startsWith(keyPrefix)) {
      store.delete(key);
    }
  }
}

/**
 * Build a deterministic cache key for the chat retrieval pipeline.
 */
export function buildQueryCacheKey(
  mode: string,
  optimizedQuery: string,
  activeDocuments: string[]
): string {
  const docs = activeDocuments.length > 0 ? activeDocuments.sort().join("|") : "none";
  return `${mode}:${docs}:${optimizedQuery.toLowerCase().trim()}`;
}

/** Returns current cache size (for diagnostics). */
export function getCacheSize(): number {
  return store.size;
}
