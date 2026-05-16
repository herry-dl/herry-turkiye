import type { Location } from './locations';
import { fetchStreetScene } from './streetImagery';

const CACHE_KEY = 'herry-validated-v1';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

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

  const scene = await fetchStreetScene(loc.lat, loc.lng);
  const ok = !!scene && scene.images.length > 0;
  cache[loc.id] = { ok, ts: Date.now() };
  return ok;
}

/**
 * Verilen havuzdan, sokak fotoğrafı olan en fazla `count` konum döndürür.
 * Sonuçları localStorage'da önbellekler — sonraki oyunlar anında başlar.
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
  const concurrency = 6;
  let index = 0;
  let progress = 0;

  const total = count;
  onProgress?.(0, total);

  async function worker() {
    while (validated.length < count && index < shuffled.length) {
      const loc = shuffled[index++];
      const ok = await validateOne(loc, cache);
      if (ok && validated.length < count) {
        validated.push(loc);
        progress = Math.min(validated.length, total);
        onProgress?.(progress, total);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));

  if (validated.length < count) {
    const fallbackShuffled = [...fallbackPool].sort(() => Math.random() - 0.5);
    for (const loc of fallbackShuffled) {
      if (validated.length >= count) break;
      if (validated.some((v) => v.id === loc.id)) continue;
      const ok = await validateOne(loc, cache);
      if (ok) {
        validated.push(loc);
        onProgress?.(Math.min(validated.length, total), total);
      }
    }
  }

  saveCache(cache);
  return validated.slice(0, count);
}

/** Tek konumun fotoğrafı var mı? (ATLA sırasında kullanılır) */
export async function hasCoverage(loc: Location): Promise<boolean> {
  const cache = loadCache();
  const ok = await validateOne(loc, cache);
  saveCache(cache);
  return ok;
}
