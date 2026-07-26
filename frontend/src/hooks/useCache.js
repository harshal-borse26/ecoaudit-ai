/**
 * useCache — In-memory + sessionStorage cache with TTL
 *
 * Usage:
 *   const { getCache, setCache, invalidateCache, invalidateAll } = useCache();
 *   const cached = getCache('dashboard-summary');
 *   setCache('dashboard-summary', data, 2 * 60 * 1000); // 2 min TTL
 */

const CACHE_PREFIX = "ecoaudit_cache_";

// In-memory store for runtime speed (survives re-renders, not page refresh)
const memoryStore = {};

export function getCache(key) {
  const fullKey = CACHE_PREFIX + key;

  // Check memory first (fastest)
  if (memoryStore[fullKey]) {
    const { data, expiry } = memoryStore[fullKey];
    if (Date.now() < expiry) return data;
    delete memoryStore[fullKey];
  }

  // Fall back to sessionStorage (survives navigation within session)
  try {
    const raw = sessionStorage.getItem(fullKey);
    if (raw) {
      const { data, expiry } = JSON.parse(raw);
      if (Date.now() < expiry) {
        // Promote back to memory
        memoryStore[fullKey] = { data, expiry };
        return data;
      }
      sessionStorage.removeItem(fullKey);
    }
  } catch (_) {
    // sessionStorage unavailable (private mode, quota, etc.) — ignore
  }

  return null;
}

export function setCache(key, data, ttlMs = 2 * 60 * 1000) {
  const fullKey = CACHE_PREFIX + key;
  const expiry = Date.now() + ttlMs;

  // Write to memory
  memoryStore[fullKey] = { data, expiry };

  // Write to sessionStorage for cross-navigation persistence
  try {
    sessionStorage.setItem(fullKey, JSON.stringify({ data, expiry }));
  } catch (_) {
    // Quota exceeded or unavailable — memory cache still works
  }
}

export function invalidateCache(key) {
  const fullKey = CACHE_PREFIX + key;
  delete memoryStore[fullKey];
  try {
    sessionStorage.removeItem(fullKey);
  } catch (_) {}
}

export function invalidateAll() {
  // Clear all ecoaudit cache entries from memory
  Object.keys(memoryStore).forEach((k) => {
    if (k.startsWith(CACHE_PREFIX)) delete memoryStore[k];
  });

  // Clear from sessionStorage
  try {
    Object.keys(sessionStorage).forEach((k) => {
      if (k.startsWith(CACHE_PREFIX)) sessionStorage.removeItem(k);
    });
  } catch (_) {}
}
