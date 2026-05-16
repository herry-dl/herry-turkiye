import type { Location } from './locations';
import { hasStreetCoverage } from './streetImagery';

const CACHE_KEY = 'herry-validated-v4';
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type CacheEntry = { ok: boolean; ts: number };
type Cache = Record<string, CacheEntry>;

function loadCache(): Cache {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Cache;
  } catch {
    return {};
  }
}

function saveCache(c: Cache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(c));
  } catch {
    /* quota dolmuşsa sessizce geç */
  }
}

function isCached(cache: Cache, id: string): boolean | null {
  const entry = cache[id];
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) return null;
  return entry.ok;
}

async function validateOne(loc: Location, cache: Cache): Promise<boolean> {
  const cached = isCached(cache, loc.id);
  if (cached !== null) return cached;

  const ok = await hasStreetCoverage(loc.lat, loc.lng);
  cache[loc.id] = { ok, ts: Date.now() };
  return ok;
}

/**
 * Havuzdan, sokak fotoğrafı kapsamasında olan en fazla `count` konum döndürür.
 * Sadece var/yok bilgisini cache'ler — fotoğraf URL'leri round başında alınır
 * (Mapillary URL'leri kısa ömürlüdür).
 */
export async function pickValidatedLocations(
  pool: Location[],
  count: number,
  fallbackPool: Location[],
  onProgress?: (ready: number, total: number) => void
): Promise<Location[]> {
  const cache = loadCache();
  const shuffled = [...pool].sort(() => Math.random() - 0.5);

  const validated: Location[] = [];
  const concurrency = 5;
  let index = 0;

  onProgress?.(0, count);

  async function worker() {
    while (validated.length < count && index < shuffled.length) {
      const loc = shuffled[index++];
      const ok = await validateOne(loc, cache);
      if (ok && validated.length < count) {
        validated.push(loc);
        onProgress?.(Math.min(validated.length, count), count);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));

  if (validated.length < count) {
    const fbShuffled = [...fallbackPool].sort(() => Math.random() - 0.5);
    for (const loc of fbShuffled) {
      if (validated.length >= count) break;
      if (validated.some((v) => v.id === loc.id)) continue;
      const ok = await validateOne(loc, cache);
      if (ok) {
        validated.push(loc);
        onProgress?.(Math.min(validated.length, count), count);
      }
    }
  }

  saveCache(cache);
  return validated.slice(0, count);
}

export async function validateLocation(loc: Location): Promise<boolean> {
  const cache = loadCache();
  const ok = await validateOne(loc, cache);
  saveCache(cache);
  return ok;
}
