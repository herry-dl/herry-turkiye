import type { Location } from './locations';
import { fetchStreetScene, type StreetImageSource } from './streetImagery';

const CACHE_KEY = 'herry-validated-v2';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type CacheEntry = {
  ts: number;
  ok: boolean;
  images?: string[];
  source?: StreetImageSource;
};

type Cache = Record<string, CacheEntry>;

export type ValidatedLocation = Location & {
  images: string[];
  source: StreetImageSource;
};

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

function getCached(cache: Cache, id: string): CacheEntry | null {
  const entry = cache[id];
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) return null;
  return entry;
}

async function validateOne(loc: Location, cache: Cache): Promise<ValidatedLocation | null> {
  const cached = getCached(cache, loc.id);
  if (cached) {
    if (!cached.ok || !cached.images || cached.images.length === 0) return null;
    return { ...loc, images: cached.images, source: cached.source ?? 'kartaview' };
  }

  const scene = await fetchStreetScene(loc.lat, loc.lng);
  if (!scene || scene.images.length === 0) {
    cache[loc.id] = { ts: Date.now(), ok: false };
    return null;
  }

  cache[loc.id] = {
    ts: Date.now(),
    ok: true,
    images: scene.images,
    source: scene.source,
  };
  return { ...loc, images: scene.images, source: scene.source };
}

/**
 * Doğrulanmış konum + fotoğraf URL'leri.
 * Sonuçları localStorage'da önbellekler — sonraki oyunlar anında başlar.
 */
export async function pickValidatedLocations(
  pool: Location[],
  count: number,
  fallbackPool: Location[],
  onProgress?: (ready: number, total: number) => void
): Promise<ValidatedLocation[]> {
  const cache = loadCache();
  const shuffled = [...pool].sort(() => Math.random() - 0.5);

  const validated: ValidatedLocation[] = [];
  const concurrency = 6;
  let index = 0;

  onProgress?.(0, count);

  async function worker() {
    while (validated.length < count && index < shuffled.length) {
      const loc = shuffled[index++];
      const v = await validateOne(loc, cache);
      if (v && validated.length < count) {
        validated.push(v);
        onProgress?.(Math.min(validated.length, count), count);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));

  if (validated.length < count) {
    const fallbackShuffled = [...fallbackPool].sort(() => Math.random() - 0.5);
    for (const loc of fallbackShuffled) {
      if (validated.length >= count) break;
      if (validated.some((v) => v.id === loc.id)) continue;
      const v = await validateOne(loc, cache);
      if (v) {
        validated.push(v);
        onProgress?.(Math.min(validated.length, count), count);
      }
    }
  }

  saveCache(cache);
  return validated.slice(0, count);
}

/** Tek konum doğrula — ATLA için */
export async function validateLocation(loc: Location): Promise<ValidatedLocation | null> {
  const cache = loadCache();
  const v = await validateOne(loc, cache);
  saveCache(cache);
  return v;
}
