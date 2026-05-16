/**
 * Mapillary Graph API v4 — ücretsiz, public client token ile çalışır.
 * Türkiye'de KartaView ve Panoramax'tan çok daha geniş kapsama sağlar.
 * @see https://www.mapillary.com/developer/api-documentation
 */

/** Türkiye Kâşifi için Mapillary client token (public). */
const DEFAULT_TOKEN = 'MLY|26987588834193708|011dc134097b4445565515726fe4c9d0';

const ENV_TOKEN =
  typeof import.meta.env.VITE_MAPILLARY_ACCESS_TOKEN === 'string'
    ? import.meta.env.VITE_MAPILLARY_ACCESS_TOKEN.trim()
    : '';

export const MAPILLARY_TOKEN = ENV_TOKEN || DEFAULT_TOKEN;

const GRAPH_URL = 'https://graph.mapillary.com/images';
const REQUEST_TIMEOUT_MS = 10_000;

export type MapillaryImage = {
  id: string;
  thumbUrl: string;
  lat: number;
  lng: number;
  sequenceId?: string;
};

type ApiImage = {
  id: string;
  thumb_2048_url?: string;
  thumb_1024_url?: string;
  computed_geometry?: { coordinates?: [number, number] };
  geometry?: { coordinates?: [number, number] };
  sequence?: string;
};

function metersToDeg(m: number, atLat: number): { dLat: number; dLng: number } {
  const dLat = m / 111_320;
  const dLng = m / (111_320 * Math.cos((atLat * Math.PI) / 180));
  return { dLat, dLng };
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

async function searchBbox(
  lat: number,
  lng: number,
  radiusM: number,
  limit = 20
): Promise<ApiImage[]> {
  const { dLat, dLng } = metersToDeg(radiusM, lat);
  const bbox = `${lng - dLng},${lat - dLat},${lng + dLng},${lat + dLat}`;
  const url = new URL(GRAPH_URL);
  url.searchParams.set('bbox', bbox);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('fields', 'id,thumb_2048_url,thumb_1024_url,computed_geometry,geometry,sequence');
  url.searchParams.set('access_token', MAPILLARY_TOKEN);

  const ctrl = new AbortController();
  const t = window.setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url.toString(), { signal: ctrl.signal });
    if (!res.ok) {
      console.warn(`[Mapillary] HTTP ${res.status} for radius=${radiusM}m`);
      return [];
    }
    const json = (await res.json()) as { data?: ApiImage[]; error?: { message?: string } };
    if (json.error) {
      console.warn('[Mapillary] API error:', json.error);
      return [];
    }
    if (!json.data) return [];
    console.log(`[Mapillary] r=${radiusM}m → ${json.data.length} images`);
    return json.data;
  } catch (e) {
    console.warn('[Mapillary] fetch failed', e);
    return [];
  } finally {
    clearTimeout(t);
  }
}

function pickCoords(img: ApiImage): [number, number] | null {
  const c = img.computed_geometry?.coordinates ?? img.geometry?.coordinates;
  if (!c || c.length < 2) return null;
  return [c[0], c[1]];
}

function toMapillaryImage(img: ApiImage, refLat: number, refLng: number): MapillaryImage | null {
  const coords = pickCoords(img);
  if (!coords) return null;
  const [lng, lat] = coords;
  const thumbUrl = img.thumb_2048_url ?? img.thumb_1024_url;
  if (!thumbUrl) return null;
  return {
    id: img.id,
    thumbUrl,
    lat,
    lng,
    sequenceId: img.sequence,
  };
}

/** Verilen konumun yakınında Mapillary fotoğrafı var mı (hızlı kontrol). */
export async function mapillaryHasCoverage(lat: number, lng: number): Promise<boolean> {
  const radii = [150, 400, 1000];
  for (const r of radii) {
    const items = await searchBbox(lat, lng, r, 1);
    if (items.length > 0) return true;
  }
  return false;
}

/** Konuma en yakın Mapillary image ID'sini döndürür (viewer için). */
export async function findNearestImageId(lat: number, lng: number): Promise<string | null> {
  const radii = [120, 300, 700, 1500];

  for (const radius of radii) {
    const items = await searchBbox(lat, lng, radius, 15);
    if (!items.length) continue;

    const mapped = items
      .map((it) => toMapillaryImage(it, lat, lng))
      .filter((x): x is MapillaryImage => !!x);

    if (mapped.length === 0) continue;

    mapped.sort(
      (a, b) => haversineM(lat, lng, a.lat, a.lng) - haversineM(lat, lng, b.lat, b.lng)
    );

    return mapped[0].id;
  }

  return null;
}

/**
 * Konum için sokakta dolaşılabilir fotoğraf dizisi getir.
 * En yakın fotoğrafı bulur, aynı sequence'tan komşularını da ekler.
 */
export async function fetchMapillaryScene(lat: number, lng: number): Promise<MapillaryImage[]> {
  const radii = [120, 300, 700, 1500];

  for (const radius of radii) {
    const items = await searchBbox(lat, lng, radius, 25);
    if (!items.length) continue;

    const mapped = items
      .map((it) => toMapillaryImage(it, lat, lng))
      .filter((x): x is MapillaryImage => !!x);

    if (mapped.length === 0) continue;

    mapped.sort(
      (a, b) => haversineM(lat, lng, a.lat, a.lng) - haversineM(lat, lng, b.lat, b.lng)
    );

    const nearest = mapped[0];
    const sequence = nearest.sequenceId;

    const fromSeq = sequence ? mapped.filter((m) => m.sequenceId === sequence) : [];
    if (fromSeq.length >= 2) return fromSeq.slice(0, 12);

    return mapped.slice(0, 8);
  }

  return [];
}
