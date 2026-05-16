/**
 * Panoramax federated catalog — ücretsiz, API anahtarı gerekmez.
 * @see https://api.panoramax.xyz/
 */

const SEARCH_URL = 'https://api.panoramax.xyz/api/search';
const REQUEST_TIMEOUT_MS = 8_000;

/** Yaklaşık metre → derece (enlem için) */
function metersToDeg(m: number, atLat: number): number {
  const latDeg = m / 111_320;
  const lngDeg = m / (111_320 * Math.cos((atLat * Math.PI) / 180));
  return Math.max(latDeg, lngDeg);
}

function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6_371_000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type SearchFeature = {
  geometry?: { coordinates?: [number, number] };
  assets?: {
    sd?: { href?: string };
    hd?: { href?: string };
    thumb?: { href?: string };
  };
};

async function searchBbox(
  lat: number,
  lng: number,
  radiusM: number
): Promise<SearchFeature[]> {
  const d = metersToDeg(radiusM, lat);
  const bbox = `${lng - d},${lat - d},${lng + d},${lat + d}`;
  const u = new URL(SEARCH_URL);
  u.searchParams.set('bbox', bbox);
  u.searchParams.set('limit', '12');

  const ctrl = new AbortController();
  const t = window.setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(u.toString(), { signal: ctrl.signal });
    if (!res.ok) return [];
    const json = (await res.json()) as { features?: SearchFeature[] };
    return json.features ?? [];
  } finally {
    clearTimeout(t);
  }
}

/** En yakın Panoramax fotoğrafı (SD); yoksa null */
export async function fetchNearestPanoramaxImageUrl(lat: number, lng: number): Promise<string | null> {
  const radii = [120, 250, 500, 1200];

  for (const radius of radii) {
    try {
      const features = await searchBbox(lat, lng, radius);
      if (!features.length) continue;

      let bestUrl: string | null = null;
      let bestDist = Infinity;

      for (const f of features) {
        const coords = f.geometry?.coordinates;
        if (!coords) continue;
        const [fLng, fLat] = coords;
        const dist = haversineM(lat, lng, fLat, fLng);
        const url =
          f.assets?.sd?.href ?? f.assets?.hd?.href ?? f.assets?.thumb?.href ?? null;
        if (!url || dist >= bestDist) continue;
        bestDist = dist;
        bestUrl = url;
      }

      if (bestUrl) return bestUrl;
    } catch {
      continue;
    }
  }

  return null;
}
