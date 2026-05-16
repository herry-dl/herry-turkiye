/**
 * KartaView (eski adı OpenStreetCam) — topluluk sokak fotoğrafları.
 * POST /1.0/list/nearby-photos/ herkese açık; API anahtarı gerekmez.
 * @see https://api.openstreetcam.org/api/doc.html
 */

const NEARBY_URL = 'https://api.openstreetcam.org/1.0/list/nearby-photos/';
const NEARBY_TIMEOUT_MS = 9_000;

type NearbyItem = {
  id: string;
  name?: string;
};

type NearbyResponse = {
  currentPageItems?: NearbyItem[];
};

async function fetchNearby(lat: number, lng: number, radius: number): Promise<NearbyItem | null> {
  const ctrl = new AbortController();
  const t = window.setTimeout(() => ctrl.abort(), NEARBY_TIMEOUT_MS);
  try {
    const form = new FormData();
    form.append('lat', String(lat));
    form.append('lng', String(lng));
    form.append('radius', String(radius));

    const res = await fetch(NEARBY_URL, { method: 'POST', body: form, signal: ctrl.signal });
    if (!res.ok) return null;

    const nearby = (await res.json()) as NearbyResponse;
    return nearby.currentPageItems?.[0] ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

/** storage11/files/photo/... → cdn.kartaview.org (CORS uyumlu) */
function cdnUrlFromStorageName(name: string): string | null {
  const m = name.match(/^storage(\d+)\/files\/photo\/(.+)$/);
  if (!m) return null;
  const origin = `https://storage${m[1]}.openstreetcam.org/files/photo/${m[2]}`;
  if (typeof btoa !== 'function') return null;
  const encoded = btoa(origin);
  return `https://cdn.kartaview.org/pr:sharp/${encoded}`;
}

export async function fetchKartaViewImageUrl(lat: number, lng: number): Promise<string | null> {
  const radii = [80, 160, 320, 500];

  for (const radius of radii) {
    const item = await fetchNearby(lat, lng, radius);
    if (!item) continue;

    if (item.name) {
      const cdn = cdnUrlFromStorageName(item.name);
      if (cdn) return cdn;
    }
  }

  return null;
}
